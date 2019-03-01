---
layout: post
title: Homography
date: 2012/3/26
tags: [OpenCV,C++]
---

Homography单应，说的是投影的时候可以逆过来找，具体的可以戳[wiki](http://en.wikipedia.org/wiki/Homography)。

<!--more-->

用到这个的原因，是因为手头在做的video处理时，需要消除“抖动”，也就是让镜头尽量平稳。换个角度来说，可以看错相邻两个frame找到对应的变化之后变上去。具体的代码已经挂[opencv.homography](http://github.com/qiankanglai/opencv.homography)。先show一个效果图~

![](/images/homography_result.jpg)

上面的Img1 Img2分别为相邻两帧，下图的Result是将Img1映射到Img2的方位——可以看到左上角的文字O开始，位置已经开始对应了。

# 流程

## 抽取特征值

由于两个frame里面人在动，所以不能直接对图片进行处理。因此需要抽特征值，这里我用的是[SURF](http://en.wikipedia.org/wiki/SURF)~在效果图上那个白色的圆圈就是了

## 计算Homography

这里参考了部分OpenCV sample代码find_obj.cpp。主要是进行配对：相邻两个frame之间哪些特征点是一一对应的。最后使用

{% codeblock lang:cpp %}
cvFindHomography( points1, points2, homography,CV_FM_RANSAC,1.0);
{% endcodeblock %}

因为可能还有outliers，所以使用的是[RANSAC方法](http://en.wikipedia.org/wiki/RANSAC).

# Code

具体的我已经封装在Homography.cpp里面了，真正使用的话只要载入图片之后计算即可。

{% codeblock lang:cpp %}
IplImage *img = cvLoadImage("input1.jpg");
IplImage *img2 = cvLoadImage("input2.jpg");

CvMat *homography= cvCreateMat(3,3,CV_32F);
Homography(img,img2,homography);
{% endcodeblock %}

直接使用OpenCV提供的函数，可以使用矩阵进行图片的变形

{% codeblock lang:cpp %}
cvWarpPerspective(img, img2, homography, CV_INTER_NN+CV_WARP_FILL_OUTLIERS, cvScalar(0));
{% endcodeblock %}

这样也可以实现图片的拼接，如果是一堆“静态”图片的话。OpenCV也是有android版本的，你可以考虑移植一下代码的说。
