---
title: CoffeeScript Under Pressure
layout: post
published: true
---

# {{page.title}}

I'm the primary developer on the HTML/front-end components (but not
the Flash) of the [Camry Effect](http://toyota.com/camryeffect/)
website. It's both the largest amount of client-side code I've written
for a project, and the first project I've done with CoffeeScript. It
was also a fairly high-pressure project for many different reasons.

This post will describe the project, and detail my experiences
developing it in CoffeeScript.

## Origins

We were brought into the project six weeks before delivery. What had
been planned as a pure-Flash site suddenly needed to work on mobile
(particularly iPad), so we were called in to build it in HTML.

It wasn't just fancy HTML we had to build; it was a port of a graphic-
and animation-intensive Flash app, with the polish intact,[^polish]
and it had to work on iOS. It had to work on IE7. It had to work on
Android 2.1 on one of the clients' phones. And we had six weeks. We
did the maths and figured that at twelve hours a day, six days a week
for six weeks, we might just sneak in.

[^polish]: For example, the designers would send me Flash animations
of particular transitions, with screenshots of the easings and timings
all marked up for me to exactly duplicate.

As if that wasn't tricky enough, we had no control over the backend.
There was a JSON datastore that had been built for the site, but our
deliverable had to be purely static — everything would have to run
client-side, and as much as possible from a CDN.

There were also three levels of stakeholders above us, with different
priorities, and constantly shifting (and always growing) specs
cascading down from above as the site took shape.

After some discussion with my ‘if I get hit by a truck’ backup
developer, I decided to add [CoffeeScript][] to this, despite no real
experience with it. It promised decent gains, and looked like not too
much to learn.

[CoffeeScript]: http://jashkenas.github.com/coffee-script/

## Fast-forward

Six months later, we're still working on this website. It now consists
of more than six thousand lines of CoffeeScript, two thousand of
Javascript (source, not CoffeeScript output), another twelve hundred
lines of HTML templates and snippets, and four thousand lines of
[LESS CSS][] to style it all.

[LESS CSS]: http://lesscss.org/

The originally-specced 3.5 page site has blown out to twice that (if
you can count a fifteen-state state machine or a dynamic 3D scene as
single pages), with significantly richer functionality on every page,
and there is a separate-but-concurrent Spanish version of the site,
which we also maintain.[^es] Just about every page refers to or
includes modules originally built for other pages. We had no idea how
big and tangled this site was going to get.

[^es]: It was a late-breaking requirement, and is maintained as a
fork. It has diverged significantly from the English version, and is a
pretty good example of the wrong way to build multi-language sites.

You may have seen it advertised during the 2012 Super Bowl.

## Why CoffeeScript?

I'd heard good things about CoffeeScript, and it definitely looked
more succinct and less error-prone than Javascript. This appealed to
me as I looked down the barrel of a terrifying amount of work.

Also, I'm no Javascript expert, and I'm not terribly confident with
it[^django] either in the large (modules, structure, big-picture
stuff), or in the corners, where browser quirks and language warts
live. CoffeeScript seemed cleaner and more modern than JS, and it
looked like it might do for JS much what jQuery does for cross-browser
issues, papering over the most annoying mismatches.

[^django]: Our sites are usually more traditional page-based,
server-driven things, more Django than jQuery. A bit of AJAX, sure. A
full JS app, not so much.

The site as specified at the beginning of the project didn't look
broad enough to be worth investing in a full framework or library, and
I didn't think I'd have time to learn anything too large. Coffee
looked (at a glance, and after a quick proof-of-concept skeleton) like
a good fit for the project.

I think I was hoping that CoffeeScript would have some opinions, too,
about project structure, modules, whatever, but it didn't.

## Tooling

CoffeeScript is a language, but it's also a tool. Unfortunately,
sometimes it's a broken tool. In particular, for much of this
project's duration, `coffee` has had a nasty bug in its `--watch` mode
which causes it to lose track (and therefore stop automatically
recompiling) every time the git branch is changed. (This problem
[may have been fixed now][issue1853].)

[issue1853]: https://github.com/jashkenas/coffee-script/issues/1853

Restarting the watcher process is trivial enough, but *remembering* to
restart it usually only happens after an ever-increasing series of
changes to my `.coffee` sources which fail to have any effect at all.
It's a pretty frustrating bug.

Another unexpected problem cropped up when a second developer joined
the project partway through, and installed the available version of
CoffeeScript — a later one than I'd been using, with a different
output format. Due to our deployment requiring the generated
Javascript to be checked into the repository, this made for incredibly
noisy diffs. The whole generated JS folder would complete change with
each developer's builds, until I finally upgraded my `coffee` install
to match output styles.

>     -  if ((_ref = this.actions) != null) {
>     -    _ref;
>     -  } else {
>     -    this.actions = {};
>     -  };
>     +
>     +  if ((_ref = this.actions) == null) this.actions = {};
>     +
> 
> *Our repo is full of this kind of thing. Makes code reviews annoying.*

This latest point is perhaps less a complaint about CoffeeScript, and
more a warning about versioning and standardising *all* components of
a project.

## Coffee in the Project

This project is a completely static deploy at my end. My `Makefile`
concatenates, minifies and copies everything necessary into a
subfolder, which is merged with other components elsewhere before
being deployed to the server. An automated deployment (which is
outside my control) takes forty minutes, which makes it fairly crucial
to get things right — hotfixes on the server aren't really an option.

CoffeeScript was a godsend here, simply as an explicit compile and
validation step. Having to compile everything from CoffeeScript to
Javascript means that it isn't possible to deploy malformed Javascript
— a git commit hook refuses to commit without a clean `make`.

Of course, I still managed to deploy plenty of bugs, but not a single
syntax error or missing-semicolon problem got through Coffee. The fact
that CoffeeScript produced not just syntactically correct but also
more robust Javascript than I would have written myself was a huge
additional bonus.

## The language itself

CoffeeScript as a language is… slightly underwhelming, actually. A few
really nice features and shortcuts (`function (x) {}`  just doesn't
compare to the `(x) -> ` lambda syntax) just don't quite manage to
outweigh the quirks of the indentation rules and the feeling that
there's three ways to do everything. I really like `for x in xs`. I
don't really use the list comprehensions (which [Andrew Brehaut][] had
some things to say about), because I tend to use `map` and `filter`
anyway.

