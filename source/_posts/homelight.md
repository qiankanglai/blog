---
layout: post
title: HomeLight-安卓空壳版
date: 2012/4/7
tags: [Android,Java]
---

清明的时候Gus找我做的一个安卓的UI，要拿去参赛-。-本质上是一个用手机控制家里的各种灯的开关、明暗、颜色等，需要一个过得去的界面。反正我只管搭空壳子。昨天晚上+今天早上突击搞了一下，发现android的各种view还是博大精深的，外加xml自定义各种强大。最后也算自我感觉不错，嗯~

<!--more-->

# 相对位置布局

这个主要是解决不同手机分辨率不一样的情况，其实安卓本身也有9-patch这样的东西。下图是主界面，整体是一个RelativeLayout，上面置顶了一个RelativeLayout作为Head，下面置地了一个RelativeLayout作为Bottom，中间用一个match_parent的自定义ImageView画房型。在Head和Bottom上也分别用相对定位，在拿几个同学手机测试的时候都表现良好。

![](/images/HomeLight_Main.jpg)

# 透明启动画面

主要参考了这个教程[An Advanced Splash Screen for Android App](http://www.codeproject.com/Articles/113831/An-Advanced-Splash-Screen-for-Android-App)

![](/images/HomeLight_Splash.jpg)

简单说一下，就是在屏幕中间放置一个ImageView，通过设置theme里的透明背景色和Overlay来实现

{% codeblock lang:xml %}
<item name="android:windowBackground">@android:color/transparent</item>
<item name="android:windowContentOverlay">@null</item>
{% endcodeblock %}

对应的设置一个SplashActivity，开个线程5s后自动结束或者触摸结束，进入下个Activity即可。

后来教程中还教了怎么做淡入淡出，都是用xml实现的，感觉真的好神奇(不过本质还是对应了函数)。具体参见Appera.xml和Disappear.xml

# 圆角按钮

对应主界面上的Back和Edit，同样的是使用了xml作为样式

{% codeblock lang:xml %}
<?xml version="1.0" encoding="UTF-8"?>   
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">   
    <solid android:color="@color/lightgray" />
    <corners android:radius="7dp"/>   
    <padding android:left="14dp" android:top="8dp" android:right="14dp" android:bottom="8dp" /> 
</shape>  
{% endcodeblock %}

{% codeblock lang:xml %}
<Button
    android:id="@+id/main_edit"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_alignParentRight="true"
    android:layout_centerVertical="true"
    android:layout_marginRight="16dp"
    android:text="@string/main_edit"
    android:textSize="16dp"
    android:textStyle="bold"
    android:textColor="@android:color/white"
    android:background="@layout/roundbutton" />
{% endcodeblock %}

比较遗憾的是只能控制四个角一样的圆弧，还没有找到在一侧实现一个"三角形"的方向箭头的效果。

# Drawable ImageView

![](/images/HomeLight_Main2.jpg)

户型图上面的灯光是我直接画上去的，本质是重载了ImageView的OnDraw方法，刷新时调用invalidate()方法。

{% codeblock lang:java %}
@Override
public void onDraw(Canvas canvas) {
  super.onDraw(canvas);
  drawLights(canvas);
}
{% endcodeblock %}

触摸操作也是重载了ImageView的onTouchEvent方法。

# ColorPicker Dialog

![](/images/HomeLight_ColorPicker.jpg)

要想做一个选出所有颜色的colorpicker还是比较麻烦的，当时用过别人的Library。不过这次只要用有限的灯光，因此就直接自定义了一个Dialog的子类，里面放了个ImageView放图片。当触摸事件产生时，获取图片对应的RGB即可

{% codeblock lang:java %}
Bitmap bitmap = ((BitmapDrawable)this.getDrawable()).getBitmap();
int color = bitmap.getPixel(dx, dy);
{% endcodeblock %}

**安卓开发起来还是很顺畅的，但是一考虑到不同设备之间的差异，特别是分辨率就容易引起头大的问题~所以好好设计xml还是很重要滴**