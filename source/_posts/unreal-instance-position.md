---
title: Unreal中针对Instance物体获取位置
date: 2019-02-26 23:56:09
tags: Unreal
---

最近帮忙解决了一个很奇怪的问题：在Instance的材质球里如何获得模型的原始LocalPosition，其实也就是[Foliage instance position in Material editor](https://answers.unrealengine.com/questions/484539/foliage-instance-position-in-material-editor.html)。

<!-- more -->

解决方法非常简单粗暴:

> Try passing object position through custom UVs

我后来是用的VertexInterpolator来实现的，简单来说就是**在VS里计算世界坐标是计算的，而PS里是错的**。

{% asset_img unreal_foliage_instance.jpg %}

下面来看下具体的原因：对于非Instance的物体，两者除了经过一次v2f插值之外没什么区别；但是对于Instance的物体(譬如Foliage)，那么PS里计算的时候数据是不够的(没有`InstanceLocalToWorld`)。当PS里世界空间坐标是错误的情况下，肯定就不能指望倒算回来的LocalPosition正确了...

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

MaterialFloat3 Local0 = mul(MaterialFloat4(GetWorldPosition(Parameters),1.00000000), (Primitive.WorldToLocal)).xyz;
{% endcodeblock %}

顺便提一句常见的几个位置区别[Coordinates Expressions](https://docs.unrealengine.com/en-us/Engine/Rendering/Materials/ExpressionReference/Coordinates):

- ActorPositionWS: Actor位置(逻辑概念)
- ObjectPositionWS: 包围盒中心(和网格有关)
- TransformPosition(float4(0,0,0,0))是获取的模型坐标系零点对应的世界坐标

如果一定要获取准确Instance物体的LocalPosition，可以参考TransformLocalVectorToWorld来个CustomExpression自定义一发

{% asset_img unreal_foliage_instance2.jpg %}

这里我自定义扩展了一个材质节点，把Pixel和Vertex分开输入(防止编译错误)。最后生成的代码就是

{% codeblock lang:hlsl %}
MaterialFloat3 CustomExpression0(FMaterialPixelParameters Parameters)
{
    return mul(float4(GetWorldPosition(Parameters), 1), Primitive.WorldToLocal).xyz;;
}

MaterialFloat3 CustomExpression1(FMaterialVertexParameters Parameters)
{
#if USE_INSTANCING
    return Parameters.InstanceLocalPosition;
#else
    return mul(float4(GetWorldPosition(Parameters), 1), Primitive.WorldToLocal).xyz;
#endif
}
{% endcodeblock %}

ps. UE4里扩展材质球节点比我想象中简单很多，直接在插件里实现一个`UMaterialExpression`的子类，核心代码是`virtual int32 Compile(class FMaterialCompiler* Compiler, int32 OutputIndex)`函数生成最后的HLSL。具体生成逻辑参考`HLSLMaterialTranslator.h`里的`FHLSLMaterialTranslator`实现即可