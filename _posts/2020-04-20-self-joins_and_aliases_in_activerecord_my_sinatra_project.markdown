---
layout: post
title:      "Self-joins and Aliases in ActiveRecord: My Sinatra Project"
date:       2020-04-20 15:05:33 +0000
permalink:  self-joins_and_aliases_in_activerecord_my_sinatra_project
---

For my Sinatra Project, I built AirOut, an app that lets housemates anonymously register complaints against one another in these times of close-quarter comraderie. To do it, I had to take the foundations of ActiveRecord associations that I've built through Learn and supercharge them with a little bit of extra research. 

Here's a big picture overview of the associations (full res [here](https://imgur.com/EyEEPXu)). 

![](https://i.imgur.com/JKmyqMp.png)

Let's break it down.

When a user joins AirOut, they select a preexisting house or create a new one. Every user belongs to a house. Acordingly, every house has many users. Now, if there was only one user per house, things would stay nice and simple. However, that would make for a pretty boring app. AirOut only works for houses with multiple users, and so the challenge becomes to establish the relationships between the users in a house. Here we turn to ActiveRecord self-joins. Let's zoom in on the assocations between the "user" and "user_housemates" tables: 

![](https://i.imgur.com/PlChoSh.png)

It may look a little strange, but at the end of the day, what's happening here is only a variation on the join-table that many of you are already familiar with. In the "users" table associations, we have has_many "user_housemates" and respectively, the "belongs_to :user" in "user_housemates", just like in any join table. The magic is in the next line of each table's associations. In "users" we have  

```
has_many :housemates, :through =>  :user_housemates
```

This is basically establishing that at the end of the day, when you have some data in the database, you can expect User.housemates to return an array of these things called "housemates". Hang on though, we don't have a housemates class. Well, let's take a look at the next association under the "user_housemates" table, which reads 

```
belongs_to :housemate, class_name: "User"
```

What does that mean? Here we're telling the "user_housemates" table, 'hey, you know that housemate_id column you got there? Well, just so you and and anyone that has_many :housemates knows, this thing we're calling a "housemate" is really an instance of the class_name "User" '. That way, the User model really has many users through the "user_housemates" self-join table, except we're calling them housemates. This is as much, at least in my understanding a syntactical necessity as it is a logical step to make your code more readable. Toward the first point, we can't have two columns in the "user_housemates" table called user_id; if we did, ActiveRecord would have no idea what we were looking for any time we query that table. But on another level, think about it this way: what if you saw something that looked like this:

```
billy = User.create(name: "Billy")
billy.users
```

Seems pretty strange for a user to have many users, even if at the end of the day, that's pretty much exactly the case from the perspective of our object relationships. Now compare that to:

```
billy = User.create(name: "Billy")
billy.housemates
```

Makes sense right? A user, logically, has many housemates, so why not reflect that natural relationship in how you define your associations?


Now that the "class_name: " option's function is hopefully clear, the last piece of logic in the database's associations should be easier to wrap our heads around. Let's take a look: 

![](https://i.imgur.com/8Fb0ewY.png)

Here, a user has many complaints, and a complaint belongs to a user. However, notice that in the associations for "users", a user also:

```
has_many :charges, class_name: "Complaint", foreign_key: "housemate_id"
```

That means that when we call User.charges, we should get an array of instances of the Complaint class. But wait? Why do we need that if the user already has_many :complaints? Well, the idea behind AirOut is that each user can create/edit/view complaints that they have against their housemates, but also view complaints that their housemates have logged *against them*. Naming the complaints *against* a housemate "charges" differentiates them from complaints, because we need a way to differentiate the complaints a user has against others, and those that are made against the user. The "complaints" table is structured so that every complaint not only logs the user_id of the user who makes the complaint, but also the housemate_id (which is really another user_id) to keep track of who the complaint is against. That way, tying "charges" to the foreign_key: "housemate_id" lets our "complaints" table know that when we do something like this:

```
billy = User.create(name: "Billy)
billy.charges
```

We're looking for all the records of complaints where the *housemate_id* value matches billy.id . Meanwhile, something like:

```
billy.complaints
```

would return all the complaints where billy.id matches the value in the *user_id* column. 


### Conclusion
It wasn't easy getting this all set up, but if I can take one thing away from building Air Out, it's this: *take the time to set things up so they sound right.* Ruby was built to read almost like English. So, if it doesn't make sense when you read it (e.g. something like User.users) take a second to think about your associations. Lay a sensible foundation for the rest of your app, and save yourself, and others, a lot of confusion down the line.

