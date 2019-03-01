---
layout: post
title: Unity中Temporal AA
date: 2015/2/25
tags: Unity
---

这个东西是trace在群里提到的，然后我看了一些相关资源[Filtering Approaches for
Real-Time Anti-Aliasing](http://iryoku.com/aacourse/)(很多sig course好棒好棒)、[High Quality Temporal Supersampling](https://de45xmedrsdbp.cloudfront.net/Resources/files/TemporalAA_small-59732822.pdf)、[CryENGINE3 Graphics Gems](http://www.crytek.com/download/Sousa_Graphics_Gems_CryENGINE3.pdf)。在这么多资料(其实是现成代码...)的帮助下，我主要参考CryEngine里的SMAA 1TX山寨了下，UE4的那个有点过于麻烦了。

<!--more-->

# 备忘

- Unity中矩阵是左乘的，和UE4里相反，所以在对projectionMatrix做jitter的时候要反下
- `UNITY_MATRIX_MVP`在之前的post里已提过，这个是卡我最久的地方(╯‵□′)╯︵┻━┻
- Depth Buffer也在同一个post里提了，这是卡我第二久的地方……
- `OnRenderImage`里如果不手动设置`RenderTexture.active`的话，最好要保证最后对dest调用下`Graphics.Blit`，不然之后画的就乱七八糟了

其实都是一些API上的东西，搞的我连蒙带猜的...

# 效果

自我感觉效果还行吧...一开始边缘一直有闪动，慢慢改对代码之后降低了不少，最后就调参数了只能...

Temporal AA: 

![](/images/unity_temporal_aa_on.jpg)

W/O AA: 

![](/images/unity_temporal_aa_off.jpg)

Nexus5真机

| Temporal AA | W/O AA |
|--------------------------------------------------------------------------------------|------------------------------------------------------------------------|
| ![](/images/unity_android_temporal_aa_on.jpg) | ![](/images/unity_android_temporal_aa_off.jpg) |

放大出来还是能看出来的

![](/images/unity_android_temporal_aa_compare.jpg)

# 性能

在Nexus 5上跑了下Shadow Gun Sample Level这个场景，每帧消耗时间大概增加了7ms；从profiler上来看主要是因为用到了Depth Texture，而且看起来不是直接用的ZBuffer导致的(见{% post_link unity-misc %})，话说还是Defer大法好-_,-

![](/images/unity_profiler_temporal_aa.jpg)

NVidia在[Far Cry 4 Graphics, Performance & Tweaking Guide](http://www.geforce.com/whats-new/guides/far-cry-4-graphics-performance-and-tweaking-guide#far-cry-4-nvidia-txaa-anti-aliasing)中有不同AA效果对比；TweakGuides的[Crysis 3 Tweak Guide](http://www.tweakguides.com/Crysis3_6.html)中有一节专门讲Antialiasing，里面有性能图标。后来问了下老大，她意思就是AA还是比较费的，等有性能余地的话才加；而且比较尴尬的是手机屏幕上其实看不太出区别，看来还是要配合动态分辨率+upscale~

{% include_code TemporalAA1Tx.shader lang:glsl TemporalAA1Tx.shader %}

{% include_code TemporalAA.cs lang:csharp TemporalAA.cs %}
