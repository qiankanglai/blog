---
title: Unity iOS增量编译
date: 2018-09-24 12:45:22
tags: [Unity, iOS]
---

之前提到过利用{% post_link jenkins %}，后来发现一个问题是每次iOS编译的时候都是全量编译，很奇怪。根据[Incremental builds for IL2CPP](https://forum.unity.com/threads/incremental-builds-for-il2cpp.365470/)里的说法只要选择Append应该已经支持了才对，但是发现还是每次触发了全量编译。

<!--more-->

## 文件时间戳

拿出Beyond Compare对比了下，发现即使没有代码修改，Append出来的XCode工程里也有一个头文件和一个文件夹的修改时间变了...这个就很难受了，因为很多IDE是根据这个来检查是否需要重新编译的。

我第一反应是用dnSpy看下IL2CPP工具好不好改，但是翻了会代码放弃了，而且维护成本肯定很大(每个版本升级都要跟着fix，直到官方修复)。后来在[IL2CPP在xcode下增量编译问题](https://answer.uwa4d.com/question/5b90ebbb670c1a61c64d6cd3)包括UWA群里聊了下，最后选择了手动复制的方案:

> 打出的xcode用svn同步到xcode打包项目下

我比较偷懒就随手写了个python脚本，完成了类似rsync的功能(`shutil`了解一下，加起来也就10来行)

## XCode增量打包

接下来麻烦的一个地方是，出包服务器上调用的是`xcode archive`然后`xcodebuild -exportArchive`来生成.ipa，但这个默认就是clean build。如果直接`xcodebuild`的话得到的是.app无法签名。

网上搜了下[How to create XCode archive without a clean build](https://stackoverflow.com/questions/14640816/how-to-create-xcode-archive-without-a-clean-build)，有人提的路子是`PackageApplication`但这货已经被官方移除了(不推荐使用)。我从网上下了个PackaegApplication放到XCode目录，确实是能用的，但是证书部分怎么都搞不对。

后来我分析了下xarchive文件，发现里面其实就是.app和Info.plist而已(其实还有dSYM，但删掉完全没影响)。这样的话解决方案就很简单了...

- 直接调用`xcodebuild`生成.app，这里有个小技巧是`CONFIGURATION_BUILD_DIR=build`指定输出文件夹
- 构造Info.plist，里面诸如CFBundleIdentifier、CFBundleVersion等信息可以通过两种方式获得
	- `xcodebuild -showBuildSettings`获得XCode Project信息
	- `/usr/libexec/PlistBuddy -c \"Print xxx\"`获得原Info.plist信息

构造完成之后就可以像原来一样`xcodebuild -exportArchive`操作即可

## 实验效果

在C#代码不变情况下(这个对我们这种lua为主的项目是常态)，出包最耗时的就变成IL2CPP以及最后的ld，本身Compile消耗非常小。配合Asset Bundle的增量编译，对于我们这种体量的工程来说从20min降到10min。

日常开发过程中使用增量节约时间，封版本的时候用全量即可避免潜在问题。

ps. Android部分的IL2CPP不知道有没有老铁研究过增量方式，我发现代码貌似是生成在Temp里的...