---
layout: default
title: Home
---

<ul class="posts">
{% for post in site.posts %}
  <li><span class="date">{{ post.date | date_to_string }}</span> <a href="{{ post.url }}">{{ post.title }}</a></li>
{% endfor %}
</ul>