[Andrew Brehaut]: http://brehaut.net/blog/2011/coffeescript_comprehensions

This is at least an order of magnitude more client-side code than I've
ever written for a project. I was a bit surprised to discover that
CoffeeScript has no more opinions on code structure than does
Javascript (short a `class` syntax which I barely used.) Presumably it
plays perfectly well with JS dependency-management systems and the
like; I never tried.[^struct]

[^struct]: The CoffeeScript is broken up into around 25 `.coffee`
files, each containing a top-level namespace with all that module's
exports, as per normal practice. That's about as much structure as
there is.

In hindsight, I would have been better served learning a suitable
framework/library for this project than a new language. CoffeeScript
is just a less-typing way to do exactly what I've always done in the
browser, which in this case has turned out to be six thousand lines of
semi-modular code with a tendency towards spaghetti.

Less typing seems like a good idea (and it may have saved my butt
given the early schedule of this site — a two month sprint), but I
feel like maybe it just allowed me to type first, think later. I
really wish I had spent a bit of time and put some serious thinking
and planning into this site *before* I started typing.

Less typing is also in many places just a compensation for a lacking
standard library. (This is a Javascript criticism.) The lack of a
strong set of standard control and data structures means that you end
up typing many of the same patterns repeatedly — arguably, more
efficient expression of these patterns is the wrong solution to this
problem.

None of this is to say that CoffeeScript isn't helpful. There are a
number of features that are all too easy to forget about, but that I'm
sure have a huge effect on code quality. Automatic local scoping (no
`var` necessary) is a sane choice, and safe loop scoping with `for x
in y do (x) -> ` erases a whole category of errors. Implicit returns
are nothing short of fantastic. Easy lambdas do encourage more
functional programming (which suits me well), and indentation and the
lack of noisy punctuation make code read more easily. I definitely
miss these back in Javascript.

On the whole, though, I don't think CoffeeScript adds quite enough
benefit to outweigh the costs, and many of the benefits I get from it
could be duplicated by a good choice of framework. It has some
annoying quirks, too, that just add friction. I had a lot of trouble
with the indentation rules in certain cases; for instance:

{% highlight coffeescript %}
    # (note weird hanging comma & time argument)
    setTimeout ->
      alert("hello")
      alert("world")
    , 5000
{% endhighlight %}

I've had more trouble with CoffeeScript's indentation rules than I
ever had with Python or Haskell, and that's also true for other people
I've talked to.

I'll miss many of Coffee's niceties, but it just doesn't feel quite
robust enough (as a language or as a tool) that I'm confident in it at
this sort of scale, and at smaller scales it doesn't confer enough
benefit to be worth the added complexity. Your mileage may of course
vary. It is still possible that I may find a return to plain
Javascript sufficiently painful that I'll stick with Coffee.

## Conclusions

Next time I do something at this scale, I'll start with dependency
management, maybe use [Google Closure][] for an explicit
compilation/validation step (on top of `"use strict";`), and probably
take some lessons from [Addy Osmani's article][addyosmani] which I
unfortunately only discovered well into this project.

[Google Closure]: http://code.google.com/closure/
[addyosmani]: http://addyosmani.com/largescalejavascript/


My biggest mistake was probably the assumption that the project would
remain as specified. Projects *always* grow in scope. It was always
going to be more complicated than it seemed up front.

After all of that, though, the final product is a site that works as
required, and that's got to be considered a success.

_Join in the discussion at [Hacker News][hn]._

[hn]: http://news.ycombinator.com/item?id=3560616
