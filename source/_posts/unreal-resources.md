---
layout: post
title: 拆解Unreal资源
date: 2014/11/7
tags: Unreal
updated: 2016/2/12
---

出于学习的目的(认真脸)，想拆解下别人家的作品的包，看下他们的美术资源是怎么布局、整理的，所以花了一晚上尝试了下，并记录如下。

<!--more-->

# 无尽之剑

更新: 后来[官方直接提供了这部分素材](https://www.unrealengine.com/blog/free-infinity-blade-collection-marketplace-release)...2333

[无尽之剑](http://infinityblade.com/)是一款很有名的iOS游戏，一代是用unreal 3做的，首先就用这个练手了。

第一步是获得这个游戏本体，可以在网上直接找ipa文件下载；也可以在iPad上下载之后，通过[iFunbox](http://www.i-funbox.com/)之类的工具导出。

第二步是抓取里面的资源：ipa文件其实本质是个带签名的压缩包，因此把后缀名改成zip之后直接解压就行了。

接下来要请出专门的工具[UE Viewer](http://www.gildor.org/en/projects/umodel)(也可以叫umodel)，非常好的支持了ue3的格式：

![](/images/umodel1.jpg)
指定刚才解压出来的ipa文件夹的位置

![](/images/umodel2.jpg)
可以看到资源文件都在`Payload/SwordGame.app/CookedIPhone`下面，点`Scan content`还可以看到每个xxx文件里具体有多少内容。我这里全选之后`Export`就行了。

![](/images/umodel3.jpg)
导出的所有资源。这样就完成了最基本的导出资源的工作

## 导入模型
UE Viewer导出的模型是psk格式的，这个在UE4里都已近不支持了，所以需要转换一下。我这里使用的是[blender](http://www.blender.org/)

![](/images/blender1.jpg)
[打开psk格式支持](http://www.katsbits.com/tutorials/blender/psa-psk-add-ons-import-export-tool.php): File菜单—User Preference-Addon面板里勾上插件之后保存。

![](/images/blender2.jpg)
将模型转为fbx输出，具体看下File菜单下的Import和Export就行

![](/images/unity3d_jester.jpg)
有了对应的模型和贴图之后，很容易就可以导入到unity3d里看一下效果。这里出现了uv mirror的问题，不过先不管了因为我也没准备用现成的这套资源。

# 禅境花园

Zen Garden是unreal拿来跑分的一个demo，用UE4做的。因为umodel对UE4的支持还在开发中，只能另外想办法。

通过解压缩ipa文件之后发现，资源应该是都被合并在一个pak里面，后来我找到了[u4pak](https://github.com/panzi/u4pak)，直接`u4pak.py unpack xxx.pak`就解压出来一个文件夹:

![](/images/zengarden1.jpg)
看起来很像是UE4的工程！

![](/images/zengarden2.jpg)
很可惜读取失败，无法解析那一堆umap，导致uasset不认。按照我的理解，uasset作为一个通用的压缩包，必须制定好格式才能正常的用反射机制反序列化，所以当umap不灵的时候，uasset就无法打开了；我尝试了下直接对照修改十六进制，但是没耐心一个个byte对过去；如果能用UCommandlet直接写代码去读，应该会方便不少。

我用umodel试了一下，暂时还不支持，不过希望作者下个版本能带上！这个就暂时放弃了……