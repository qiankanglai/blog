---
title: Unreal中针对Instance物体获取位置
date: 2019-02-26 23:56:09
tags: Unreal
---

在Instance的材质球里如何获得模型的位置信息，其实也就是[Foliage instance position in Material editor](https://answers.unrealengine.com/questions/484539/foliage-instance-position-in-material-editor.html)里提到的问题。

<!-- more -->

解决方法非常简单粗暴:

> Try passing object position through custom UVs

我后来是用的VertexInterpolator来实现的，其实核心是**在VS里计算坐标，而不要在PS里计算**

{% asset_img unreal_foliage_instance.jpg %}

对于非Instance的物体，两者除了经过一次v2f插值之外没什么区别；但是对于Instance的物体(譬如Foliage)，那么PS里计算的时候数据是不够的

{% codeblock lang:hlsl %}
/** Transforms a vector from local space to world space (VS version) */
MaterialFloat3 TransformLocalVectorToWorld(FMaterialVertexParameters Parameters,MaterialFloat3 InLocalVector)
{
    #if USE_INSTANCING || IS_MESHPARTICLE_FACTORY
        return mul(InLocalVector, (MaterialFloat3x3)Parameters.InstanceLocalToWorld);
    #else
        return mul(InLocalVector, GetLocalToWorld3x3());
    #endif
}

/** Transforms a vector from local space to world space (PS version) */
MaterialFloat3 TransformLocalVectorToWorld(FMaterialPixelParameters Parameters,MaterialFloat3 InLocalVector)
{
    return mul(InLocalVector, GetLocalToWorld3x3());
}
{% endcodeblock %}

顺便提一句常见的几个位置区别[Coordinates Expressions](https://docs.unrealengine.com/en-us/Engine/Rendering/Materials/ExpressionReference/Coordinates):

- ActorPositionWS获取的是Actor位置(逻辑概念)
- ObjectPositionWS获取的是包围盒中心(和网格有关)
- TransformPosition(float4(0,0,0,0))是获取的模型坐标系零点对应的世界坐标