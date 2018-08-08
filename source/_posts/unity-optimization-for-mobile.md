---
layout: post
title: Unite 2016 针对移动设备端的Unity应用优化
date: 2016/4/11
tags: Unity
thumbnail: /images/teaser/unite2016-optimize.jpg
---

今天参加Unite 2016听下来最有收货的一个talk，虽然一半以上都是老生常谈...我个人觉得比较有价值的在于**资源审查**这一部分，关于各类资源的常用方法都提出了一些很有实用价值的建议和规范

<!--more-->

# 如何获得足够好的数据

## iOS: [Instruments](https://developer.apple.com/library/tvos/documentation/DeveloperTools/Conceptual/InstrumentsUserGuide/)

- XCode自带的免费工具
- 对Unity IL2CPP编译出的代码使用起来完全没问题
- 移动CPU性能优化的最佳工具
- 优化启动时间的最佳工具

理解Instruments结果(游戏循环中的重要函数):

- `BaseBehaviourManager::CommonUpdate`
	- `Update`, `FixedUpdate`和`LateUpdate`的回调
- `PhysicsManager::FixedUpdate`
	- [PhysX](https://developer.nvidia.com/gameworks-physx-overview)模拟，`OnCollision*`和`OnTrigger*`的回调
	- 如果使用了2D物理，还会有`Physics2DManager::FixedUpdate`
- `DelayedCallManager::Update`
	- 恢复运行的协程
- `PlayerRender`
	- 绘制命令
	- 批次
	- `MonoBehaviour::OnWillRender`
	- 图像后处理效果回调(我猜`Camera.OnRenderImage`)
- `UI::CanvasManager::WillRenderCanvases`
	- 重新批次UI canvas
	- 生成字体纹理等
- `EnlightenRuntimeManager::Update`
	- Enlighten, 预计算实时GI，反射探针

当某些函数不是一次执行完，而是分散多次的时候(譬如协程)，尝试直接搜索方法名，例如:

- `::Box`, `Box(`和`_Box`
- `String_`

## Android

- [VTune](https://software.intel.com/en-us/intel-vtune-amplifier-xe)
- [Snapdragon Profiler](https://developer.qualcomm.com/software/snapdragon-profiler)

## Unity Editor: Timeline

## Unity 5.3: Memory Profiler

- 代码在[Bitbucket](https://bitbucket.org/Unity-Technologies/memoryprofiler)
- 拖到*Assets*里任一*Editor*文件夹下
- 在编辑器Window-MemoryProfilerWindow打开
- 通过Profiler窗口连上Unity Profiler
- 点击**Take snapshot**

如果发现两个纹理名字相同，但是InstanceID不同，基本上就是纹理在内存里重复出现了...

# 常见的最佳实践

## 资源审查

### 理由: 避免错误

- 开发者都是人类(大概)
- 是人就会犯错
- 错误就会增加开发时间

**用工具来规避常见但是代价大的错误**显然非常划算...

### 常见错误

- 疯狂的纹理尺寸
- 资源压缩
- 错误的Avatar/Rig设置

当然，就算在同一个项目里，不同部分的资源的标准要求是不一样的~

### HOWTO(如何实现)

参考[AssetPostprocessor](http://docs.unity3d.com/ScriptReference/AssetPostprocessor.html)，根据项目需要修改`assetImporter`实例

### 常见规则

- 纹理
	- 确认关闭Read/Write
	- 尽可能禁用mipmap
	- 尽可能使用压缩纹理
	- 确保纹理不要过大：UI来说用2048或者1024；模型纹理不超过512
- 模型
	- 确认关闭Read/Write
	- 非玩家模型就关掉rig
	- 共用rig的模型就直接复制avatar
	- 打开模型压缩
- 音频
	- iOS使用mp3压缩
	- Android使用Vorbis压缩
	- 移动设备上Force Mono
	- 尽可能降低比特率

# 常见的问题及解决方案

## 内存相关

Managed Memory: 堆(Heap)里包含了资源(Assets)和脚本(Scripts)里的东西(objects)。

当通过代码申请的时候，会分配更多的内存，如`int[] someNumbers = new int[2048]`

垃圾回收会周期性的运行，删除没用的东西 `GC.Collect()`

需要注意：删除掉后释放的内存不一定能被再次使用，也就是所谓的内存碎片化。

现在问题来了:

- Unity中的heap**只会增长，不会缩小**
- iOS和Android中依然有保留页(reserved pages)
- 以上两点带来的结果就是，堆里无用的区域(已经被回收器干掉了)依然会被保留，但是又被清除出当前的保留页~

- 临时的内存申请**非常不好**
- 如果一个游戏是60FPS，每帧申请1kb内存
	- 也就是一秒60kb
- 如果每分钟才运行一次垃圾回收(因为这事很影响帧率)
- 那么总的需要3600kb内存...

### 优化内存使用

通过Unity Profiler里的*GC Alloc*一列，可以看到具体的内存申请。在用户操作应用的时候，尽可能让其接近0。(当然了，如果是载入资源就没事)

- 尽可能重用集合(例如`Lists`, `HashSets`)
- 避免字符串拼接，可以考虑重用`StringBuilder`来完成
- 避免匿名函数和闭包

### 装箱问题(Boxing)

当将值类型当做引用类型传入时，会在堆顶临时分配一个值来用

{% codeblock lang:csharp %}
int x = 1;
object y = new object();
y.Equals(x);	// Boxes "x" onto the heap
{% endcodeblock %}

### Foreach

当循环开始时会申请一个`Enumerator`，这也是广为人知的Mono的锅了...别这么写就行。

### Unity API

- 如果引擎返回的是一个数组的话，它每次都会生成拷贝
- **每次被访问**的时都这样，就算不修改里面的值！

这个错误代码药丸，每次都申请非常多的`Touch[]`数组

{% codeblock lang:csharp %}
for(int i = 0; i < Input.touches.Length; i++)
{
	Touch touch = input.touches[i];
	// ...
}
{% endcodeblock %}

正确的代码就只有一份

{% codeblock lang:csharp %}
Touch[] touches = Input.touches;
for(int i = 0; i < touches.Length; i++)
{
	Touch touch = touches[i];
	// ...
}
{% endcodeblock %}

## CPU性能

### XML, JSON和其他文本格式

- 解析文本非常慢
- 避免基于反射的解析器——因为太TM慢了！
	- 5.3开始可以用自带的`JsonUtility`类

解决本问题有三个策略：

1. 压根不要解析文本格式，利用`ScriptableObject`二进制保存数据，可以保存一些很少变化的数据；
2. 做更少的活，譬如将数据分成小块，每次只解析需要的部分，解析完了之后保存到缓存中；
3. <del>线程</del>: 只能用于处理纯C#逻辑，任何涉及Unity资源的都没法做，而且写的时候要非常非常小心...

### Resources文件夹

在游戏启动的时候会载入Resources文件夹的目录结构，这个是无法避免或者延后的~

解决方案：将Resources下的资源打包到Asset Bundle

### Material/Animator/Shader属性访问

永远不要直接通过名字去访问，因为在引擎内部需要对字符串名字计算哈希得到一个整数id~

错误做法

{% codeblock lang:csharp %}
material.SetColor("_Color", Color.white);
animator.SetTrigger("attack");
{% endcodeblock %}

正确做法是一开始启动的时候计算一次哈希，然后缓存下来...

{% codeblock lang:csharp %}
static readonly int material_Color = Shader.PropertyToID("_Color");
static readonly int anim_Attack = Animator.StringToHash("attack");

material.SetColor(material_Color, Color.white);
animator.SetTrigger(anim_Attack);
{% endcodeblock %}

### 装箱 字符串操作

因为这些操作太慢了...所以不得不再强调下！

`RegExps`, `String.StartsWith`和`String.EndsWith` 都是非常非常慢的~ 在Instruments你可以搜索`::Box` `_Box` `String_`看下~

<del>不过官方的人也说了，对于Boxing这个问题，开发者没啥办法能解决这个问题...所以还是天灭Mono，快抱微软.Net大腿吧！</del>