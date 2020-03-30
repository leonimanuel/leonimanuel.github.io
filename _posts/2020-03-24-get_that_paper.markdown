---
layout: post
title:      "Get That Paper"
date:       2020-03-24 19:24:01 -0400
permalink:  get_that_paper
---

Do you ever get code-brain? That thing where lines of code start welling up in your mind's eye while sitting at dinner, walking the dog, right as you fade to sleep? Not the "whoa, I just had a great idea" kind of code, but this weird overlay on your logic center where you end up thinking about case statements for what brand of ketchup to grab at the grocery store. No? Just me? That's ok. I imagine everyone experiences exhaustion a little differently. But if you know what I'm talking about (I'm changing it to "brain over-code"), then you've probably coded yourself into a fugue state more than once. 

The most practical advice I, or probably anyone else, can give on the topic is not to code for too long in one sitting. Makes sense. But sometimes, that's just not going to work out. When you're in the zone, you're in the zone. The thing I've come to appreciate, though, is that there's two kinds of "zone". The first zone, the good zone, is what most people think of; it's how you feel when you're crushing it, when it's like someone slipped some of that limitless drug in your steel-cut oatmeal (what's the deal with steel-cut oatmeal by the way, I just don't... understand the difference). If I'm in a zone, I'm in that good one about 1/2 of the time; otherwise I'm in the bad zone. In the good zone, you don't want to stop working because you're flying through the air. In the bad zone, you don't stop working out of sheer spite. Spite and the knowledge that if you put things down now, hacking your way back out later will take forever once you crawl back into the trenchlike maze of code you've thrown at your IDE for the last hour. 

So here's something that's helped: **paper**. Good old fashioned, sitting-right-there-by-the-computer paper notebook and pencil. Because here's how I end up in the bad zone: I get exhausted, and I get annoyed. And when either of those things happen, stupidity, or at the very least short-sightedness, usually tag along. Things start to get blurry, and I'm not just talking about [eye-strain](https://www.vsp.com/eyewear-wellness/eye-health/digital-eye-strainhttp://) and that sort of thing, though that's part of the problem. I'm not talking about blurry vision so much as I am blurry brain, where you chase one problem after another for so long that eventually you're just playing syntactical whack-a-mole. Yes, having  the paper right there helps take your eyes off the screen for a little while, but just as importantly for me, it also takes my brain off the *code*, and shifts its focus back on the *program*. What I mean is, as the things we build get bigger, more complex, and awesomer, it gets harder to keep track of all the moving parts. Flow diagrams are great for figuring out how everything will fit together on a high level before you get started, but when you start getting your hands dirty, nothing beats a pencil and paper for hearing yourself think when the fog of war/frustration starts to roll through your already undoubtedly adenosine-soaked brain. Just as an example, check out this chunk of code that describes a very basic AI Tic Tac Toe strategy: 

```
  class Computer < Player
    def move(board)
    	puts "the computer (#{self.token}) went like this:"
        danger_combo = Game::WIN_COMBINATIONS.detect do |combo|
          (board.cells[combo[0]] == board.cells[combo[1]] ||
          board.cells[combo[1]] == board.cells[combo[2]] ||
          board.cells[combo[2]] == board.cells[combo[0]]) &&
          (combo.collect { |index| index if board.cells[index] == " " }.compact.count == 1) &&
          !combo.collect { |index| board.cells[index]}.include?(self.token)
        end

        if danger_combo != nil
          cutoff_ind = danger_combo.detect do |index|
            board.cells[index] == " "
          end
          input = (cutoff_ind + 1).to_s
        else
          input = (rand * 10).round.to_s
        end
    end
  end
```

If you could read through this like a breeze then congrats, that's dope. But, if you're like me and still don't speak fluent computer, or are just starting to drift into mental fatigue from your own coding marathon, this is the kind of thing that demands some serious eyeball crossfit. That code right there is the product of a very clear-cut before and after: the before was punching in about a dozen different error-producing variants of the above *masterpiece* for an hour and a half. Then I grabbed a notebook and just put my thoughts down, not in Ruby, not in JS, but in whatever language they needed to come out as. It looked something like this:

![](https://i.imgur.com/8ce6xa9.png)

It might not make much sense to you, but that's ok. Actually, that's kind of the point: on paper, it doesn't have to make sense to anyone but you, so you can make sense of your thoughts. The code snippet produced above came less than fifteen minutes after taking a minute to sketch out the plan, to bring it from concenptual vapor blowing around between lines of code in my head to something more concrete, something actionable. There's [plenty of science](https://www.huffpost.com/entry/writing-on-paper_n_5797506) on the benefits of using paper and pencil, but the truth is, you don't need to read about it to feel it. Paper and pencil slows you down when you're going too fast and asks you to think, then do, rather than do, then try to correct. Slow is smooth, smooth is fast. Taking a minute to trace your thoughts won't kill you, but it might just save you.





