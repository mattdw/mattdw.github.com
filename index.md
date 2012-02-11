---
layout: default
title: Home
class: home
---

My name is Matthew Wilson and I'm a web developer. I do most of my
work for [Sons & co](http://sons.co.nz/), and I work with
[Andrew Brehaut](http://brehaut.net) and
[Greg Brown](http://gregbrown.co.nz).

I work in Python (with Django), HTML, and Javascript, and at home I
play with Clojure and occasionally Haskell. I also have a blog at
[problemattic.net](http://problemattic.net), which has nothing at all to do with
programming.

***

<ul class="posts">
{% for post in site.posts %}
  <li><span class="date">{{ post.date | date_to_string }}</span> <a href="{{ post.url }}">{{ post.title }}</a></li>
{% endfor %}
</ul>
