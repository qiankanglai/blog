---
layout: post
title: FFT Ocean Part 1
date: 2015/11/15
mathjax: true
tags: Unity
toc: false
---

最近在折腾Ocean Simulation，业余时间快搞了半个月了，数学功底太差TAT...

<!--more-->

![](/images/fft_part1.gif)

主要参考了Jerry Tessendorf的[Simulating Ocean Water](http://graphics.ucsd.edu/courses/rendering/2005/jdewall/tessendorf.pdf)这篇论文，实现上还参考了[NVidia的Ocean Surface Simulation](https://developer.nvidia.com/sites/default/files/akamai/gamedev/files/sdk/11/OceanCS_Slides.pdf), [OCEAN SIMULATION](http://www.keithlantz.net/2011/10/ocean-simulation-part-one-using-the-discrete-fourier-transform/)等资料。

首先遇到的问题就是NVidia实现魔改了不少地方...

- 文档里第七页给出的频域图像是不对称的，但是按照公式$\mathbf{P}_{h}(\mathbf{k})=\frac{A}{k^{4}}\|\hat{\mathbf{k}}\cdot\hat{\mathbf{\omega}}\|^{2}e^{-\frac{1}{k^{2}L^{2}}}$来说，应该完美对称才对~
- Gaussian那张图我用QQ截图取色看了下，也肯定不是标准的分布，而是用了奇怪的均值和方差。

后来群里@恶魔笑了说是其代码里乘上了一个系数来减少逆波，另外在NV的代码里，分母上用了$k^6$而不是$k^4$。(黑科技一如既往的多啊...)

反正一路理解推导+一路抄袭，总算先山寨了一下...FFT的效率比DFT好多了

接下来需要参考[Ocean waves using phillips Spectrum in Unity](http://scrawkblog.com/2013/08/04/ocean-waves-using-phillips-spectrum-in-unity/)，将更多的运算搬到GPU上，看看能否优化到中低端手机上都能支持。