---
layout: post
title: C#反射——掀起Unity Editor面纱
date: 2017/3/20
tags: Unity
thumbnail: /images/teaser/skirt.jpg
toc: false
---

之前在群里看到有人提到[Profiler Memory Plus](https://www.assetstore.unity3d.com/en/#!/content/28888)这个插件，相当不错～在原来Profiler功能上扩展出了diff功能 非常实用。

<!--more-->

然后我就在想这个是怎么做的呢，某天在折腾shader keyword的时候突然灵光一闪，莫非是private API搞的? 动手试了下果然可行。

具体解释一下：Unity引擎底层是用C++写的，但是外围逻辑绝大部分都是C#实现，包括Editor本身。平常我们常见的UnityEngine.dll和UnityEditor.dll里就有大量的宝藏值得挖掘，网上已经有提供了一份[UnityDecompiled](https://github.com/MattRix/UnityDecompiled)(当然也可以自己用ILSpy等工具处理)。我个人觉得可以分为两类: 

- Undocument API 在代码里可以直接调用，但是并没有在文档里出现
- Private API 无法在代码里直接调用，一般是internal class或者private作用域

但是谁让这些代码是人见人爱的C#代码呢！在编辑器下完全可以使用反射来绕开这个限制。具体来说举个例子，如果我们希望访问到[ProfilerWindow](https://github.com/MattRix/UnityDecompiled/blob/master/UnityEditor/UnityEditor/ProfilerWindow.cs#L138)里的某个私有变量`m_ProfilerWindow`

{% codeblock lang:csharp %}
private static List<ProfilerWindow> m_ProfilerWindows = new List<ProfilerWindow>();
{% endcodeblock %}

完全可以这么写

{% codeblock lang:csharp %}
m_ProfilerWindows = tProfilerWindow.GetField("m_ProfilerWindows", BindingFlags.NonPublic | BindingFlags.Static);
IList windows = m_ProfilerWindows.GetValue(null) as IList;
{% endcodeblock %}

这样直接绕开了internal和private双重限制。在这个思路下，三下五除二就自己实现了想要的功能

![](/images/profilerdiff.jpg)

最后也不得不提示下这样做的缺点：

- 反射在性能上还是有不少损失的
- 如果Unity升级导致变量名变动等，就会代码出错需要人肉维护...

不过总得来说，作为编辑器扩展非常靠谱，最近用这个思路还折腾了不少事情，譬如设置Material Inspector面板的Reflection Probe/完美抓取shader keyword等。这酸爽感觉就是打开了一个新世界的大门(逃 