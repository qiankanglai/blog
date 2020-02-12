---
title: Win/OSX下多继承内存布局区别
date: 2020-02-01 20:10:48
tags: C++
toc: false
---

最近在家闲的快发霉了，无聊之下花了点功夫把部分代码在OSX上跑起来(之前都是在Win上开发)，遇到了一个很有意思的崩溃：目前定位出来是不同compiler下的memory layout区别。

<!--more-->

首先从表象上来看，加载同一份资源在Win上没问题，然后OSX上稳定崩溃(都是x64)；先干掉各种异步加载接口和构造最小可复现demo之后，对比发现是某个类的数据很奇怪：

![](/images/memory_layout_osx.jpg)

![](/images/memory_layout_win.jpg)

直观的看就是`mNbVertices`和`mNbTriangles`错位了，同时后面的`mVertices`开始又没问题。接下来找下这块数据是哪里赋值的：

{% codeblock lang:cpp %}
RTreeTriangleMesh* obj = new (address) RTreeTriangleMesh(PxBaseFlag::eIS_RELEASABLE);
{% endcodeblock %}

这里使用了in placement new，先排查下`address`部分的数据，对比了下OSX/Win下没区别。然后看下具体出问题的父类定义：

{% codeblock lang:cpp %}
class TriangleMesh : public PxTriangleMesh, public Ps::UserAllocated, public Cm::RefCountable
{% endcodeblock %}

以及打印下这些基类的大小和成员变量地址

{% codeblock lang:cpp %}
printf("%d %d %d %d %d\n", sizeof(RTreeTriangleMesh), sizeof(TriangleMesh), sizeof(PxTriangleMesh), sizeof(PxBase), sizeof(RefCountable));
printf("%d %d %d %d %d\n", (void*)obj, (void*)&(obj->mNbVertices), (void*)&(obj->mNbTriangles), (void*)&(obj->mVertices), (void*)&(obj->mRefCount));
{% endcodeblock %}

数据结果表明`sizeof`的结果两个平台一致

> 256 160 16 16 16

但是成员变量偏移部分出现了不一致

- OSX上的成员变量地址偏移
	- mNbVertices 28
	- mNbTriangles 32
	- mVertices 40
	- mRefCount 24
- Win上的成员变量地址偏移
	- mNbVertices 32
	- mNbTriangles 36
	- mVertices 40
	- mRefCount 24

OK这里的结果也和最前面的差异对上了：临时解决方案是`RefCountable`里加了个int占位。

ps. 但这里有点奇怪的是明明`PxTriangleMesh`和`RefCountable`都是大小为16，那么`TriangleMesh`的两个基类应该直接占掉32了，为什么XCode里`mNbVertices`偏移还是28...待继续深入

btw 后来又遇到一个无力吐槽的情况: XCode里Hybrid下物理碰撞直接失效了，用PVD查了下pxScene数据看上去都没问题，但愣是raycast无结果；Debug下倒是一切正常。最后发现把PhysXSDK3_4的编译优化禁用就行了(我测试了下开`-O1`也挂，服了)。同样待有空继续深入。

![](/images/physx_compiler_opt.jpg)
