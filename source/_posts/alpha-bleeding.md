---
title: Alpha Bleeding老生常谈之新瓶装旧酒
date: 2019-11-30 12:29:22
tags:
---

老生常谈但是坑了我一把的问题……昨天有人吐槽为毛现在的UI质量好差，一圈狗牙什么鬼

![](/images/alpha_bleeding_result.jpg)

<!--more-->

我之前把压缩这块默认使用了BC7，看到这个效果直觉就觉得不对，先看下原图没有任何问题

![](/images/alpha_bleeding_source.jpg)

然后看下Alpha Bleeding有没有打开，也稳的1p

![](/images/alpha_bleeding_wrong.jpg)

ps. 关于Alpha Bleeding有不同的叫法，这里直接抄[Texture Packer设置](https://www.codeandweb.com/texturepacker/documentation/texture-settings)里的解释

> Transparent pixels get color of nearest solid pixel. These color values can reduce artifacts around sprites and remove dark halos at transparent borders. This feature is also known as "Alpha bleeding".

把图片塞进Unity开BC7也效果没问题；然后换成DirectTex的GPU Compress模式，效果居然没问题了——反而是CPU Compress炸了。

仔细看了下喂进去的参数和数据都是一样的，不科学啊……突然灵机一动，用PVRTexTool的Bleeding功能多点几下 让外扩的像素变多，瞬间CPU Compress的效果也对了(摔

![](/images/alpha_bleeding_right.jpg)

行吧行吧，居然是GPU Compress的效果比CPU好，最近老是踩这种经验主义的坑（逃