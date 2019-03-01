---
layout: post
title: Unity下带法向的Bump Mapping
date: 2015/1/19
tags: Unity
toc: false
---

昨儿吹酱在群里发了一个[WebGL 雪地](http://christmasexperiments.com/2013/21/)的例子，里面雪地的交互挺有意思。还好它的源代码只是压缩了一下，没有加密；大概扒拉着看了一下，它其实就是不断利用[createRadialGradient](http://www.w3schools.com/tags/canvas_createradialgradient.asp)绘制Bump Map来实现的。

<!--more-->

比较有意思的是它在代码的注释里提到了一篇文章[Bump Mapping Unparametrized Surfaces on the GPU](http://mmikkelsen3d.blogspot.sk/2011/07/derivative-maps.html)，看了下挺好玩，于是我搞到Unity里面去了~

![](/images/unity3d_bump1.jpg)

它要做的事情其实很简单：最普通的Bump Map只是在顶点处沿着法向量做一个位移，但法向量是保持不变，这样导致的结果就是和新的Mesh对不上了~论文提出了一个方法，通过屏幕空间的手法近似做一个法向量扰动，使得效果更加逼真。对比图见下：左边是只修改pos；右边是同时修改pos和normal。

![](/images/unity3d_bump2.jpg)

这个东西很适合拿来做雪地脚印的简单交互~不得不吐槽，一开始我试图用surface shader实现，但是始终没法将最终的worldNormal转回tangent space，因为直接写回`o.Normal`就全乱套了……

{% include_code BumpMap.shader lang:glsl BumpMap.shader %}