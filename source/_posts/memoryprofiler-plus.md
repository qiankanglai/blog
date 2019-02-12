---
title: 让MemoryProfiler变得更强
date: 2017-11-18 19:20:41
tags: Unity
thumbnail: /images/teaser/memoryprofiler_plus.jpg
---

之前其实在{% post_link csharp-reflections %}里提到过Profiler的增强；后来官方提供了更加方便的[MemoryProfiler](https://bitbucket.org/Unity-Technologies/memoryprofiler)，上周末的时候顺手用类似的思路增加了diff功能并进行了一定的优化。~~原来那个ProfilerDiff就直接废弃，毕竟当时懒了没做序列化~~

ps. 本来我想直接用gulu大大的[PA_ResourceTracker](https://github.com/PerfAssist/PA_ResourceTracker)，不过仔细研究了下代码发现需要接入的东西比较多(很多数据信息是通过网络传输的)，嵌入我们自己的项目不是特别方便。最后自己动手弄个山寨版，也就半个多小时搞定...

<!--more-->

ps. 对于数据的解读参考[Unity MemoryProfiler 的工作机制及可能的改进](https://gulu-dev.com/post/perf_assist/2017-01-25-unity-memoryprofiler)即可，这里不再赘述。

# 快照对比功能

我这里做了一个偷懒做法，直接对比了`NativeUnityEngineObject`里的数据，规则比较简单：

- 如果两个物体的`instanceID`相同:
	- 如果大小也相同，那么就表示没有变化，不予显示
	- 如果大小不同，那么作差得到变化值
- 剩下的按照名字排序，然后按照大小排序：如果有大小相同的同名项继续『抵销』(这一步其实是有点问题的，不过为了专注于差值就先这么干了)
- 最后剩下的就是新增的或者释放的

最后将生成的数据塞回去显示，红绿分别代表new/delete就非常显眼了(见teaser)。由于相关代码都是开源的，所以改起来特别方便，不用像之前反射扩展Profiler那么麻烦。

不过这里有一个缺陷我没有完全解决干净：同一个资源的`instanceID`是会变的，也就是说重启Unity Editor之后就不好做diff了...后面我在想要不要直接参考名字算了，不过这也是有风险的(譬如同名同大小但是实际上是不同的两个资源会被误判)。

# 优化序列化速度

MemoryProfiler内部其实已经实现了三套序列化机制

- `System.Runtime.Serialization.Formatters.Binary.BinaryFormatter`
- `UnityEngine.JsonUtility.ToJson`
- `Newtonsoft.Json.JsonSerializer`

默认用的是第三个(相对最快的一个)，但说实话这仨都非常慢。这里我用了一个粗暴的手写来解决:

{% codeblock lang:csharp %}
bw.Write(snapshot.nativeTypes.Length);
foreach (var nativeType in snapshot.nativeTypes)
{
    bw.Write(nativeType.name ?? "");
    bw.Write(nativeType.baseClassId);
}
{% endcodeblock %}

比较麻烦的地方在于读取，因为这些类只提供了getter——那么解决方案已呼之欲出，反射走起。

{% codeblock lang:csharp %}
int len = br.ReadInt32();
var nativeTypes = new PackedNativeType[len];
for(int i = 0; i < len; i++)
{
    object boxed = nativeTypes[i];
    PackedNativeTypeNameField.SetValue(boxed, br.ReadString());
    PackedNativeTypeBaseClassIdField.SetValue(boxed, br.ReadInt32());
    nativeTypes[i] = (PackedNativeType)boxed;
}
{% endcodeblock %}

这里有一点需要注意的是直接去`SetValue`无效，因为有个装箱的问题，具体可以参考[Is there a way to set properties on struct instances using reflection?](https://stackoverflow.com/questions/6280506/is-there-a-way-to-set-properties-on-struct-instances-using-reflection)。

我测试了下，保存的速度轻松快了10x，读取的速度也有5x的提升...

# TODO

这些都是我们在使用过程中遇到的一些可以改进的地方，其实仔细想想还有不少继续扩展，特别是一些已经在PA_ResourceTracker里实现了: 

- Daily Build Performance Report
- Search
- Table View

嘛反正挖坑不填是常态，以后有精力再说(逃