---
layout: post
title: Teleglitch RGB闪烁
date: 2016/4/9
tags: [GameArtTricks,Translation]
toc: false
---

如果你在[Teleglitch](http://teleglitch.com/)中使用传送门，会出现一个很有意思的特效。我仔细看了下，感觉他们就是在RGB通道分别扭曲(distort)了下画面。我相当喜欢这个看上去有点硬件坏了的效果...

<!--more-->

译注:在下图中我截取了几帧放在Teaser，看起来比较好懂。本质上是三个通道分别扭曲，然后随着时间减小扭曲强度，最后返回原样...

![](https://data.simonschreibt.de/gat003/teleglitch_rgb.gif)

讲真，这个让我想到了另一个游戏[Deadlight](http://www.deadlightgame.com/)。我觉得他们也是分别在RGB通道里加了点特技。从下图右上角那个水箱上，可以比较明显的看出这一点(译注: 作者指的是整张图片右上角那个黑又粗的柱子上，仔细看这个柱子的边缘会闪出蓝色)。不过由于游戏开发者在[The Art of Deadlight](http://www.youtube.com/watch?v=b0Huw18GsUY)里并没有提到这一点，所以我也不是非常肯定。

![](https://data.simonschreibt.de/gat003/deadlight_rgb.gif)

### (原文作者)更新

Deadlight的开发者[David Miranda](http://cmonteroart.blogspot.de/)表示这个效果被称为[Chromatic Abberation](http://en.wikipedia.org/wiki/Chromatic_aberration)，能够用来模拟不干净镜头的老相机效果。CE里也用这个在水的shader里模拟不同波长光线分离效果。

### 译注

我之前在图像处理课程当助教的时候，布置过类似效果~当时是做了个LOMO滤镜，日系画风(逃)，不过用Mask就解决问题了哈哈哈哈

原文评论部分里的解决方案是:从屏幕中心到周围边界部分，增大扭曲效果强度~

[原文链接](http://simonschreibt.de/gat/teleglitch-rgb-flickering)