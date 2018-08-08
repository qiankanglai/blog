---
layout: post
title: Divine Divinity 2D反射
date: 2016/4/12
tags: [GameArtTricks,Translation]
toc: false
---

讲真反射效果对我来说挺常见的，但是在我印象里Divine Divinity是唯一一个实现了反射的2D游戏...像兔子这种很小的物体都会产生镜像

<!--more-->

![](https://data.simonschreibt.de/gat006/divinity.gif)

译注: <del>噫!难道是SSR?</del> 评论区有个人提到的思路和我想的一样，可能是将sprites翻转之后重新绘制在特定区域(倒影)，这样主要是要注意下渲染顺序，倒也难度不大...

[原文链接](http://simonschreibt.de/gat/divine-divinity-2d-reflexion)
