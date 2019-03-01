---
layout: post
title: Mean Shift with OpenCV
date: 2012/3/19
tags: [OpenCV,C++]
---

主要是讲述关于图片分割的内容，使用了[Mean shift: A robust approach toward feature space analysis](http://ieeexplore.ieee.org/xpls/abs_all.jsp?arnumber=1000236)提出的方法，应该是目前效果最好的几个方法之一了。整个算法分为两步：Filter和Segmentation。这里简单说下实现，具体原理请自行阅读论文(¬_¬)

<!--more-->

这个算法其实论文作者提供了源代码实现[EDISON](http://coewww.rutgers.edu/riul/research/code/EDISON/)，但主要是这段时间我的工作都在OpenCV上面，因此另外实现了一遍，顺便也是加深理解。

# MeanShift Filter

第一步主要是去掉一些细节，论文中使用的是通过kernel函数进行函数计算，让每个窗格都挪到局部极值处，这样就相当于“抹平”图像。稍微具体点说，就是将图片上每个点视为五维点Z=(X^s,X^y)：X^s表示空间变量(x,y)；X^r表示频域变量(r,g,b)，当然也可以是别的颜色空间。然后开始迭代这个五维点Z，直到稳定；最后将稳定的频域变量即颜色复制到初始点上。迭代的时候是考虑这个点周围的窗格内的点影响。

但是！有**两个问题**

## OpenCV自带函数效果不好

我一开始用的是[openCV API](http://www.seas.upenn.edu/~bensapp/opencvdocs/ref/opencvref_cv.htm)

{% codeblock lang:cpp %}
void cvPyrMeanShiftFiltering( const CvArr* src, CvArr* dst, double sp, double sr, int max_level=1, CvTermCriteria termcrit=cvTermCriteria(CV_TERMCRIT_ITER+CV_TERMCRIT_EPS,5,1));
{% endcodeblock %}

速度倒是很快，但是边缘很粗糙([stackoverflow](http://stackoverflow.com/questions/9645713/whats-the-difference-between-edison-and-cvpyrmeanshiftfiltering))。可以看到和论文作者提供的代码相比，滤波效果很糟糕(左侧图明显好于右侧图)。

![](/images/meanshift1.jpg)

后来网上找了下，看到[Java代码](http://rsbweb.nih.gov/ij/plugins/download/Mean_Shift.java)，将颜色空间转换之后效果好多了。

![](/images/meanshift2.jpg)

## OpenCV自带颜色变换

由于为了适应数据结构，使用RGB2LUV时候，会自动将最后结果再次映射到0-255范围，也就是说

{% codeblock lang:cpp %}
void cvCvtColor(const CvArr* src, CvArr* dst, int code)
{% endcodeblock %}

的结果不是一开始想要的结果，其实。具体可以参考[opencv颜色空间变换](http://opencv.willowgarage.com/documentation/c/miscellaneous_image_transformations.html)。再加上一个映射就好了。

## eanShift Segmentation

本质是一个聚类。这个主要是参考了EDISON的实现。简单说下步骤

1. Connect &amp; Fill：第一步将图片上所有相邻的、颜色距离小于定义频域阈值的点连在一起
2. 做闭包传递：首先建立链表来保存图片上现有的“块”，相邻的块连起来；然后合并所有相邻的、颜色接近的块。这里直接用平均值来表示每个块的频域mode，使用并查集来合并。重复直至无法合并
3. 清除小块：譬如将所有20个像素以下的块，合并到它周围和它距离最近(但是超过了第二步阈值的)块

# Result

具体代码见挂在github上面的项目[opencv.meanshift](https://github.com/qiankanglai/opencv.meanshift)。本来是在windows下写的项目，后来为了方便将这部分代码移植出来了。后来有人给我写邮件，因此又将visual studio项目加上了，但是需要自己配置openCV。

开发环境等问题见README

原始输入图：

![](/images/meanshift_input.jpg)

效果图(左侧为滤波结果，右侧为随机着色)：

![](/images/meanshift_result.jpg)

# Update

2012-4-6 实际操作中发现，CIE-LUV空间对黑色处理有点问题，至少按照现在的公式会出错。后来换成了Lab空间之后工作良好。