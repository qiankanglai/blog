---
layout: post
title: Unity山寨水波荡漾
date: 2014/11/15
tags: Unity
---

前段时间体验了下Zen Garden之后，觉得两个效果很有意思：漫天飞舞的花瓣和可以点点点的水波，于是准备在Unity里面山寨一下。

<!--more-->

先是尝试了用粒子实现下花瓣的效果，结果发现Unity暴露的接口很少，每一帧都`GetParticles, SetParticles`加上计算有点费；而且不太会使用现有的效果调出飘落的效果。最后实现了手指点上去挤开花瓣的效果后，就无奈放弃了。
ps. 粒子系统里貌似有两套速度，一个是Script里的对应startSpeed，另一个是Velocity over lifetime~感觉很奇怪...

然后试图山寨了下水波的效果，用一个脑洞大开的思路做了下，自我感觉还行\_(:з」∠)\_

![](/images/fakewater.gif)

这个效果说穿了就是做一个圆环波纹的bump，然后通过Script控制其center/scale贴到平面上(我设置最多贴六个环)；在Shader里用max取到最大的Normal来计算光照...

准备等Unity 5.x出来之后看看有没有GPU粒子可用，重新试试花瓣...