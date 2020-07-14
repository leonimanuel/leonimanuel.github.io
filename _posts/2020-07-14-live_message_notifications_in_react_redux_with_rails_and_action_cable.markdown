---
layout: post
title:      "Live Message Notifications in React/Redux with Rails and Action Cable"
date:       2020-07-14 13:36:51 -0400
permalink:  live_message_notifications_in_react_redux_with_rails_and_action_cable
---


For my React/Redux portfolio project I built a web-app which, among other things, allows users to participate in several different discussions. Check it out in the following link:

https://imgur.com/gallery/W9NdVhv

There are a couple of things going on here, but what we're focusing on here is the little red popup that appears in the top left corner on Billy's screen that indicates he's received a new message in a different discussion. It's precisely this mechanic that this post is going to walk through. To be as broadly useful as possible, this post will avoid many of the specifics involved in creating what you see above on the front-end in favor of describing the basic architecture which will give your app what it needs, when it needs it. 

##### Prerequisites
Almost every technology used in this walkthrough will have been covered in the Flatiron Software Engineering curriculum through the React/Redux unit. The one exception is Action Cable. Action Cable is a rails-oriented implementation of web-socket technology which essentially keeps the connection betwee the server and client open so that server-side changes (like receiving a message) can be reflected in real-time on the client-side. This walkthrough kicks off with the assumption that you already have a basic familiarity with Action Cable. If not, I highly recommend you follow fellow Flatiron alum Dakota Lillie's [excellent walkthrough](https://medium.com/@dakota.lillie/using-action-cable-with-react-c37df065f296) for using Action Cable to set up a basic chat app with Rails and React. 


### Walkthrough

Let's kick off the chain of events by submitting a message:

```
    let configObj = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        text: this.state.text,
        userId: this.props.userId
      })
    }

    fetch(`${API_ROOT}/groups/${this.props.discussion.group_id}/discussions/${this.props.discussion.id}/messages`, configObj);

```

Here's the corresponding messages controller create action (don't freak out): 

```
  def create
    user = User.find(params[:userId])
    discussion = Discussion.find(params[:discussion_id])    
    message = Message.new(text: params[:text], discussion: discussion, user: user)

    if message.save
      recipients = message.discussion.users.select do |user|
        user.id != message.user_id
      end

      recipients.each do |recipient|
        MessagesUsersRead.create(message: message, discussion: discussion, user: recipient, read: false)
      end

      recipients.each do |recipient|
        DiscussionUnreadMessage.with_discussion_id(discussion.id).find_by(user_id: recipient.id).update(unread_messages: MessagesUsersRead.unread.with_user_id(recipient.id).with_discussion_id(discussion.id).count)
      end

      serialized_data = ActiveModelSerializers::Adapter::Json.new(
        MessageSerializer.new(message)).serializable_hash
        ActionCable.server.broadcast "messages_channel", serialized_data
      head :ok

      serialized_notification_data = {discussion_id: discussion.id, unread_messages: 1, sender_id: user.id}
      ActionCable.server.broadcast "message_notifications_channel", serialized_notification_data
      head :ok
    end
  end
```

I know, it's a lot. Let's take it line by line. The first few are straightforward enough; we're simply creating a message based on the given parameters. For reference, here's my messages table schema:

```
create_table "messages", force: :cascade do |t|
    t.string "text"
    t.bigint "discussion_id", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
end
```

Now onto the next group of lines, the block that starts with "if messages.save". The *what* of what we're doing is simple enough: we're simply creating an array of users very similar to one of all the members of the given discussion, with one small change: we are excluding the user who sent the message, leaving only the *recipients*. 

This next part's where I had to get a little creative. The goal here is to keep track of which messages in which discussions have been read, and which haven't. As soon as a message is created on the back end, it's fair to say that none of the recipients have read the message, which explains this next part:

```
      recipients.each do |recipient|
        MessagesUsersRead.create(message: message, discussion: discussion, user: recipient, read: false)
      end
```

