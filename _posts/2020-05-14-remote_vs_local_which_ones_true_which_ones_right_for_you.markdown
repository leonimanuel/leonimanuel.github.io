---
layout: post
title:      "Remote vs. Local: Which one's true? Which one's right for you?"
date:       2020-05-14 15:24:17 +0000
permalink:  remote_vs_local_which_ones_true_which_ones_right_for_you
---

### Debugging invisible bugs in my Rails App

Although we’ve so far learned how to build forms quickly and dynamically with form_for and form_tag, those that have taken a look at the form helper guide on rubyonrails.org will have noticed that Rails has only very recently soft-deprecated those in favor of [form_with](https://guides.rubyonrails.org/form_helpers.html), which, at a basic level, rolls the functionality of both form_for and form_tag into one.

Wanting to stay current, I decided to give form_with a shot. Of course, in doing so, I invited all the new features that come with form_with, regardless of whether I wanted them. And that’s a hard thing to avoid when you don’t yet quite understand what many of the features mean. One of the many updates that come with form_with is that form_with defaults to “remote: true” unless specified otherwise. Not sure what that means? Neither was I. 

After building a couple of forms with form_with, I soon ran into what’s quickly become my least favorite kind of problem: a problem without any errors. On the backend, my forms were working fine, the database was getting updated. But on the frontend, the view refused to change. With some forms, everything went smoothly, while others refused to update the view even though the corresponding view file was being executed. 

As it turned out, the problem lay in that invisible default of :remote => true. Essentially, when remote is true, that tells the form, and by extension, rails, to send a JavaScript view file instead of handling the form submission locally within Rails. So, all those forms that never ended  up resulting in a new view were trying to take instruction from some external JS file that never showed up. It’s a difficult problem to catch when your browser isn’t turning red, but take a look at what happen whens submitting a form with (by default) :remote => true: 

![](https://i.imgur.com/pCuu3fC.png)

![](https://i.imgur.com/IRriOF3.png)

As you can see, the form is being processed as JS. In this case, since my application has no JS outside of the rails app to tell it what to load to the view, nothing changes in the view. On the flip side, when the form is set to :local => true”, we get: 

![](https://i.imgur.com/HyCNMKY.png)

![](https://i.imgur.com/DMMoScJ.png)

And the view that we want to see gets rendered on the browser screen, since rails now knows to look *locally* (within the rails app) for the related view. 

At this point in the game, it’s less worthwhile to get hung up on exactly what’s going on behind the scenes with JS; that should become clearer in the upcoming JS section. The key takeaway here is twofold:
1. When your app isn’t doing what you want it to do and there are no errors to guide the way, it’s worth digging into the terminal to see exactly what your app is trying to do with the code that you’re provided. If you can, try to compare, line by line, with an example that is working until you can find the discrepancy. 

2. When using a new feature, such as form_with, take it slow. Make the most basic version of whatever you’re building first, test, then add. That way, you catch the mistake sooner and there’s less space for the bug to hide. 


For anyone interested, check out my Rails App, [Fleabay](https://github.com/leonimanuel/FleaBay).
