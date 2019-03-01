---
title: Guess Into UGUI
date: 2017-08-30 00:14:16
tags: Unity
---

虽然说[UGUI](https://bitbucket.org/Unity-Technologies/ui)已经开源，但是最核心的几个文件是c++实现的因此依然不可知。这几天好好的研究了下，整理出了一些自己的理解。这部分说实话是**连蒙带猜**出来的，如有理解不当的地方欢迎沟通交流。

ps. 后面的代码都以Unity 5.x为例分析。

<!--more-->

# CanvasRenderer

从文档来说，所有UGUI需要绘制的组件其实都是通过CanvasRenderer来渲染的。为了分析这个类，使用了以下参考内容 (毕竟连蒙带猜并不是纯猜...)

- [CanvasRenderer](https://docs.unity3d.com/ScriptReference/CanvasRenderer.html) 官方文档
- [CanvasRenderer.cs](https://github.com/MattRix/UnityDecompiled/blob/master/UnityEngine/UnityEngine/CanvasRenderer.cs) 接口信息，配合文档使用(因为文档有时候会漏掉一些API)
- [Graphic.cs](https://bitbucket.org/Unity-Technologies/ui/src/f0c70f707cf09f959ad417049cb070f8e296ffe2/UnityEngine.UI/UI/Core/Graphic.cs?at=5.5&fileviewer=file-view-default) 最核心的文件，里面具体使用了CanvasRenderer这个组件

## 通常情况

首先我们来考虑最常见的一种情况：一个普通的UGUI控件，譬如一张图片，是如何渲染上去的？

通过阅读源代码可以发现，其实这些控件都继承了`Graphic.cs`。这么做的原因很简单——需要渲染的内容其实都是在Graphic里组装的。举个例子：Graphic和CanvasRenderer的关系就像MeshFilter和MeshRenderer一样。所以我们具体就要来看具体信息是如何填充进去的：

{% codeblock lang:csharp %}
protected virtual void UpdateMaterial()
{
    if (!IsActive())
        return;

    canvasRenderer.materialCount = 1;
    canvasRenderer.SetMaterial(materialForRendering, 0);
    canvasRenderer.SetTexture(mainTexture);
}

private void DoMeshGeneration()
{
    if (rectTransform != null && rectTransform.rect.width >= 0 && rectTransform.rect.height >= 0)
        OnPopulateMesh(s_VertexHelper);
    else
        s_VertexHelper.Clear(); // clear the vertex helper so invalid graphics dont draw.

    var components = ListPool<Component>.Get();
    GetComponents(typeof(IMeshModifier), components);

    for (var i = 0; i < components.Count; i++)
        ((IMeshModifier)components[i]).ModifyMesh(s_VertexHelper);

    ListPool<Component>.Release(components);

    s_VertexHelper.FillMesh(workerMesh);
    canvasRenderer.SetMesh(workerMesh);
}
{% endcodeblock %}

这里其实看的就非常清楚了：通过`materialCount`，`SetMaterial`和`SetTexture`三个接口来设置材质相关信息；通过`SetMesh`来把生成的网格填充进去。与普通3D模型不同的是，这里额外提供了设置`mainTexture`的接口，应该就是对应`_MainTex`；这样的好处是很方便的实现一个材质球渲染不同atlas的信息。

ps. 目前我看到的`materialCount`都是1，但是看接口设置其实支持多材质球，可以考虑用这个来做一些UI特效。

到这一块还比较简单，但是再搜索一下`canvasRenderer`还在哪些地方被使用，就会发现两个比较特殊的控件。

## RectMask2D

这个是通过计算位置之后然后在shader里clip来实现遮罩功能。翻一下对应代码：RectMask2D通过调用这个函数，对这个RectMask2D的所有子节点设置了裁剪区域。

{% codeblock lang:csharp %}
public virtual void SetClipRect(Rect clipRect, bool validRect)
{
    if (validRect)
        canvasRenderer.EnableRectClipping(clipRect);
    else
        canvasRenderer.DisableRectClipping();
}
{% endcodeblock %}

我估计在CanvasRenderer内部记录了clipRect，在绘制对应的物体的时候把额外的参数传到材质球里(参考builtin_shaders/DefaultResourcesExtra/UI/UI-Default.shader)

{% codeblock lang:glsl %}
color.a *= UnityGet2DClipping(IN.worldPosition.xy, _ClipRect);
{% endcodeblock %}

## Mask

通过Stencil来实现的裁剪就麻烦多了，不过幸好这部分代码都是开源的。很容易就找到最核心的一段代码：

{% codeblock lang:csharp %}
public virtual Material GetModifiedMaterial(Material baseMaterial)
{
    if (!MaskEnabled())
        return baseMaterial;

    var rootSortCanvas = MaskUtilities.FindRootSortOverrideCanvas(transform);
    var stencilDepth = MaskUtilities.GetStencilDepth(transform, rootSortCanvas);
    if (stencilDepth >= 8)
    {
        Debug.LogError("Attempting to use a stencil mask with depth > 8", gameObject);
        return baseMaterial;
    }

    int desiredStencilBit = 1 << stencilDepth;

    // if we are at the first level...
    // we want to destroy what is there
    if (desiredStencilBit == 1)
    {
        var maskMaterial = StencilMaterial.Add(baseMaterial, 1, StencilOp.Replace, CompareFunction.Always, m_ShowMaskGraphic ? ColorWriteMask.All : 0);
        StencilMaterial.Remove(m_MaskMaterial);
        m_MaskMaterial = maskMaterial;

        var unmaskMaterial = StencilMaterial.Add(baseMaterial, 1, StencilOp.Zero, CompareFunction.Always, 0);
        StencilMaterial.Remove(m_UnmaskMaterial);
        m_UnmaskMaterial = unmaskMaterial;
        graphic.canvasRenderer.popMaterialCount = 1;
        graphic.canvasRenderer.SetPopMaterial(m_UnmaskMaterial, 0);

        return m_MaskMaterial;
    }

    //otherwise we need to be a bit smarter and set some read / write masks
    // CODES OMITTED...
}
{% endcodeblock %}

我删掉了后面一段，只分析前面第一层的情况；当多个Mask嵌套的时候，我们必须使用不同的Stencil Bit来处理。

首先修改了前面通常情况中`materialForRendering`的值：在原来的绘制过程中加入Stencil的写入，同时根据`m_ShowMaskGraphic`决定Color Mask。

其次是设置了所谓的`popMaterial`。根据文档对`hasPopInstruction`的描述

> Enable 'render stack' pop draw call.

我觉得应该是这样一个情况：绘制完Mask的所有子节点之后，需要把Stencil复原，也就是需要多一次额外的Draw Call。

## 小结

大多数情况下每个CanvasRenderer应该只对应一次Draw，材质和网格通过`SetMesh`和`SetMaterial`等设置。

当`hasPopInstruction=true`时，那么在这个节点所有子节点都绘制完之后会再多一次绘制，对应`SetPopMaterial`(网格不变)。

此外还有一些接口，譬如`cull`其实之前我就在一个BUG里遇到过了: [UGUI 5.2: Rect Mask 2D has BUG! be careful](https://forum.unity3d.com/threads/ugui-5-2-rect-mask-2d-has-bug-be-careful.391040/)，表示的是这个控件如果完全在RectMask2D之外的话就肯定不用绘制。`SetColor`, `SetAlpha`应该是设置整体顶点色用的。

# Batching

这里主要是参考了[UGUI优化：批次合并源码分析及工具](http://www.gad.qq.com/article/detail/25947)(有源代码真是好，羡慕嫉妒ing)，结合我自己的试验和上面的分析。首先结论是目前来看5.x的规则和4.6区别不是很大...

## BuildBatch策略

下面是我根据文章内容和自己的一些理解，进行梳理的步骤

1. 判断Canvas是否需要绘制，譬如inactive或者alpha=0就不需要处理
2. 对Canvas下的所有CanvasRenderer深度优先遍历，生成一个队列
	- 如果在里面有嵌套Canvas的话，我发现如果子Canvas为空的时候完全没有影响，但是要是有任意元素就会打断Batch
3. 『生成UI Instructions』我的理解每个CanvasRenderer一般就生成一个UI Instruction，也就是绘制自身；如果是Mask的话那么在深度遍历子节点结束之后会追加一个Pop Instruction
	- 这里其实可以引出一个推论: **由于这两个stencil draw的隔离，Mask节点里面和外面是无法做Batch的**。但是我不同意文章里说的『最终增加两个drawcall』，因为只会多一个Pop，原来的那个是通过`GetModifiedMaterial`修改了
4. 『同步render UI数据』这步完全不知道在干吗，也许是把内存里的数据弄到显存上？
5. 计算Depth: 每个Instruction和前面的Instrunction判断是否相交，主要是判断有没有相交同时材质/贴图信息不一样的Instruction，如果有的话则Depth+1
	- 这里我换一个方式解释比较清楚：如果两个CanvasRenderer相交，同时材质/贴图不同，那么就一定要保序，不然画出来的结果可能不对(A盖住B还是B盖住A的区别)；否则顺序是无所谓的(要么索性不相交，要么其实是同一个东西)
	- 经过测试发现，这里相交貌似是比较的生成出来的网格是否相交，而不是rectTransform求交(因为像Text这种东西可以overflow...)
6. 『根据Depth/Material ID/Texture ID/渲染顺序』排序
7. 对排序过的数组遍历，判断相邻节点是否打断Batch，用贪心法尽量合并...

## 贪心策略分析

这里核心点在于如何理解Depth：**Depth表示的是这个元素最早能在第几步绘制**。如果说一个CanvasRenderer对应的Instruction的Depth=3，那么它必须等所有Depth<3的Instruction都绘制完之后再绘制，否则可能出现BUG。

在梳理完策略之后，我实现了一个小工具去模拟BuildBatch，在简单UI的情况下模拟结果和FrameDebugger结果一致。然后顺便发现了这种贪心策略的盲点：

![](/images/ugui_batch_example1.jpg)

在这种情况下Image (1)一定要在Text (1)后绘制，所以Depth分别是1和0。我估计在第6步排序(在Depth相同时会通过Material ID来决定顺序)得到的结果是Image < Text (1) < Image (1)，最终就导致两个Image没法进行Batch。最理想情况其实是先绘制Text然后再绘制两个Image。

这种瑕疵发生的原因其实是第6步排序简单粗暴了一些，导致本来可以Batch的Instruction没有在一起。当然了，从工程角度来看这个结果已经可以接受了。如果说要做到更好的策略，我直觉感觉是一个图论问题不过没有细想下去了(逃...

## 贪心策略推论

在找到这个贪心策略之后(毕竟我是根据文章和Unity表现『蒙』的...不确定是不是100%正确)，我得到了一个比较奇怪的结论：

> 在不修改材质球、贴图的情况下，单纯通过调整节点顺序基本上是无法优化Batch的。

理由比较简单，在计算完Depth之后，排序的时候要到最后才考虑渲染顺序；前面Material ID和Texture ID能处理掉大多数排序情况(测试结果)。

文章里的例子2『调换一下次序，减少2个drawcall』我一直觉得有点奇怪：因为从Depth来看，Image应该覆盖Btn_Close/Title_Bg，然后ImageIner_FrameRight覆盖Image；如果像文中那么简单调换，应该会导致Image覆盖ImageIner_FrameRight，两者之间的覆盖关系就变化了。可能那个『注：调换UI次序注意交互响应问题』的意思就是这么改了之后和原来的情况不是完全相同了吧 -。-

ps. 上面结论的推论就是：我貌似又做了几天无用功——推测计算Depth并不能拿来指导优化...囧

## 优化策略

如果真的想减少Batch，那么还是老生常谈的几点：

- 减少Mask使用，实在需要优先考虑Rect Mask 2D
- 尽可能用相同的Material和Texture (Color/Alpha貌似是无所谓的)

如果要减少Batch消耗：

- 降低层级，减少深度遍历生成的消耗
- 动静分离，子Canvas不会影响到父Canvas(但是会导致父Canvas在子Canvas那边打断Batch)
