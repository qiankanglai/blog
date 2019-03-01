---
title: Android下Streaming Assets特殊姿势
date: 2017-07-20 00:10:20
tags: [Unity,Android]
toc: false
---

这两天在群里看到有人问过这个问题，也有朋友小窗问我：Unity中导出Gradle工程然后打包出来的apk会加载AssetBundle慢很多。

于是联想到了之前遇到的一个有意思的现象：我们的出包流程是在打包出来apk之后，利用apktool解包再进行加密和资源处理再打回去。但我发现这个步骤导致apk大小变化很多(有时变大有时变小，毫无规律)，非常奇怪；但是解压出来的内容确实又是一样的。后来我仔细比对之后终于找到玄机：**Streaming Assets下的东西默认是不压缩的**。

<!--more-->

![](/images/apk_streaming.jpg)

用Bandizip打开可以看到，Unity打出来的apk里StreamingAssets下东西是**Store**的。后来我搜到了论坛上的一个解释[Why the asset bundle slow in StreamingAssets on android device?](https://forum.unity3d.com/threads/why-the-asset-bundle-slow-in-streamingassets-on-android-device.401234/)

> StreamingAssets are packaged into APK with -0 flag for AAPT tool (or -0 -Z for fastzip). Meaning that correspondent segment in APK is uncompressed. APK is a zip container which consists of blocks of potentially different compression types. You can use e.g. APK Analyzer to check what's compressed and what's not.

然后使用apktool这个工具的时候它有一个bug：apktool拆包的时候其实会记录哪些文件是Store哪些是Deflate，然后在打包回去的时候读取之；但是非常不幸的是这个功能对于没有后缀名的文件无效。之前我们的AssetBundle全都是没有后缀名的，因此导致我拆包+压回去之后所有资源都变成了Deflate。解决办法也非常简单：加一个bundle的后缀名即可。由于这个情况发现的比较早，所以我无意间就避开了Android下加载Asset Bundle很慢的情况...

ps. 针对朋友的那个情况，他后来找到了[ASSET BUNDLES PERFORMANCE DROP WHEN USING CUSTOM BUILD SYSTEM FOR UNITY PROJECT ON ANDROID](https://loreglean.wordpress.com/2016/04/17/asset-bundles-performance-drop-when-using-custom-build-system-for-unity-project-on-android/)，里面的解决方案非常简单。当然思路也是一样的，加一个后缀名然后保证在打包apk的时候不要压缩这部分资源即可。

{% codeblock lang:gradle %}
android {
    ...
    aaptOptions {
        noCompress 'bundle' // or whatever extension you use
    }
}
{% endcodeblock %}