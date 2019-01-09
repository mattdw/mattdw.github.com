---
title: "Oat the Goat #5: Character Animation"
date: 2018-05-27T12:00:00+12:00
author: "Matt Wilson"
layout: post
published: true
---

*Cross-posted from [Assembly Dev Notes](http://assemblyltd.com/devnotes/)*

Before we could say whether [Oat the Goat](http://oatthegoat.co.nz/) was even a feasible project, we had to figure out how to get skinned character animation into the browser.

<div style="text-align: center; margin: 0 auto;">
<video src="/images/oat/Oat_character_turn.mp4" autoplay loop muted style="max-width: 100%; width: 400px;"></video>
</div>

We'd previously explored a few approaches for doing this -- `.fbx` via a Python conversion script to a [three.js] `.json` format, Collada/`.dae` files -- but not found anything we were particularly happy with for serious use.

## glTF Shows Up

Happily there's a new kid on the block, [glTF](https://www.khronos.org/gltf/), with a public spec, designed pretty well for real-time use. It also includes a binary `.glb` variant where all the parts are packed into a single container file -- perfect for our use, as we want to control when requests are made, and ensure that we've downloaded everything we need ahead of time. Also, make sure to gzip your `.glb`s! Most of our files gzipped down to around 25% of their uncompressed sizes.

three.js's glTF loader didn't quite do what we needed, so we monkey-patched it to give us explicit 'fetch' and 'parse/process' stages. This allows us to prefetch assets without causing frame-rate hitches in the current scene, then do all our performance-intensive parsing and assembling underneath a loading screen between scenes.

After some figuring out what we could strip out of a file and still have it work, we were able to export one `.glb` file per character per scene with skeleton + animation data (no mesh/material info), and one shared `.glb` file for each character with a T-pose mesh, material info, and skeleton with skin binding information.

## Cutting Up Animations

Another problem was that Maya and the Blender glTF exporter (currently) both insist on a single animation timeline per export. This meant we had to find our own system of carving up animation data into smaller portions -- we might want to play the first hundred frames, loop the next fifty, then play the fifty after that in response to user interaction, so we needed a way to blend and mix and capture events for all those separate portions.

{% highlight typescript %}
// THREE.KeyframeTrack's constructor calls validate() and optimize()
// in its constructor, which is unnecessary and was costing us half a
// second of CPU time per scene.
class CheapKeyframeTrack{
    constructor(
        public name: string,
        public times: any[],
        public values: any[],
        interpolation: THREE.InterpolationModes) {
            let as_kf = this as any as THREE.KeyframeTrack;
            as_kf.setInterpolation(interpolation || as_kf.DefaultInterpolation);
    }
}
CheapKeyframeTrack.prototype = THREE.KeyframeTrack.prototype;

function subClip(clip, start, end) {
    const tracks = clip.tracks.map(t => {
        const newTrack = new CheapKeyframeTrack(
            // start with shared values, no copying
            t.name, t.times, t.values,
            t.getInterpolation()) as THREE.KeyFrameTrack;

        // (we depend on internal behaviour of trim() which uses Array.slice,
        // and doesn't modify the original array).
        newTrack.trim(start, end);

        // Once trim has been called, our track now has its own copies of
        // times/values, and no shared data. It's now safe to modify in-place,
        // which shift() does.
        newTrack.shift(-start);
    });

    return new THREE.AnimationClip(
        `${clip.name}:${start}-${end}`, end - start, tracks);
}
{% endhighlight %}

On top of this sub-clip system we built our own layer around `THREE.AnimationMixer` which kept track of known actions, allowing terse references to animations, optionally by character, and which enforced a single action per character at any time, managing transitions. So we were able to write code roughly like:

{% highlight typescript %}
anims.addActions(
    [oat, amos], // references to names, skeleton roots, and anim clips per character
    [
        {name: "join-in", from: 25.64, to: 35.08, loop: LoopStyles.once},
        {name: "join-in-hold", from: 35.08, to: 37.12, loop: LoopStyles.repeat},
    ]
);

// "oat:" prefix restricts this to the oat character
anims.play("oat:join-in").then(() => {
    // no prefix means all anims with the given name
    anims.play("join-in-hold");
});
{% endhighlight %}

## Performance and Data-sharing

The character's skeletons have up to 120 bones; with up to eight characters on screen in some scenes, we found that the bulk of our per-frame time is cpu-bound animation sampling and bone matrix updates. Thankfully with characters [on twos] we only have to update approximately 12.5 times a second -- which simultaneously lowers CPU load, and makes performance still feel acceptable down to 15fps or so. For one especially heavy scene we stepped half of the characters down to 4s, only requiring 6 updates per second.

One final wrinkle was instancing of characters -- the sheep and glowworms are the same character, but the animation system needs a unique mesh and skeleton for each. [This `cloneGLTF` function] turned out to be exactly what we needed to avoid copying or reloading the binary `.glb` file, with just a bit of follow-up processing to share geometry and material data.

<div style="text-align: center; margin: 0 auto;">
<video src="/images/oat/clearing_loop.mp4" autoplay loop muted style="max-width: 100%; width: 100%;"></video>
</div>

## Addendum: Keyframe Cleaning and File Sizes

One other thing of note was cleaning keyframes at export time. Our animators were delivering animations as `.fbx`s with every animated object baked on every second frame, which gave the most reliable results but often meant a lot of redundant data.

To get file size down, there were some Blender export specifics we had to navigate carefully for best results. On animations with a lot of redundant/still frames it was worth cleaning keyframes to reduce the file size, but we found as animations became more dense that cleaning keyframes could actually increase file size dramatically.

I believe it's because the Blender exporter packs e.g. position as a `Vec3` if it has `x`/`y`/`z` keys matching at every point, but as soon as they don't don't fully match (e.g. because the bone is only moving in one axis, so you've removed keys from the other axes), the export packs position as three individual `Float` tracks, which seems to sharply increase overhead.

In the end (for places where file size really mattered) it was a two-step process:

1. Manually group the axes and delete entire `pos`/`rot`/`scale` keys where we know they're redundant.
2. Test export, and compare file size with Blender 'clean keyframes' version.

We also had to be careful about precision issues here; too much cleaning caused some drifting and twitching, so we had a pretty tight threshold for what made a key 'redundant'.

[three.js]: https://threejs.org/
[on twos]: https://en.wikipedia.org/wiki/Inbetweening#Frame_frequency
[This `cloneGLTF` function]: https://gist.github.com/cdata/f2d7a6ccdec071839bc1954c32595e87
