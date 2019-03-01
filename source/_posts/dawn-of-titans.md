---
layout: post
title: 泰坦黎明效果分析一二
date: 2015/9/4
tags: [Android,OpenGL]
thumbnail: /images/teaser/dawnoftitan_soldiers.jpg
---

之前在{% post_link Adreno-Profiler %}中提过，对泰坦黎明的效果很感兴趣。现在终于等到安卓版本了，分析了一下它的几个效果，感觉有不少收获:

<!--more-->

- 就硬件来说，很多经验性的性能数据可以更新一下；
- 就其引擎来说，广告板(Billboard)用的非常之风骚，而且只传顶点、接着在Vertex Shader里拉出面片的思路很赞；
- 配合美术，用后处理效果提升逼格棒棒的；
- 整体绘制的还是挺奢侈的，不少地方我觉得用面片能节约非常多。

ps. 严重吐槽Adreno Profiler保存、载入大apr文件实在是慢爆了，我看了下反汇编的代码，C#的BinaryFormatter神坑啊啊啊~不知道官方有没有心思优化下，用个Protobuf-net啥的...

# 主界面

首先这个游戏本身应该是针对中高端机的，Nexus 4上已经运行的很卡了，不过Nexus 5和MiPad上都还行...一帧里面有200多个Draw Call，2000多个API调用。先是天空盒用了一个2k多面的椭球<del>虽然和面片大法相比看不出啥区别</del>；尝试了下山寨场景，光地形就有2w面，然后一个个看起来小小的城市做的模型(譬如我用红框标记出来的那个小城市就有将近1k面)，真是奢侈啊...

![](/images/dawnoftitan_landscape.jpg)

![](/images/dawnoftitan_city.jpg)

不过让人耳目一新的是，它的树及其影子都是**广告版**。有意思是可以看到输入的顶点数据相同，然后在shader里根据纹理坐标将四个顶点挪开~所以我感觉这个应该是直接在程序里生成了树的坐标。

![](/images/dawnoftitan_tree.jpg)

场景里还加了一个God Rays(或者还有个叫法[Sun Shaft](http://docs.unity3d.com/Manual/script-SunShafts.html))，在小图上模糊叠加，灰常提升逼格。最开始看介绍视频的时候，就是感觉这个效果在手机上帅炸了-.-

![](/images/dawnoftitan_godray.jpg)

# 战斗场景

对于泰坦巨人来说，使用的是模型+骨骼没啥大问题。就效果来说就普通的Bumped Diffuse，1w不到的面数。话说整个场景Total Vertices 692522/Total Primitives 274960，想到现在我自己扣性能基本还在压2w面，不禁悲上心头……

亮点还在于那堆小兵，依然是丧心病狂的广告板...CPU部分负责更新小兵位置和uv坐标，以播放序列帧的形式让小兵动起来。关于这点，知乎上也有讨论[《泰坦黎明》是通过什么优化手段在 iOS 上达到千人战效果的？](http://www.zhihu.com/question/30016156)，梧桐大大的答案已经很详细了。