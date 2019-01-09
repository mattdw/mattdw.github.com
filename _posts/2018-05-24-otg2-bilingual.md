---
title: "Oat the Goat #2: Two Languages"
author: "Matt Wilson"
date: 2018-05-24T12:00:00+12:00
layout: post
published: true
---

*Cross-posted from [Assembly Dev Notes](http://assemblyltd.com/devnotes/)*

[Oat the Goat](http://oatthegoat.co.nz/intl.html) is fully bi-lingual, with a counterpart Te Reo Māori version [Oti te Nanekoti](http://otitenanekoti.co.nz/intl.html). Both languages have unique voice-over, captions, UI, copy, and a few 3D assets (image textures). Handling this was largely straightforward -- there's a few hacks in some asset loaders to decide based on URL which assets are translated and which are universal, and there's a big ol' table of alternative voice-over timings to keep captioning in sync, but mostly it was just a case of making sure our layouts were flexible enough to handle both cases gracefully.

![The choices screen with translated subtitles and cards](/images/oat/tereo-cards.jpg)

We switch initial language based on domain name - [oatthegoat.co.nz](http://oatthegoat.co.nz/intl.html) defaults to English, [otitenanekoti.co.nz](http://otitenanekoti.co.nz/intl.html) to Te Reo Māori, but both run exactly the same codebase from the same endpoint. The only issue we hit with our purely-static deployment was with services that scrape metadata -- a dummy second `.html` entry point was required to let Facebook see appropriately-translated `<meta name="og:*">` tags.

Switching languages does require a scene reload, but (happily) enough assets are shared that it's a pretty quick process, and as I'll describe later, we needed a robust and efficient loading/unloading system anyway, so no real problem there.

It was important to everyone involved in the project that both languages were treated as equally important; none of us wanted it to seem like one or other language was an afterthought. The realities of the project timeline made this not entirely possible (animation happened primarily against the English narration), but we hope we got pretty close.

![Title screen for Oti te Nanekoti, the Māori version](/images/oat/oti.jpg)
