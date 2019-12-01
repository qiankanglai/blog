---
title: 奇妙的Shader精度
date: 2019-11-28 20:29:09
tags: Shader
---

前几天同事在PC(DX11)上遇到了一个很有意思的问题: 顶点属性经过插值之后从一个非常接近0的正值变成了负数...堪称有毒。

<!--more-->

先看下renderdoc抓出来的Mesh View, 三角形顶点输出的attr

![VS Out](/images/shader_precision1.jpg)

然后是Pixel Debug中的插值输入数据

![PS In](/images/shader_precision2.jpg)

这就很尴尬了...直觉反应估计是float精度的问题，但是从正数变到负数我还是想不通(考虑软光栅实现里的perspective interpolation只有加、乘、除，没有减)

我做了一些测试：

- 如果输出的attr强制一样，譬如都是4e-38，插值出来的没问题
- 插值方式用`nointerpolation`或者`noperspective`，结果也没问题 (参考[HLSL Struct Type](https://docs.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-struct)文档)
- 输出的attr乘以100000，插值出来也没问题

我特意把`SV_POSITION`和`LocalPosition`代入计算了一下，确保这个像素确实是在三角形的内部(而且还不是边或者点这种corner case)。然后就陷入僵局...


我查了下网上关于float precision的资料，首先这个值还没落到denorm里去，其次不管是Round To Zero还是Round To Nearest应该最多误差UNP也不会反转符号位才对.. 有了解或遇到这个情况的朋友还请分享一下-。-

ps. 网上找资料的时候发现了一个非常好的系列博客 ，强烈推荐[Benchmarking floating point precision in mobile GPUs](https://community.arm.com/developer/tools-software/graphics/b/blog/posts/benchmarking-floating-point-precision-in-mobile-gpus---part-iii): 利用shader在不同设备上测试了float精度问题、探讨了denorm实现以及分析了RTZ/RTN。顺便也就解释了为什么normalize/exp这种高危操作一定要保护的原因

pps. 有同事发了GLES的Spec，里面对float precision也有提及，不过没前面的那个博客看的过瘾