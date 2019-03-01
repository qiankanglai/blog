---
layout: post
title: ImagePicker for cocos2d-x v3
date: 2014/4/14
tags: [C++,cocos2d-x]
updated: 2016/4/3
toc: false
---

This extension plugin is able to load images from system photo library. Native calls for Android, iOS(iPhone+iPad) & Win32. More details can be found here [ImagePicker](https://github.com/qiankanglai/ImagePicker).

<!--more-->

NOTE: please check the example files first before using! I've tested code with v3.5 and v3.10, and it should always work if the cocos2d::Texture2d related API doesn't break...

ps. I made a Pull Request to cocos before and it seems they don't need it. So I just put it here seperately.

| Android | iOS |
|--------------------------------------------------------------------------|----------------------------------------------------------------------------|
| ![](/images/imagepicker_android.jpg) | ![](/images/imagepicker_ios.jpg) |

### update 1

Improve codes with cocos2d-x 3.5, and add support to OSX

| Win | OSX |
|--------------------------------------------------------------------------|----------------------------------------------------------------------------|
| ![](/images/imagepicker_win.jpg) | ![](/images/imagepicker_osx.jpg) |

### update 2

Add support to WP, including JS bindings.

### update 3

Tested with cocos2d-x 3.10. Cpp-tests and example usages added.