---
layout: post
title: 卡通渲染
date: 2016/6/10
tags: [GameArtTricks,Translation]
toc: false
---

实现一个简单的漫画效果(在物体周围描边)是非常简单的事情。多年前在Games Academy上，制作漫画风格冒险游戏[Tummy Trundle](http://www.games-academy.de/home/projekte.html)的开发人员研究如何实时的实现这个效果。[Falk](http://www.fa-so.de/)提出了一个解决方案：复制3D模型本身，扭转法线方向，将其设为黑色的材质球并沿着法线挤压其表面。

<!--more-->

![](https://data.simonschreibt.de/gat007/mrturtle_stepbystep.gif)

本质上是画了一个比原来略大一些的黑色海龟。但是因为这个黑色模型的法线是翻转过的，所以只能看到其重叠部分。

### (原文作者)更新1

[Christopher](http://www.cjonesdev.com/)很赞的提供了两个实现『真·描边』的其他方法：

- [Unity Edge Detection](http://docs.unity3d.com/Manual/script-EdgeDetectEffect.html)
- [Edge Detect Effect Normals](http://docs.unity3d.com/Manual/script-EdgeDetectEffectNormals.html)

(译注: 图像空间的做法，恩...)

### (原文作者)更新2

[Nicolae Berbece](https://twitter.com/xelubest)给我了一个超级棒的技巧：如何针对2D精灵实现描边。他的思路是将其拷贝8次，然后改变颜色并朝着8方向移动。

(译注: UGUI里的Shadow和Outline就是这么干的...)

<video width="100%" controls="" loop="" preload="meta"><source src="https://data.simonschreibt.de/gat007/update2/moveordie_outline_01.webm" type="video/webm;codecs=&quot;vp8&quot;"><source src="https://data.simonschreibt.de/gat007/update2/moveordie_outline_01.mp4" type="video/mp4"></video>

你可能觉得只需要将一个元素本身方法就行了，就像3D版本一样。乍一看貌似没问题但是仔细看，你会注意到几个有问题的地方：

<video width="100%" controls="" loop="" preload="meta"><source src="https://data.simonschreibt.de/gat007/update2/moveordie_outline_02.webm" type="video/webm;codecs=&quot;vp8&quot;"><source src="https://data.simonschreibt.de/gat007/update2/moveordie_outline_02.mp4" type="video/mp4"></video>

当然多画8个精灵会有更多性能消耗，但是如果你只是针对小区域这么干的话完全没问题。另外你也能从这个技术里获取很多优势！

![](https://data.simonschreibt.de/gat007/update2/advantages.jpg)

我用PS做了一个『完美』的描边效果作为对比，可以看到刚才的思路能做出很棒的头发剪影效果：

<video width="100%" controls="" loop="" preload="meta"><source src="https://data.simonschreibt.de/gat007/update2/moveordie_outline_advantage01.webm" type="video/webm;codecs=&quot;vp8&quot;"><source src="https://data.simonschreibt.de/gat007/update2/moveordie_outline_advantage01.mp4" type="video/mp4"></video>

同时这个方法也支持渐隐(注意下图手腕部分)

![](https://data.simonschreibt.de/gat007/update2/moveordie_outline_advantage02.jpg)

最后是最重要的特点，也是我最喜欢的: 普通的点可以映射成小花的形状！

![](https://data.simonschreibt.de/gat007/update2/moveordie_outline_advantage03.jpg)

(译注: 其实这个小花我后来问了下，就是一个圆点上下左右这样移动8次组成的...我一开始理解成可以映射成任意形状)

希望大家能喜欢这个小技巧，并感谢Nicolae分享！

[原文链接](https://simonschreibt.de/gat/cell-shading/)