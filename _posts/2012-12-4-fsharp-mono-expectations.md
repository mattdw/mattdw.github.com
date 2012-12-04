---
title: FSharp & Mono on the Mac, & Expectations regarding Language Ecosystems
layout: post
published:false
---

# {{page.title}}

I've recently been toying with [F#][fs]; in large part looking for
some sort of middle ground between Haskell's type system and Clojure's
practicality.

[fs]: http://en.wikipedia.org/wiki/FSharp

As a language, I'm finding F# quite pleasant to use. It's not quite as
elegant and concise as Haskell can be (especially in the point-free
style), but it's definitely in the same family. That, added to nice
touches like the `|>` pipeline idiom and what looks (at first glance,
at least) to be first-class interop with the .NET ecosystem, make for
a pretty potent combination.

Point: type-system + functional, data structures not as good as
Clojure but a good solid set.

Point: complaint with Haskell is (a) rocket science (I can't keep up
with magic five-part Monads) and (b) a brittle packaging/deployment
story (for instance, see [this HN discussion][gbu].)

Point: Clojure+Lein+Uberjar is a happily robust packaging and
deployment system.

Point: I am disappointed to find that F# has, as far as I can tell, no
packaging or dependency story at all. Downloading DLLs, copying them
into the right place (possibly via the GAC?), and explicitly
referencing them every time I go to use them is a long way from `lein
deps`, `lein shell`, `lein run`.

[gbu]: http://news.ycombinator.com/item?id=4721550
