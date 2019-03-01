---
layout: post
title: Visual Studio 2012编译Unreal 4 
date: 2014/3/29
tags: [C++,Unreal]
---

最近尝试了一下在Visual Studio 2012中编译Unreal 4，记录一下其中踩的坑 (其实这个纯粹是我蛋疼才这么干的，讲真还是升级VS比较方便...)

<!--more-->

# 安装SDK

只需要下载一个windows 8.1 SDK安装即可~突然发现以前每次重装系统后必备的DXSDK_Jun10用不上了，甚伤感~

# 生成项目文件

首先，修改`Engine\Source\Programs\UnrealBuildTool\Windows\UEBuildWindows.cs`文件中编译器

{% codeblock lang:csharp %}
/// Version of the compiler toolchain to use on Windows platform
public static readonly WindowsCompiler Compiler = WindowsCompiler.VisualStudio2012;
{% endcodeblock %}

然后执行`GenerateProjectFiles.bat`即可生成`UE4.sln`工程项目

# 生成第三方库

这一步比较繁琐，由于默认是使用Visual Studio 2013编译的，所以第三方库里提供的都是VS2013文件夹；这里我们需要把对应的一个个弄一下~

先大概看看有多少第三方库需要倒腾一下

![](/images/unreal4_1.jpg)

简单介绍下不同的库的处理方式。基本的策略就是能自己编译就自己编译，基本上Visual Studio 2012都有对应的工程不用设置；不然就试试cygwin；实在不行就直接复制粘贴好了~

## Visual Studio 2012编译

以DirectShow为例，打开`Engine\Source\ThirdParty\DirectShow\DirectShow-1.0.0\build\VS2012\DirectShow.sln`，使用批生成即可：

![](/images/unreal4_2.jpg)

需要这么处理的库

- DirectShow
- ForsythTriOO
- FreeType
- HACD
- hlslcc
- libOpus
- libPNG
- MCPP
- nvTextureTools
- nvTriStrip
- Ogg
- Recast
- Vorbis

需要注意的是，使用Visual Studio 2012打开的`.sln`文件，应该是在VS2012或者vstudio11或者vc11之类的文件夹下面的版本。

ps. nvTextureTools中的nvtt项目使用了CUDA 5.0，而我机器上装的是5.5，所以手动改了下vcxproj文件才载入成功。

## cygwin编译

只有ICU库是需要用cygwin编译，具体参考`Engine\Source\ThirdParty\ICU\icu4c-51_2\readme.html`，简单来说就是先运行`Config for Windows - Release.bat`然后运行`Make on Windows.bat`，编译时间长的令人发指。

## 直接复制粘贴

这个就很简单了，直接把VS2013里面的`.lib`文件之类的复制一份到同层VS2012就行了~

需要这么处理的库

- PhysX
- Qualcomm
- FBX

# 运行时dll

首先需要安装[Visual C++ Redistributable Packages for Visual Studio 2013](http://www.microsoft.com/en-hk/download/details.aspx?id=40784)；其次是在`Binaries\ThirdParty\`拷贝对应的文件，例如`Engine\Binaries\ThirdParty\PhysX\APEX-1.3\Win32\VS2013`复制一份到`Engine\Binaries\ThirdParty\PhysX\APEX-1.3\Win32\VS2012`里去就行了~

这一步其实不用记录的，因为直接在下一步运行的时候会提示xxx.dll加载失败，然后就懂了~

# 编译运行

将UE设为启动项目，运行文件为`Development Editor`和`Win64`，直接F5即可！

![](/images/unreal4_3.jpg)