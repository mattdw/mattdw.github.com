---
title: CoffeeScript Under Pressure
layout: post
published: false
---

# {{page.title}}

This is a story about development under pressure, and using a new and
untested language to do it. It's a list of mistakes made and things
learned. It's mostly about CoffeeScript.

## Origins

We were brought into the project at the point it was decided that the
site needed to work on iPad — up until that point, six weeks to
delivery, it was pure Flash.

It wasn't just fancy HTML we had to build; it was a port of a graphic-
and animation-intensive Flash app, with the polish intact,[^polish]
and it had to work on iOS. It had to work on IE7. It had to work on
Android 2.1 on one of the clients' phones. And we had six weeks. We
did the maths and figured that at twelve hours a day, six days a week
for six weeks, we might just sneak in.

[^polish]: For example, at the five-week mark I was receiving Flash
animations of some of the transitions, with screenshots of the easings
and timings all marked up for me to exactly duplicate.

As if that wasn't tricky enough, we had no control over the backend.
There was a JSON datastore that had been built for the site, but our
deliverable had to be purely static — everything would have to run
client-side, and as much as possible from a CDN.

Add to these the three levels of stakeholders above us, all wanting
different things, and the constantly shifting (and always growing)
specs cascading down from above, and you have a pretty intense
project.

For some reason I decided to add a new and untested language to this.
[CoffeeScript][] seemed like a good idea. And because I was to be
working solo on the project, there was nobody to object.[^object]

[CoffeeScript]: http://jashkenas.github.com/coffee-script/
[^object]: In the interests of truck-numbers I did make sure that I
had some backup, both on the project and on the CoffeeScript question.

## Fast-forward

Six months later, we're still working on this website. It now consists
of more than six thousand lines of CoffeeScript, two thousand of
Javascript (source, not CoffeeScript output), another twelve hundred
lines of HTML templates and snippets, and four thousand lines of
[LESS CSS][] to style it all.

[LESS CSS]: http://lesscss.org/

The originally-specced 3.5 page site has blown out to twice that (if
you can count a 15-state state machine or a dynamic 3D scene as single
pages), with significantly richer functionality on every page, and
there is a separate-but-concurrent Spanish version of the site, which
we also maintain.[^es] Just about every page refers to or includes
modules originally built for other pages. We had no idea how big and
tangled this site was going to get.

[^es]: It was a late-breaking requirement, and is maintained as a
fork. It has diverged significantly from the English version, and is a
pretty good example of the wrong way to build multi-language sites.

You may have seen it advertised during the 2012 Super Bowl.

## Why CoffeeScript?

I'd heard good things about CoffeeScript, and it definitely looked
more compact and efficient than Javascript. This appealed to me as I
looked down the barrel of a terrifying amount of work.

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
changes to my .coffee sources which fail to have any effect at all.
It's a pretty frustrating bug.

Another unexpected problem cropped up when a second developer joined
the project partway through, and installed the available version of
CoffeeScript — a later one than I'd been using, with a different
output format. Do to our deployment requirements, the generated
Javascript is checked into the repository, which made for incredibly
noisy diffs, the whole generated JS folder completely changing with
each developer's builds, until I finally upgraded my own copy to match
output styles.

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

CoffeeScript as a language is… underwhelming, actually. A few really
nice features and shortcuts — the `(x)-> ` lambda syntax kicks the ass
of `function () {}` — just don't quite manage to outweigh the quirks of
the indentation rules and the feeling that there's three ways to do
everything. I really like `for x in xs`. I don't really use the list
comprehensions (which [Andrew Brehaut][] had some things to say
about), because I tend to use `map` and `filter` anyway.

[Andrew Brehaut]: http://brehaut.net/blog/2011/coffeescript_comprehensions

This is at least an order of magnitude more client-side code than I've
ever written for a project. I was a bit surprised to discover that
CoffeeScript has no more opinions on code structure than does
Javascript (short a `class` syntax which I barely used.)

In hindsight, I would have been better served learning a suitable
framework/library for this project than a new language. CoffeeScript
is just a less-typing way to do exactly what I've always done in the
browser, which in this case has turned out to be six thousand lines of
semi-tamed code with a tendency towards spaghetti.

Less typing seems like a good idea (and it may have saved my butt
given the early schedule of this site — a two month sprint), but I
feel like maybe it just allowed me to type first, think later. I
really wish I had spent a bit of time and put some serious thinking
and planning into this site *before* I started typing.

## Conclusions

Next time I do something at this scale, I'll start with dependency
management, maybe use [Google Closure][] for an explicit
compilation/validation step, and probably take some lessons from
[Addy Osmani's article][addyosmani] which I unfortunately only
discovered well into this project. I don't think CoffeeScript adds
enough benefit to outweigh the costs, and the primary benefits I got
from it could easily be duplicated by a good choice of framework.

[Google Closure]: http://code.google.com/closure/
[addyosmani]: http://addyosmani.com/largescalejavascript/

My biggest mistake was probably the assumption that the project would
remain as specified. Projects *always* grow in scope. It was always
going to be more complicated than it seemed up front.

It's also a hard thing to get the budget necessary for refactoring,
especially when clients want to pay feature-by-feature, but if you can
convince them of the down-wind savings, it's probably worth it. I had
to say ‘no’ to too many features because we didn't have the necessary
architecture, and more than a couple of bugs resulted from the same.

I guess, though, that the final product is a site that works. We
delivered the required functionality by the required deadlines, on the
required platforms, and you know what? That makes it a
success, tangled innards or not.
