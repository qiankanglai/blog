---
title: Unity试水Bent Normal
date: 2018-07-16 12:44:39
tags: [Unity]
thumbnail: /images/teaser/bentnormal.jpg
---

最近半年赶项目的事情一直很忙，好不容易上周末的时候有空做点渲染的东西玩，于是尝试了一下[Bent Normal Maps](https://docs.unrealengine.com/en-us/Engine/Rendering/LightingAndShadows/BentNormalMaps)。

这是UE 4.17发布的功能之一，可以拿来解决间接光照漏光；工具部分Substaince Designer已经支持[利用高模烘焙Bent Normal](https://support.allegorithmic.com/documentation/display/SDDOC/Bent+Normals+from+mesh)。效果图对比来自UE4文档：

![](/images/bentnormal_ue4.jpg)

<!--more-->

# 算法原理

为了实现这个，首先要理解一下思路。这货我在网上找了半天介绍，最后发现其实是一个『老概念』了... [GPU Gems Chap. 17 Ambient Occlusion](http://developer.download.nvidia.com/books/HTML/gpugems/gpugems_ch17.html)里面是这么描述的

> The approach can also be extended to produce the average unoccluded direction, or bent normal. We can use a shader to calculate the direction to the light multiplied by the shadow value, and then copy the result to the RGB output color. The occlusion information can be stored in the alpha channel. We accumulate these RGB normal values in the same way as the occlusion value, and then we normalize the final result to get the average unoccluded normal. Note that a half (16-bit) floating-point accumulation buffer may not have sufficient precision to represent the summation of these vectors accurately.

游戏里的低模带上法线代表的是高模的法线，但是这里其实没有考虑周围Mesh的遮蔽影响。如果间接光照直接使用普通法线，就可能出现『暗部漏光』的现象。

![](/images/bentnormal_algorithm.jpg)

偷懒的童鞋可以参考一份中文介绍 [Bent Normal (环境法线?)](https://blog.csdn.net/BugRunner/article/details/7272902)。

# 基于Unity的Bent Normal Baker

虽然Substaince Designer可以直接烘焙(话说也可以用SSAO后处理，不过弄手游的暂时就不贪心了...)，但出于做着玩的角度，肯定是尝试在Unity里实现烘焙。 

GPU Gems里提到的是*This method is based on a view-independent preprocess that computes occlusion information with a ray tracer and then uses this information at runtime to compute a fast approximation to diffuse shading in the environment. * 我脑洞了一下：是否可以用Unity的ShadowMap来替代可见性计算:

- 生成一个球状平行光分布(真正烘焙的时候会比这个密很多)

![](/images/bentnormal_lights.jpg)

- 每次从不同角度渲染物体，利用Shadow Map可以得到每个像素可见性。有几个需要注意的地方：
  - 输出到2UV(这个技巧可以参考之前博客 {% post_link sgmodelinspector %})，记得关掉Cull/ZTest等；
  - Light上用Hard Shadow，需要的话调整下Bias等参数；
  - 不要用Screen Space Shadow；
  - 注意相机位置、模型大小，让Shadow Map利用率最高；

![](/images/bentnormal_uv2.jpg)

ps. 我一开始是使用`Graphics.DrawMeshNow`直接绘制到RenderTexture的，后来发现很多变量引擎不会自动传过去特别闹心... 最后换了个路子，直接设置`Camera.targetTexture`然后`Camera.Render`省心多了。

- 新建一张float的RenderTexture，然后Blend One One情况下各个角度渲染一遍叠加：如果没有影子，RGB输出光源方向，A输出1计数；最后RGB/A保存下来即可。

- 最后生成的结果需要做几遍Dilation 解决边缘采样问题

# Bake结果对比

和SD出的图比了下，只能说方向上没问题，但是还有不少细节差距很大(人家毕竟商业软件，我整这个加起来不超过3h，逃) 

![](/images/bentnormal_compare.jpg)

- 有些奇怪的噪声来自于采样严重不足；
- 严重怀疑Substaince Designer做了一些图像空间的操作，因为它生成的BentNormal有些地方根本没有2UV对应也有值，这就很有意思了；
- Substaince Designer使用的是ZB高模，这个Unity导入就费劲...

不过好处也是有的：Substaince Designer导出的是normalized Bent Normal；我自己生成的时候B通道拿来存了AO Strength，还可以当成Mesh AO使用。另外就是在Unity里烘焙确实流程简单+迭代起来快。 放在自己项目里比较了下背光时候Diffuse IBL部分的效果(暂时只用了天光地光)，因为法线平滑了很多所以漏光好了很多：

![](/images/bentnormal_result.jpg)

# 未来工作

目前的结论是在手游上可以尝试使用一下的，反正低配一个keyword关掉就行了。

接下来有精力的话还要好好迭代下预处理烘焙这块。 Unity这套Baker方案扩展一下其实有非常多二次开发的空间，譬如AO、Normal等完全可以实现自定义的烘焙(当然另外一条路就是写C++的Ray Tracing来搞Baker)。 

SD/SP/Max等美术DCC工具最大问题是public API不是很多，如果想定制输出不是很方便；若只是最终结果的encode还好办，如果想拿中间结果就很费劲。在Unity里搞Baker的最大意义即在于此。

顺便po一张图：三个面光源下，Max里Vray烘焙到贴图和Unity里Enlighten烘焙到贴图的对比，看上去还是比较有搞头的(左边模型鞋子/腰带上的问题其实是Max里哪里出错了，然而我对这货不熟-.-)

![](/images/vray_enlighten.jpg)

这样最大的好处是提高定制性和整合工作流顺畅度(虽然目前来看鸽的概率太大了)。 

不说了继续写Lua去了，不YY了(逃