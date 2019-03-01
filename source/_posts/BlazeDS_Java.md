---
layout: post
title: 使用BlazeDS进行Java和纯actionscript项目通信
date: 2012/4/7
tags: Java
---

前段时间在帮着做一个网络模块，背景是一个actionscript的项目和后台服务器进行数据交换。最后选择了[BlazeDS](http://opensource.adobe.com/wiki/display/blazeds/BlazeDS)的解决方案，使用HTTP封装的AMF协议进行通信。交换的数据中有各种数组和自定义类，blazeDS基本上都能自动序列化和反序列化，因此用的比较舒服。但一开始配置环境的时候遇到了各种奇怪的问题，特别有一个问题网上搜索只有在一个post里提到，因此很值得记录。

<!--more-->

# 搭建BlazeDS服务器

因为BlazeDS实质上是tomcat webapp，因此我用的是Eclipse+Web Tools Platform搭建的服务器。建立Dynamic Web Project之后，将blazeds.war里面的META-INF和WEB-INF解压到WebContent里面，就完成了服务器的初步搭建(so easy~)。在Eclipse里面用Run on Server，接下来一系列常规设置tomcat就行了。

在FlashBuilder中，我一开始是选择的Flex项目进行测试(因为纯actionscript项目使用BlazeDS会麻烦非常多，容后再表)。在建立项目的时候可以选择服务器技术-BlazeDS:

![](/images/BlazeDS_cannotconnect.jpg)

提示说**“无法访问 Web 服务器。服务器可能没有运行，或者 Web 根文件夹或根 URL 可能无效”**，但实际上是已经在Eclipse里面运行了服务器。这就是我纠结的第一个问题。

后来发现，Eclipse WTP在默认部署的时候，是将网站部署到workspace metadata文件夹；Flex在验证服务器的时候，很有可能是在文件夹里添加某些内容然后尝试远程访问——这个很像Google site这样上传随机文件的样子。然而用过的人都知道，WTP在刷新服务器内容的时候是有时间差的(譬如修改了代码，会提示同步中...)，这就是问题所在。最后我通过将网站部署位置修改到tomcat文件夹下来解决:

![](/images/blazeDS_tomcat.jpg)

# 修改默认tomcat部署位置

通常情况下，会发现这些内容都是灰色的！我是通过删除tomcat服务器下的网站，清理之后重新打开，就如下图所示，可以修改了

![](/images/blazeDS_tomcat2.jpg)

将部署位置修改以后，FlashBuilder表示能正常连上了~

具体怎么使用BlazeDS服务器:修改配置文件、编写自定义类之类的，都比较简单，查阅[官方文档](http://livedocs.adobe.com/blazeds/1/blazeds_devguide/)就行了。比较简单的就搞定了Flex与Java之前的互相通信。

# 纯ActionScript项目使用BlazeDS

网上绝大部分(包括教程)都是如何使用Flex项目进行数据通信，ActionScript版本的很难找到。这一部分我纠结了特别长的时间，主要遇到了以下几个问题，在这里分享一下。

## 导入mx.rpc.\*等

默认的AS项目比Flex项目少引用了不少东西，这里需要手动加上:framework.swc, rpc.swc。但是在加上framework.swc之后，还遇到了“无法为区域设置zh_CN解析资源束xxx解决方法”一串错误：在actionscript构建路径-库路径中，将C:\Program Files (x86)\Adobe\Adobe Flash Builder 4.6\sdks\4.6.0\frameworks\locale\zh_CN作为swc文件夹导入。

## 不使用services-config.xml配置

在Flex中，通过指定services-config.xml(本质是在编译的时候加上-services标签)，可以很方便的使用

{% codeblock lang:xml %}
<mx:RemoteObject id="helloRemoteObject" destination="helloWorld" fault="faultHandler(event)" result="resultHandler(event)">;
{% endcodeblock %}

但是在Actionscrpit项目中，我指定xml编译一直不能成功使用。后来我自己使用AS3代码实现了等价的功能

{% codeblock lang:actionscript %}
var ro:RemoteObject = new RemoteObject();
var cs:ChannelSet = new ChannelSet(); 
cs.addChannel(new AMFChannel("my-amf", "http://localhost:8080/Ninja/messagebroker/amf"));
ro.channelSet = cs;
ro.destination = "ninja"; 

ro.addEventListener(ResultEvent.RESULT,r1);
ro.addEventListener(FaultEvent.FAULT,r2);

ro.sayHello();
{% endcodeblock %}

这个就相当于调用远程对象的sayHello方法。

## Error #1034

> TypeError: Error #1034: Type Coercion failed: cannot convert Object@13e9921 to mx.messaging.messages.ErrorMessage. 

这个问题是最值得记录的问题，也是我遇到的最关键的问题。最后在[StackOverflow](http://stackoverflow.com/questions/8987109/using-remoteobject-amf-from-a-flash-or-pure-as3-project)找到了答案：没有绑定。反正当时在网上搜了很久，都只有这一个地方找到。

Flex的.mxml文件本质上会编译出一堆.as文件(通过编译器指令-keep-generated-actionscript=true)，对比发现有这样一句初始化命令flash.net.registerClassAlias()

{% codeblock lang:actionscript %}
public static function registerClassAliases():void
{
    // Flex classes
    registerClassAlias("flex.messaging.io.ArrayCollection", ArrayCollection);
    registerClassAlias("flex.messaging.io.ArrayList", ArrayList);
    registerClassAlias("flex.messaging.io.ObjectProxy", ObjectProxy);
    
    // rpc classes
    registerClassAlias("flex.messaging.messages.AcknowledgeMessage", AcknowledgeMessage);
    registerClassAlias("DSK", AcknowledgeMessageExt);
    registerClassAlias("flex.messaging.messages.AsyncMessage", AsyncMessage);
    registerClassAlias("DSA", AsyncMessageExt);
    registerClassAlias("flex.messaging.messages.CommandMessage", CommandMessage);
    registerClassAlias("DSC", CommandMessageExt);
    registerClassAlias("flex.messaging.config.ConfigMap", ConfigMap);
    registerClassAlias("flex.messaging.messages.ErrorMessage", ErrorMessage);
    registerClassAlias("flex.messaging.messages.HTTPMessage", HTTPRequestMessage);
    registerClassAlias("flex.messaging.messages.MessagePerformanceInfo", MessagePerformanceInfo);
    registerClassAlias("flex.messaging.messages.RemotingMessage", RemotingMessage);
    registerClassAlias("flex.messaging.messages.SOAPMessage", SOAPMessage);
}
{% endcodeblock %}

这些语句的意思是说，将本地的as类和远程的java类对应起来(诸如`flex.messaging.messages.*`都在blazeds.war里面的jar中实现了)。这样在Flex-Java通信的时候，就知道序列化和反序列化对应的是什么类了。

我估计是没有初始化的情况下，返回的基本类型(我当时是返回了一个String)不知道如何反序列化这样的情况。

## 所谓`[RemoteClass(alias=)]`标签

除了基本的一些类型和数组之外，AMF协议可以进行自定义类的序列化。但是需要在AS代码中进行绑定，例如

{% codeblock lang:actionscript %}
[Bindable]
[RemoteClass(alias="me.qiankanglai.test")]
public class Test
{
    public var t:String="";
}
{% endcodeblock %}

但是，一如既往的，在actionscript中使用不能。最后发现这个问题和上个问题类似——对比.mxml生成的.as代码可以发现，这个metadata其实就是这句话

{% codeblock lang:actionscript %}
registerClassAlias("me.qiankanglai.test",Test);
{% endcodeblock %}

自此问题解决~

ps.当时做的时候还在纠结要不要用node.js+websocket，或者说AMF+socket的架构。最后出于开发风险和现有要求的考虑，用了HTTP+AMF的架构实现，估计问题也不大。

ps2.看了[Zynga通信框架](http://www.quora.com/How-does-server-technology-work-for-Zyngas-games)，感觉蛋定了好多！话说云服务真是个好东西啊。