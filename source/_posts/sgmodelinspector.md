---
title: 扩展Unity模型编辑器
date: 2018-03-10 08:05:56
tags: Unity
thumbnail: /images/teaser/modelinspector.jpg
---

又忙的好久没打理博客了...最近来回使用Unity/UE两个引擎，发现有个可视化UV/Normal的小功能不错，花了一晚上在Unity 5.6里面山寨了下:

<!--more-->

![](/images/uemesheditor.jpg)

![](/images/sgmodelinspector.jpg)

# DecoratorEditor

要实现这个功能，首先需要自定义Mesh的Inspector。这里我参考了[Unity3D研究院编辑器之不影响原有布局拓展Inspector（二十四）](http://www.xuanyusong.com/archives/3931)，在引擎原有ModelInspector基础上进行扩展:

{% codeblock lang:csharp %}
class SGModelInspector : DecoratorEditor
{
    public SGModelInspector(): base("UnityEditor.ModelInspector")
    {
    }

    public override void OnInspectorGUI ()
    {
        // TODO: Draw Buttons
    }

    public override void OnPreviewGUI (Rect r, GUIStyle background)
    {
        // TODO: Draw Mesh
    }
}
{% endcodeblock %}

这儿使用DecoratorEditor的思路很简单: 利用反射新建一个ModelInspector的实例，然后所有方法实现是调用这个instance对应接口。不过原版代码有点问题——OnInspectorGUI确实能被调用到，而OnPreviewGUI始终不会被调用到。这时候只能掏出Decompiled Unity查一下Editor.cs里是怎么做的:

{% codeblock lang:csharp %}
public virtual void DrawPreview(Rect previewArea)
{
    ObjectPreview.DrawPreview(this, previewArea, this.targets);
}

public virtual void OnInteractivePreviewGUI(Rect r, GUIStyle background)
{
    this.OnPreviewGUI(r, background);
}
{% endcodeblock %}

也就是说在绘制预览的时候，ModelInspector实例是直接调用了自己的方法，那么就在对应的地方调用SGModelInspector就行了。

{% codeblock lang:csharp %}
static MethodInfo ObjectPreviewDrawPreview = typeof(ObjectPreview).GetMethod("DrawPreview", BindingFlags.Static | BindingFlags.NonPublic);

public override sealed void DrawPreview (Rect previewArea)
{
    ObjectPreviewDrawPreview.Invoke(null, new object[]{this, previewArea, this.targets});
}

public override sealed void OnInteractivePreviewGUI (Rect r, GUIStyle background)
{
    this.OnPreviewGUI(r, background);
}
{% endcodeblock %}

搞定这个之后就可以开始动手折腾显示。

# ModelInspector

接下来要解决的是模型究竟是怎么绘制的...看了下ModelInspector的核心函数，发现其实最后是调用的`PreviewRenderUtility.DrawMesh`，还能带材质球来着。

{% codeblock lang:csharp %}
this.m_PreviewUtility.BeginPreview(r, background);
this.DoRenderPreview();
this.m_PreviewUtility.EndAndDrawPreview(r);
{% endcodeblock %}

所以问题最后就转化成如何用Shader画Normal和UV。

# Shader可视化顶点信息

## Visualize UV

可视化UV这个太简单了，在线框模式下一句话解决

{% codeblock lang:glsl %}
v2f vert(appdata v)
{
    v2f o;
    o.vertex = float4((v.uv.xy - 0.5) * 2, 1, 1);
    return o;
}
{% endcodeblock %}

## Visualize Normal

可视化Normal麻烦一些，一开始考虑过根据Mesh的normal来手动DrawLine或者生成一个新的Mesh，但是这样不够好玩。所以折腾了下Geometry Shader，也是在线框模式下刷LineStream就行了。

最后测试兼容性的时候发现两个小问题:

- OSX Editor下禁用Metal Support
- Android平台下关掉Graphics Emulation