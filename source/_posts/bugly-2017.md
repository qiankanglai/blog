---
layout: post
title: Unity 2017涉及Bugly的修改
date: 2018-07-15 13:49:42
tags: [Unity,Android]
toc: false
---

在Bugly上恢复原生崩溃堆栈信息需要符号表文件，具体可以参考{% post_link dump-libunity.so %}。我们在升级2017之后发现引擎有些行为发生了变化，这里记录下。

<!--more-->

### 不再需要手动拷贝so

之前在5.6版本的时候，官方支持[](https://support.unity3d.com/hc/zh-cn/articles/115000177543)提到可以在出包之后从`ProjectFolder\Temp\StagingArea\libs\`下拷贝出来。

升级引擎之后发现这里的文件已经不存在了，转而是默认在apk同样文件夹下有个版本号作为文件名的zip文件：譬如打包出来的是Android.apk，就会有对应的Android-1.13-v18071322.symbols.zip。把这个归档即可。

### 上传Bugly需要改名

至于新的怎么用其实非常简单: **把.so.debug后缀名改回.so**然后压缩包上传即可。Unity默认打出来的zip是STORE，所以可以重新压缩一边减小上传大小。

![](/images/bugly_2017.jpg)