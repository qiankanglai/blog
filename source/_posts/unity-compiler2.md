---
layout: post
title: 优化Unity项目编译速度-后续
date: 2016/12/3
tags: Unity
thumbnail: /images/teaser/compiler_complaint.jpg
---

{% post_link unity-compiler %}后续篇...感谢@wxp提供的非常有用的反馈！之前在优化编译速度的时候，我试图dll化遇到的一个障碍是不同平台需要编译用宏区分的代码，但是guid/fileID不一致。结果发现我是完全**想当然**了，Unity竟然已经自动做好了映射(下面均为Unity 5.3.6测试结果，尚未找到相关文档...)！

<!--more-->

# 测试脚本

很简单，就是在屏幕上写一个字符串，根据对应版本分别是editor/android/windows。编译出3个dll之后放到不同文件夹，设置对应Platform分别为Editor/Standalone/Android。

{% codeblock lang:csharp %}
using UnityEngine;

public class NewBehaviourScript : MonoBehaviour {
    //"C:\Program Files\Unity\Editor\Data\MonoBleedingEdge\lib\mono\4.5\mcs" -sdk:2 /target:library /out:NewBehaviourScript.dll /r:"C:\Program Files\Unity\Editor\Data\Managed\UnityEngine.dll" NewBehaviourScript.txt
    void OnGUI () {
        GUI.Label(new Rect(0, 0, 200, 200), "android");
    }
}
{% endcodeblock %}

测试结果如下：

- 在场景里直接添加任意一个dll里的MonoBehavior之后，运行显示editor，PC出包显示windows，安卓出包显示android都没问题
- **很诡异但是是最重要的一个现象**: 如果把3个dll里的脚本拖到同一个GameObject上，运行发现是显示了三层editor叠加
- 如果只把Editor版本的dll拖到GameObject上，然后删掉这个dll，对应的Standalone/Android的dll就算还在，出包的时候也是missing

所以我只能猜测Unity内部对Managed DLL做了映射，这样就直接解决了...**我以为存在的一个大坑**其实压根不存在...

# 目前的解决方案

目前我们项目是将插件移动到Standard Assets下来加快编译速度的。SLua部分进行了dll化，在这里修改了两个小地方：

- iOS下记得用`link.xml`跳过对编译出来dll的Stripping (引擎对Managed DLL是默认打开的)
- 5.x开始支持`RuntimeInitializeOnLoadMethod`，我们用这个来注入`bindList`而没有再用`Assembly.Load`