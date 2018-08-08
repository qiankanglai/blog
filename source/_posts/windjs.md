---
layout: post
title: Pomelo中利用Wind.js封装异步
date: 2013/7/31
tags: [JavaScript,pomelo]
---

这是@老赵写的一个[js库](http://windjs.org/cn/docs/async/)
本质是用eval函数实现的~我们写看起来是同步的顺序流程代码，但是实质异步执行

<!--more-->

# 具体demo
在这里，我模拟一个计数器的场景：

- `pomelo init windtest`建立一个最基本的pomelo项目。初始内容是网页里一个按钮，然后连接服务器返回game server is ok这个字符串
- 现在将其要改成：服务器记录有多少次客户端请求了并返回~
- 使用redis进行计数，主要演示下异步set/get如何写的“漂亮”

直接贴entryHandler.js代码如下

{% codeblock lang:javascript %}
var Wind = require("Wind");
var Binding = Wind.Async.Binding;
var redis = require("redis");
var client = redis.createClient();

client.on("error", function (err) {
      console.log("error event - " + client.host + ":" + client.port + " - " + err);
});

var AsyncRedisSet = Binding.fromStandard(client.set.bind(client));
var AsyncRedisGet = Binding.fromStandard(client.get.bind(client));

var testasync = eval(Wind.compile("async", function (next) {
	try{
		var result = $await(AsyncRedisGet("test"));
		console.log(result);
		result = parseInt(result) + 1;
		$await(AsyncRedisSet("test", result));
  		next(null, {code: 200, msg: result});
	}catch (ex) {
    	console.log(ex);
    	var stack = new Error().stack
		console.log( stack )
	}
}));

module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
Handler.prototype.entry = function(msg, session, next) {
	testasync(next).start();
};
{% endcodeblock %}

# 简单解释代码

- 利用windjs自带的`Binding.fromStandard`函数，将原来redis的两个get/set先封装一下~这里具体的API用法见Windjs文档
- 将所有逻辑都封装成一个`AsyncTask: var testasync = eval(Wind.compile("async", function (next)`。这里是重头戏！！！在这段函数里，通过`$await`调用的方法，虽然是异步但是Windjs会保证其执行完之后才一步步下去，相当于我们之前写的一大层嵌套~最后执行完了，调用传进来的唯一参数next返回
- 最后在`Handler.prototype.entry`里，实例化一个`asynctask`，调用其`start()`方法

# 意义

主要是代码便于理解。将常用的（主要是涉及到数据库/IO的）封装之后，每个主体逻辑都封装成一个asynctask，里面就可以用`$await`写成同步啦~错误处理、异常也会简单很多，强推（`eval`带来的性能损失可以忽略的，看博文……）

# 踩坑

{% codeblock lang:javascript %}
var AsyncRedisSet = Binding.fromStandard(client.set.bind(client));
{% endcodeblock %}

不能写成`Binding.fromStandard(client.set)`，这样有`TypeError: Object #<Object> has no method 'send_command'`错误，详情见[StackOverflow提问](
http://stackoverflow.com/questions/7006829/error-when-trying-to-use-async-concat-to-retrieve-data-from-redis)

以上~
