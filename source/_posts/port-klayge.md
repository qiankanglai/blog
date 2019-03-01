---
layout: post
title: KlayGE移植到OSX的尝试
date: 2014/12/20
tags: [KlayGE,C++]
---

之前一直有准备在研三的业余时间深入学习一套引擎:

<!--more-->

- cocos2d-x: 不小心直接把代码过完了\_(:з」∠)\_，确实比较简单，话说3.x版本比2.x的设计好多了，用了不少c++11的新特性真是赞；
- unity: 能看到的也就是自带的脚本和内置shader，读完觉得也就这样，而且有些黑盒的东西真是坑的我一脸，最近还遇到了俩bug，这方面的一些知识体会准备过几天整理一下；
- Unreal4: 读完了所有shader、大部分材质和部分渲染，但是整个引擎太庞大有点搞不动；
- KlayGE: 纯代码量来说不多不少正好，而且更加侧重渲染，同时兼顾了OpenGL、DirectX，以及那个glloader的思路真不错。

最终选定龚大的KlayGE作为学习的样本，而且还可以参与进去边做边学。前段时间在业余花了不少功夫[将KlayGE移植到OSX](http://www.klayge.org/2014/12/17/klayge%e8%b5%b0%e4%b8%8aosx%e7%9a%84%e5%ae%9e%e9%aa%8c/)，记录一下学习到不少东西以及踩的坑。

# 工程管理相关

KlayGE是使用CMake配合python脚本来管理整个工程的，确实非常方便。之前用OpenCV和Qt的时候对CMake有所认识，而且好像新的ccx也是用CMake来管理了；主要是对于不同的平台可以生成对应IDE，很节约成本。我主要看的是Common.cmake、Compiler.cmake和Platform.cmake这三个文件，以及build_*.py。

## Xcode & Clang

xcode里的clang的版本号和mingw表现不一致，需要用跟gcc不一样的写法来获取，[不然会产生奇怪的数字](http://stackoverflow.com/questions/12893731/why-does-clang-dumpversion-report-4-2-1)；使用编译器内置宏来判断平台的代码也需要各种注意；4.6版本中用的boost还有RTTI，因此其他项目也需要打开这个。反正一路改下来就是感觉特立独行的Xcode...

最开始弄得时候我笔记本上装了XCode 5.1和XCode 6.0 preview还各种不对路，真是悲剧。

ps. 对于OSX的Framework链接，在CMake里的写法和dylib不太一样，例如`find_library(COREFOUNDATION CoreFoundation "/")`。

## 工作目录

使用XCode运行程序的时候必须设置工作目录，不然会载入资源失败。这个是我山寨出来的一个东西，之前Google没找到...

![](/images/klayge_port1.jpg)

在Visual Studio里，是通过覆盖VisualStudio2010UserFile.vcxproj.user.in来实现的，然后我通过对比XCode的工程项目，发现在package contents里覆盖一个xcode.xcscheme.in也能做，就山寨了一发出来了。

ps. 在CMake里通过`$ENV{USER}`获得环境变量，通过`CONFIGURE_FILE`将配置文件覆盖进去。

## 跨工程调试

龚大说是因为KlayGE代码比较多，如果放在一个工程的话Visual Studio会卡跪。不过对于XCode，我一直只会接将一个工程拖到另一个工程下作为子工程，从而跨工程调试。这样的问题就在于修改了工程文件，如果CMake变化导致重新生成工程的话，加进来的工程就不见了。后来我有次拖拽的时候发现可以将两个工程作为平级关系，这样会生成一个workspace就搞定了……

## OpenGLProfiler

XCode自带了一个GLES Capture，用来在App上调试OpenGL，但是如果是OSX程序需要另外下载调试工具(歧视的太明显了)~一开始还不怎么会用这玩意儿，后来发现该有的功能还是都有的，关键就是要在程序暂停的时候才能显示信息。

![](/images/klayge_port2.jpg)

使用Profiler启动程序之后，一般是在`CGALFlushDrawable()` Before/After加断点；当程序跑到断点的时候，就可以看到包括渲染状态、Shader、Texture、FBO以及各个Buffer等信息。

# OpenGL相关

## glloader

因为OpenGL的那些API是函数指针可以随便换，所以用了这套东西来搞跨平台(核心+扩展)；但这个我没怎么细看，反正龚大根据文档重新生成了代码我就这么凑合着用先……

## WindowDarwin.mm

参考了OpenCV的highgui模块，难点主要在于不用plist、storyboard之类，直接使用c++代码进行建立窗口并绘制。建立NSWindow的时候，需要注意`frameRect`和`contentRect`的区别；建立NSOpenGLView的时候，需要根据传进来的设置`PixelFormat`。鼠标事件、窗口事件等比较简单，没什么好说的。

## Render Loop

这里参考了官方的`CVDisplayLink`代码，渲染的过程中需要加锁，避免出现多线程问题。然后就出现了一个非常奇怪的问题：打开后处理之后，程序无法正常显示；关闭倒是没问题。这个bug卡了我相当长的时间，因为不会用调试工具……后来发现，其实程序能正常渲染到back buffer上，但是`[[self openGLContext] flushBuffer]`无法完成swap的操作。

昨天晚上调到1点多的时候灵机一动找到了问题所在：当FBO没有解绑的时候，OSX的OpenGL是无法交换缓存的(而且不会报错...)！而且当打开后处理时，绘制需要经过若干FBO形成后处理链，而不开后处理的时候是直接绘制到back buffer所以没有问题。

这个问题在其他平台上是没有的，真是被OSX坑了一脸。

# 未来计划

OSX上KlayGE目前只能运行一半不到的Samples，剩下的基本全是shader相关的问题。龚大的意思是等下个版本尝试wine的d3d compile，完全抛弃Cg。

目前我准备开始尝试iOS版本的编译，估计又会遇到不少链接坑。长远的看，我准备将引擎完整过一遍，以及shadow map、defer rendering等代码实现，顺便整理点文档出来。还想试试在KlayGE上移植MMD过来，嘿嘿。