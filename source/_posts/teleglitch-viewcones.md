---
layout: post
title: Teleglitch 动态视锥
date: 2016/4/9
tags: [GameArtTricks,Translation]
toc: false
---

[Nox](http://en.wikipedia.org/wiki/Nox_%28video_game%29)有一个很有意思的特性: 动态视锥(view cones)!当玩家移动的时候，可见区域会动态更新，很吸引眼球~

<!--more-->

![](https://data.simonschreibt.de/gat002/nox.gif)

独立游戏[Teleglitch](http://teleglitch.com/)中也有类似的效果，开发者用一种有趣的方式模拟出了这种动态视野的效果(译注: 就是用黑色盖住看不到的地方...)。一开始我想的是『看来他们也做了类似Nox的效果』，但后来我注意到这两者还是有所不同的。

![](https://data.simonschreibt.de/gat002/teleglitch.gif)

<del>实现的思路是生成一些黑色的『墙』，这些墙只会在部分场景物体上出现，方向都是正对着相机(译注: 其实也就是玩家)、然后将背面涂黑即可。非常简单但是有效的办法。但这些黑色区域并没有直接沿着场景边缘，而是留了一点空隙，这样保证了玩家可以看到墙的最外侧部分。</del>

译注: 这是作者一开始的想法，但后来被游戏开发者指正了...我理解作者想表达的意思如下图所示(虽然游戏本身实际上不是这么干的) 淡蓝色部分标注了可以生成『墙』的部分，绿色的叉表示了相机，红色就是正对相机的『墙』、背后涂黑~

下面是作者收到开发者邮件里说的:

> 实际上，视野阴影(sight shadows)的边界并不是通过透视完成的。他们仅仅是从玩家角度来看，向外扩展的黑色多边形。这部分的数学计算类似从相机角度往外涂黑3d的墙，但实际上是不一样的。

由于我对数学和编程实现部分没有太多了解，而且难以想象这事。所以我比较了下**真实**的视锥效果 vs. 向外扩展的方法(虽然开发者说这并不是真正采用的方法，但是我觉得至少差不多)。我观察到的是尽管不是100%一致，但总的来说足够好了！

![](https://data.simonschreibt.de/gat002/cone_vergleich.gif)

译注: 我问了下Simon，这个gif图是他在3ds max里摆了一个一样的场景然后计算的阴影，然后和原图比较的~

对我来说这个效果非常惊艳。和去写一个『真的』视锥算法来说，这样节约了大量时间。如果你对这个感兴趣的话，一个开发者给我提供了[一份代码](http://pastebin.com/x7LV33Ft)。

### (原文作者)更新

某天我突然想到[Diablo 2](http://eu.blizzard.com/de-de/games/d2/)里也有类似动态视锥的效果。这个也很有意思，因为实际上它没有依靠任何3D信息来计算。

![](https://data.simonschreibt.de/gat002/diablo2_schatten.gif)

### 译注

翻译这篇文章的时候，我第一是想到了[视线和光线：如何创建 2D 视觉范围效果](http://indienova.com/indie-game-development/sight-light-how-to-create-2d-visibility-shadow-effects-for-your-game/)这篇文章，利用采样Ray的方法来做。不过我把原文发给Simon看了下，他表示不能确定...开发者没有细说。

就我自己的理解来说，如果用真3D方法做视锥，需要光栅化那一套比较麻烦~对2D游戏来说，用这种取巧的方法做个七七八八即可(恩还有特色...)~

[原文链接](http://simonschreibt.de/gat/teleglitch-viewcones)