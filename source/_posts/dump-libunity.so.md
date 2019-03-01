---
layout: post
title: 分析libunity.so Release崩溃
date: 2015/12/25
tags: [Unity,Android]
updated: 2016/11/8
---

最近一直在和Crash做斗争，一开始用了Bugsnag相当不错，后来经朋友推荐转用腾讯的Bugly，后台查询简直6。

<!--more-->

偶尔发现会遇到libunity.so崩溃，如果是Development模式还好，`adb log`基本就能看的七七八八；如果是Release模式下就一堆地址，根本没法看。网上搜索了下相关信息，绝大多数都是自己编译的C++代码，利用`ndk-stack`去分析obj文件。但是对于Unity引擎本身来说，我们手头只有一个`libunity.so`，无法这么干。

# 直接上传符号表

ps. 要把libunity.sym.so压缩zip之后上传，直接的话Bugly不认...

![](/images/bugly_libunity.jpg)

# objdump 导出

在[官方论坛某个帖子](http://forum.unity3d.com/threads/android-crash.86682/)里找到了答案：利用`binutils`工具包里的`arm-eabi-objdump`。

帖子里是说从NDK里找，但是我找了半天都没发现，最后机智的直接用万能的brew搞定...

{% codeblock lang:bash %}
brew tap qiankanglai/embedded
brew install arm-none-eabi-binutils
cd /usr/local/Cellar/arm-none-eabi-binutils/2.23.2/bin
 ./arm-none-eabi-objdump -d /Applications/Unity/Unity.app/Contents/PlaybackEngines/AndroidPlayer/Variations/mono/Release/Libs/armeabi-v7a/libunity.so > libunity.txt
{% endcodeblock %}

最后根据崩溃日志里的`pc xxxx`去搜索导出的符号信息即可...反正这种崩溃大多数时候都是Unity的锅，只能自己想办法规避了……

ps. 原来的`thomaseichinger/embedded`里面用的sha1已经被brew废弃了，我fork了一个出来并且改成了清华的源，不过只改了`arm-none-eabi-binutils`一个。

# Update

今天wxp和我聊了下，发现新版本竟然Release直接带符号表了，就不用这么麻烦了...[5.3.6 Release Notes](https://unity3d.com/unity/whats-new/unity-5.3.6)里第一条是

> Android: Symbols for release libraries are now available in PlaybackEngines/AndroidPlayer/Variantions/*/Release/Symbols.
