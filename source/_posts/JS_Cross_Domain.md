---
layout: post
title: 使用GAE完成JS跨域中转
date: 2012/3/29
tags: [JavaScript,Java]
---

Javascript跨域访问(Cross-Domain，主要可以看这个[same origin policy](http://en.wikipedia.org/wiki/Same_origin_policy))，一直是个很纠结加蛋疼的问题(擦话说我又想到当时做flex时也遇到了跨域问题)

<!--more-->

现有的解决方案其实也有不少：例如用iframe包装，HTML5页面间通信，jquery自带的JSONP技术等等。但如果说当跨域访问对象不是我们能控制的时候，就格外纠结了。因为如果A，B域的都能我们来控制，那么可以用iframe之类的方法进行交互，具体的就不详谈了，网上也一大把。下面具体看看只能控制一个域的跨域访问的解决。

**咳咳，具体点说这个，就是我自己域上的js如何去访问[金山快盘的API接口](http://www.kuaipan.cn/developers/)。要记得我们是没有权限去修改kuaipan网站上的文件的Yooo~**

# JSONP

这个在jQuery里已经实现了[JSON with padding](http://en.wikipedia.org/wiki/JSONP)：因为script标签是不受跨域限制的，所以将数据包装成JSON的格式，以函数的形式返回客户端，这样就完成了跳过跨域的限制。

具体怎么实现的可以看下文。

# Proxy方法

现在我看到的比较好的一个解决方案是[Cross-domain requests with jQuery](http://james.padolsey.com/javascript/cross-domain-requests-with-jquery/)中提到的思路，也就是通过第三方的服务来解决。这个思路说穿了就一句话：

**既然我没有权限控制对方的域，那么我自己再实现一个域来封装它！**

先来看下代码(作者覆盖了jQuery.ajax)

{% codeblock lang:javascript %}
$.ajax({
    url: 'http://news.bbc.co.uk',
    type: 'GET',
    success: function(res) {
        var headline = $(res.responseText).find('a.tsh').text();
        alert(headline);
    }
});
{% endcodeblock %}

再看下具体对应的代码，会发现本质就是用了yahoo提供的[Yahoo!Query Language](http://developer.yahoo.com/yql/)服务

{% codeblock lang:javascript %}
YQL = 'http' + (/^https/.test(protocol)?'s':'') + '://query.yahooapis.com/v1/public/yql?callback=?',
query = 'select * from html where url="{URL}" and xpath="*"';
{% endcodeblock %}

ok其实到这里就不用说了。本质就是调用Yahoo的服务器进行封装。

# 使用GAE作为Proxy

唔，从我自己的角度来说呢，总归觉得这样用对方的服务不靠谱，而且确实使用过程中有时候会遇到取回来的数据是空的情况：进程性的第一步requestToken正常，第三步accessToken的时候取不回来了。

因此，我选择[Google App Engine](https://developers.google.com/appengine/)自己实现一个Proxy。唔我觉得吧谷歌的CDN格外靠谱，而且这种免费给开发者用的精神太赞了啊啊啊(想想GOAGENT吧，亲~)

反正之前用过python开发过一个简单自动发邮件的小东西，配合一个静态控件实现“伪动态”的留言板；这次改用Java，反正eclipse plugin用起来格外顺手的说。Debug和Deploy都一键到位(当时弄安卓一套东西的ADT也很爽，NDT还是有点小麻烦的说)。直接上代码：

{% codeblock lang:java %}
package me.qiankanglai;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import javax.servlet.http.*;

@SuppressWarnings("serial")
public class QcrossdomainServlet extends HttpServlet {
    public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String _url = req.getParameter("url");
        String callback = req.getParameter("qjsoncallback");
        resp.setContentType("text/javascript");
        if(_url != null && callback != null)
        {
            //_url = URLDecoder.decode(_url, "UTF-8");
            StringBuffer resultstring = new StringBuffer();
            URL url = new URL(_url);
            BufferedReader in = new BufferedReader(new InputStreamReader(url.openStream()));

            String inputLine;
            while ((inputLine = in.readLine()) != null)
                resultstring.append(inputLine);
            in.close();
            
            resp.getWriter().println(callback+'('+resultstring.toString()+')');
        }
        else
            resp.getWriter().print(" ");
    }
}
{% endcodeblock %}

简单解释一下：当用Get请求的时候，判断有没有url和qjsoncallback参数。url是要获取的“不能控制”的B域的请求地址，例如[wiki](http://en.wikipedia.org/wiki/Main_Page)；qjsoncallback是一会儿返回的js函数名字。因此Proxy做的工作实际上就是：根据url获得网页内容，然后封装成"函数名(数据)"的形式。想象数据是json格式的话，那么只要运行这个函数就能得到数据了！

然后看下对应的jQuery代码

{% codeblock lang:javascript %}
$.ajax({
    url: proxyBase+encodeURIComponent(URL),
    type: "GET",
    dataType: "jsonp",
    jsonp: "qjsoncallback",
    success: function(res) {
      document.write(res.content);
    }
});
{% endcodeblock %}

proxyBase是搭建好的GAE的proxy地址，后面加一个"?url="。URL是需要跨域访问的内容，进行encode是防止特殊符号阶段地址。jsonp表示默认的函数提供者，在实际运行中jQuery会变化为"&amp;qjsoncallback=随机函数名"这样的形式——所以服务器端返回的数据就是"随机函数名(数据)"。

ohyeah这样就搞定了！