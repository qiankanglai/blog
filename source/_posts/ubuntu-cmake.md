---
layout: post
title: Ubuntu下编译支持HTTPS的CMake
date: 2016/8/14
tags: KlayGE
toc: false
---

仅用来记录一个小细节...这两天KlayGE升级了CMake版本要求3.4+，但是默认Ubuntu源或ppa上最多才到3.2，因此需要自己编译。下载源码之后直接编译安装没问题，但是遇到了如下错误

<!--more-->

{% codeblock lang:bash %}
➜  KlayGE git:(develop) python build_external.py
Building boost Debug...
-- Downloading https://raw.githubusercontent.com/gongminmin/KlayGEDependencies/cbda47a1678ce70b6720856736100979d469e159/External/Downloads/linux_x64/7z...
CMake Error at /home/anthony/KlayGE/cmake/Common.cmake:123 (FILE):
  file DOWNLOAD HASH mismatch

    for file: [/home/anthony/KlayGE/External/boost/Build/cmake/../../../../External/Downloads/linux_x64/7z]
      expected hash: [277d58cae5405ec65c4d2eb3d49b28128158f008]
        actual hash: [da39a3ee5e6b4b0d3255bfef95601890afd80709]
             status: [1;"Unsupported protocol"]

Call Stack (most recent call first):
  /home/anthony/KlayGE/External/Build/CMake/ExternalCommon.cmake:21 (DOWNLOAD_FILE)
  /home/anthony/KlayGE/External/Build/CMake/ExternalCommon.cmake:29 (DOWNLOAD_7Z)
  CMakeLists.txt:35 (DOWNLOAD_PACKAGE)
{% endcodeblock %}

这里是下载https文件出错，因为默认CMake的编译参数是不支持的。参考[Unsupported protocol while downlod tar.gz package](http://stackoverflow.com/questions/29816529/unsupported-protocol-while-downlod-tar-gz-package)需要进行如下修改

{% codeblock lang:bash %}
sudo apt-get install libcurl4-openssl-dev
./bootstrap --system-curl
make
sudo make install
{% endcodeblock %}

这样就正常了