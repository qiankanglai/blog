---
layout: post
title: Unity分层烘焙
date: 2016/1/3
tags: Unity
toc: false
---

Unity中的烘焙(不管是老的Beast还是新的Enlighten)有一个非常恼火的功能缺失：无法利用Culling Mask。不管是否设置了Baking为Realtime，还是修改了Culling Mask都没有作用，貌似只有整个设置光源物体的Active才有效。

<!--more-->

根据论坛说法，5.3会增加这方面功能但后来又说延迟到5.4，反正至今木有看到希望。有鉴于此，参考了[Beast lightmap ignores light culling mask and/or layers](http://answers.unity3d.com/questions/61158/beast-lightmap-ignores-light-culling-mask-andor-la.html)这个回答里的代码，我自己写了一遍从而实现了烘焙的Culling：

| 不带Culling | 带Culling |
|----------------------------------------------------------|----------------------------------------------------------|
| ![](/images/unity_bake_default.jpg) | ![](/images/unity_bake_culling.jpg) |

- 原代码中`(light.cullingMask & layerForGroup) > 0`这种判断是错误的
- 反复使用` UnityEditor.Lightmapping.BakeSelected`来烘焙多次，这个方法在某些Unity版本中可用，但是有时候会覆盖上一次烘焙结果，导致运行完之后只剩下了最后一次烘焙结果；我的解决方案是每次烘焙之后拷贝出当前的光照贴图，同时保存Renderer上的信息，最后一起复原(这部分可以参考{% post_link unity-lightmap %}里的代码)

这么干最大的好处是烘焙速度提高了不少(题外话：确保你的GI Cache足够大，不然速度感人...)；不好的地方就是Lightmap的利用率下降了，因为不同次烘焙的东西必然就不能放在一张贴图上了，会造成一定的浪费...