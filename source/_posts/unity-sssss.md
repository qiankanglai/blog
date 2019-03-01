---
layout: post
title: 山寨SSSSS
date: 2015/1/10
tags: Unity
toc: false
---

主要参考了[KlayGE里的SSSSS实现](http://www.klayge.org/2013/12/24/klayge-4-4%E4%B8%AD%E6%B8%B2%E6%9F%93%E7%9A%84%E6%94%B9%E8%BF%9B%EF%BC%88%E5%9B%9B%EF%BC%89%EF%BC%9Asssss/)，在Unity里山寨了一下:

<!--more-->

| SSSSS打开 | SSSSS关闭 |
|----------------------------------------------------------|----------------------------------------------------------------------------|
| ![](/images/unity_sssss_on.jpg) | ![](/images/unity_sssss_off.jpg) |

然后不得不吐槽u3d的API太少了，怎么优化都不给力...

- 参考[MRT example](http://forum.unity3d.com/threads/mrt-example.152050/#post-1118431)用倒是用出来了，不过有点麻烦，而且后来根本没法跑3个Loop，删到只剩下x/y方向各一次也用不上了...
- 在后处理里没法用stencil真是猎奇啊啊啊，[Using the stencil-buffer in a post-process?](http://answers.unity3d.com/questions/621279/using-the-stencil-buffer-in-a-post-process.html)这个帖子里描述的一模一样;
- 替换掉`Graphics.Blit`也基本没有效果提升;
- 没有factor blend真麻烦，还要自己在代码里算混合...
- 最后还尝试了在`OnPostRender()`里搞，如果是相机有RT的话、这样能读取到stencil倒是，不过会有[其他的问题](http://answers.unity3d.com/questions/799941/blit-camera-targettexture-to-screen.html)

反正就是各种蛋疼，N5上都只有30fps；实在不行只能考虑纹理空间的SSS了，不然每次算整个屏幕太费了~

{% include_code SSSSS.shader lang:glsl SSSSS.shader %}

{% include_code SSSSS.cs lang:csharp SSSSS.cs %}