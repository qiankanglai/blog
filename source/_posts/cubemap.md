---
layout: post
title: unity中cubemap使用的一些想法
date: 2014/11/8
tags: Unity
---

一般在渲染中，是使用cubemap来预计算环境反射，但是怎么玩好这个东西，我之前并没有考虑太多。最近和桌子讨论了挺多环境贴图的使用方式，在这里记录一下想法(偷懒起见，示意代码都是surface shader)。

<!--more-->

# too young too naive

最简单的利用当然是直接根据反射方向采样：

{% codeblock lang:GLSL %}
float3 environment = texCUBE(cube, IN.worldRefl)
{% endcodeblock %}

这里其实是假设cubemap是记录了无穷远的内容，反射的时候直接根据世界坐标系中反射方向直接采样即可。
ps. 这个其实就是skybox~

# Image Based Lighting

如果我们只考虑采集一个小范围的环境贴图，例如一个屋子里，那么用前面所提到的方法就会有瑕疵：参考GPU Gems Chap.19 [Image-Based Lighting](http://http.developer.nvidia.com/GPUGems/gpugems_ch19.html)的例子，当物体移动但法向不变时，其实我们是希望看到反射部分产生变化，这样才能更加真实。

具体实现也不难，求解一个一元二次方程就行了。参考链接里提供了对应的vertex/fragment shader，不过我做的比它简化一些：只考虑cubemap的center和radius，不考虑旋转、缩放等，因此不需要生成Lighting这个坐标系、直接在世界坐标系计算就行了。需要注意以下两点：

- shader里`texCUBE`函数不要写在if内
- 当一元二次方程无解的时候处理一下

这样做了之后，对于非无限远的cubemap内物体的移动效果相当不错，可以和周围对上；但是由于分辨率问题，而且我是用球来算的，因此在长方体的八个角的地方有瑕疵。

ps. 桌子跟我提到这个，是因为unreal里的采集器出来的效果就自带了，不过我之前读了UE4的shader没有找到相关代码，也许是CPU部分计算的？不过它的效果的边缘情况处理比我好很多，而且有box形状的。具体等以后有心情再研究研究。

# Fuck Your Brain

上一块提到的方法总体来说已经能够使用了，但是运算量有点大，所以桌子提出了一种脑洞大开方法：直接把cubemap里要画的物体直接贴在plane上，倒贴物体下方。。。然后绘制的过程就直接先画一遍物体本身、然后再画一遍低膜版本的倒置物体、将反射的颜色blend上去。也就是说完全不用后计算真实地cubemap采样方向，而是直接绘制对应的“倒影”物体。

我用stencil实现了一下，相比上一个方法减少了fragment shader里的计算、但是多了几个draw call。经过美术调参数也能实现类似的效果，真是脑洞大开啊……不过这个只适合要倒影的物体很少的情况，而且做起来略微丧心病狂。