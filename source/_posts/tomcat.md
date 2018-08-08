---
layout: post
title: Tomcat的java.net.BindException错误
date: 2013/4/27
tags: Java
toc: false
---

我一直是用Eclipse+WTP，配合tomcat7以及mysql来写struts2网站的。今天开电脑以后遇到了一个很奇怪的问题：tomcat7始终在eclipse中启动不起来

<!--more-->

{% codeblock lang:bash %}	
Apr 27, 2013 9:59:23 AM org.apache.coyote.AbstractProtocol start
INFO: Starting ProtocolHandler ["http-bio-8080"]
Apr 27, 2013 9:59:23 AM org.apache.coyote.AbstractProtocol start
INFO: Starting ProtocolHandler ["ajp-bio-8009"]
Apr 27, 2013 9:59:23 AM org.apache.catalina.startup.Catalina start
INFO: Server startup in 2442 ms
Apr 27, 2013 9:59:23 AM org.apache.catalina.core.StandardServer await
SEVERE: StandardServer.await: create[localhost:8005]: 
java.net.BindException: Can't assign requested address
	at java.net.PlainSocketImpl.socketBind(Native Method)
	at java.net.PlainSocketImpl.bind(PlainSocketImpl.java:383)
	at java.net.ServerSocket.bind(ServerSocket.java:328)
	at java.net.ServerSocket.<init>(ServerSocket.java:194)
	at org.apache.catalina.core.StandardServer.await(StandardServer.java:427)
	at org.apache.catalina.startup.Catalina.await(Catalina.java:766)
	at org.apache.catalina.startup.Catalina.start(Catalina.java:712)
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:39)
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:25)
	at java.lang.reflect.Method.invoke(Method.java:597)
	at org.apache.catalina.startup.Bootstrap.start(Bootstrap.java:322)
	at org.apache.catalina.startup.Bootstrap.main(Bootstrap.java:451)
{% endcodeblock %}
		
网上搜了一下，大体是说看看hosts文件有没有改坏之类的。但是我很久没动过之类的操作了~netstat出来的端口也没有被占用。

后来想到了是不是因为家里的网络环境和学校的不一样?

结果发现*关了WIFI就好了*，狂囧~真是简单粗暴的解决方案啊(╯°口°)╯╧═╧

大概看了下原因，应该是tomcat试图去绑定家里路由器的公网IP，但本机只有一个C类IP，因此出现了绑定端口不能的情况。