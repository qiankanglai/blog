---
layout: post
title: OSX下设置垂直同步
date: 2015/1/13
tags: OpenGL
toc: false
---

最近发现一个逗比知识，osx下设置垂直同步貌似靠代码是无效的

<!--more-->

{% codeblock lang:objectivec %}
GLint swapInt = 1;
[[self openGLContext] setValues:&swapInt forParameter:NSOpenGLCPSwapInterval];
{% endcodeblock %}

后来找到了这个[How to disable vsync on macOS](http://stackoverflow.com/questions/12345730/how-to-disable-vsync-on-mac-osx)，不过选项的位置改到了Window-Quartz Debug Settings里面的Beam Sync中

![](/images/osx_vsync.jpg)