---
layout: post
title: RectMask2D裁剪BUG
date: 2016/10/18
tags: Unity
updated: 2016/10/18
toc: false
---

RectMask2D在Unity 5.1/5.2里有个BUG(现在已修复)，今天又有朋友在群里提到了：ScrollRect里的元素有时候不显示，需要拖动一下才好

<!--more-->

![](/images/rectmask2d_bug.jpg)

这个我之前在官方论坛报过[UGUI 5.2: Rect Mask 2D has BUG! be careful](https://forum.unity3d.com/threads/ugui-5-2-rect-mask-2d-has-bug-be-careful.391040/)，问题出现的原因是：某个元素被RectMask2D裁剪过之后，再次移回Mask里依然保持着被裁剪的状态，所以无法显示。

解决办法有两个，一个是直接升级Unity到5.3版本，或者用以下代码强制刷新下即可：

{% codeblock lang:csharp %}
CanvasRenderer.cull=false
{% endcodeblock %}
