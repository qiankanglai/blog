---
layout: post
title: Unity中光照贴图一二坑续
date: 2016/3/15
tags: Unity
updated: 2016/4/11
---

之前写过一篇{% post_link unity-lightmap %}，最近帮朋友看了些与AssetBundle结合的时候发现了一个新的问题...依然坑的飞起

<!--more-->

# Case 1

| Simulation Mode | Asset Bundle |
|--------------------------------------------------------------------------|----------------------------------------------------------------------------|
| ![](/images/unity_ab_lm_right.jpg) | ![](/images/unity_ab_lm_wrong.jpg) |

这个是用官方的AssetBundle例子改的，发现对于烘焙过的场景：

- Simulation Mode下直接载入工程里的场景文件，显示正常的效果
- Asset Bundle下载入打包出来的ab中的场景，显示错误

利用Frame Debugger分析对比了两种情况：

| Simulation Mode | Asset Bundle |
|--------------------------------------------------------------------------|----------------------------------------------------------------------------|
| ![](/images/unity_ab_lm_right_frame.jpg) | ![](/images/unity_ab_lm_wrong_frame.jpg) |

可以看到对应的宏一个是`LIGHTMAP_OFF`，一个是`LIGHTMAP_ON`。但是场景里确实已经利用之前我提到的API设置了Render对应信息。最后发现了另一个不同之处：

![](/images/unity_ab_lm_wrong_detail.jpg)

也就是说AssetBundle载入出来的场景是丢失了static信息... 后来我在官方论坛上找到了一模一样的BUG: [Unity 5.3 - Objects in scenes loaded from AssetBundles are losing their STATIC flag](http://forum.unity3d.com/threads/unity-5-3-objects-in-scenes-loaded-from-assetbundles-are-losing-their-static-flag.377771/) ┑(￣Д ￣)┍

## Case 1 Solution

简单粗暴的解决方法就是和我前面用的方法一样，不是直接载入整个场景而是用prefab化的物体，这样载入出来的东西不会丢失static信息

![](/images/unity_ab_lm_right_detail.jpg)

# Case 2

这是菜狗几个月前问我的一个问题，也是遇到了从Asset Bundle里载入的场景和原来不一致的情况。与Case 1不同的是，他的场景里不全是烘焙，所以载入之后一方面要利用API设置各种Lighting信息，最后记得

{% codeblock lang:csharp %}
DynamicGI.UpdateEnvironment();
{% endcodeblock %}

另一方面就是只能强行关掉lightmap，不然出来的结果就是不一样 (╯‵□′)╯︵┻━┻

![](/images/unity_lm_ab_compare.jpg)

<del>也许Unity想的是至少实时部分我复原了...</del>

# TODO

今天听一个老司机说，也许可以通过`StaticBatchingUtility.Combine`解决~这样生成的新的Mesh是带static flag的(待测试)