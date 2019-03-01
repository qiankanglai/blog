---
layout: post
title: WSO2套件三连发
date: 2013/8/15
tags: Java
---

这其实是我大四时一门课配套大作业，当时配环境折腾很久~后来发人人网共享，结果昨天学长给我留言有人[不带名字抄袭](http://blog.csdn.net/xo_zhang/article/details/9200013)。虽然很冷这个都有人搞，但总归还不如给自己骗流量呢哈哈哈哈……

<!--more-->

# 如何在wso2套件之Application Server上部署并使用服务

我是贴图流…………在虚拟机里ubuntu跑的，注意就是说jdk1.7运行wso2会有一些错，但不知道是否影响使用。jdk1.6亲测可用

## 设置`JAVA_HOME`

控制台`sudo vim /etc/environment`

![](/images/wso2_1.1.jpg)

这样每次开机都就自动设置进去了。至于说怎么装java的问题……啧啧

## 运行AS

解压下载的压缩包，进入bin子目`./wso2server.sh`

![](/images/wso2_1.2.jpg)

## 打开浏览器进入https://localhost:9443/carbon/admin/login.jsp

![](/images/wso2_1.3.jpg)

使用admin,admin登录即可~到这里服务器就能用了

## Eclipse安装carbon studio插件

懒得截图了(我用的eclipse EE)……至于说怎么装eclipse，啧啧

[下载地址](http://wso2.org/downloads/carbon-studio)

## 开始写一个服务~直接上图，这里点一下那里点一下soeasy爬过

### 建立carbon项目

![](/images/wso2_1.4.jpg)

![](/images/wso2_1.5.jpg)

### 建立一个普通项目，起一个文艺名字，写一段2b代码作为测试

![](/images/wso2_1.6.jpg)

### 在carbon项目中右键-新建Axis Service

![](/images/wso2_1.7.jpg)

选中刚才写的那个类

![](/images/wso2_1.8.jpg)

在生成的service中右键generate-AAR

![](/images/wso2_1.9.jpg)

### 发布到网站

使用管理员登录as管理网站后，在左侧Web Services-Add-Axis2 Service，上传生成的AAR即可

![](/images/wso2_1.10.jpg)

回到Web Service List，可以看到多了一个服务啊！Try it！

![](/images/wso2_1.11.jpg)

## 如何在代码中调用WSDL服务

### 生成wsdl client

在DashBoard中

![](/images/wso2_1.12.jpg)

我使用了-s -t命令生成client，下载下来加压到一个新的项目中

![](/images/wso2_1.13.jpg)

### Eclipse修改

首先将test中的代码移动到src中

其次将项目应用axis的所有包([下载地址](http://axis.apache.org/axis2/java/core/download.cgi)，在子文件夹lib中有一大堆jar)

修改junit代码啥的~

![](/images/wso2_1.14.jpg)

最后运行得到结果~竟然和Try it是一样的！

![](/images/wso2_1.15.jpg)

弄完收工。。。贴图太累了~录视频算了赖皮

# wso2第二波之如何部署ESB proxy service

主要参考esb doc中的QuickStartGuide后半部分Proxy Services因此文字就更少了哈哈！

## 搞两个互通的系统

(假设ubuntu已经有了部署好的服务并开启AS)先用浏览器上一下确认可用抠鼻孔

![](/images/wso2_2.1.jpg)

## 打开ESB登录进去

![](/images/wso2_2.2.jpg)

## 左边Manage-Web Services-Add-Proxy Services

![](/images/wso2_2.3.jpg)

## 选择Custom Proxy

这块懒得写太麻烦了……具体去看文档就行了(逃

- 选择Specify source URI
- 输入AS中WSDL2的连接
- Test=>next

![](/images/wso2_2.4.jpg)

选择'Define Inline'，在'Define Endpoint' 下面。Create

![](/images/wso2_2.5.jpg)

这里注意是用AS中axis2 DashBoard中的http的endpoint(使用https由于跨域问题会有错误~估计需要导入证书什么的就没管)

![](/images/wso2_2.5.jpg)

选择'Define Inline' 在'Define Out Sequence' 下，'Add Child'->'Core'->'Send'

最后保存就ok了

![](/images/wso2_2.6.jpg)

## 看到服务里多了一个Proxy Service爬过

![](/images/wso2_2.7.jpg)

## Try It(at ESB)

![](/images/wso2_2.8.jpg)

收工…………………………这时候是先访问的ESB的代理服务，然后ESB去调用AS服务的形式抓狂

ps.我是两个虚拟机host-only模式下互相访问的~罪过罪过又用盗版了郁闷

![](/images/wso2_2.9.jpg)

又冷又饿。。。(好冷)等来修电脑了……

<del>现在看看就是不用osx虚拟机，有俩笔记本可以连调了哦也</del>

# wso2最后一波……解决一台电脑同时运行多个carbon2

之前真dt跑了俩虚拟机，不过试试Lion还是挺好玩的<del>谁让我现在有rmbp啊啊哈哈哈</del>

由于不同的wso2套件都有carbon核心，所以直接运行会有端口绑定错误。

在README里面有说 -DhttpPort这样的参数来修改端口避免冲突。其实是覆盖了mgt-transport.xml中的设置。

通过修改/respository/conf/carbon.xml中一系列端口(譬如AS保持不变，ESB每个端口号+1，IS每个端口号+2)就可以达到同时运行的目的。

![](/images/wso2_3.1.jpg)

![](/images/wso2_3.2.jpg)