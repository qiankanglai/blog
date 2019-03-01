---
layout: post
title: unity的环境捕捉器
date: 2014/11/8
tags: Unity
toc: false
---

一下午随手写了一个环境捕捉器，山寨了一下unreal的[scene capture cube](https://docs.unrealengine.com/latest/INT/Resources/ContentExamples/Reflections/1_6/index.html)。结果后来发现unity3d pro自带了一个[Camera.RenderToCubemap](http://docs.unity3d.com/ScriptReference/Camera.RenderToCubemap.html)函数真是哈哈哈哈啊……

<!--more-->

实现的思路很简单，在任意GameObject上挂载脚本之后，会自动生成一个摄像机对象。设置一下纹理大小和cubemap文件名之后，点`Build Cubemap`就会生成一个cubemap在关卡文件同级目录下。

![](/images/cubemapcapture1.jpg)

`Save Image`勾上之后会同步导出6个贴图文件；`Preview`如果勾上，则会在Game界面显示、否则会直接弄到render texture上。

![](/images/cubemapcapture2.jpg)

生成的cubemap文件。

如果需要特殊效果，可以在这个GameObject上贴上各种后处理脚本并预览。反正这个东西也写的很简单，就纯当练手用了……学习了一下纹理抓取、保存、inspector GUI设置等，顺便发现了纹理的y真是麻烦啊。

{% include_code CubemapCaptureEditor.cs lang:csharp CubemapCaptureEditor.cs %}

{% include_code CubemapCaptureScript.cs lang:csharp CubemapCaptureScript.cs %}

ps. unity 5.x 貌似直接提供一个反射捕捉器