---
layout: post
title: Unity Profiler介绍
date: 2014/12/27
tags: Unity
toc: false
---

Profiler是3D引擎中一个非常重要的工具~之前为了测试Unity在手机上的性能，做了一系列测试，然后发现了一个有点奇怪的现象：同样是若干旋转模型+一个光源，在Nexus 5运行到30fps时，有俩Test Case面片数相差的非常多~(都故意没开Dynamic/Static Batch DrawCall)。

<!--more-->

| Test Case 1: | Test Case 2: |
|----------------------------------------------------------|----------------------------------------------------------|
| ![](/images/unity_profiler_test1.jpg) | ![](/images/unity_profiler_test2.jpg) |

Unity自带了一个[Profiler](http://docs.unity3d.com/Manual/Profiler.html)，这是个Pro版本才有的功能，准备利用这个试试能不能找到原因。话说官方文档里的这块说明其实不全，还需要修改下两个地方才能在Android上打开这个：

![](/images/unity_profiler_android.jpg)

分别运行一下两个场景

![](/images/unity_profiler_test1_p.jpg)

![](/images/unity_profiler_test2_p.jpg)

对比一下：Test Case 1里Draw Call有1k多，面片数才14.1k；Test Case 2里面的Draw Call才500左右，但是面片数到了111.5k。具体对比一下发现一个是`Shader.setPass`相差不少，另一个就是`Mesh.DrawVBO`(但是和Calls确实是相关的)...再检查了一下，发现原来是因为一个是平行光，一个是点光源(╯‵□′)╯︵┻━┻ 真是逗比原因……

经过一番调整+测试，全用平行光之后就差不多了(ps. 这时候旋转物体的脚本变成了一个较大的占用)。不过还是要感慨下：

- 移动平台上还是尽量不要动态光源了，最多有个平行光，其他全用Lightmap或者Shader假光源算了；
- Shader的切换果然是一个很费的事情啊啊啊；
- 在同一场景、使用不同的光源会导致面片数变化，这个应该是因为在管线里要渲染多次造成的(ForwardBase/ForwardAdd例如)，不过这个需要进一步研究...

题外话：对于Android来说，其实还可以用芯片厂商的Profiler工具，也挺有意思; iOS直接用Xcode就行了~

![](/images/adreno_profiler.jpg)