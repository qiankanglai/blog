---
title: P/Invoke调用优化
date: 2017-07-20 00:31:14
tags: [Unity,Android,C++,iOS]
toc: false
---

这其实是一个常见的问题：Unity中使用P/Invoke调用原生代码的时候如何更高效的传参数和获取返回值的问题。一般来说简单的直接写在函数声明里，遇到复杂的情况譬如变长、数组等情况我基本都是直接上JSON的。但是最近性能测试的时候发现这么写也是一个非常可观的消耗：

<!--more-->

![](/images/agoramanager_profiler.jpg)

这个应用场景其实是在处理消息队列，每一帧可能从C++层返回不少消息体回来，不同类型的消息体格式有所区别。

于是就纠结如何进一步优化：本来我都在纠结要不要上protobuf之类的，后来正好翻[声网](https://www.agora.io/cn/)AMG SDK的时候想到了一个不错的平衡点——直接定长序列化，每个API写死得了。搜了下[How can I pass a pointer to an array using p/invoke in C#?](https://stackoverflow.com/questions/289076/how-can-i-pass-a-pointer-to-an-array-using-p-invoke-in-c)确实可以直接传数组。那么动手开整，第一步是测试了c++层编码+c#层解码(实在是被little/big endian坑怕了)：

{% codeblock lang:cpp %}
void AddInt32(char* buffer, int& startIdx, int value)
{
    char* p = static_cast<char*>(static_cast<void*>(&value));
    buffer[startIdx+0] = p[0];
    buffer[startIdx+1] = p[1];
    buffer[startIdx+2] = p[2];
    buffer[startIdx+3] = p[3];
    startIdx += 4;
}
{% endcodeblock %}

{% codeblock lang:csharp %}
int GetInt32(ref int startIdx)
{
    int v = BitConverter.ToInt32 (buffer, startIdx);
    startIdx += 4;
    return v;
}
{% endcodeblock %}

相比于每次获取一个消息并检查有没有消息未处理，更加划算的策略是一口气传一个buffer到C++，然后填充之后返回再解析。

{% codeblock lang:csharp %}
public extern static bool PollMessage(byte[] buffer, int bufferLen);

int bufferLen = 1024;
byte[] buffer = new byte[bufferLen];
if(PollMessage(buffer, bufferLen))
	ParseMessages(buffer);
{% endcodeblock %}

相比原来的写法，节约了大量JSON生成和解析的消耗，而且我需要处理的API也不多所以人肉写一下也很快。如果要处理的API比较多的话方方老司机的意见是clang分析+python生成算了，这波稳~