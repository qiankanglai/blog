---
layout: post
title: Skynet in Windows
date: 2016/12/29
tags: C++
toc: false
---

最近的一个项目用了云风的[skynet](https://github.com/cloudwu/skynet)，之前是只有linux/osx版本，非官方版本有一个mingw。

<!--more-->

试了下新的Windows 10自带的Bash on Ubuntu发现能直接跑，非常带感。具体安装过程参考[Installation Guide](https://msdn.microsoft.com/en-us/commandline/wsl/install_guide)，然后如下安装几个依赖即可：

{% codeblock lang:bash %}
sudo apt-get install build-essential autoconf libreadline-dev 
cd skynet
make linux
{% endcodeblock %}
