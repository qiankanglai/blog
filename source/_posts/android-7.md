---
layout: post
title: Android 7升级须知
date: 2016/11/14
tags: Android
thumbnail: /images/teaser/android7.jpg
---

最近守护要上GP，G家要求最好支持Android 24的targetSDK。然后硬生生周末被坑了两天...主要有两个问题需要强烈注意！

<!--more-->

# NDK限制

这个在{% post_link android-hook %}里提到了，新版本系统上如果targetSDK>23，在动态载入其他库时会直接崩溃；如果targetSDK<=23，目前是会报错但是暂时能使用。再之后的Android版本也是直接崩溃的。

不使用Hook之后，目前我还遇到的一个问题是亲加聊天SDK崩溃，尚未完全解决...

> Caused by: java.lang.UnsatisfiedLinkError: dlopen failed: library "libsqlite.so" not found
>   at java.lang.Runtime.loadLibrary0(Runtime.java:977)
>   at java.lang.System.loadLibrary(System.java:1530)
>   at com.gotye.api.GotyeAPI.loadLibrary(GotyeAPI.java:54)

# Support Library

这也是一个让我损失惨重的坑...从24.2.0开始之后，原来的support-v4被拆分成了多个。[Support Library Revision History](https://developer.android.com/topic/libraries/support-library/revisions.html)里

>  With this release, the v4 Support Library has been split into several smaller modules:

更蛋疼的是我们的SDK是dex加载，编译的时候一遍通过压根没发现啊我摔