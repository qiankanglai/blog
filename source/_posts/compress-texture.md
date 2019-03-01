---
layout: post
title: 移动设备压缩纹理使用技巧
date: 2016/1/23
updated: 2017/9/30
tags: Unity
toc: false
---

压缩纹理能够节约不少内存空间，因此目前项目中UI全都是用Texture Packer打包出大图之后压缩。Unity导入纹理的默认设置是compress，在符合条件的情况下会优先使用PVR或ETC、否则会降为RGBA4444。从程序的角度来说，当然是1/4大小的压缩纹理更好啦~但是，毕竟是有损压缩，会带来一定的损失，有时候还是挺郁闷的。

<!--more-->

第一个常见的问题是渐变颜色区域经过压缩之后会出现色阶，如下图所示。我参考了dither思路，用Photoshop加了一层0.3%的高斯分布杂音；可以看到ETC和PVR都有所改进，但是仔细盯着看依然能看到一些噪声。

![](/images/compress_texture_1.jpg)

另一个很常见的问题就是有杂色(下图绿色部分)，本质是在某些block里边界混合了...解决方法就是非常粗暴的放大分辨率，可以看到当放大到2x大小的时候就完全没问题了。这个事情桌子很早也和我提过，压缩纹理的UI部分最好放大一些，当超采样来用...

![](/images/compress_texture_2.jpg)

顺便再提一句就是，新版本的Texture Packer里有了polygon布局，还能扣洞真是excited...

![](/images/texture_packer_polygon.jpg)

~~ps. 最早我们使用的是将原始图片拆分成RGB和Alpha Mask两张图的策略，然后替换默认的UI Shader。但是[Unity-5.2](http://unity3d.com/cn/unity/whats-new/unity-5.2)开始默认将ETC2设为默认(顺便支持了ETC1 Compression for Sprite Atlases)，所以我就懒得切图+每个Sprite拖材质球了...直接一张RGBA进行压缩完事儿~~

再ps. 目前我们又改回Alpha Split策略，原因是我们发现有安卓模拟器『号称支持ES3』但是ETC2支持的有问题，导致UI全黑了...实属无奈之下改回分离，不过好处是这次我们的所有UI都使用了自己封装的SGImage，所以在框架层支持起来非常省事，不需要手动维护材质球了...