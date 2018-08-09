---
title: ShaderVariantCollection解决shader_feature丢失
date: 2018-08-06 23:52:31
tags: [Unity]
toc: false
---

之前在{% post_link shader-feature %}提到`shader_feature`配合AssetBundle使用的BUG。当时是通过`multi_compile`绕开，现在在Unity 2017里通过`ShaderVariantCollection`可以完美解决，记录一下遇到的坑。

<!-- more -->

使用过程中只遇到一个问题：

- 直接Debug模式打包AssetBundle没问题
- 使用依赖分析零冗余打包之后遇到了丢失

后来仔细的查了下log发现是依赖分析之后SVC被自动抽到通用的AB中，没有和Shader在一起；这里改动了下就好。网上找到一篇博客[Unity中Shader是否可以热更新的测试](https://www.cnblogs.com/cpxnet/p/6439706.html)，看了下也能和我的理解对上：

Shader只有在和材质球/ShaderVariantCollection打包到**同一个AssetBundle里**的时候才能知道需要哪些shader_feature，否则会丢失...

ps. 顺便使用ShaderVariantCollection的意义好处还有选择性的WarmUp部分Shader