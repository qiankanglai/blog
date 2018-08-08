---
layout: post
title: 三维模型布尔运算网页版
date: 2013/6/14
tags: [JavaScript,C++]
---

本学期计算几何课程，选了三维模型布尔运算作为大作业选题。主要考虑到邓公的演示一向比较绚丽多彩，各种PDF和网页中的applet作为demo；我就想把我们最后的东西也搬到网页上来。

<!--more-->

核心的算法是赵老湿和程老湿弄的，一开始我是想人肉翻译成Javascript代码，后来发现了一个神器[emscripten](https://github.com/kripken/emscripten)，就从此走入了<del>轻松愉快</del>坑爹无数之路...

# 初体验

配置环境什么还是比较简单的，跟着wiki上的教程走就行了，不管是ubuntu还是osx下都很简单就跑起来了。唯一比较麻烦的是ubuntu下clang 3.2没有找到好的源，就自己svn co了代码编译了一份，花了将近一小时。

# 开始坑阶段

最开始的代码是MFC的，但是我嫌麻烦没有在windows下配置emscripten，因此是要拿到linux环境下编译~单独将核心算法涉及到的文件抽出到一个控制台项目，然后写了一堆宏来判断头文件的引入和代码的流程，例如将绘制渲染的地方就通过这种宏来选择

{% codeblock lang:c++ %}
#ifdef _CONSOLE
glVertex3dv(v->position.data)
#endif
{% endcodeblock %}

最后写一个包装的接口文件，确保这个控制台能编译运行起来就行了-v-虽然麻烦点好歹只是小体力活

# 继续坑

在使用emscripten编译之前，先手写了一份Makefile用clang++编译一遍，结果发现第一个大坑——**赵老湿用了好多MSVC特有的语法**，在clang下都编译不过T_T

{% codeblock lang:c++ %}
#ifndef readwrite
#define readwrite(var) __declspec(property(get=Get##var, put=Set##var)) var
#endif
{% endcodeblock %}

{% codeblock lang:c++ %}
for each(ref<CCoedge> coedge in coface->coedges)
{% endcodeblock %}

嗯，花了一个晚上把这些写法都规范掉，终于能在clang++下编译出可执行文件，真是<del>太开心了</del>恨死Visual Studio了**！！！

# 界面部分倒是进展顺利

网页渲染模型直接使用了[three.js](http://threejs.org/)作为引擎，不仅提供了完善的文档还非常贴心的提供了一个editor!在这个基础上很轻松就搭建好了我想要的交互功能。

参考HTML5的材料，我还自己做了一个obj模型上传加解析的功能~直接拖到网页里就行了，Blob真心方便。

至于在Javascript里调用C++暴露出来的接口，参考项目的wiki页面和[别人的帖子](http://comments.gmane.org/gmane.comp.compilers.emscripten/302)，也很轻松的实现了。唯一猎奇的就是我一开始想用`int *&faces`来保存返回的数组的，但始终搞不定；研究了5min之后决定无节操的用一个很大的int数组将所有的返回值(什么`int`啊，`int*`啊，`float*`啊)全塞一起返回了oy

在做的时候还顺便发现了竟然已经有人干过[这个事情](http://learningthreejs.com/blog/2011/12/10/constructive-solid-geometry-with-csg-js/)了，虽然跑的很慢但是代码很简单，思路也很清晰，我就顺手给挂上去了也。

# 最后一个炒炒鸡大坑

前天晚上在编译赵老湿最新代码的时候，开始发现总出一些猎奇的结果。仔细一看发现此奥！！！clang++编译出的程序的运行结果和emscripten编译的js文件通过nodejs运行的结果竟然是**不！一！样！的！**这是闹哪样啊=。=说好的翻译llvm运行呢……心都碎了啊思密达

各种定位之后(拿出写python的调试精神——log大法)，发现了神奇的错误

{% codeblock lang:c++ %}
int Setx(double value){data[0]=value;std::cout<<data[0]<<'\t'<<value<<std::endl;}
{% endcodeblock %}

这样一句赋值语句最后输出的结果竟然是`-1.5e-315 -11`...闹太套啊魂淡！内存访问有问题吧摔=口=好歹人家unreal那么复杂一个引擎转出来都没问题，凭啥我这么小一个工程就挂呢=。=接下来进行了一下坑爹尝试（模仿慎重）

- 第一反应是关掉所有编译优化，关掉type array、asm.js等，毫无作用
- 会不会是osx的内存问题，毕竟官方说linux版本最稳定=>装linux虚拟机去
- 装完发现表现一样，那会不会是64bit问题，毕竟内存模型是默认32的=>装32bit虚拟机去
- 结果发现还是一个德行！

总之各种装环境就花了大半天，但表现形式一摸一样……毫无人性（幸好没尝试windows版本的安装）

最后灵机一动……突然想到赵老湿用了很多C++0x的特性，特别是自己写的一个类似智能指针的类用了`nullptr`啥的，所以我在编译的时候打开了`-std=c++11`才能编译过。。。最后蛋疼之下删掉了这个东西+关掉编译开关，全改成指针<del>不管内存泄露的请不要在意</del>，竟然好了T T

整了半天真是标准的错！虽然在github上[提问](https://github.com/kripken/emscripten/issues/1279)了但最后发现完全不是我想的一回事……

# 所谓的demo

先挂上[DEMO链接](/boolean/index.html)，chrome/firefox都应该无压力，IE也需要新一点才行，因为用了type array来加速

<del>用户手册等有空吧=。=</del>

{% post_link threejs_mannual %}