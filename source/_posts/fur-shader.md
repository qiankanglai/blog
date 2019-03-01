---
layout: post
title: Fur Shader
date: 2014/11/15
tags: Unity
updated: 2014/11/16
toc: false
---

花时间看了下毛发效果，苦于囊中羞涩没能买[QuickFur](https://www.assetstore.unity3d.com/#!/content/11866)、[furFX](https://www.assetstore.unity3d.com/en/#!/content/9201)等插件，最后找到了[Fur Shader](http://forum.unity3d.com/threads/fur-shader.4581/)学习了一下。

<!--more-->

![](/images/furshader1.jpg)

这个代码一开始貌似是Unity 3.x版本的，我稍微改了几个地方，不然在Android上是黑的：

- 第一遍绘制的时候`Blend Off`不知道为何，在Nexus 5上起不了作用，我就单独重写了第一遍Pass、保证底图能画上去；
- `Alphatest Greater [_Cutoff]`据说性能比alpha blend还糟，而且效果不明显就被我直接注释了；
- 把第二个文件用`CGINCLUDE ENDCG`合并进来；
- 把VertexProgram改成了vert/frag形式。

这段代码为了利用光源，还单独写了一个Script将两个平行光的方向和颜色传进来~偷懒起见也被我干掉了。

简单解释一下原理：这个说穿了，就是画多个Pass，然后每个Pass中将顶点沿着法向方向挪动出来一部分，同时控制顶点的alpha：

- 移动的越往外的顶点alpha越小
- 法向量与视线越接近垂直的顶点alpha越小

最后在vert里根据normal计算下顶点的Diffuse Light，传到frag之后采样贴图乘上去就行了。

这里把相邻Pass挪动顶点的距离放大，就很清晰的看到一层层结构：

![](/images/furshader2.jpg)

顺便提一句就是，我也见到有人是从噪声纹理贴图中取alpha，配合前面的“移动的越往外的顶点alpha越小”规则，调出一个Fur。

此外，我看了下asset shop里那俩插件的描述：

> The package comes with 3 detail levels, with 10, 20 and 40 steps. More steps gives you more detailed fur, but is more expensive to render. 

> Pack contains multi pass FUR shaders with many extra features like physics based fur movement, fur gravity, custom coloring etc. Shaders are compiled.

感觉是同一个思路，不过控制每个Pass中顶点移动方式更加多样罢了……具体在移动设备上性能还需要再研究研究，不过随便搞20 Pass这种事情还是不幻想了...