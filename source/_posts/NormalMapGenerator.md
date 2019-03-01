---
layout: post
title: 从任意图片生成NormalMap
date: 2015/8/24
tags: Unity
toc: false
---

之前有人给我发了一个[NormalMap-Online](http://cpetry.github.io/NormalMap-Online/)，在线从任意图片生成法线纹理。这个功能还是挺常见的，专业工具如[CrazyBump](http://www.crazybump.com/)，或者Unity之类的引擎都自带。不过既然有Javascript版本，就可以看看到底是怎么实现的，然后用C++实现了下。

<!--more-->

![](/images/NormalMapGenerate.jpg)

核心思路非常简单粗暴：

- 将输入图片灰度化；
- 通过Sobel或Scharr算子作为梯度dx/dy；
- 输入参数控制dz；
- 归一化向量(dx, dy, dz)。

这样同时满足了几个条件：生成的Normal与图片梯度一致；通过修改dz可以调整整体的Bumpness。

与之前图像处理的知识结合，很有意思~

[C++代码](https://github.com/qiankanglai/blog/raw/master/raw/NormalMap.zip)