---
title: 使用RenderDoc调试
date: 2018-02-07 00:17:14
tags: [Unity, Unreal]
---

最近在查一些渲染上的问题，发现[RenderDoc](https://renderdoc.org/)这货非常好用，而且引擎原生支持用起来也很方便。

ps. 这个工具是从DX层去抓取真实绘制信息，和引擎内置的工具会有一定的区别。而且像纹理状态、寄存器变量甚至调试Shader上会方便非常多。

<!--more-->

# Unity3D

参考官方文档[RenderDoc Integration](https://docs.unity3d.com/Manual/RenderDocIntegration.html)

- 在Game窗口右键Load RenderDoc
- Game窗口在Maximize on Play左边的小图标点一下就是抓取

对于需要调试的Shader加一行`#pragma enable_d3d11_debug_symbols`

# UE4

官方文档[RenderDoc plugin](https://wiki.unrealengine.com/RenderDoc_plugin)有点过时，其实最近几个版本的引擎已经内置了这个插件。下图是我在4.18.3里打开这个插件:

![](/images/renderdoc_ue4.jpg)

然后同样是点同一个小图标截取。如果需要调试Shader的话在`Engine\Config\ConsoleVariables.ini`打开这两行

{% codeblock lang:ini %}
r.Shaders.Optimize=0
r.Shaders.KeepDebugInfo=1
{% endcodeblock %}

# RenderDoc

常见的功能譬如查看Draw Call略过不提，我个人最喜欢的是查看Shader及参数。甚至可以直接修改Shader看结果，不过我发现有时候CB会在修改过程中乱掉，至今没有找到好的办法fix。

![](/images/renderdoc_shader.jpg)

更多推荐参考文档[How do I debug a shader?](https://renderdoc.org/docs/how/how_debug_shader.html)。


ps. 后来和朋友讨论了下CB乱掉的问题，应该是因为修改Shader之后可能编译器会优化一些变量，导致CB的offset对不上了... 目前用比较脏的手段`OutColor.rgb = OutColor.rgb*0.00001+xxxxx;`绕过先