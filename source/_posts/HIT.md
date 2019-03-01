---
layout: post
title: HIT图形分析
date: 2016/12/2
tags: Unreal
thumbnail: /images/teaser/hit.jpg
---

填坑向...之前和群里一个朋友讨论HIT的影子是咋实现的，后来验证了下发现自己之前想错了(逃。后来还看了下它的Bloom做法，效果还是挺好的。这里大力感谢@Hinatia和@LeLe给予的帮助和点拨，嘿嘿

<!--more-->

# 影子

![](/images/hit_shadow.jpg)

这里讲真，一开始我把HIT的影子当成{% post_link unity-projector %}一样的做法，主要就是受到了这个图的“误导”。抓了下帧发现，一开始是只有角色绘制到一张depth texture

![](/images/hit_shadow_caster.jpg)

在绘制影子的时候，只有部分场景能接受影子：我感觉是只有地面部分，像周围栏杆什么都是不受到动态阴影影响的。在绘制地面的时候有个传到shader的参数设为1，会读取shadowmap计算；否则是0，只要计算本身受到实时光和lightmap影响即可。

![](/images/hit_shadow_receive.jpg)

## UE4实现

我找了下官方文档，估计HIT是直接使用了[Use Modulated Shadows](https://docs.unrealengine.com/latest/INT/Platforms/Mobile/Lighting/HowTo/ModulatedShadows/index.html)。这个应该是最原始的shadowmap的做法，根据[Lighting for Mobile Platforms](https://docs.unrealengine.com/latest/INT/Platforms/Mobile/Lighting/#modulatedshadowing)描述：

- Dynamic Shadowing是根据摄像机距离远近的多层CSM，而且能够和烘焙的静态阴影混合的很好
- Modulated Shadowing感觉就是简单粗暴的shadowmap计算之后叠加一个颜色上去...

HIT游戏里能很明显的发现玩家阴影和静态场景阴影格格不入... 我看了下shader和对应usf文件，应该就是在计算完模型受到光照的影响之后，直接从shadowmap里做了四次`texture2dLOD`平均之后混合一下了事儿。

## Unity实现

正好趁这个机会讨论了下对应Unity实现，然后发现我之前一直有两个知识点搞错了

- Unity中Shadow Caster是单独一个Pass，但是Shadow Receive是写在主Pass里的(我之前一直以为这也是单独的一个Pass)
- [`tex2DProj`](http://http.developer.nvidia.com/Cg/tex2Dproj.html)最后一个参数直接提交了额外的深度比较：Coordinates to perform the lookup. The value used in the projection should be passed as the last component of the coordinate vector. The value used in the shadow comparison, if present, should be passed as the next-to-last component of the coordinate vector.

在搞清楚这俩的基础上，对照乐乐的[【常见问题】对9.4节Unity的阴影的补充说明（重要）](https://github.com/candycat1992/Unity_Shaders_Book/issues/49)能比较轻松的看懂`AutoLight.cginc`里的代码：

{% codeblock lang:glsl %}

#if defined(UNITY_NO_SCREENSPACE_SHADOWS)

UNITY_DECLARE_SHADOWMAP(_ShadowMapTexture);
#define TRANSFER_SHADOW(a) a._ShadowCoord = mul( unity_World2Shadow[0], mul( _Object2World, v.vertex ) );

inline fixed unitySampleShadow (unityShadowCoord4 shadowCoord)
{
    #if defined(SHADOWS_NATIVE)

    fixed shadow = UNITY_SAMPLE_SHADOW(_ShadowMapTexture, shadowCoord.xyz);
    shadow = _LightShadowData.r + shadow * (1-_LightShadowData.r);
    return shadow;

    #else

    unityShadowCoord dist = SAMPLE_DEPTH_TEXTURE_PROJ(_ShadowMapTexture, shadowCoord);

    // tegra is confused if we use _LightShadowData.x directly
    // with "ambiguous overloaded function reference max(mediump float, float)"
    half lightShadowDataX = _LightShadowData.x;
    return max(dist > (shadowCoord.z/shadowCoord.w), lightShadowDataX);

    #endif
}

#else // UNITY_NO_SCREENSPACE_SHADOWS

sampler2D _ShadowMapTexture;
#define TRANSFER_SHADOW(a) a._ShadowCoord = ComputeScreenPos(a.pos);

inline fixed unitySampleShadow (unityShadowCoord4 shadowCoord)
{
    fixed shadow = tex2Dproj( _ShadowMapTexture, UNITY_PROJ_COORD(shadowCoord) ).r;
    return shadow;
}

#endif
{% endcodeblock %}

这里做几个补充说明：

- `UNITY_NO_SCREENSPACE_SHADOWS`表示不使用屏幕空间阴影，所以移动平台看上半段就行
- `SHADOWS_NATIVE`宏表示硬件是否有原生shadow map支持，如果是ES2这种的话就走上半段的下半截，也就是取出深度信息之后自己比较`dist`; 否则直接用`UNITY_SAMPLE_SHADOW`取就行了

ps. PCF模糊是在shadow caster的时候做的，而不是receive阶段，参考`Internal-PrePassCollectShadows.shader`里的代码。

pps. 这么看来Unity原生shadowmap的做法其实硬件特性利用的会比Projector好一些，咳咳，等他什么时候能让我更方便的控制模糊程度和范围我立刻<del>弃暗投明</del>转变立场，嗯嗯

# 辉光

这个是我比较感兴趣的部分，因为UE4的后处理一条处理下来非常流畅，见Teaser部分对比。我之前抄了下它的Bloom还～

网上能找到一份资料[Next-gen Mobile Rendering](https://cdn2.unrealengine.com/Resources/files/GDC2014_Next_Generation_Mobile_Rendering-2033767592.pdf)里Mobile Post Processing Pipeline介绍了整体的流程，主要看Bloom Filter Tree部分。

我对照的看了下，它首先做了一次clamp+downsample(原图分辨率1280x720)到1/4大小，然后连着四次downsample分别是1/8，1/16，1/32，1/64；然后开始upsample，每次利用两个RT的内容混合回来。shader部分大概看了下确实是圆形的采样，和PPT里所说的正好对应：

- Standard hierarchical algorithm with some optimizations
– Down-sample from 1:1/4 res first (shared with light shaft)
– Then down-sample in 1:1/2 resolution passes
– Single pass circle based filter (instead of 2 pass Gaussian)
    - 15 taps on circle during down-sampling
    - 7 taps for both circles during up-sample+merge pass

顺便它原始的RenderTexture是RGBA16F格式，渲染的时候就考虑了HDR。usf里面的注释里是提到了64bpp HDR、32bpp HDR using Mosaic encoding和32bpp HDR using RGBA encoding三种，其中mosaic我一直没找到具体资料，希望懂的朋友不吝赐教。

这样Bloom的好处在于不需要像Gaussian Blur或者SGX Blur需要每次横竖两个方向，而是每次都可以1/2分辨率往下降。正如PPT里所说的“Limited effect radius and less passes”。