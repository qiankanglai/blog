---
layout: post
title: cocos2d-x Assets Manager断点续传
date: 2014/12/2
tags: cocos2d-x
toc: false
---

基于cocos2d-x 3.x版本修改的Assets Manager，加几行代码就能实现断线续传功能...so easy

<!--more-->

{% codeblock lang:cpp %}
bool AssetsManager::downLoad()
{
    // Create a file to save package.
    const string outFileName = _storagePath + TEMP_PACKAGE_FILE_NAME;
-   FILE *fp = fopen(outFileName.c_str(), "wb");
+   ssize_t outFileLength = 0;
+   FILE *fp = fopen(outFileName.c_str(), "rb");
+   if(fp)
+   {
+       fseek(fp, 0, SEEK_END);
+       outFileLength = ftell(fp);
+       fclose(fp);
+   }
+    
+   fp = fopen(outFileName.c_str(), "ab");
{% endcodeblock %}

然后在下面设置curl的地方
{% codeblock lang:cpp %}
    curl_easy_setopt(_curl, CURLOPT_FOLLOWLOCATION, 1 );
+   if(outFileLength > 0)
+       curl_easy_setopt(_curl, CURLOPT_RESUME_FROM, outFileLength);
 
    res = curl_easy_perform(_curl);
{% endcodeblock %}