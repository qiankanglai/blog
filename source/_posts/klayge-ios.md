---
layout: post
title: KlayGE移植iOS进行中
date: 2014/12/28
tags: [KlayGE,C++,iOS]
---

这个帖子估计持续更新时间会很长...记录移植KlayGE到iOS中的坑ing~不少坑之前在{% post_link port-klayge %}的时候已经踩过了，这里就不再赘述。

<!--more-->

# CMake/XCode

不得不说CMake是个好东西，但细微的地方坑也不少啊啊啊。。。XCode就是大坑货了……

## iOS Cross Compile

这部分学习了Android部分的处理，使用了[ios-cmake](https://code.google.com/p/ios-cmake/)作为CMAKE_TOOLCHAIN_FILE参数传进去；这个文件里主要进行了以下设置

- 强行设置编译器为/usr/bin/clang，不然直接使用Xcode.app里的Clang会提示: The C compiler "/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang" is not able to compile a simple test program.；
- 强行跳过编译器检查；
- 设置若干的宏，譬如`set (IOS True)`；
- 自动搜索并设置CMAKE_OSX_SYSROOT，这个是区分编译出OSX或iOS App的关键；
- 设置架构armv6 armv7(真机)或i386(模拟器)。

总的来说是挺简单易懂的一小段代码~另外可以参考StackOverflow上的[How to set up CMake to build an app for the iPhone](http://stackoverflow.com/questions/822404/how-to-set-up-cmake-to-build-an-app-for-the-iphone)，因为在ios-cmake里提供的例子只有lib工程没有app工程。

这里我选择注释掉强行设置编译器部分，打开跳过编译器检查的代码；不然的话生成的文件名是gcc42而非clang60~

## Code Sign

在编译Python的时候，发现try_compile部分全挂，提示"target specifies product type 'com.apple.product-type.tool', but there's no such product type for the 'iphoneos' platform"。网上搜到了一个2011年就有一个CMake Bug Issue [0012288: project/try_compile fails for XCode when CMAKE_OSX_SYSROOT is set to iPhone](http://public.kitware.com/Bug/view.php?id=12288)，大体意思就是说cmTryCompileExec的时候对于iOS要出包而不能是库；[ios-cmake issue 1](https://code.google.com/p/ios-cmake/issues/detail?id=1)也提到了这个问题。Bug Reporter提供了两个patch，不过都需要重新编译CMake，略微麻烦。后来我在StackOverflow上找到了一个[0票答案](http://stackoverflow.com/a/24380608/1033338)亲测有效，现在被我upvote到1了嘿嘿\_(:з」∠)\_

题外话：之前我每次使用Xcode签名的时候都要蹦出来输入账户密码，后来根据[每次真机调试都要求输入用户名和密码，不知道什么原因](http://www.cocoachina.com/bbs/read.php?tid=256725)里的说法，在Keychain里把开发者证书转义到Login里就好了。

![](/images/klayge_ios_codesign.jpg)

## Resources

对于iOS App，需要将资源目录复制过去。之前在[How to set up CMake to build an app for the iPhone](http://stackoverflow.com/questions/822404/how-to-set-up-cmake-to-build-an-app-for-the-iphone)提到使用pbxcp命令来实现，不过新版本的XCode里已经干掉了这个东西；最后暴力使用CMake的copy-directory搞定了~

## Find Boost

在编译iOS版本的库时，始终提示Could NOT find Boost。我打开Boost_DEBUG之后发现是在FindBoost.cmake的662行find_path出现行为不一致的，但是传进去的参数都是一样的，非常奇怪~

后来通过对比darwin环境二分查找，干掉了ios.toolchain.cmake里这三行就好了~啊啊啊不过[find_path文档](http://www.cmake.org/cmake/help/v3.0/command/find_path.html)里没提到啊……

{% codeblock lang:cmake %}
set (CMAKE_FIND_ROOT_PATH_MODE_PROGRAM ONLY)
set (CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set (CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
{% endcodeblock %}

接下来发现能找到头文件(其实就是boost/version.hpp)，但是找不到对应的库文件。继续打开Boost_DEBUG，找到原因是生成的库文件名有问题，挂在了Searching for Library上；对比FindBOOST.cmake注释里给出的[Library Naming](http://www.boost.org/doc/libs/1_41_0/more/getting_started/windows.html#library-naming)最终改好了。

## Error creating LLDB target

使用i386(模拟器)会遇到这个问题，[据说](http://stackoverflow.com/questions/25088252/xcode-error-creating-lldb-target)用真机+64bit就好了~待验证

# wine

在OSX/Linux下，D3DCompilerWrapper必须通过wine来编译~因此在CMake里利用add_custom_target，直接调用winegcc输出即可。但是这里涉及到XCode里的一个特别扯淡的坑:

## XCode PATH

如果直接使用XCode的Post Build来编译D3DCompilerWrapper，但是会提示winegcc command not found；类似的在代码里用`system("wine D3DCompilerWrapper.exe.so")`也是找不到。这个东西我是用homebrew安装到默认的/usr/local/bin下，在控制台下确实能正常运行；CMake的find_path也能找到。

最后发现是XCode的坑：[Running Custom Scripts after Build](http://blog.manbolo.com/2012/04/25/xcode-4-vs-me-running-custom-scripts-after-build)提到XCode里运行的时候默认PATH是写死的，不会从配置里读取...如果要修改的话得改[~/.MacOSX/environment.plist](http://developer.apple.com/library/mac/#qa/qa1067/_index.html)文件。

我尝试在Post Build Script里调用export PATH等方式，都搞不定；如果直接写死winegcc的绝对路径，又会遇上winebuild command not found了。最后没办法，写了一个Python脚本来搞定了。

## 其他

顺便需要注意的是，wine是编译32bit程序，写入二进制格式输出的时候、HRESULT(long)可能会导致长度不一样。

使用脚本调用xcodebuild的时候，有一定概率出现wine: cannot find L"C:\\windows\\system32\\D3DCompilerWrapper.exe.so" 具体原因未知~

## wineserver

使用XCode调试的时候，有一定概率会出现XCode Lost Connection，然后程序直接消失。具体原因也未知……

2014.12.31: 对着[WINE文档](https://www.winehq.org/docs/wine)YY了一下，猜测可能是每次wine关闭的时候带飞了什么东西造成的。后来黑盒测试出是wineserver的原因；解决方案就是在第一次运行wine之前先运行一次`wineserver -p`，就能正常的调试了~

# OpenGLES

由于编译shader需要在OSX上搞定，所以需要在OSX上运行OpenGLES环境。默认系统是不支持的，所以参考龚大的[opengl-es-emulator横向比较](http://www.klayge.org/2011/04/20/opengl-es-emulator%E6%A8%AA%E5%90%91%E6%AF%94%E8%BE%83/)，先试了下高通的SDK完全不给力(尼玛dylib里的路径还是特别奇怪的)，后来改用了PowerVR的SDK。

使用过程中发现2个特别奇怪的现象：

- 时不时出现/Users/autobuild/buildxl/buildroot/sdk/branch/UtilitiesSrc/Common/PVRPreferences/PVRPreferences.cpp WARNING: No declaration found at the start. The declaration will be recreated.的错误提示，会崩溃；
- `glGetString(GL_VENDOR)`返回的是NVIDIA而不是Imagination

经过一番探索，最后定位出来是[delay load](http://forum.imgtec.com/discussion/comment/18323#Comment_18323)问题，修改了glloader里的载入顺序、保证libGLESv2.dylib比libEGL.dylib先载入就好了~

# iOS

## main()

OSX/iOS与其他平台不一样，一般是在main()入口里使用Apple的API接管，然后直接去写delegate。之前费了很大劲把OSX改成和windows平台一样，不过现在看来要改回去跟iOS统一一下。总之就是保证KlayGE和系统API的初始化顺序没问题……好处就是这两块的代码很像了~

## OpenGLES View

[OpenGL ES Programming Guide for iOS](https://developer.apple.com/library/ios/documentation/3DDrawing/Conceptual/OpenGLES_ProgrammingGuide/OpenGLESontheiPhone/OpenGLESontheiPhone.html)里面提到两种方式

- GLKit framework
- CAEAGLLayer class

偷懒我就用了GLKit，不然用CAEAGLLayer还得自己维护FBO，我担心和KlayGE里面的不小心搞起来...

## 资源路径

在iOS下，不能直接`fopen`文件，需要用系统函数去定位资源路径，具体参考[How can I find the path to a file in an application bundle (NSBundle) using C?](http://stackoverflow.com/questions/8768217/how-can-i-find-the-path-to-a-file-in-an-application-bundle-nsbundle-using-c)实现一下即可。

## glloader

在glloader里需要根据函数名来定位ProcAddress，这个没找到文档，直接是根据头文件和注释找到了对应函数`CFBundleGetBundleWithIdentifier`, `CFBundleGetFunctionPointerForName`~

## DDS纹理

Apple的GLES Extension和别人家不太一样，然后就导致ARGB_EXT没法用~修改了glloader xml禁掉了这个就好了~

![](/images/klayge_ios_text.jpg)

目前手头只有es 2.0的机器，部分Sample能正常工作了；比较麻烦的是defer相关的几个，看起来要么是FBO挂了，要么是内存不够就跪了。而且有些Sample跑虚拟机会显示LLVM挂了，真机反而没事，真是无语...

![](/images/klayge_ios_reflect.jpg)

接下来要解决性能问题，回到OSX上搞定defer先！

ps. 已找到一个后处理纹理每帧释放的问题，虽说用了`shared_ptr`不会泄露，但是有的显卡上创建、删除GL纹理很慢，所以也成了性能热点。