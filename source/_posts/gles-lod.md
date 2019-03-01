---
layout: post
title: GLES2/3下LOD问题
date: 2016/11/28
tags: [Unity,Android,OpenGL]
toc: false
---

上周有半天在调整shader fallback，主要测试了下`texCUBElod`和`tex2Dlod`在GLES 2/3下是否能正常表现。

<!--more-->

adreno profiler表明`UNITY_SAMPLE_TEXCUBE_LOD`在GLES3下会使用`textureLod`，在GLES2下回落到`textureCUBE`，没毛病~

![](/images/GLES3_PBR.jpg)

![](/images/GLES2_PBR.jpg)

比较麻烦的是`tex2Dlod`在GLES2下会自动使用`GL_ARB_shader_texture_lod`，所以不知道如果在不支持的机器上是什么表现。

我试图用`SHADER_TARGET`来区分结果发现编译出来的还是一样的...看来还是要尽量避免

![](/images/GLES3_FXAA.jpg)

![](/images/GLES2_FXAA.jpg)
