---
title: "Oat the Goat #3: System Design"
date: 2018-05-25T12:00:00+12:00
author: "Matt Wilson"
layout: post
published: true
---

*Cross-posted from [Assembly Dev Notes](http://assemblyltd.com/devnotes/)*

System architecture is always a risk factor when you haven't worked on a certain kind of project, or at a certain scale before. We knew we needed scenes to be pretty well separated, loadable and unloadable, and we knew we'd need some kind of separation within scenes between the nitty-gritty of shader setup, animation declarations, update-render loops, and the higher-level logic of a scene -- triggering animations in response to user interaction, fading between music tracks for different parts of the scene.

We ended up with a `Scene` class that handled loading, unloading, shader setup, and all the other crunchy lifecycle stuff. It then passed control to a somewhat-misnamed `StateMachine` class that implemented long-running cancellable `async` functions for managing the different sequences of a scene.

Free of all the gritty stuff, the higher-level logic was able to look something like:

{% highlight typescript %}
class Scene010States extends StateMachine {
    entry = this.intro;

    async intro() {
        this.sound.onceThenLoop(Layer.Music, "intro", "firstLoop");

        const vo = this.vo("vo_title");
        const anim = this.playSegment("intro")

        await Promise.all([vo, anim])

        this.advanceTo(this.waitClick);
    }

    async waitClick() {
        await this.getClick();
        this.advanceTo(this.outro);
    }

    async outro() {
        await this.playSegment("outro");
        this.scene.event(SceneEvent.End);
    }
}
{% endhighlight %}

While imperfect (and imperfectly named) this made it super easy to iterate on the flow of a scene while someone else fiddled with materials or scenery.

Cancellation and pause/resume logic remains a bit thorny; cancellation is handled by setting a flag on the statemachine and checking that flag between states, and by helpers like `vo()` and `playSegment()` checking the flag before resolving or triggering further events. Pausing and resuming are handled by allowing all long-running tasks to register pause and resume methods for themselves. Sadly it's a little bit case-by-case; there's always a mismatch between long-running tasks and a regular update()/render() game loop.