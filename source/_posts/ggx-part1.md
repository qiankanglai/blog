---
layout: post
title: Guilty Gear Xrd
date: 2015/10/9
tags: Unity
toc: false
---

之前Trace翻译过[西川善司「实验做出的游戏图形」「GUILTY GEAR Xrd -SIGN-」中实现的「纯卡通动画的实时3D图形」的秘密](http://www.cnblogs.com/TracePlus/p/4205798.html)系列，后来问他要了份[Rip](http://www.cnblogs.com/TracePlus/p/4234431.html)，对照着在Unity里山寨了份。

<!--more-->

![](/images/ggx1.gif)

对照着翻译做下来的感觉基本就是Blinn Phong+Toon Shading，然后配合贴图控制参数。日本人关于“阴·影”的区别也挺有意思的。

做的过程中尝试比对了下校正法线前后区别，我眼神不好看不太出... 左边是用引擎计算的，右边是导入max的

![](/images/ggx_normal.jpg)

再试了下换SSS贴图，使得阴部分产生变化

![](/images/ggx_sss.jpg)

比较遗憾的是没有搞出顶点色，所以无法进一步尝试控制描边效果；本村线也没有搞定，如果有哪位弄出来了希望指点一下。Rip出来的模型有2个uv channel，不过两个相差不大所以无从下手了；有vertex color不过是空的 TAT

最后例行吐槽Unity: 对于多Pass的Shader(我这里用了背面膨胀描边)，必须在Tag里指定`Tags { "LightMode"="ForwardBase" }`才能获得有效的`_LightColor0`等数据，参考[SL-PassTags](http://docs.unity3d.com/Manual/SL-PassTags.html)。

这里最坑的地方是此问题在场景里有别的Surface Shader的时候会被掩盖，因为别的Pass得到的数据会被顺延到这个Shader，但又无法保证这个数据是其对应的光源...
