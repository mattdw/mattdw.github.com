---
title: "Oat the Goat #1: Introduction"
author: "Matt Wilson"
date: 2018-05-23T12:00:00+12:00
layout: post
published: true
---

*Cross-posted from [Assembly Dev Notes](http://assemblyltd.com/devnotes/)*

![Oat the Goat's opening scene](/images/oat/OPENING_02.jpg)

[Assembly](http://assemblyltd.com/)'s latest project, [Oat the Goat](http://oatthegoat.co.nz/intl.html), has just gone live. It's an animated kids' story about dealing with bullying, built for New Zealand's Ministry of Education, and it's a pretty large-scale use of WebGL.

It's one of the largest web projects I've ever worked on, clocking in at around 12 minutes of narrative animation, spread through 11 scenes, with a voice-over narration track (in two different languages, synced to captions), a sound effects layer, and an orchestral score performed by the [New Zealand Symphony Orchestra](https://www.nzso.co.nz/). Scenes feature up to eight animated characters at once, and every scene is a unique set of scenery, textures and animation.

<div style="margin: 0 auto; max-width: 250px;">
<img src="/images/oat/Amos_Sketch_loop.gif" alt="Concept sketches of Amos">
</div>

We wrote just shy of 13,000 lines of Typescript, plus enough HTML and responsive CSS to glue it all together. The largest scene has more than twelve minutes of character animation by itself. It runs on a pretty decent variety of tablets, phones, and desktops.

I've split the rest of this into a number of posts describing some of the specific challenges we hit, solutions we found, and things we learned in solving them.

The big-picture top-level bullet list:

- Fully translated to both English and Te Reo Māori.
- Written in Typescript. The idea of doing this in plain Javascript is terrifying.
- Rendered in WebGL through [three.js](https://threejs.org).
- 3D skeletal/skinned character animation, mostly on twos (stepped 12.5fps), out of Maya, through Blender and the [Blender glTF exporter](https://github.com/KhronosGroup/glTF-Blender-Exporter) to `.glb` files.
- Audio through WebAudio with HTML5 fallback, using [Howler](https://howlerjs.com/).
- Served as a purely static site from S3/Cloudfront.

You can get in touch with me at `mattw` at `assemblyltd.com` if you have further questions or thoughts.

## In this series:

1. [Multiple Language Support](/2018/otg2-bilingual.html)
2. [Building Blocks](/2018/otg3-division-of-labour.html)
3. [3D Scenes](/2018/otg4-3D-scenes.html)
4. [Character Animation](/2018/otg5-character-animation.html)
5. [A Lot of Audio](/2018/otg6-audio.html)
