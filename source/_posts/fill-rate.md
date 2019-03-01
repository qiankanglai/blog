---
layout: post
title: 填充率!填充率!填充率!
date: 2016/3/5
tags: Unity
toc: false
---

最近新项目快上线了，专门抽了一天做性能优化。不开锁帧情况下，在Nexus 5和Nexus 6上始终稳定在60fps(恩刚开始写的时候就比较注意细节，嗯嗯)。在红米测试的时候发现了一个奇怪的现象：战斗界面维持60fps没问题；进入UI界面之后瞬间掉到45fps，甚至有的复杂界面掉到30fps。

<!--more-->

![](/images/fillrate_profiler.jpg)

看到这个现象的第一反应当然是查vertices/trianges以及batch：

- 战斗场景 Verts 26.3k, Tris 15.2k, Batches 86
- UI场景 Verts 15.0k, Tris 8.9k, Batches 138

其实我第一反应是Batches太多，SetPass导致的；但是后来想了一想其实红米的话200个Draw Call也是没问题的。那么问题就怀疑到了<del>此处响起名侦探柯南BGM</del>——填充率！

关于填充率这事情，可以参考[Fill Rate and Memory Bandwidth](http://www.ping.be/~pin10741/fillbandw.htm)一文，讲的非常清楚。由于我们的UI部分用了很多半透明效果以及丧心病狂的毛玻璃，因此overdraw还是挺严重的。

另外我们在UGUI中使用了不少**Alpha=0的不可见Image**参与Raycast，譬如在屏幕空白处点击的响应，然而这些元素虽然在屏幕上不可见、但依然参与了绘制！后来在[官方论坛](http://answers.unity3d.com/questions/1091618/ui-panel-without-image-component-as-raycast-target.html)找到了一个特别TRICKY的方法：建一个空内容的Text作为RayCast Target...我试验了下，某个界面上使用这个方法之后直接提升了5fps!(可以挖的地方还是挺多的...)

当然，用空的Text还是有点脏的，最后我针对UGUI 5.2写了个简单脚本来完成这个功能，一方面能响应点击、另一方面完全不参与绘制~

{% codeblock lang:csharp %}
using UnityEngine;
using System.Collections;

namespace UnityEngine.UI
{
    public class Empty4Raycast : MaskableGraphic
    {
        protected Empty4Raycast()
        {
            useLegacyMeshGeneration = false;
        }

        protected override void OnPopulateMesh(VertexHelper toFill)
        {
            toFill.Clear();
        }
    }
}
{% endcodeblock %}