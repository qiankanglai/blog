---
layout: post
title: KFL代码阅读笔记
date: 2015/8/28
tags: [KlayGE,C++]
toc: false
---

KlayGE的基础库，就挑看到觉得有意思的地方整理下，主要是有不少c++0x的花样很有趣。

<!--more-->

**AlignedAllocator** 内存分配器，确保分配出来的地址是对齐的。核心思想就是多分配一点内存，然后通过`(ptr+alignment-1) & ~(alignment-1)`得到新的对齐过的地址即可。[Aligned Memory Allocator](http://jmabille.github.io/blog/2014/12/06/aligned-memory-allocator/)里面有介绍，顺便了解了下为什么会有`rebind`，容器为了隐藏细节也是蛮拼的...

ps. 龚大写的是`(ptr+alignment-1) & (-alignment)`，一眼看下去不太习惯，不过根据想了想`0x00000010`的取反`0xffffffef`加1，`0xfffffff0`也是对的...

** COMPtr ** 看起来就是在`shared_ptr`释放的时候，自动调用其`Release`函数~

** CustomizedStreamBuf ** 内存里的stream，还是STL吼吼。

** DllLoader ** 跨平台载入动态链接库的封装，反正就是`LoadLibrary`和`dlopen`呗。

** Thread ** `join_now_`表示这个运行结束，`can_recycle_thread_`表示可以复用了；然后在循环里面检查+运行，逻辑利用了`std::function`包了下。说实话这块没完全看懂，封装的有点迷糊了...

不过学习了一下新的模板知识~我对这货的印象还停留在展开上，现在11出来以后编译阶段已经可以做很多计算(编译阶段计算字符串Hash已被龚大玩出花)和检查操作(`static_assert`)。譬如根据模板类型，生成一个`optional`，需要注意的是对于`void`、需要使用`void_t`，从而保证有有`::type`。

{% codeblock lang:csharp %}
struct void_t
{
	typedef void_t type;
};

typedef std::experimental::optional<
	typename std::conditional<std::is_same<result_type, void>::value,
	void_t, result_type>::type
>  result_opt;
{% endcodeblock %}

大概看了下头文件，对于这种编译期判断的，是通过模板顺序来实现返回`true_type`或`false_type`，挺好玩...

** Util ** `MakeFourCC`直接利用模板和枚举，在编译期计算；`std::forward`传递参数真是强大，搜了下[Perfect forwarding](http://www.cnblogs.com/harrywong/p/perfect-forwarding-the-solution.html)...还有就是[字符串编译器Hash](http://www.klayge.org/2015/07/13/%E4%B8%89%E6%8E%A2%E7%BC%96%E8%AF%91%E6%9C%9F%E5%AD%97%E7%AC%A6%E4%B8%B2hash/)了

** AABBox ** 那一堆继承boost的OPERATOR真是亮瞎了我的狗眼。然后在群里问了下大神关于[右值引用](http://jxq.me/2012/06/06/%E8%AF%91%E8%AF%A6%E8%A7%A3c%E5%8F%B3%E5%80%BC%E5%BC%95%E7%94%A8/)的事情，看起来`std::move`很好用的样子，但还无法说得上掌握-.-

** Math ** 各种模板神偷懒，这个感觉还是用到的时候慢慢添加进来为好~为了兼容STL，需要各种`typedef`好对应类型供迭代器使用；还有就是尽量减少各种拷贝。

** Vector ** 利用`enum`来保存模板里的信息，然后这样配合着`static_assert`进行编译期检查。