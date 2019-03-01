---
layout: post
title: Unity山寨PBR
date: 2014/12/26
tags: [Unreal,Unity]
updated: 2015/8/14
toc: false
---

这个和我之前在贵易实习的内容相关，当时是参考了[SIGGRAPH 2013 Course](http://blog.selfshadow.com/publications/s2013-shading-course/)里的材料，主要是UE4和COD9两节；以及KlayGE博客上的系列介绍[游戏中基于物理的环境光渲染](http://www.klayge.org/2014/07/13/%E6%B8%B8%E6%88%8F%E4%B8%AD%E5%9F%BA%E4%BA%8E%E7%89%A9%E7%90%86%E7%9A%84%E7%8E%AF%E5%A2%83%E5%85%89%E6%B8%B2%E6%9F%93%EF%BC%88%E4%B8%80%EF%BC%89%EF%BC%9A%E5%9F%BA%E6%9C%AC%E6%A1%86%E6%9E%B6/)。

<!--more-->

话说虽然Unity 5已经提供了PBR，而且还有Skyshop这种插件(见[unity3d 基于物理渲染的问题解决](http://www.cnblogs.com/TracePlus/p/4070974.html))；出于练手，我还是参考UE4在Unity 4.6里山寨了一发。做的时候需要打开线性空间、HDR和Tone Mapping，才能看得出效果~另外UE4里的ambient cubemap是用的hdr格式，而我在Unity里是转换到dds cubemap了，所以表现力下降了不少。

粗糙度不变，金属度增大: 
![](/images/PBR_metallic.jpg)

金属度不变，粗糙度增大: 
![](/images/PBR_roughness.jpg)

山寨UE4效果: 
![](/images/PBR_metal.jpg)

Vehicle: 
![](/images/PBR_vehicle.jpg)

只能说看得出这个意思吧...不过效率还是有点费。于是我尝试了使用烘焙，结果发现两个问题：

- [Custom Lighting Models in Surface Shader](http://docs.unity3d.com/Manual/SL-SurfaceShaderLighting.html)里描述的`half4 Lighting<Name>_SingleLightmap (SurfaceOutput s, fixed4 color, half3 viewDir);`会导致编译错误，即使用LIGHTMAP_OFF等宏来切换，生成出来的surface shader代码也编译不过(不会自动将viewDir传进来)；
- 尝试了下Directioanal Lightmap, 直接输出scale结果很奇怪，不知道怎么回事，反正最后导致金属度高的材质的环境贴图贡献明显看到一条缝...
![](/images/PBR_lightmap.jpg)

总之如何利用烘焙来搞定PBR我还存疑...把Lightmap作为IBL主要精度是很大问题，而且跪求Unity支持HDR Cubemap啊啊啊~

ps. 环境贴图是找的[Light Probe Image Gallery](http://www.pauldebevec.com/Probes/)里的资源；转换过程见{% post_link lightprobe %}。

ps2. 有人私信问我要预计算LUT的代码，也一起提供了

![](/images/PreIntegratedGF.jpg)

{% include_code PreIntegratedGF.cpp lang:cpp PreIntegratedGF.cpp %}
