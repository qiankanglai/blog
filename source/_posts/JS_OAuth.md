---
layout: post
title: 使用纯JS进行金山快盘OAuth验证
date: 2012/3/29
tags: JavaScript
---

去年做软工课的时候，实现了完整的OAuth验证和javascript/Android两种客户端，既然有人已经发过安卓的SDK了，那就做个pure JS的DEMO版本吧(话说万恶的调休害的我没啥空都=。=)

<!--more-->

下面具体讲述如何使用javascript实现金山快盘的三步oauth验证。其中用到了跨域的解决方案，请戳{% post_link JS_OAuth %}(如果你觉得我在骗访问量，一定是幻觉！)

<del>项目已挂在[kuaipan_js](http://github.com/qiankanglai/kuaipan_js)</del>

# 准备工作

我自己用的是notepad+Firefox，具体用啥其实很随意。因为是demo，我没有太考虑美观和容错等，所以实际使用的时候自己明白就行。

首先要在[快盘](http://www.kuaipan.cn/developers/list.htm)注册应用，获得consumer_key和consumer_secret。反正一步步来，具体流程可以参考这个[OAuth协议](http://www.kuaipan.cn/developers/document_oauth.htm)

# requestToken

先放代码再解释

{% codeblock lang:javascript %}
var proxyBase = "http://.appspot.com/?url=";
var consumerKey = "";
var consumerSecret = "";

var accessor = { "consumerSecret": consumerSecret};
var message = { method: "GET" , action: "https://openapi.kuaipan.cn/open/requestToken", parameters: []};
var signcode;
do{
  message.parameters = [];
  message.parameters.push(["oauth_version", "1.0"]);
  message.parameters.push(["oauth_consumer_key", consumerKey]);
  message.parameters.push(["oauth_timestamp", OAuth.timestamp()]);
  message.parameters.push(["oauth_nonce", encodeURIComponent(OAuth.nonce(6))]);
  message.parameters.push(["oauth_signature_method", "HMAC-SHA1"]);
  
  OAuth.SignatureMethod.sign(message, accessor);
  signcode = OAuth.getParameter(message.parameters, "oauth_signature");
}while(signcode.indexOf("+")!=-1);
var tURL = message.action+"?"+OAuth.SignatureMethod.normalizeParameters(message.parameters).replace(/oauth_signature/,"oauth_signature="+OAuth.getParameter(message.parameters, "oauth_signature")+"&amp;oauth_signature");

$.ajax({
    url: proxyBase+encodeURIComponent(tURL),
    type: "GET",
    dataType: "jsonp",
    jsonp: "qjsoncallback",
    success: function(res) {
        var oauth_token_secret = res.oauth_token_secret;
        var oauth_token = res.oauth_token;
    }
});
{% endcodeblock %}

## 初始化变量

前三行分别定义了跨域代理和快盘应用的信息。accessor是用于签名的部分；message包含了所有用于签名的原始信息，用于生成baseString。

## 计算签名

将oauth需要的信息，诸如version,consumer_key,timestamp都加进去。然后使用HMAC-SHA1进行签名即可。这里我用了oauth.js和sha1.js，可戳[kuaipan_js](https://github.com/qiankanglai/kuaipan_js)查看

需要注意的是：如果算出来的signcode里面有加号，一定要重新生成，不然会爆掉滴。

## 发送请求

我用的是我自己GAE上的一个跨域代理，用Java代码去请求返回值，然后包装为JSONP发回来。这样就取回了oauth_token和oauth_token_secret。

# authorize

第二步直接弹出一个窗口就行了，记得把参数带上

{% codeblock lang:javascript %}
window.open ("https://www.kuaipan.cn/api.php?ac=open&op=authorise&oauth_token="+oauth_token,"auth"); 
{% endcodeblock %}

![](/images/kuaipan_1.jpg)

打开弹窗并登陆

![](/images/kuaipan_2.jpg)

看到验证码，然后回到test.html页面输入验证

![](/images/kuaipan_3.jpg)

ps.这一步暂时我只能做到这样，需要用户手动输入验证码。纯JS我暂时没想到怎么解决，即让用户登录之后自动关闭弹出窗口并父窗口进行下一步。

Feedly在进行Google账户验证的时候能做到自动关闭弹出窗口，但那个好像是用了服务器进行交互的说。

# accessToken

{% codeblock lang:javascript %}
var accessor = { "consumerSecret": consumerSecret,"tokenSecret": oauth_token_secret};
var message = { method: "GET" , action: "https://openapi.kuaipan.cn/open/accessToken", parameters: []};
var signcode;
do{
  message.parameters = [];
  message.parameters.push(["oauth_version", "1.0"]);
  message.parameters.push(["oauth_consumer_key", consumerKey]);
  message.parameters.push(["oauth_timestamp", OAuth.timestamp()]);
  message.parameters.push(["oauth_nonce", encodeURIComponent(OAuth.nonce(6))]);
  message.parameters.push(["oauth_signature_method", "HMAC-SHA1"]);
  message.parameters.push(["oauth_token", oauth_token]);
  //message.parameters.push(["oauth_verifier", $("#verifier").val()]);
  
  OAuth.SignatureMethod.sign(message, accessor);
  signcode = OAuth.getParameter(message.parameters, "oauth_signature");
}while(signcode.indexOf("+")!=-1);
var tURL = message.action+"?"+OAuth.SignatureMethod.normalizeParameters(message.parameters).replace(/oauth_signature/,"oauth_signature="+OAuth.getParameter(message.parameters, "oauth_signature")+"&oauth_signature");

$.ajax({
  url: proxyBase+encodeURIComponent(tURL),
  type: "GET",
  dataType: "jsonp",
  jsonp: "qjsoncallback",
  success: function(res) {
    $("#content").html("oauth_token:"+res.oauth_token+"\r\noauth_token_secret:"+res.oauth_token_secret);
  }
});
{% endcodeblock %}

这里和前面有两个区别，一个是accessor中多了一个oauth_token_secret；还有一个就是可有可无的oauth_verifier(ps.管理猿我错了=。=是firefox的[缓存问题](http://kstatus.wps.cn/viewthread.php?tid=22503))

其他的就是和第一步一样的，最后返回取得的oauth_toekn和oauth_token_secret。至此三步oauth验证完成！

![](/images/kuaipan_4.jpg)

# To Be Continued...

回头瞅瞅啥时间有空把其他API包装下，话说JS做SDK主要遇到的问题是各种安全沙盒限制，说不定还要用flash来绕过限制。估计Pure Javascript会做的很受限。

顺便再想想有啥解决跨域问题更漂亮的方法，毕竟我希望用纯JS，尽量减少第三方的例如PHP服务器中转这样的(所以我才用servlet包装了最简单的proxy在用)~

# Suggestion

快盘有可能提供原生的JSONP支持么？现在我是用GAE做了个代理，毕竟性能不如原装。我试了下https://openapi.kuaipan.cn/open/requestToken上的jsoncallback，确实没用的说。