---
title: NDK遇到Link Failed
date: 2021-03-06 20:35:47
tags: [Android, C++]
---

这次是有几个同事遇到的一个问题: release版本编译引擎没问题，但是debug下会在链接步骤挂掉:

> [arm64-v8a] SharedLibrary  : libGame.so
> D:\SDK\android-ndk-r21\toolchains\llvm\prebuilt\windows-x86_64\bin/../lib/gcc/aarch64-linux-android/4.9.x/../../../../aarch64-linux-android/bin\ld: final link failed: File truncated
clang++: error: linker command failed with exit code 1 (use -v to see invocation)

<!--more-->

网上搜了下有人报过非常类似的[ndk r21 strip.exe failed in windows with "File truncated" error #1176
](https://github.com/android/ndk/issues/1176)，但是奇怪的是我本地一直没遇到过。后来仔细和同事对比了下是因为我的r21b比较新...

其实在NDK的根目录有个`source.properties`，里面是版本信息

> Pkg.Desc = Android NDK
> Pkg.Revision = 21.1.6352462

也就是说虽然r21b虽然很早就发布了，但是其实一直是有小版本号更新的。后来同事从官网重新下了一份r21b覆盖就也解决了。(没什么用的知识++