---
title: 反解常见Mono加密的一种通用探索
date: 2018-09-26 18:57:50
tags:
---

之前在{% post_link android-hook %}里提到了[Unity3D研究院之Android加密DLL与破解DLL .SO](http://www.xuanyusong.com/archives/3553)这篇文章。今天看某个PC上游戏的时候发现用了一样的思路，掏出IDA看了下确实是修改了`mono_image_open_from_data_width_name `来实现的。比较好奇有没有简单的方法绕开它而不是去跟汇编较劲，于是找到了一个比较通用的思路。

<!--more-->

主要参考了[[原创]内存dump 获得基于Unity3d的游戏相关代码	](https://bbs.pediy.com/thread-223649.htm)来绕开：mono加载的dll是常驻内存的。所以很简单的两步走：

- 抓取游戏所有内存数据
- 从内存数据里分析出dll

第一步用到了[ProcDump](https://docs.microsoft.com/en-us/sysinternals/downloads/procdump):

{% codeblock lang:shell %}
procdump64.exe -ma 1342
{% endcodeblock %}

第二步就更简单了，使用上文代码处理下导出的数据即可得到一堆dll

{% codeblock lang:cpp %}
char * findDosHeader(char * buffer, int length, int *out_length) {
    char * pe = NULL;
    for (int i = 0; i < length - 0x200; i++) {
        WORD * p = (WORD *)(buffer + i);
        if (*p != IMAGE_DOS_SIGNATURE) {
            continue;
        }
        IMAGE_NT_HEADERS * ntheader = (IMAGE_NT_HEADERS *)(buffer + 0x80 + i);
        if (ntheader->Signature != IMAGE_NT_SIGNATURE){
            continue;
        }
        IMAGE_FILE_HEADER * fileheader = &ntheader->FileHeader;
        if (!(fileheader->Characteristics & IMAGE_FILE_DLL)){
            continue;
        }
        IMAGE_SECTION_HEADER * section = IMAGE_FIRST_SECTION(ntheader);
        int size = 0;
        for (int j = 0; j < fileheader->NumberOfSections; j++) {
            if ((section + j)->SizeOfRawData + (section + j)->PointerToRawData > size) {
                size = (section + j)->SizeOfRawData + (section + j)->PointerToRawData;
            }
        }
        *out_length = size;
        return (buffer + i);
    }
    return NULL;
}
 
void find(const char * fileName) {
    FILE *fp = NULL;
    fopen_s(&fp, fileName, "rb");
    if (fp == NULL) {
        return;
    }
    fseek(fp, 0L, SEEK_END);
    int length = ftell(fp);
    fseek(fp, 0L, SEEK_SET);
 
    char * pFileBuffer = new char[length];
    fread_s(pFileBuffer, length, 1, length, fp);
    char* ppe = pFileBuffer;
    int image_length = 0;
    int buffer_length = length;
    while (true)
    {
        char f[512];
        buffer_length -= image_length;
        ppe = findDosHeader(ppe + image_length, length - (ppe - pFileBuffer) - image_length, &image_length);
        if (ppe != NULL) {
            sprintf_s(f, "%s.%x-%x.dll", fileName, ppe, image_length);
            FILE* outfp = 0;
            fopen_s(&outfp, f, "wb+");
            fwrite(ppe, image_length, 1, outfp);
            fclose(outfp);
            printf("%x %x\n", ppe, image_length);
        }
        else{
            break;
        }
    }
     
    delete[] pFileBuffer;
    fclose(fp);
}
{% endcodeblock %}

ps. 对安卓上的游戏上文已经说的很清楚了，root过的设备(譬如MuMu)抓取内存即可

pss. 看来还是混淆和IL2CPP靠谱多了(逃