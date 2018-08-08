---
layout: post
title: 辐射3 边缘处理
date: 2016/4/2
tags: [GameArtTricks,Translation]
toc: false
---

前言：[Game Art Tricks](https://simonschreibt.de/game-art-tricks/)是我在知乎上看到某个回答里提到的一个网站，里面分析了很多游戏用到的精彩技巧。原谅我见识少...反正很多美术技巧我是第一次学到，简直6的飞起~我与原作者Simon联系之后，得到了翻译授权，之后我慢慢会将这个系列翻译出来。为了避免出现潜在问题，第一次遇到术语时我会注上对应英文单词。对于原文中提到的一些其他文章，我也会挑选性的翻译一些，减少阅读难度。

<!--more-->

辐射3中有不少图形上做的非常棒的地方，其中一个让我惊艳到的细节是辐射3是如何处理磨损的边缘。

如下图所示，你可以在最上面一行看到一个非常漂亮的破损岩石。我觉得这个效果非常赞，感觉上是高模(high poly)做的。但是当你从另一个角度观察，会发现其实石头模型用的面非常少(见中间一行)。

![](https://data.simonschreibt.de/gat001/fallout3.jpg)

如果你从一个非常近的距离去观察，你会发现这个低模上有两张贴图：一个“光滑”的石头和一个破损的边缘。同时为了让两者之间过度的不被人察觉，辐射利用了法线贴图(normal map)造出了一些坑孔。

我研究了一下这事儿。下面是这个石头模型的线框图。我猜测**辐射利用了一层额外的几何形状，然后在边缘处透明混合贴花和石头**。更多关于这个的细节在本文底部。

![](https://data.simonschreibt.de/gat001/stone_wireframes.jpg)

我进一步检查了边缘处的纹理。有意思的是，辐射里的法线贴图大小只有漫反射贴图(diffuse map)的一半，这就是为什么下图中两张纹理的大小不一样。我标记了上面截图中对应石头纹理的部分。

![](https://data.simonschreibt.de/gat001/stone_decaltexture.jpg)

另外，高光贴图(specular map)被直接保存到法线贴图的透明通道里。对于贴花(decal)来说，高光部分是纯白的。我比较奇怪的是这种情况下为何不直接另外加一个透明通道。当贴图本身没有透明通道时，其默认返回值是1.0，也就是纯白。不过可能是有其他我不知道的原因。(译注：我理解的是说对于贴花来说反正高光部分纯白全是1，相当于没有信息；所以这里可以用来存透明信息，反正贴花和石头需要做透明混合)

下面我们回到贴花部分。[Throttlekitty](http://www.polycount.com/forum/member.php?u=25486)说辐射将贴花和视差贴图(parallex mapping)一同使用。这一点我也不是很确定，因为一般来说使用视差贴图除了法线贴图之外，还需要一张高度图(height map)，正如[Parallax Mapped Bullet Holes](http://cowboyprogramming.com/2007/01/05/parallax-mapped-bullet-holes/)文内所说。但是[wichenroder](http://www.polycount.com/forum/member.php?u=21307)给了我一个[有趣的文章](http://freesdk.crydev.net/display/SDKDOC3/Using+Decals+for+Destroyed+Structures)，以Cry Engine为例解释了这个。

但我依然不是100%确定辐射3也用了这个技术，因为我没看到额外的模型。下图是游戏里模型的线框模型，我添加了红线标出了属于石头的部分；这是从底部看石头的角度，越过石头可以看到天空球：

![](https://data.simonschreibt.de/gat001/stone_wireframes02.jpg)

另一个可以作为证据的是辐射提供的MOD制作工具，从中可以发现一些有意思的东西。在里面你可以混合任何东西。

![](https://data.simonschreibt.de/gat001/house_example.jpg)

[Falk](http://www.fa-so.de/)提到也许在辐射是在编辑器里摆好贴花之后，作为预制体(prefab)保存下来。然后关卡设计师可以直接利用这些做好的预制体，同时贴花信息可以保存在随便什么地方。但是今天我和一个Crytek的人(他原来在Bethesda工作)聊天，他说辐射就是按照Cryengine的方法做的。所以也许我应该看看如何找到那些额外的模型。

**最后补充：我问了如何在贴花之间混合，辐射只是删除了LoD上的贴花面。机智！**(译注：其实就是不管地形本身用的细节多少，最后都混合上同一层细节最多的贴花即可...)

# (原文作者)更新1

我问了下同事Markus有没有工具能够拿来分析，他向我推荐了Intel GPA。下图是我用这个工具的截图：

![](https://data.simonschreibt.de/gat001/fallout3_noalphatest.jpg)

需要注意的是我并没有画贴图上的黑色部分。我只是关闭了Alphatest/Alpha1，这也许是因为辐射利用了额外模型才导致的。(译注：这时候贴花就无法和石头进行透明混合，而是全部盖住了)

# Parallax Mapped Bullet Holes

贴花是直接将一张二维图片贴到三维模型上，如果需要表现孔这样的形状就很容易穿帮。为了解决这个问题，一方面需要法线贴图，在光照上产生3D感；另一方面需要一张额外的**深度图**，这样在贴上贴花的时候能有一些扰动，更加真实。

举个简单栗子，一张桌布平铺在桌面上的效果，和铺在有孔的桌面上的效果肯定是不同的；在孔的范围内，桌布会有一定的“延展拉伸”，相当于贴图产生了一定的形变。如果依然是和原来一样平铺开来，就算有法线贴图产生的光照变化，依然会让人觉得有瑕疵。

# Using Decals for Destroyed Structures

原文作者的链接需要登录才能打开，我找了个[还是中文版本的](http://docs.cryengine.com/display/SDKDOC2/Using+Decals+for+Destroyed+Structures)...

文章主要就是介绍了透明混合的贴花，做法是在原来的模型上复制出一部分几何模型，然后指定好对应的贴花和法线贴图(只用贴花的话，光照效果是不对的)，最后在边缘处和原模型透明混合即可。

[原文链接](http://simonschreibt.de/gat/fallout-3-edges)