Here, a new entry is created in the join table which tracks whether each message has been read or not (we'll get into how to tell the program a message has been "read" in a bit).

```
      recipients.each do |recipient|
        DiscussionUnreadMessage.with_discussion_id(discussion.id).find_by(user_id: recipient.id).update(unread_messages: MessagesUsersRead.unread.with_user_id(recipient.id).with_discussion_id(discussion.id).count)
      end
```

I know, not very pretty. Here's what's going on. When ever a new discussion is created, a record in the discussion_unread_messages table is created along with it for every member of that discussion. Here's the schema: 

```
  create_table "discussion_unread_messages", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "discussion_id", null: false
    t.integer "unread_messages", default: 0
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end
```

In the "each" block above, we're updating the unread message count of every member of the discussion in which a message has just been created, making use of some scope methods along the way. Here's how those were built:

```
class MessagesUsersRead < ApplicationRecord
  belongs_to :message
  belongs_to :discussion
  belongs_to :user

  scope :unread, -> { where(read: false) }
  scope :with_user_id, -> (user_id) { where("user_id = ?", user_id) }
  scope :with_discussion_id, -> (discussion_id) { where("discussion_id = ?", discussion_id) }
end
```

```
class DiscussionUnreadMessage < ApplicationRecord
  belongs_to :user
  belongs_to :discussion

  scope :with_discussion_id, -> (discussion_id) { where("discussion_id = ?", discussion_id) }
  scope :with_user_id, -> (user_id) { where("user_id = ?", user_id) }
end
```

Quick side note: at this point some of you may have noticed that the schemas for MessagesUsersRead and DiscussionsUnreadMessage have a lot of overlap. In fact, the one column that the latter has which the former does not is the "unread_messages" column which keeps the latest tally of all the records in MessagesUsersRead where "read" is false for the corresponding discussion and user. Could DiscussionsUnreadMessage be done away with in favor of simply querying the MessagesUsersRead table whenever we needed that count? I'm pretty confident that would work. I chose to create DiscussionsUnreadMessage because it seemed to make things easier, but frankly, you only really **need** MessagesUsersRead to hold on to the information you need to make this work. 


Anyway, once those records have been created for MessagesUsersRead and updated in DiscussionUnreadMessage, it's time to send that data back to our app using ActionCable:

```
      serialized_data = ActiveModelSerializers::Adapter::Json.new(
        MessageSerializer.new(message)).serializable_hash
        ActionCable.server.broadcast "messages_channel", serialized_data
      head :ok

      serialized_notification_data = {discussion_id: discussion.id, unread_messages: 1, sender_id: user.id}
      ActionCable.server.broadcast "message_notifications_channel", serialized_notification_data
      head :ok
```

The purpose of the first block relates to the Action Cable responsible for broadcasting messages. We're going to focus on the second one, beginning with "serialized_notification_data", whose value is being broadcast back to the front-end. Again, this post assumes that you already have experience with a basic implementation of Action Cable and react-actioncable-provider, so I'll just show you what the action cable component tag looks like inside my App.js component:

```
class App extends Component {
  componentDidMount() {
    this.props.logIn()  
  }

  handleUnreadUpdate = (response) => {
    debugger
    if (response.sender_id !== this.props.userId) {
      this.props.resetUnreadCount(response)      
    }
  }

  handleReceivedMessage = response => {
    debugger
    console.log("handling received message")
    const { message } = response;
    this.props.addMessageToDiscussion(message)
  }

  render() {
    return (
        <div className="App">
          <NavBar />
          {this.props.userId ?
          <div>
            <ActionCable 
              channel={{ channel: "MessageNotificationsChannel" }}
              onReceived={this.handleUnreadUpdate} 
            />          

            <ActionCable 
              channel={{ channel: "MessagesChannel" }}
              onReceived={this.handleReceivedMessage} 
            />
						
						...
        </div>      
    );
  }
}

export default connect(state => ({userId: state.users.userId}), { logIn, resetUnreadCount, addMessageToDiscussion })(App);
```

The first ActionCable tag inside the render function handles the message notification cable, which calls the handleUnreadUpdate function which in turns calls the resetUnreadCount action method with the following response data from a moment ago **unless** the user_id in that response data is the id of the user (after all, no point in updating your own unread count for a message you yourself sent). Here's the resetUnreadCount action:

```
export const resetUnreadCount = (response) => {
  return {
    type: "RESET_DISCUSSION_UNREAD_COUNT",
    response
  }
}
```

and corresponding reducer case:

```
case "RESET_DISCUSSION_UNREAD_COUNT":
	let discussionsClone = _.cloneDeep(state.allDiscussions)
	let resetDiscussion = discussionsClone.find(discussion => discussion.id === parseInt(action.response.discussion_id));

	if (action.response.unread_messages === 0 ) {
		resetDiscussion.unread_messages_count = 0
	} else if (action.response.unread_messages === 1 && !(state.renderForum && state.selectedDiscussionId === action.response.discussion_id)) {
		resetDiscussion.unread_messages_count += 1
	}
	
	let updatedDiscussions = discussionsClone.filter(discussion => discussion.id !== resetDiscussion.id)
	updatedDiscussions.push(resetDiscussion)
	return {
		...state,
		allDiscussions: updatedDiscussions,
	}
```

The action is simple enough, the reducer... not so much. let's take it from the top. From the get go, this block uses lodash to create a deep clone of the array of the current user's discussions in the redux store. Full disclosure: as a general rule, I try to avoid situations where a deep clone is even called for; best to keep your state nice and flat. But, in this case, it seemed to make more sense to keep those unread counts tied to their discussions. If you want to separate them out in a separate array and then get the ones you need by filtering against a discussion id later, more power to you.   

For the conditional block, you might be wondering why there's a conditional statement at all. After all, the create action on the backend which comunicates with this cable only ever sends a response with an unread_messages key/value pair of "unread_messages: 1". So when might action.response.unread_messages === 0? Well, near the beginning of this post I said that we'd circle back to how we tell our app that a message has been "read", and now seems an appropriate time. This is really at your discretion; since my app requires users to actively open a discussion, it felt appropriate to say a message, or for that matter, all messages in a given discussion had been read once the component displaying the messages had rendered. That's why the componentDidMount hook inside that component calls an action to fetch that discussion's messages, looking like this:

    let configObj = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: localStorage.getItem("token")
      }
    }

    fetch(`${API_ROOT}/groups/${groupId}/discussions/${discussionId}/messages`, configObj)
      .then(resp => resp.json())
      .then(messages => {
        dispatch({
          type: "ADD_MESSAGES_TO_DISCUSSION",
          messages
        });
      })

