---
layout: post
title: 几个简单After Effects特效
date: 2012/3/28
---

Adobe After Effects是个很强大的工具！之前一直想学了拿来做MAD玩的，可惜貌似一直没空。这次正好毕业DV可以做点特效，一方面是正好不用露脸-。-还可以做点贡献嗯嗯。主要做了几个特效，一个是烟雾化切场，一个是老电视的开头效果，还有一个是山寨基友夏洛克YY时候的场景。

<!--more-->

# 老电视效果

这个做起来其实是最简单的：从不知道哪里下了一个Old_Film.mov，然后盖在原有的layer上面，设置为multiply就行了。当时参考了一下[videocopilot教程](http://www.videocopilot.net/tutorials/old_film_look/)。然后通过adjustment layer调一闪闪的亮度即可~

字幕的话是学习了流白童鞋的[sevens](http://v.youku.com/v_show/id_XMzI0NDM5NzI4.html)。请房姐每个文字用数位板写三遍，然后直接切出的。果然手写字体效果比电脑字体灵活、好看太多了！

还有一种BadTV的效果，是通过在Solid Layer上面加Fractal Noise实现的，只要将大小调小了就有感觉了。

![](/images/AE_badTV.jpg)

这里还加了一个wave wrap，将噪声扭动起来=。=反正就是使劲山寨括弧笑。

# 烟雾化切场

依靠神级插件Trapcode Form。

![](/images/AE_form.jpg)

这个插件本质是在三维空间生成粒子。我一般是选择x,y方向上各500的粒子(max)，长宽同视频大小；z方向范围5，放50的粒子。center Z选择-600，这样看上去正好覆盖屏幕。

然后在color and alpha中选择对应的图层，模式为RGBA，对应XY。这样就将原来视频的"颜色"信息映射到对应位置的粒子上了。

最后通过调整fractal field这种信息让粒子动起来~就完成了一个场景“烟雾消散”的效果。

# 山寨夏洛克

BBC的《基友夏洛克》中，当主人公在YY时候，屏幕上会蹦出各种文字……这个看起来还是很带感的，这次帮贞子加了两个场景。

基本思路就是用textlayer，通过调整position和alpha等属性，加上遮罩做的。

![](/images/AE_word.jpg)

文字在快速闪动的过程中，只有一个字的范围是可见的。

# 其他效果

AE自带的插件实在太强大了……后来又做了一个短信交流、打字的效果，直接套了一个word process

<del>自从用了After Effects, 妈妈再也不担心我做视频了！</del>

# 样片

[优酷传送门](http://v.youku.com/v_show/id_XMzc0MTQyMjE2.html)