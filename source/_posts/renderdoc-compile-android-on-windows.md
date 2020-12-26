---
title: Windows上编译Renderdoc Android
date: 2020-12-26 09:08:54
tags: [RenderDoc, Android]
---

最近用RenderDoc调试的时候发现GLES的`glCopySubImageData`结果不太对，翻了下代码发现实现不是特别完整(只支持了整块拷贝的情况)。于是动手自己实现了一发，结果测试的时候居然卡在了一个编译安卓版本上。

之前我都是在Mac下编译的安卓，这次手头没有合适设备不得不研究了下如何在Windows上编译。关于这块网上资料比较少，`CONTRIBUTING/Compiling.md`也语焉不详，因此就在这里记录下步骤。

<!--more-->

首先是安装一些必备的库，包括Java、Android SDK、Android NDK等，这些都有现成的直接使用即可。

然后然后根据文档，Windows上需要装个bash shell

> On Windows, you should always build Android from a bash shell - cygwin, msys2, Windows WSL, etc. Building from cmd may work but is not supported.

我一开始是尝试用的WSL，根据官方文档装上还是很方便的，但是发现调用不到环境里已有的NDK组件。为了省事就翻了翻其他几个可选项。这里参考[Cygwin 和MinGW 的区别与联系是怎样的？](https://www.zhihu.com/question/22137175)里的整理:

- Cygwin 运行于Windows平台的POSIX子系统
- MinGW 进行Windows应用开发的GPU工具链
- MSYS 从老版本Cygwin剥离出来的小巧玲珑版本
- MSYS2 由于前者万年不更新...所以出来的新版本

我图省事，直接装了MSYS2确实很方便... 先安装编译需要的工具

{% codeblock lang:bash %}
pacman -S mingw-w64-x86_64-cmake
pacman -S mingw-w64-x86_64-make
pacman -S mingw-w64-x86_64-gcc
pacman -S git
{% endcodeblock %}

cmake和make不用多说，肯定是用的上的。然后gcc和git是我踩坑之后才发现需要安装的东西：

- renderdoc在交叉编译的时候需要使用include-bin跑一些步骤，所以不是一开始我想的只需要保证NDK工具链就行，宿主机上的gcc也是需要的；
- 另外renderdoc会默认把git的commit hash生成进版本号，然后安卓和PC版本通信时进行校验，所以git也是需要安装的。

此外我还修改了一个CMake文件，里面的逻辑有点奇怪会导致找不到JDK

{% codeblock lang:diff %}
 renderdoccmd/CMakeLists.txt | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

diff --git a/renderdoccmd/CMakeLists.txt b/renderdoccmd/CMakeLists.txt
index da7563e7b..2b0baea66 100644
--- a/renderdoccmd/CMakeLists.txt
+++ b/renderdoccmd/CMakeLists.txt
@@ -66,7 +66,7 @@ if(ANDROID)
     # then invoke FindJava.cmake which will search just the PATH, then re-set it.
     set(SAVE_JAVA_HOME $ENV{JAVA_HOME})
 
-    set(ENV{JAVA_HOME} "")
+    #set(ENV{JAVA_HOME} "")
     find_package(Java REQUIRED)
     set(ENV{JAVA_HOME} ${SAVE_JAVA_HOME})
{% endcodeblock %}

接下来就非常简单，参考文档里的步骤即可：

{% codeblock lang:bash %}
mkdir build-android
cd build-android
cmake -DBUILD_ANDROID=On -DANDROID_ABI=armeabi-v7a -G "MinGW Makefiles" ..
mingw32-make -j20
{% endcodeblock %}

{% codeblock lang:bash %}
mkdir build-android64
cd build-android64
cmake -DBUILD_ANDROID=On -DANDROID_ABI=arm64-v8a -G "MinGW Makefiles" ..
mingw32-make -j20
{% endcodeblock %}

最后打包出来的俩apk塞进`renderdoc\x64\Development\plugins\android`，全套流程完成。