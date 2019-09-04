---
title: 光照贴图接缝
date: 2019-08-24 12:18:23
tags: Unity
mathjax: true
---

之前翻Unity的更新日志时候发现Progressive Lightmapper里自带上了[Lightmap seam stitching](https://docs.unity3d.com/Manual/Lightmapping-SeamStitching.html)。正好之前研究过这个问题，出于手痒也在Unity里实现了一发，在这里也整理下这个问题的原因、现象及解决办法。

下图为Unity文档示例，红框为有Seam的错误效果，绿框为修复效果。

![](/images/lightmap_seam.jpg)

<!--more-->

## 问题成因

模型展开2UV需要将三维模型平铺到平面，那么就可能出现这种情况(下图黄边)：两个相邻的面共用一条边，但是展开2UV之后是两条不同的边。

![](/images/2uv_seam.jpg)

烘焙的时候这两个相邻面上的像素各自计算光照，由于精度问题可能导致结果不一致，导致光照贴图上的瑕疵。

## 解决思路

这个问题我最早是在[Lighting Technology of The Last Of Us](http://miciwan.com/SIGGRAPH2013/Lighting%20Technology%20of%20The%20Last%20Of%20Us.pdf)看到，从Unity文档描述应该也是类似做法。

![](/images/seam_stitching.jpg)

下面具体解释下实现思路，其实核心就是两步。

### 找到Lightmap Seam

对于单个Mesh，我们可以直接获得对应的顶点坐标和2UV坐标。这里需要将三角形的Index数据全部展开，因为本身Mesh导入时候光滑组设置不同可能导致有时候同一个顶点能复用、有时候是裂开的顶点。

然后暴力搜索任意两条边，需要满足两个条件

- 两条边的起点、终点的位置重合
- 两个三角形的面法线差别不要过大

第二个条件相当于是一个自定义的阈值，因为如果本身面法线差别很大就说明光照本来就可能有较大差别。

### "粘合"Lightmap Seam

这一步其实就是stitching了。其实公式在前面PPT里已经列出：我们需要构造Ci使得两侧颜色误差尽量小，同时本身颜色变化尽量小。这个其实就转化为一个过拟合的最小二乘法，直接套用现成Solver即可。

ps. 这里有个小技巧就是不同通道颜色完全可以分别计算，每次相当于计算一个灰度图结果。

## 参考项目

我参考[ands/seamoptimizer](https://github.com/ands/seamoptimizer)移植了一个Unity版本实现[qiankanglai/seamoptimizer](https://github.com/qiankanglai/seamoptimizer)。

下图是测试结果：首先故意烘焙一个三方向硬边的结果

![](/images/lightmap_seam_unoptimized.jpg)

使用Lightmap Seam Stitching之后可以看到相邻边出现了一个过度

![](/images/lightmap_seam_optimized.jpg)

对比起见，将Lightmap改成Point Filter看的更加清楚

![](/images/lightmap_seam_optimized_point.jpg)

### 数学推导

这里稍微展开讲下数学部分，我们是如何去建模、求解这个能量方程的: 首先Lightmap Seam上采样若干对点，每对点(上图的$C_{0i}$和$C_{1i}$)又对应到光照贴图里的8个像素$C\_{i0}=\sum^{4}\_{j} w\_{0ij} t\_{0ij}$。这里考虑了bilinear采样，$w\_{0ij}$表达权重(也就是$C\_{i0}$距离四个点的距离)，$t\_{0ij}$表达光照贴图上这个像素的颜色。

然后我们来构造一个矩阵$AT=B$，其中T就是每个像素对应的值，$A$里面每一行对应一个约束，分为两类

- $A[k] = [... w\_{0i1} ... w\_{0i2} ... w\_{0i3} ... w\_{0i4} ... -w\_{1i1} ... -w\_{1i2} ... -w\_{1i3} ... -w\_{1i4} ...], B[k] = 0$ 这里A的其余项都是0，利用矩阵乘法的性质就是构造出$\sum^{4}\_{j} w\_{0ij} t\_{0ij} - \sum^{4}\_{j} w\_{1ij} t\_{1ij} = 0$即接缝两侧值要相同；
- $A[k] = [... \lambda ...], B[k] = \lambda * c$这里c为光照贴图原始像素的值，对应就是$t_{i} = c_{i}$即每个像素的值和原始值相比，不能变化过大。

这样就构造了一个过拟合的公式，利用最小二乘法求解即可。$lambda$是权重，控制最后的结果是更倾向于接缝消失还是更倾向于颜色变化小。

更具体的实现可以参考[Algorithm Analysis: Linear Least Squares Problem](http://www.programmersought.com/article/3597186469/)，提到了Chomsky decomposition method。

### 实现细节

实现的时候我遇到了一个非常坑的光照贴图编码问题：如何正确的把光照贴图数据读取出来，因为Unity在不同平台下自带了不同编码方式...当时折腾了半天没搞定，最后野路子直接写了个`Hidden/DecodeLightmap`的Shader把原始光照贴图拷贝到一个Float纹理然后读出来，算是绕开这个大坑...

其他的还好就遇到了几个小问题。

ps. 这个工程是我做着玩的，没有在大规模场景测试过...

### 使用说明

我简单包装了一下，功能都在菜单里

![](/images/seamoptimizer_menu.png)

- Optimize Lightmaps: 一键优化接缝，其实是在Unity自带的光照贴图旁边生成一堆优化过的版本
- Apply Optimized Lightmaps: 将处理过的光照贴图应用到场景
- Apply NonOptimized Lightmaps: 将原版光照贴图应用到场景
- Visualize Mesh 2UV/Seams: 调试功能，无视

代码里有两个参数`cosNormalThreshold`控制那些面需要平滑接缝，`lambda`控制能量函数权重。