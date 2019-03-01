---
layout: post
title: Adreno Profiler分析任意安卓游戏特效+抓取资源
date: 2015/5/16
tags: [Android,OpenGL,cocos2d-x]
updated: 2016/3/22
---

最近发现了一个非常好用的工具Adreno Profiler，可以用来分析安卓手机上OpenGL ES绘制过程。这个东西牛的地方在于可以抓取任何可以运行的App，而且使用起来非常方便、没有额外限制。这个工具本质上是一个OpenGL ES Draw Call Replay；如果你用过PIX或者GPA，就会感到很非常熟悉了。下图是贵易的魔天记，挂起来毫无压力233

<!--more-->

** 申明: 我不会回答任何关于资源导出方面的问题。博客内容我单纯作为技术分享，并不想以此盈利，也不想惹麻烦。如果读者有志于学习渲染方面内容，我很乐意与大家交流学习，但是就本话题就此打住。 **

![](/images/adreno_mtj.jpg)

由于这个工具是高通提供的，所以只能运行在高通芯片的安卓机上。为什么要强调这一点呢？其实其他厂商也有类似工具，但是从使用限制、方便程度上来说差太多了：

- iOS可以用XCode自带的[Frame Capture](https://developer.apple.com/library/mac/recipes/xcode_help-debugger/articles/debugging_opengl_es_frame.html)，但是这货用起来很不顺手，而且没法抓取第三方应用。
- 其他安卓厂商也有类似的工具，例如[Mali Graphics Debugger](http://malideveloper.arm.com/develop-for-mali/tools/software-tools/mali-graphics-debugger/)，但是使用起来比较麻烦，譬如需要越狱、上传so到系统目录之类的。

下面将具体介绍其使用，然后用两个例子来讲解，一个是抓取分析聚爆Implosion的特效绘制，另一个是用来做cocos2d-x图形性能优化。

ps. 我习惯说Draw Call(DC)，工具里是Render Call，下文会混用...

# 环境配置

## 软件配置

下载[Adreno Profiler](https://developer.qualcomm.com/mobile-development/maximize-hardware/mobile-gaming-graphics-adreno/tools-and-resources)并安装，需要注意以下几点：

- Adreno SDK不是必须的，可以无视；
- 虽然Adreno Profiler提供了跨平台版本，但这货貌似是c#的，我尝试在OSX下用Mono跑但是折腾不出来，所以最好还是Windows；
- 需要将adb添加到系统路径，可以直接下载一个[Android SDK](https://developer.android.com/sdk/index.html)，但是我国国情导致你不一定能很方便的下载下来；还有一种取巧的办法是所谓的xx手机助手、豌豆荚等工具目录下一般都会自带，指向adb.exe所在目录即可。

## 硬件配置

需要一个有高通芯片的手机，我这里强烈推荐G家亲儿子Nexus系列！如果手头没有的话，可以去淘宝买个Nexus 4，虽然是几年前的机器、不过一点都不卡，而且一千块钱都不到。

**注意** 目前Android 5.1上可能出现连接不稳定的情况，见[官方论坛](https://developer.qualcomm.com/forum/qdn-forums/maximize-hardware/mobile-gaming-graphics-adreno/28516)，我这边测试5.0倒是一直能用~所以如果遇到这个问题，建议降低系统版本再说。

**update** 评论区@Hoping White指出，通过`adb shell setprop debug.egl.profiler 1`命令设置属性能解决连不上的问题。

**再注意** 需要打开手机的开发者模式，并把电脑设为信任，偷懒的方法是用豌豆荚连一次，跟着指示做就行，驱动都自己装好了。

# 基础教程

## 如何抓取一帧

首先手机上打开游戏，运行到需要抓取的界面。然后在电脑打开Adreno Profiler，点左上角的Connect。这里有两种连接方式：手机直接插到电脑上，或者在同一个局域网内使用IP连接。准备好了之后点击Refresh，直至刷出对应的设备和应用：

![](/images/adreno_connect.jpg)

双击连接之后，点击Scrubber GL弹出抓取界面，然后点击Capture Frame等待即可

![](/images/adreno_connect2.jpg)

这样其实就完成了抓取工作，是不是感觉so easy! 下面将从例子出发，介绍具体的使用。

小技巧：抓取完成之后，可以点击上方的Save将帧数据保存成apr文件，这样可以之后Open，省的每次分析都需要连接手机、打开游戏。

## 基础使用

这个工具使用非常简单，核心是左下角的Render Calls。它其实是抓取了一帧中所有GL部分的调用及相关数据，然后按照绘制命令组织。当选中不同的Render Call时，工具会显示从一开始到这一个命令的绘制结果，方便看到每一个中间过程。此外，在API Calls中，还可以看到每一个Render Call之前的其他命令，包括各种对GL状态机的修改：

![](/images/adreno_api_calls.jpg)

从图中可以看到，在这个绘制动作前，对模板状态进行了设置，然后传了一些Uniform，并修改了顶点属性~更方便的是，具体的顶点数据什么也能直接看到！

![](/images/adreno_vertex_data.jpg)

## 如何查看、导出资源

就纹理来说，在右边可以看到所有显存里的纹理资源，点开可以看到具体的纹理参数和缩略图。在上面有一个小的按钮，可以将所有纹理都保存成一个个文件：

![](/images/adreno_textures.jpg)

就Shader来说，同样也是可以看到所有Program，工具还会贴心的标出所有利用了该Shader的Render Call，下面可以看到反汇编出来的指令：

![](/images/adreno_shaders.jpg)

就模型来说，选中一个Render Call然后Save Vertex Data就可以导出obj，但是生成的文件还需要稍微修改下才能导入，具体打开看看就懂了~

![](/images/adreno_obj.jpg)

我曾经把驯龙高手的地形导出之后放到Unity，毫无压力-。-

![](/images/adreno_dragons.jpg)

# 进阶使用

## 游戏性能优化

之前zhiwei写过[Cocos2d-x+Lua游戏的优化总结](http://wuzhiwei.net/opitimize_of_cocos2d-x_lua_game/)，下面我从图形性能为例，来介绍需要注意的几个点~

首先需要看一下每一个Render Call干了什么，是否有意义。根据不同游戏类型，对Draw Call个数应该有个大概掌握。这个当然是越少越好啦~

- 是否有无效Render Call，我曾经见过一个全屏绘制“无效果”，也就是屏幕内容在绘制前后结果完全一致，不知道到底干啥了...
- 是否有绘制到屏幕外的Render Call，也就是模型在屏幕外的情况；这个其实应该是引擎自动优化掉相机范围外的物体，不过有的引擎不具有这个能力\_(:з」∠)\_
- 是否有被完全挡住的Render Call，这时候需要完全干掉，不然也是会造成性能损失的；话说这个其实也应该引擎自动优化Occlusion来着(╯‵□′)╯︵┻━┻
- 是否有能够合并的Draw Call，像Unity里有Dynamic/Static Batching技术。
- 是否有负担比较重的API调用，譬如每帧都修改顶点数据，是否能避免或绕开。

然后需要看一下显存中的纹理数量和大小，这个肯定也是越小越好~

- 能用压缩纹理的地方就用压缩纹理，RGB444能忍的地方就不要用RGB888；
- 少用透明贴图，可以节约掉一个A；
- 可以用NPOT；
- 无用的纹理尽量不要放太多显存。

需要注意的是显存中纹理占用和包里的纹理占用不同，因为所有纹理资源在进入显存之前会进行解压操作，这就是为什么建议使用压缩纹理。

此外，Adreno Profiler还提供了Graph工具，可以看到应用的许多性能信息，用来对比不同游戏场景下负载：

![](/images/adreno_graph.jpg)

工具本身也提供了一些建议供参考：

![](/images/adreno_suggestions.jpg)

## 聚爆特效分析

这个其实源自我之前在知乎上的一个回答：[这款游戏中 主角被遮挡部分变成半透明的效果是如何实现的？](http://www.zhihu.com/question/29747715/answer/45721049)。

在介绍如何绘制被遮挡部分的特效，用了一个小技巧：查看GL Context状态机，这里就可以看到ztest被改成了GREATER，也就是绘制完场景之后直接绘制被挡住的部分~

![](/images/adreno_gl_context.jpg)

当然，还可以点击上方的Depth切换出zbuffer查看

![](/images/adreno_depth.jpg)

解释刀光特效的时候，主要靠经验积累，大概看下绘制的中间结果就猜出来了-。-
本质还是一个很简单的特效。亮点在于绘制第二道刀光时，先绘制了整个场景，然后对其进行了一定的扭曲~

![](/images/adreno_distort.jpg)

Adreno Profiler提供了一些很方便的可视化功能，譬如选中一个纹理或者Shader，可以标记出所有使用该资源的Render Call；选中Render Call的时候会在屏幕上标记其绘制效果~

**总结** 嘛，总之很方便的工具一只~<del>我现在就等着泰坦黎明的安卓版，好好分析下它咋做的啦o(╯□╰)o</del> {% post_link dawn-of-titans %}

## 简单的Python处理脚本

评论区有几个需要的，就贴一下~其实特别简单粗暴，只是文本替换而已

{% codeblock lang:python %}
import sys

def replaceAll(filename):
	f = open(filename,'r')
	filedata = f.read()
	f.close()

	newdata = filedata.replace("#position", "v").replace("#normal", "vn").replace("#texcoord0", "vt")

	f = open(filename,'w')
	f.write(newdata)
	f.close()

if __name__ == '__main__':
	if len(sys.argv) == 1:
		print("Please provide filename")
	else:
		files = sys.argv[1:]
		for x in files:
			replaceAll(x)
{% endcodeblock %}

使用方法是`python OBJ.py kongfu_01.obj kongfu_02.obj kongfu_03.obj`这样直接传入文件名。至于为什么这么做，其实打开下obj文件看下最上面的注释就懂了...