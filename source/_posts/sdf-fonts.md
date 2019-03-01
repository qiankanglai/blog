---
layout: post
title: SDF字体
date: 2015/12/5
tags : [Unity, KlayGE]
thumbnail: /images/teaser/textmeshpro.jpg
toc: false
---

之前一段时间项目到了一个节点，忙于出包和应付渠道，没太多时间业余充电...最近空下来之后终于有空继续折腾KlayGE。这次是把字体部分kfont读了下，感受到了SDF(Signed Distance Field)的厉害之处。

<!--more-->

在游戏引擎里，当需要渲染某个文字时，一般是用freetype或类似的工具，生成一张灰度纹理，然后用俩三角形绘制到屏幕上。这种bitmap贴图的问题就在于放大之后由于mipmap会导致边缘糊掉。SDF主要解决的是字体放大之后模糊的问题，因为它的贴图里保存的不再是灰度值，而是距离边缘的距离；这个值在mipmap模糊后依然能有效的重建出硬边。

本来想参考KlayGE的kfont自己写一个Unity的实现，后来发现Text Mesh Pro已经很好的支持了这一点，我用其测试工程和原生Text Mesh比较了下确实是吊打的效果...


导入游戏里比较了下，加上描边对比非常明显(项目里使用的是UGUI)。我们原来是通过很大的字号+很小的localScale来保持文字锐利的...

![](/images/unity_textmeshpro2.jpg)

唯一的遗憾是不支持动态生成SDF，作者有提到[在日程安排中](http://digitalnativestudios.com/forum/index.php?topic=169.0)。这个特性对于CJK来说还是挺重要的...

顺便发现一个小技巧：对于不同的Font Material，可以通过右键、Duplicate新建，然后通过拖拽材质到Material部分来选择不同的Font材质。UGUI Component貌似只能通过这个方法来切换材质，因为同一材质里Outline等属性都是共用的。