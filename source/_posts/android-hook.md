---
layout: post
title: Android下利用Hook实现mono dll加密
date: 2016/11/12
tags: [Unity,Android]
updated: 2016/11/21
thumbnail: /images/teaser/cydiasubstrate.jpg
toc: false
---

Unity的代码加密是一个有点麻烦的事情，相对iOS的IL2CPP，安卓里直接存放的dll很容易被ILSpy这种工具打开。网上有一些资料，如[Unity3D研究院之Android加密DLL与破解DLL .SO](http://www.xuanyusong.com/archives/3553)，常见的思路都是修改mono源代码后重新编译；但是这样有一个麻烦的地方在于每次升级Unity版本之后都需要重新编译对应版本的libmono.so出来...

<!--more-->

后来Unite 2016的时候和朋友聊天，学到了一个新思路——直接用Hook的方式来解密，这样就可以直接使用Unity自带的libmono.so解决问题～具体一点，使用了[Cydia Substrate](http://www.cydiasubstrate.com/)的API来劫持mono API

{% codeblock lang:cpp %}
MSImageRef image = MSGetImageByName(/* libmono.so */);
if(image == NULL) return 1;
void *ptr = MSFindSymbol(image, /* mono function */);
if(ptr == NULL) return 2;
MSHookFunction(ptr, (void*)&oldPtr, (void**)&newPtr);
{% endcodeblock %}

由于非常简单就不展开解释了...反正就三个函数[MSGetImageByName](http://www.cydiasubstrate.com/api/c/MSGetImageByName/), [MSFindSymbol](http://www.cydiasubstrate.com/api/c/MSFindSymbol/), [MSHookFunction](http://www.cydiasubstrate.com/api/c/MSHookFunction/)的事儿

至于怎么接入，网上也有不少资料，我主要参考的是[Substrate - hooking C on Android](https://koz.io/android-substrate-c-hooking/)。需要注意的是很多教程是介绍如何劫持别的App，需要root；但是我们劫持的是自己，所以不用那么麻烦。

最后再给个踩坑经验提示：Java那边必须**显示、按顺序**加载库，不然的话其实在绝大多数机型上依然能正常工作、但有些手机会crash。

{% codeblock lang:java %}
public class Misc {
    static {
        System.loadLibrary("mono");
        System.loadLibrary("substrate");
        System.loadLibrary("soulgame");
    }

    public static native int decrypt();
}
{% endcodeblock %}

咳咳，最后的最后是必须注意的点：**Android 7.0开始Hook方式将直接导致App崩溃** [NDK Apps Linking to Platform Libraries](https://developer.android.com/about/versions/nougat/android-7.0-changes.html#ndk)

> Starting in Android 7.0, the system prevents apps from dynamically linking against non-NDK libraries, which may cause your app to crash. 

所以，我享受了一段时间不用每个版本编译mono之后也被逼回去了...<del>当然你也不能说这个没有用啦，毕竟Android 7.0的占有率目前还是很低的(逃</del>

**更新** 今天有朋友在群里遇到一个问题，有一个可能是使用了雨松MONO博客里的混淆方法导致的(依然是Android 7.0相关)。

{% codeblock lang:bash %}
dlopen failed: "libmono.so" .dynamic section header was not found
{% endcodeblock %}