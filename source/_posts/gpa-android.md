---
layout: post
title: Graphics Performance Analyzer 安卓
date: 2017/1/8
tags: [Android,OpenGL]
toc: false
---

最近倒腾了很久新的抓包工具：

<!--more-->

- Mali手头没设备一直没用过
- {% post_link Adreno-Profiler %}之前分享过了，但是多线程发现很不好用
- Tegra我之前的米Pad被MIUI自动升级系统之后再也没连上过，苦恼

最近倒腾了下Intel GPA发现好用

![](/images/intel_gpa_android_1.jpg)

![](/images/intel_gpa_android_2.jpg)

对于自家的App只要加一个`debuggable=true`就行了，对于别人家的……咳咳，我一开始以为用[Xposed + enable-debugger Flag](https://forum.xda-developers.com/xposed/xposed-enable-debugger-flag-t3186969)可以解决，后来发现ROOT的机子直接就能跑了(逃