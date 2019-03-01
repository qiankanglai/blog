---
layout: post
title: 如何在国内下载android源代码
date: 2014/8/29
---

为了编译libcurl，必须下载android系统源代码，结果发现被某墙弄的基本不能下。我手头只有一个性能很弱的vps，最后没办法走上了双重代理不归路~最后使用了ssh端口转发，然后socks5代理转http代理(其实也可以拿来干别的事情，如上上网什么的)

<!--more-->

# SecureCRT端口转发

这个比较简单，在SecureCRT里面设置Port Forwarding就行了，我这里是用的7777端口(Name可以乱填)。

![](/images/securecrt1.jpg)

然后是Remote/X11里

![](/images/securecrt2.jpg)

这样设置之后，直接登陆vps就可以使用7777端口作为socks5代理了，例如Firfox里的foxyproxy插件设置

![](/images/foxyproxy.jpg)

# Socks5代理转HTTP代理

很不幸的是我发现获取android没法直接使用socks5代理，或者我打开方式有问题，因此用了一个叫Privoxy的软件~网上教程也不少，这里就不多说了。

核心是配置里的两句话`listen-address  166.111.x.x:8118`和`forward-socks5a / 127.0.0.1:7777 .`：前一句我把ip绑定在外网上，因为我需要让虚拟机能够访问，后一句注意不能漏掉最后英文句号。

# Linux下使用代理更新

在Bash里用`export HTTP_PROXY=http://166.111.x.x:8118 HTTPS_PROXY=http://166.111.x.x:8118`之后，照[官网步骤](https://source.android.com/source/downloading.html)做就行。虽然速度比较慢，反正挂着吧……

![](/images/androidrepo.jpg)
