---
layout: post
title: 利用Projector实现动态阴影
date: 2016/11/14
tags: Unity
thumbnail: /images/teaser/projector_shadow.jpg
---

很早之前想整理的一篇内容，之前守护的时候利用Projector实现了动态的阴影(见Teaser)，接下来的几个项目目前也会用这个思路继续做下去。

<!--more-->

下面将分几个部分来介绍Projector实现的动态阴影：原理，与Unity自带的ShadowMap优劣比较，以及坑和进一步优化。

# Dynamic Shadow Projector

守护的影子是基于Asset Store上的[Dynamic Shadow Projector](https://www.assetstore.unity3d.com/en/#!/content/35558)插件修改制作的。

原理其实非常简单：使用Command Buffer控制相机里绘制Cast Shadow部分的模型到一个Render Texture；对这个Render Texture做一定处理之后(譬如是否打开MipMap，是否模糊等)，利用[Projector](https://docs.unity3d.com/Manual/class-Projector.html)将其投影到Receive Shadow的部分。本质上就是生成一个贴图放影子，然后用`tex2DProj`画上去。

# 与ShadowMap优劣比较

## 劣势

- 无法实现自阴影，或者说实现代价比较大
- 绘制影子物体的时候无法Batch

## 优势

- 可以很方便的实现模糊、软阴影；@赵忠健在[ScreenSpaceShadowMask Blur](http://blog.uwa4d.com/archives/ScreenSpaceShadowMaskBlur.html)里也对ShadowMap实现了模糊，但是为了完美嵌入Unity自己的RenderLoop需要折腾下
- 可以控制增量更新，譬如产生影子的物体没有变化的时候，影子就完全不需要重绘
- **可以很方便的控制投影的范围**，这是我觉得最重要的一点

当然它们也有一些共通的地方，可以很方便的控制Cast Shadow/Receive Shadow的部分。

# 需要注意的坑

主要是使用的时候需要注意(对ShadowMap的使用来说也是类似的)：

- 务必控制Cast Shadow/Receive Shadow的物体个数，保证不需要的物体不会参与绘制！以守护为例，只有几个模型参与了绘制，而且**当模型超出范围之后立刻挪出渲染队列**；**接受影子的只有一个大平面**，周围复杂的场景部分压根不参与Receive。

- 某些机器的显卡对于`tex2DProj`支持的有问题，不过目前只看到一个红米有...在这个设备上ShadowMap也是有问题的，所以目前还是处于没辙的状态。

# Fast Shadow Receiver

当然，还有进一步优化的方法。我在另一个项目里直接使用了低模作为Geometry Proxy，降低Cast Shadow的消耗；另外有个插件[Fast Shadow Receiver](https://www.assetstore.unity3d.com/en/#!/content/20094)可以显著降低Receive Shadow消耗：

![](/images/fastshadowreceiver.jpg)

原理也非常简单粗暴：直接生成一个Mesh来接受影子，对肯定接受不到的部分就不参与绘制。这个插件牛的地方在于它同时实现了Plane级别的接受和Mesh级别的，因为它直接实现了一个树形结构来保存Mesh信息，按需生成(目瞪口呆脸...)。譬如原来是一个复杂的场景接收影子的话就需要重绘整个模型，现在只需要绘制一小部分的网格就可以了～