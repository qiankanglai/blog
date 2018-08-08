---
layout: post
title: glew32 link error
date: 2013/10/24
tags: [C++,OpenGL]
toc: false
---

I encountered a very strange problem these days: can't link glew in C++ code. I've tried this code but failed, [my post in SO](http://stackoverflow.com/questions/19557092/cannot-link-with-glew32-for-glewinit):

<!--more-->

{% codeblock lang:cpp %}
#include <gl/glew.h>

int main()
{
    glewInit();
    glActiveTexture(GL_TEXTURE0);
    return true;
}
{% endcodeblock %}

Visual studio 2012 returns `error LNK2019: _imp_glewInit`

Finally I got the point: **glew32** provided in **CUDA** `C:\ProgramData\NVIDIA Corporation\CUDA Samples\v5.5\common\inc\GL` is **WRONG** ! Replace with glew from [sourceforge](glew.sourceforge.net) fixes my problem...