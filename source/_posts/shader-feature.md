---
layout: post
title: 利用shader_feature打造最小版本Shader
date: 2016/9/25
tags: Unity
updated: 2016/12/1
thumbnail: /images/teaser/shader_feature.jpg
---

这个月终于腾出手为新项目做了一些Shader调整和优化工作，不知不觉就整出一个功能略多的"肥"Shader。所以我就在思考这么一个事情：如何维护这个Shader，以及如何在运行时尽可能减少无用的消耗。

<!--more-->

# 待解决问题

- 有的材质球里贴了法线贴图，那么就必须计算切空间，但有的材质球只要读取模型的顶点法线就足够了
- 有的材质球贴了自发光贴图，但是没贴的材质球完全就可以跳过这个`tex2D`(就算是一张小的黑色也是浪费啊)

**更新**: 这个是在知乎上有朋友提到的：

> 用了Shader feature的shader，跟用到它的material文件放在不同的bundle里打包，由material里的keyword决定的shader变种会丢失。

关于这个现象，我的测试结果是Asset Bundle里正常，但是编辑器下模拟Asset Bundle功能的时候因为要使用Windows/OSX版本的Shader，反而出现了`shader_feature`丢失的现象... 目前安全起见我也从`shader_feature`转到了`multi_compile`上，不过根据贴图情况去控制Keyword的思路没变

**更新2**: 这个问题在新版本Unity已解决，见{% post_link shadervariantcollection %}

# 解决思路

在官方文档里找到了答案：[Making multiple shader program variants](https://docs.unity3d.com/Manual/SL-MultipleProgramVariants.html)。之前我主要使用的是`multi_compile`在运行时切换，现在发现`shader_feature`对应自定义的`CustomEditor`能很好的完成这个需求。下表为同一个材质球配合不同贴图的参数，以及对应GLES版本的Compiled Code的指令数:

| | 完整版本 | 精简版本 |
| ----- | ----- | ----- |
| | ![](/images/SGPBR.jpg) | ![](/images/SGPBR2.jpg) |
| vert | 43 | 43 |
| frag | 81 | 50 |

## Shader部分

{% codeblock lang:glsl %}
#pragma shader_feature _EMISSIONMAP
#if _EMISSIONMAP
sampler2D _EmissionMap;
#endif
fixed4 sgpbr_frag(v2f i) : SV_Target
{
  fixed3 Color = 0;
#if _EMISSIONMAP
  Color += tex2D(_EmissionMap, i.tex).rgb;
#endif
  return fixed4(Color, 1);
}
{% endcodeblock %}

这里比较好理解，相当于自发光相关的代码都利用`_EMISSIONMAP`这个宏包起来了。

ps.记得在最后加上`CustomEditor "SGPBRInspector"`...

## C#部分

这里参考了官方的Standard的编辑器代码S tandardShaderGUI.cs。其实和其他inspector一样，最核心的几行就是根据某个属性是否贴了贴图，打开或关闭对应的宏...

{% codeblock lang:csharp %}
override public void OnGUI(MaterialEditor materialEditor, MaterialProperty[] properties)
{
  MaterialProperty emissionMap = ShaderGUI.FindProperty("_EmissionMap", props);
  bool emissionEnabled = emissionMap.textureValue != null;

  Material material = materialEditor.target as Material;
  if (emissionEnabled)
      material.EnableKeyword("_EMISSIONMAP");
  else
      material.DisableKeyword("_EMISSIONMAP");
}
{% endcodeblock %}

简单粗暴，完成～
