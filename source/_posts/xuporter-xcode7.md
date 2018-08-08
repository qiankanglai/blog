---
layout: post
title: XUPorter配合XCode 7/iOS 9
date: 2015/10/9
tags: Unity
---

最近升级XCode 7之后发现[xuporter](http://onevcat.com/2012/12/xuporter/)在Jenkins上跪了，对做的修改稍作记录。

<!--more-->

# `ENABLE_BITCODE`

在代码里加上这两句话就能关掉 (理论上第三个参数默认是`"all"`，但是木有用的样子)

{% codeblock lang:csharp %}
project.overwriteBuildSetting("ENABLE_BITCODE", "NO", "Release");
project.overwriteBuildSetting("ENABLE_BITCODE", "NO", "Debug");
{% endcodeblock %}

# HTTPS

另外iOS 9引入了新特性[App Transport Security (ATS)](https://developer.apple.com/library/prerelease/ios/technotes/App-Transport-Security-Technote/)，会导致HTTP访问失败，因此需要在plist里添加一处。从偷懒角度出发，我修改了下XUPorter使其支持通用的plist修改(原来只支持urltype，见[commit 0c7c246](https://github.com/onevcat/XUPorter/commit/0c7c246b36b464b2a7d905c88cf097cb9bf51c5b))，然后引入下面这个`https.projmods`就好了。

{% codeblock lang:JSON %}
{
	"group":"https",
	"libs": [],
	"frameworks":[],
	"headerpaths": [],
	"files": [],
	"folders": [],
	"excludes": [],
	"compiler_flags": [],
	"linker_flags": [],
	"embed_binaries": [],
    "plist": {
        "NSAppTransportSecurity" : {
        	"NSAllowsArbitraryLoads":true
        }
    }
}
{% endcodeblock %}

ps. XUPorter真心神器，极大节约重复劳动，今天小刀在群里还说这个=w=