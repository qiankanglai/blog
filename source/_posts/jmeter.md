---
layout: post
title: 使用JMeter进行压力测试
date: 2013/4/8
tags: Java
---

[JMeter](jmeter.apache.org)是Apache开发的一款开源Java压力测试工具。一开始是针对Web应用开发的测试工具，后来扩展到了诸如数据库、LDAP、Mail等多个方面，总之就是很强大了。我曾经用过其分布式测试的功能，虽然因为网速问题比较蛋疼，但总的来说还是很不错的（这个主要是为了避免压力测试的瓶颈出现在客户端导致结果的误差）。

<!--more-->

出于软件工程课程的需要，需要通过JMeter进行自定义的压力测试：

- 通过Java代码实现自定义Sampler(理解为采样器)
- 设定JMeter进行测试

下面就这两块一一介绍。

# 通过Java代码实现Sampler

下载JMeter并解压。在eclipse中新建项目，将lib/ext中的**ApacheJMeter_core.jar**和**ApacheJMeter_java.jar**拷贝到项目中并添加到build path。

新建一个class，继承**AbstractJavaSamplerClient**，接下来就是重点了

![](/images/jmeter1.jpg)

{% codeblock lang:java %}
public class FriendCodeSampler extends AbstractJavaSamplerClient{
	public Arguments getDefaultParameters() {
		Arguments params = new Arguments();
	    params.addArgument("server", "127.0.0.1");
	    params.addArgument("port", "3010");
	    return params;
	}
	public void setupTest(JavaSamplerContext s) {}
	public void teardownTest(JavaSamplerContext s) {}
	public SampleResult runTest(JavaSamplerContext s) {
		SampleResult results = new SampleResult();
		results.sampleStart();
		//Do Staff here
		results.sampleEnd();
		results.setSuccessful(true);
		return results;
	}
}
{% endcodeblock %}

上面的代码简单的实现了几个重要的接口，下面一一解释

- getDefaultParameters表示这个Sampler需要定义的参数，及其默认值（这些参数可在JMeter中改变，例如使得不同测试线程使用不同的用户名和密码）
- setupTest表示此Sampler在执行之前进行的动作，例如连接上服务器，该动作只执行一次
- teardownTest表示此Sampler在结束之后进行的动作，例如断开服务器，该动作只执行一次
- runTest表示执行**一次**测试，返回SampleResult；具体的代码在sampleStart和sampleEnd之间，最后判断运行结果是否与预期一致，设置setSuccessful并返回。runTest运行次数可在JMeter中设置

> 尽量在runTest中使用单线程，否则可能与JMeter自己的Timer产生冲突

最后将代码导出为jar，放到lib/ext文件夹下

# 设定JMeter进行测试

在JMeter中建立如图测试方案

![](/images/jmeter2.jpg)

JMeter的测试方案是一个树状结构，很好理解。下面具体解释我用到的几个节点。

## Thread Group

一个Thread Group表示需要模拟多少的用户，在Thread Properties中

- Number of threads表示总共有多少个用户
- Ramp-Up Period表示这些用户在多少s内均匀上线(防止一下同时出现导致堵塞)
- Loop Count表示每个用户/thread需要执行多少次runTest
- 当一个thread在执行时发生错误时（如抛出异常），我选择的是终止这个thread

## User Defined Variables

我们可以在这里设置一些具体的参数，使得每个thread运行时的参数有所不同。具体就不细说了，参考[文档](http://jmeter.apache.org/usermanual/component_reference.html#User_Defined_Variables)即可。


## CSV Data Set Config

当需要循环的数据量很大时，可以考虑将这些保存到CSV中然后用JMeter读取（想象几千个用户名这种~），同样参考[文档](http://jmeter.apache.org/usermanual/component_reference.html#CSV_Data_Set_Config)即可。

## Java Request

在Java Request中，首先选中我们之前定义好的Classname，下面就会有一系列的参数让我们手动改。注意**${username}**这样的形式，是指从之前User Defined Variables等地方读取名为username的参数。

![](/images/jmeter3.jpg)

## Result

全部搞定之后，别忘了在Thread Group中加入Aggregate Graph等Listener，进行结果的监听：

![](/images/jmeter4.jpg)
