---
title: Unreal中针对Instance物体获取位置
date: 2019-02-26 23:56:09
tags: Unreal
toc: false
---

最近帮忙解决了一个很奇怪的问题：在材质球里如何获得Instance模型(譬如Foliage)的坐标，其实也就是[Foliage instance position in Material editor](https://answers.unrealengine.com/questions/484539/foliage-instance-position-in-material-editor.html)。TA需要的是模型原点的世界坐标。

<!-- more -->

解决方法非常简单粗暴:

> Try passing object position through custom UVs

我是用VertexInterpolator来实现(其实意思一样)，这样能得到正确结果的原因是：**：对于Instance物体 在VS里计算世界坐标是对的，而PS里是错的**。

![](/images/unreal_foliage_instance.jpg)

下面来看下具体的原因：对于非Instance的物体，两者除了经过一次v2f插值之外没什么区别；但是对于Instance的物体，那么PS里计算的时候数据是不够的(没有InstanceLocalToWorld)。当PS里世界空间坐标是错误的情况下，肯定就不能指望了。

ps. 仔细观察可以发现UE4内置的不少节点其实都是实现了两个版本(Vertex/Pixel)，区分的地方其实就是第一个参数是`FMaterialVertexParameters`还是`FMaterialPixelParameters`。

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

![](/images/unreal_foliage_instance2.jpg)

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