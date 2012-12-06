---
title: FSharp, Mono, and&nbsp;Ecosystems
layout: post
published: false
---

# {{page.title}}

I've recently been toying with [F#][fs]; in large part looking for
some sort of middle ground between Haskell's type system and Clojure's
practicality.

For context, I'm using F# on Mono 3.0.x on a Mac, and interacting
with it through both the [Emacs mode][emacs] and directly at the
terminal with `fsharpi`.

[fs]: http://en.wikipedia.org/wiki/FSharp
[emacs]: http://sourceforge.net/projects/fsharp-mode/

***

As a language, I'm finding F# quite pleasant to use. It's not quite as
elegant and concise as Haskell can be (especially in the point-free
style), but it's definitely in the same family. That, added to nice
touches like the `|>` pipeline idiom and what looks (at first glance)
to be first-class interop with the .NET ecosystem, make for a pretty
potent combination.

I'm appreciating the type system, which often catches errors at the
point of origin and saves me long head-scratching searches up and down
the stack. Compared to Clojure, I find myself needing to consider data
structure choices a bit more up-front (which is probably a good
thing), and the static types add a bit of a tax on switching them
later (which is not such a good thing). However, aside from minor
unevenness between the List and Seq module APIs, I find the data
structures perfectly adequate.

***

I'm very inexperienced at Haskell; I'd consider myself a novice. Every
couple of years I take another run at it, and each time I get slightly
further before hitting something so frustrating or brain-melting that
I give up again.

The first couple of times things ended in flames and tears when I
couldn't pacify the type-system. However, recently, my problems have
been more to do with the ecosystem in which Haskell lives.

Firstly, I just can't keep up with the rocket-science that seems
standard in Haskell's world. I think “maybe I'll try a web app this
time” only to discover that a Haskell web app involves some unholy
union of five different monads, and the tutorial says “just ignore
this for now, it won't bite you until later.”[^facetious]

[^facetious]: Okay, I'm being a little bit facetious. But only a
little bit.

Certainly, this is more to do with my own limitations than with
Haskell per se, but it remains the case that Haskell is perhaps the
only language which persistently defeats me.[^langs] The prelude – and
many of the other built-in libraries – I find obvious and
straightforward (once the basic concepts are understood, like arrows,
functors, or monads), but the third-party libraries which you use to
‘get things done’ I find terrifyingly and incomprehensibly *clever*.

[^langs]: Admittedly I haven't tried Brainfuck or Befunge.

F#, on the other hand, is refreshingly straightforward. Even its
monads are wrapped up in a warm fuzzy interface.[^denial]

[^denial]: I can hear you now, thinking to yourself “this guy is just
blaming his own stupidity on Haskell.” And, well, I agree, in so much
as I seem to lack the ability to realise the true potential of
Haskell. It's not you, Haskell, it's me. But that doesn't make it not
a problem.

I have a vague impression that F#'s friendliness signifies a
limitation in its expressiveness or power but (apart from being
occasionally less concise) I'm yet to actually notice. I suspect that
‘Computation Expressions’ (just as an example) may not reveal the full
power of monads, but I couldn't say how – or even whether it would be
a bad thing.

***

My second issue with Haskell's ecosystem is the packaging situation.
As far as I am aware (and I admit to being only passingly familiar
with `cabal`), Haskell packages installed via `cabal` are global, and
the `cabal` experience tends to be a brittle and fragile one.

My expectations in this area have been influenced by many years of
Python and quite a few of Clojure. Python's packaging is by no means
perfect, but the combination of `pip` and `virtualenv` gives you an
automated, repeatable and isolated way to manage all the dependencies
for a given project.

Clojure's `leiningen` is quite similar, and even better. It does,
admittedly, hide all the horrifying power of Maven underneath, but in
practice it's just a very straight&shy;forward way to manage your project's
dependencies, and to make sure they're (automatically, repeatably)
available to the project as you work on it, or package it for
distribution.

Now, as I mentioned earlier, F# looked to me like a promising
middle-ground between Haskell and Clojure. And in terms of the
language itself, and the immediate use of it, I have not been
disappointed.

Unfortunately, it appears to have even less of a packaging and
dependency-management story than Haskell does. This confused me (F#
being the ‘practical,’ ‘real-world problems’ Haskell) until I started
noticing repeated references to Visual Studio and/or MonoDevelop.

It seems to be the case that your choices for F# dependency management
are:

1. Manually copy around `.dll` files, passing them as command-line
arguments everywhere necessary[^classpath] *or*

2. Work in an IDE.

[^classpath]: Fundamentally, this is no different to ‘copy `.jar`s
around and add them to the classpath’ in Java, but Java adds all the
remote repositories and local tooling to fetch, cache, store, manage,
link etc. that F# is missing.

Even working in an IDE, as far as I can tell, only solves the copying
and referencing problem at a local level, providing no way to fetch
packages from any sort of remote repository.

Additionally, I've yet to meet an IDE I like, and GTK apps are not
what you'd call first-class citizens on the Mac. It's also not helpful
in a unix server environment, where there is quite likely no GUI
available at all. Unfortunately, apparently in .NET/F# world the IDE
*is* the toolchain.

(There may well be something I'm missing. NuGet sounded like the right
sort of thing, right up to the point I discovered that it was a Visual
Studio extension.)

Which leads me to my final complaint; that of the surprising lack of
good documentation, tutorials, and descriptions of best practices for
F#.

The [F# Programming][fpwb] wikibook is very helpful, and the
[MSDN F# reference][msdn] is great when you know what you're looking
for, but either the F# community is very small or its members are very
quiet when it comes to sharing their knowledge.[^sharing] I suspect it may just
be a small, young community.[^small]

[fpwb]: http://en.wikibooks.org/wiki/F_Sharp_Programming
[msdn]: http://msdn.microsoft.com/en-us/library/dd233181.aspx

[^sharing]: With a few exceptions. It would be remiss not to mention
that there are some very active and enthusiastic members of the
community, who seem to pop up to help anywhere someone is having
trouble with F#.

[^small]: It would appear that there are only about three people
trying to use F# with SQLite, and apparently none of them are trying
to use Linq. At least, so my searching would suggest.

On the other hand, a language as elegant *and* practical as F# should
surely be able to gather a growing community around it.