By the way, I'm using json web tokens for authentication here, if that looks foreign to you, don't worry about it. Just swap it out for whatever you're using.

Anyway, looking at the corresponding index action in the messages controller, we have:

```
def index
  user = @current_user
  @messages = Message.where(discussion_id: params[:discussion_id]).all

  MessagesUsersRead.unread.with_discussion_id(params[:discussion_id]).with_user_id(user.id).all.each do |entry|
    entry.update(read: true)
  end

  DiscussionUnreadMessage.with_discussion_id(params[:discussion_id]).with_user_id(user.id).first.update(unread_messages: 0)

  render json: @messages
end
```

Here, we're returning the discussion's messages as a json object, but before we do that, we're updating the user's unread_notification counts in the two related models whose functions were discussed in the messages controller's create action section post of this post. This way, your app knows which discussions still have unread messages and how many the next time a user starts a new session.

```
let response = {discussion_id: discussionId, unread_messages: 0}
dispatch({
  type: "RESET_DISCUSSION_UNREAD_COUNT",
  response
})
```

Now, going back to the corresponding reducer case, if unread_messages === 0, as it will when the discussion component is rendered, the corresponsing discussion's unread_messages_count property will be rest to 0, and if unread_messages === 1, it will increment by 1. Pop that updated discussion back into state, and there you have it. Real-time message notification across your app. I should add that this post focused on getting live updates to the message notificaiton count once a user is already in the middle of a session. For it to work, the right unread message count for each discussion has to be loaded when the discussions data is initially fetched, and which you should easily be able to pull from the DiscussionUnreadMessage model.


### Conclusion
This post aimed to keep the mechanics of this approach to message notifications as generally applicable as possible. Still, you may find that something in it doesn't work for you, or worse, doesn't work at all. To that end, I'd like to offer one small insight, if you can call it that. While it might seem like there are a lot of moving parts, the important thing to keep in mind is that once you've got the most basic version of Action Cable working for you, as referenced in the beginning of this post, you've got a grasp of all the tools necessary to make this happen. Knowing that was a comfort to me while dealing with the many, many stumbles that came with trying something outside of my comfort zone like this. But if you're at that point where you're ready to close your laptop (backwards), please feel free to message me with any questions, as well as any comments or suggestions on how I can make this better. I'm sure there's plenty of room for improvement even in this relatively short post. Either way, happy coding.   
