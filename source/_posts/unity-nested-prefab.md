---
title: 聊聊Unity里的嵌套Prefab
date: 2017-10-26 20:57:07
tags: Unity
toc: false
---

今天正好和朋友聊到嵌套Prefab这个话题，发现这个其实是一个很多项目都需要但是Unity并没有提供内置支持的功能。在过去的项目中我们也实践过不同的解决方案，也了解过其他团队的一些做法，在这里正好整理一下，供大家参考/吐槽。

~~其实还有一个原因是又好久没更新博客了...~~

<!--more-->

# Nested Prefab 

嵌套其实一个很常见的需求：多个Prefab同时需要一个共同的子Prefab。但问题在于保存时，整个prefab会成为一个整体，子prefab和原来的就断开连接了。这时候如果需要统一修改子prefab就做不到，其实也就失去了prefab的意义所在。

下面我将分享ABC三策来“解决”这个问题，之所以不说上中下是因为各有优劣。

## Prefab vs. Anchor

这个是我们目前用的解决方案: 用一个空的GameObject然后贴一个脚本去保存路径：

![](/images/prefabloader.jpg)

编辑的时候点一下Load载入，编辑完了之后点Save保存。这个本质其实是空挂点和Prefab的来回切换，有几个好处：

- Scene里尽可能都用Anchor而非Prefab，这样Scene本质上就是一个空壳，能极大的避免多人协作带来的冲突(想起做第一个项目的时候简直泪目)；
- 运行时可以按需加载，或者使用同一的Manager来后台异步加载；
- Prefab可以拆的比较细，这样能减缓加载带来的卡顿；
- 载入时自动载入子Prefab；保存时同理。

当然也有不可避免的缺点，最大的一个就是必须抛弃原生的Prefab机制：如果直接使用Inspector上方自带的Select/Revert/Apply就会破坏这套流程，只能使用Component上丑爆了的按钮。

ps. 我曾经试图用自己的脚本去接管原生的Prefab按钮，后来发现只有uPrefabs的思路靠谱...不过这样会带来其他的问题，且听下文分解。

## Cook & PropertyModification

这里分享一个兄弟团队的思路，他们的解决方案基于[poor mans nested prefabs](http://framebunker.com/blog/poor-mans-nested-prefabs/)：父Prefab保存了子Prefab的引用；在编辑时获取子Prefab信息后直接利用Editor API来“绘制”子Prefab；在打包的时候加入一步**COOK步骤**，根据引用将子Prefab实例化出来。

当然这个做法还比较简陋：原来的代码其实只处理了MeshRenderer的情况；如果想在UGUI里使用，那么预览部分就要重新打磨下。但接下来要说的重点其实是：如果不同的Prefab里引用的子Prefab需要有区别，应该怎么做？

其实答案已经在Editor API中：[PrefabUtility](https://docs.unity3d.com/ScriptReference/PrefabUtility.html)里的GetPropertyModifications、SetPropertyModifications等接口。有了这些信息，我们可以在不同父Prefab中保存同一个子Prefab和不同的修改项。

#### 如何维护指向子Prefab内的引用

顺便引出另一个问题：如何在父Prefab上保存对子Prefab元素的引用？如果父Prefab上的`public Text hp`直接指向子Prefab里的文字，这样在保存的时候会引用失败。

这里提出一个巧妙的封装`public Ref<Text> hp`：

{% codeblock lang:csharp %}
public class Ref<T> where T : UnityEngine.Object {
    [SerializeField]
    private T obj;
    [SerializeField]
    private GameObject target;
    [SerializeField]
    privat string path;

    public T GetObj();
}
{% endcodeblock %}

在使用时`hp.GetObj().text = xxx`如果子Prefab未实例化(这种情况只可能发生在编辑器模式下)，那么根据path自动加载；如果已经实例化的情况下直接根据target和path去找到对应的Component就行了。

夸了这么多，现在要说说这个思路的缺点：整套方法实在是过于“精巧”，在使用中容易撞到奇葩的情况...

- 子Prefab的结构变化会导致`Ref<T>`失效；
- 打包的时候实例化需要消耗不少时间(备份老的、搜索并实例化、打包、还原)，同时包体会变大一些；
- 子Prefab本身的修改会不会和保存下来的PropertyModifications冲突？而且我发现导出的PropertyModifications其实包含了蛮多无用信息

## uPrefabs

[uPrefabs](https://www.assetstore.unity3d.com/en/#!/content/72007)是一套非常强大的Prefab增强插件：

- 支持单独的Component的Save/Revert
- 完整的嵌套Prefab解决方案

![](/images/uprefabs.jpg)

其实它实现的思路和上面说的有些相同。当时我还特别好奇它是如何接管到原生Prefab的按钮，后来发现丫直接重载了整个GameObject面板，然后像素级去重新绘制了整个面板，可以说是非常的丧心病狂了...

不过这个插件的缺点也十分明显——**太太太太太太卡**了...有兴趣的朋友可以自行测试一下(逃

# Conclusion

当然不同团队的解决方案肯定是有所区别的，整理完上面的三个方法我发现其实有不少相同的地方：

- 方法一、二的都是在Editor下尽可能lazy Instantiate(当然方法二的`Ref<T>`用起来更加优雅)；
- 方法二、三都使用了同样的思路来支持Component级别的diff，并利用COOK来解决打包时的展开；
- 三个方法都选择保存路径来解耦Prefab引用。

硬要说的话，其实三个方法依次下来是越来越“精巧”，同时“成本”也在不断升高(咦，我怎么想到了苏联制造vs.美国制造的笑话)。

最后欢迎大家讨论和分享更好的思路～