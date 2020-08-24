---
title: 低版本安卓电视解决Kodi
date: 2020-08-23 12:07:30
tags: Android
---

搬家之后重新折腾了下Kodi，结果第一步就卡死在小米电视上了……下载官方最新的Kodi 18之后发现“解析包错误”：搜了下发现从Kodi 17开始要求Android 5.0，而这个小米电视还停留在Android 4.4.4，于是开始折腾之旅...令人窒息



## 降级Kodi 16

用老版本的包之后很方便就安装上去了，然后开始安装Jellyfin插件的时候遇到第二个问题：始终打不开对应repository。

### 强装Jellyfin

手动打开zip里的`addon.xml`发现里面对应的路径已经404了，脑壳疼...感觉是`Jellyfin for Kodi`最近在重构py3导致没人维护这块。手动指向老的py2地址之后能加载出来了，但是里面的列表居然是空的。

继续在没有日志的情况下排查：感觉是依赖项问题导致没有可安装插件。从网上犄角旮旯里找到一份`xmbc.python 2.25.0`装上去之后总算有老版本`Jellyfin Video`插件可选。

结果安装之后还是多灾多难，直接同步媒体库的时候各种trace导致卡在0%...

### 尝试Emby

实在没辙，准备尝试下别的客户端。搜了下Emby也是要求Android 5.0最低系统，直接宣告GG。

## 柳暗花明——mygicaMediaCenter

实在没辙我就倒回来找：不知道有没有老司机编译一份Android 4可用的Kodi 17+呢？搜了下官方论坛有人做过这个尝试 [Kodi version for Andoid TV box 4.4.2](https://forum.kodi.tv/showthread.php?tid=330084)，然而后面的跟帖表明这是次失败的尝试...

最后我居然找到了一个油管教程[How INSTALL KODI 17 KRYPTON ON ANDROID | 4.4.4 KITKAT | PORTABLE VIDEO PROJECTOR INTO KODI BEAST](https://www.youtube.com/watch?v=y7KYMODsSxg&list=PLetzbsIahFUp4cnMqsz38wnorLzeAIxr6&index=7&t=0s)里贴了一个mygicaMediaCente，我下下来发现就是Kodi 17而且能在低版本安卓上使用...终于解决了

试了下安装插件然后运行没有任何问题，完美~