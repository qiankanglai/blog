---
layout: post
title: Cryptographic failure while signing assembly
date: 2015/7/25
tags: KlayGE
toc: false
---

最近新装了Windows 10 preview，蛋疼的发现装不上Visual Studio 2013，只能先用Visual Studio 2012凑合...昨儿在编译KlayGE develop分支的时候发现挂在wpftoolkit上了，一开始还试图回滚+二分定位，但是发现毫无意义-。-

<!--more-->

> 2>CSC : error CS1548: Cryptographic failure while signing assembly 'd:\SDK\KlayGE\External\wpftoolkit\Main\Source\ExtendedWPFToolkitSolution\Src\Xceed.Wpf.Toolkit\obj\x64\Debug\Xceed.Wpf.Toolkit.dll' -- 'Error signing assembly -- Access is denied. '

一开始我以为是生成dll失败，导致文件不存在无法访问。后来网上搜了一翻：[CSC : ERROR CS1548: CRYPTOGRAPHIC FAILURE WHILE SIGNING ASSEMBLY XXX.DLL ERROR SIGNING ASSEMBLY — ACCESS IS DENIED](http://www.dotnetthoughts.net/csc-error-cs1548-cryptographic-failure-while-signing-assembly-xxx-dll-error-signing-assembly-access-is-denied/), [Can't build OmniSharp at all?](https://github.com/OmniSharp/omnisharp-vim/issues/150), [Cryptographic failure while signing assembly in Visual studio](http://stackoverflow.com/questions/4237070/cryptographic-failure-while-signing-assembly-in-visual-studio)，都说的是运行Visual Studio的账户权限问题导致的...

不过对比了下他们的文件夹路径，我修改了`C:\ProgramData\Microsoft\Crypto\RSA\MachineKeys`这个文件夹，把自己账户设为Full Control就好了

龚大表示他的Windows 10+Visual Studio 2012无压力，但是我家里和公司的电脑上都遇到了一模一样的现象，真是有意思的现象...