---
layout: post
title:      "JS Project: Hanging with Friends"
date:       2020-05-24 20:32:18 +0000
permalink:  js_project_hanging_with_friends
---


For my JS/Rails Single-Page App, I built a game of hangman. The idea was simple enough but with a twist: as a user, you can challenge and be challenged by other users. It's an app that's just as fun playing solo as it is with a couple of friends. Once a user is logged in, they can see all the challenges sent to them by others, as well as the challenges they've sent, and the status of all these challenges. When a user completes a challenge, the challenge status is updated. Users create hallenges through the same popup menu. And speaking of popup menus, MAN those are a pain to juggle in one html file, especially since I've yet to find a solution that allows partials in HTML, which is why I can't wait to get started with React. My workaround was either having JS to either add or remove the "hidden" class for various popups, or generating popup content on the fly with the JS .innerHTML method. The latter at least let me split up the content to various js files for better organization, but the drawback was it all had to be wrapped in green quotes, which wasn't great for formatting or readability. Either way, feel free to check the app out [here](https://github.com/leonimanuel/rails-hangman).
