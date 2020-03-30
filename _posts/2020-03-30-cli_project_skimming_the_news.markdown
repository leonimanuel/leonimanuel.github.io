---
layout: post
title:      "CLI Project: Skimming the News"
date:       2020-03-30 14:24:27 +0000
permalink:  cli_project_skimming_the_news
---

### Building a New York Times Scraper
Imagine you work at a publishing house and part of your job is scanning the news every day for coverage of any books your firm recently released. That means combing through the books section, as well as a few others, searching every article for any mention of a book. This can get tiresome for any news publication. Now imagine having to do it for the New York Times, one of the biggest news outlets out there. It’s a big, boring job, and one that you have to do every. single. morning. If you’re in publishing, or marketing, or really anything media-related, I bet you can probably relate. 

Enter the New York Times Scraper. It's pretty simple, at least logically. Simply choose a section of the New York Times a search term, and how far back you want to look, and let the scraper do the rest. Here's a basic breakdown: 

![](https://i.imgur.com/y5OTMVi.png)

To give you an idea of what it looks in action, here it is on startup: 

![](https://i.imgur.com/VNe5EeH.png)

Once you get the ball rolling, the CLI shows all matches in the terminal, like so:

![](https://i.imgur.com/Bp0fcje.png)

Finally, once all search matches have been found, the user gets a neat little search summary:

![](https://i.imgur.com/9BrExuF.png)

All in all, pretty straightforward. But getting it all working was at times less so. This post will walk through my approach to this CLI project, some of the challenges faced along the way, and lessons learned. 

### The Process
I figured I’d start with the scraper, just to make sure there were no problems there. The first step was simple enough, just grabbing the appropriate CSS selector for the “sections” part of the front page of the New York times. I set it up so that the scraper method iterated over every matching list item (e.g. section) within the navigation list. From there, it was a pretty simple matter of storing that information as an object within my Search class. Pretty quickly, however, I started to notice that I got some results I wasn’t interested in, so I had to use a couple of conditionals to filter out any unwanted results for my section iteration: 

```
		doc.css(".css-1vxc2sl li").each do |li|
			if li.css("a").attribute("href") && li.css("a").attribute("href").value != "/" && !(["Real Estate", "Video"].include?(li.css("a").text))
				section_name = li.css("a").text
				section_url = li.css("a").attribute("href").value
				# binding.pry
				NyTimes::Search.add_section(section_name.upcase, section_url)
			end
		end
```

Once the CLI receives these sections from the Search class method and displays them to the user, the user selects a section, search term, and recency. Once those variables are set, the CLI passes those variables as arguments to initialize a new Search instance. The Scraper class then takes the information in that Search instance, first opening up the appropriate section webpage, and then combing for all articles on the page, each of which is passed into the Search instance. Again, certain conditional controls become necessary to filter out links that don’t match what we’re trying to do here:  

```
    section_doc.css("#site-content a").each do |a|
      if a.attribute("href") != nil && !a.attribute("href").value.scan(/\d{4}\/\d{2}\/\d{2}/).empty?
        article_date = Date.strptime(a.attribute("href").value.scan(/\d{4}\/\d{2}\/\d{2}/).join, "%Y/%m/%d")
      else
        article_date = Date.today
      end
      if  a.attribute("href") != nil &&
          a.attribute("href").value.include?("html") &&
          article_date > article_date - search.recency_in_days &&
          !a.attribute("href").value.include?("/membercenter") &&
          !a.attribute("href").value.include?("/content") &&
          !a.attribute("href").value.include?("/interactive") &&
          !NyTimes::Search.searches.any? { |search| search.article_sub_urls.detect {|url| url == a.attribute("href").value}} &&
          !a.attribute("href").value.include?("http")

          if !search.article_sub_urls.include?(a.attribute("href").value)
          	search.article_sub_urls << a.attribute("href").value
        	end
      end
    end
```

Once those articles are found and stored, the Scraper goes through each article and looks to see if any of the article’s content matches the search term. If it does, then it’ll grab some info about that match, including the paragraph content and article information like date, title, author and link, and throw it all into a new SearchMatch instance, which as part of it’s initialization automatically calls a CLI method to display that search match to the user in the terminal: 

```
class NyTimes::SearchMatch
	attr_accessor :context, :article_title, :article_url, :search_match_id, :article_author, :article_date

	def initialize(paragraph, article_title, article_url, article_author, article_date)
		@search_match_id = NyTimes::Search.searches.last.search_matches.count + 1
		@context = paragraph
		@article_title = article_title
		@article_url = article_url
		@article_author = article_author
		@article_date = article_date
		NyTimes::Search.searches.last.search_matches << self
		NyTimes::CLI.instances.last.show_search_match(self)
	end
end
```

Finally, once the Scraper has finished combing every relevant article, the CLI pulls from the Search instance to show the user a summary of the search results, and then asks whether the user would like to do another search. 

### Challenges:
##### 1. Finding the scraper sweet spot
One issue that became apparent the more I tested the app was that as you include more web pages in your scraper, striking a balance between being specific enough and general enough becomes increasingly important to the app’s functionality. Not being specific enough with your CSS selectors leads to the scraper grabbing more than you need and slowing your app down. However, if the data you collect will be used functionally later and not just displayed to the user, collecting extraneous data can throw a serious wrench in the gears of your project. In fact, I actually ended up specifically filtering out the Real Estate section for this project simply because the HTML in that section and individual article sections was structured just differently enough from the other sections to require an ever-growing amount of conditional statements that had no end in sight.

##### 2. Choosing which classes to make
I actually spent a while tinkering with how best to store each search match within a Search instance before I realized that they actually warrant a separate class of SearchMatch. It can be hard to decide at what point to separate things into different classes when your project starts dealing with increasing layers of specificity. In many of the labs so far, we’ve been working with classes that are on some level representations of physical and thereby distinguishable real-world objects, like Teacher/Student, Ballerina, Car, Dish/Waiter/Cook, and the like. So, when these real-world counterparts start being a little more abstract, you have to exercise your logic a little more where your mind’s eye draws up a blank. 

### Takeaways
##### 1.	Know when to stop
This CLI project includes a feature that lets you search not just all the articles in a section, but all the articles on the front page of every section in one fell swoop. I’m glad I built this feature because aside from it being awesome, it forced me to better organize a lot of what was originally one huge method handling everything that happens in the CLI into more specific methods with more singular responsibilities. On the other hand, it took a pretty decent chunk of time. Truth be told, I had a couple other ideas slated for this project, like the option to search for multiple keywords in a single search. I’m sure that it could have been done, eventually, and it probably would have forced my code to be even cleaner. But… you have to know when to stop. If you want to go above and beyond, go nuts. But make sure that doesn’t mean you’re falling behind on what matters. 

##### 2.	Gems are your friend
You probably noticed that I added a splash of color to the CLI output for the search results. I spent about an hour trying to figure out how to do that just with Ruby before I found a cool little gem called [colorize](https://github.com/fazibear/colorize), which took all of three minutes to implement just the way I wanted it. It might be intimidating to start playing around with gems, these mysterious packages of script that, unlike nearly everything else we’ve done so far, we haven’t poked and prodded yet or installed with the blessing of the course curriculum. Still, as your projects get increasingly complex and their needs more diverse, I think getting more comfortable with gems is going to save you a lot of time and headache.


###### Check out the full repo [here](https://github.com/leonimanuel/nytimes-scraper)!

