---
title: RenderDoc在Android Q上无效
date: 2020-02-12 18:27:58
tags: [RenderDoc, Android]
---

今天在查真机渲染问题的时候，突然发现神器RenderDoc无效了...Attach Process没问题但是始终抓不到有效Context。

<!--more-->

看了下Log发现了奇怪的地方，压根没有Hook GL函数

> EGL_ANDROID_GLES_layers detected, disabling EGL hooks - GLES layering in effect

顺着这个，倒过去找到了对应的代码修改[android: Switch to GLES layer on Android Q](https://github.com/baldurk/renderdoc/commit/24fb676aa1a9e1415675e04f20d8c41bb0307f10): 原来对Android Q及以上的系统，RenderDoc默认使用[GLES Layers](https://developer.android.com/ndk/guides/rootless-debug-gles)来抓了(题外话，和Vulkan的Validation Layer真的好像)。

所以问题进一步变成为什么GLES Layer没生效。后来我模拟RenderDoc代码手动操作的时候发现了问题...

![](/images/adb_shell_permission.jpg)

一口老血，后来查了下是MIUI Rom里一个设置没打开:

![](/images/adb_shell_permission_setting.jpg)

真是……峰回路转啊(逃