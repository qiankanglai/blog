---
layout: post
title: FFT Ocean Part 2
date: 2017-08-04 18:42:54
mathjax: true
tags: Unity
toc: false
---

最近读了[利用GPU实现大规模动画角色的渲染](http://www.cnblogs.com/murongxiaopifu/p/7250772.html)有感，终于想起来把一个两年前的坑{% post_link fft-ocean-part1 %}给填啦(~~我又一次战胜了拖延症~~)。之前做的时候思路有点问题，只考虑了用Scale/Offset来序列帧的情况，搞的自己很繁琐；现在开阔脑洞直接用vertex ID就方便多了。

<!--more-->

![](/images/fft_part2.gif)

左边是CPU FFT，右边是将顶点信息Bake到贴图之后利用vertex texture fetch实现的版本。

Shader参考了今年[Advances in Real-Time Rendering in Games](http://advances.realtimerendering.com/s2017/index.html)里的[Crest: Novel Ocean Rendering Techniques in an Open Source Framework](https://github.com/huwb/crest-oceanrender)实现。

![](/images/fft_bake.jpg)

从这张图其实就能看出来怎么做的，横坐标就是vertex id，纵坐标就是时间。具体的使用方式和嘉栋的代码一样：

{% codeblock lang:glsl %}
float x = (vid + 0.5) * _PosTex_TexelSize.x;
float y = (_Time.y + 0.5) * _PosTex_TexelSize.y;
float4 uv = float4(x, y, 0, 0);

v.vertex = float4(tex2Dlod(_PosTex, uv).xyz, 1);
v.normal = tex2Dlod(_NmlTex, uv).xyz;
{% endcodeblock %}

具体实现的时候也遇到了不少的坑。

# 周期性

从最原始的公式上来说，这玩意儿其实是不好做序列帧的因为没有准确的周期。但实际实现的时候$\tilde{w(k)}=[[\frac{w(k)}{w_0}]]w_0$也就是说$\frac{2\pi}{w_0}$一定是一个周期。

这里还可以进一步优化，譬如找到这些角速度的最大公约数，来获得一个更小的周期。

# 精度

有了周期大小之后，只要划分若干段采样就行了。相邻两段之间是使用的线性插值，然而FFT计算并不是线性的，所以如果每段步进过大，那么插值出来的结果就会和正确值差很多...我第一次做的时候发现采样出来的非常『丑』，后来调整参数就好了多了。

# FOAM

这是从Crest里学到的一个小技巧，通过计算det来得到浪花的强度。我之前只知道利用这货来判断是否出现overlap...

这里如果直接使用坐标的y来作为强度是有问题的，因为可能会出现比较高的波谷、也可能出现比较低的波峰；正确的做法是考虑考虑周围一格的高度值作为对比。

# 渲染

这部分在网上参考了好几个实现，基本上要考虑几个方面

- 海水颜色，一般是用一个ramp，或者简单点就是深水和浅水根据y插值
- 反射，特别是Skybox部分的贡献
- 折射，水下部分
- 浪花，基本都是一个uv动画的贴图
- 法线贴图，我发现光FFT生成的Geometry Normal还是不够用，贴上两张Bump作为细节纹理效果会好很多
- SSS/太阳平行光等加分项

# TODO

目前实现的这个版本只能作为原型，如果以后实用化的话还有很多工程细节要完成。

- Grid拼接
- LOD处理
- GLES2 Fallback
- 使用RGBA8888来encode输入贴图，节约精度

能不能用上还是看项目驱动了(逃