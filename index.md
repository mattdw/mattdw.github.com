---
layout: default
title: Home
class: home
---

My name is Matt Wilson and I'm a (mostly web-) developer. I'm currently lead dev at [Assembly](http://assemblyltd.com/).

I work with WebGL in Typescript, Python (with Django), and with Unreal Engine and Unity where necessary. I also have a blog at
[problemattic.net](http://problemattic.net), which has nothing at all to do with
programming.

***

<ul class="posts">
{% for post in site.posts %}
  <li><span class="date">{{ post.date | date_to_string }}</span> <a href="{{ post.url }}">{{ post.title }}</a></li>
{% endfor %}
</ul>
