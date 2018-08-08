---
layout: post
title: UnityEngine.Object里的迷之null
date: 2016/10/21
tags: Unity
updated: 2016/10/21
---

今天大黄在群里提出了一个非常奇怪的问题:

<!--more-->

{% codeblock lang:csharp %}
public Transform Parent = null;
void Start ()
{
    //Transform Parent = null;
    Transform SelfTransform = GetComponent<Transform>();
    Transform a = Parent ?? SelfTransform;
    Transform b = Parent != null ? Parent : SelfTransform;
    Debug.Log(a == b);
}
{% endcodeblock %}

竟然返回了`False`！难道是null coalescing operator挂了？

{% codeblock lang:csharp %}
//public Transform Parent = null;
void Start ()
{
    Transform Parent = null;
    Transform SelfTransform = GetComponent<Transform>();
    Transform a = Parent ?? SelfTransform;
    Transform b = Parent != null ? Parent : SelfTransform;
    Debug.Log(a == b);
}
{% endcodeblock %}

这样的代码倒是没问题的，结果为`True`。这个确实有种日了狗的感觉...

# 初步解释

另一个群里有个朋友@Yaukey表示之前在AstarPathfindingProject这个插件遇到过这个问题，结论是`??`不能正确重载UnityEngine.Object的。猜测是序列化的对象被赋值过了(所以第一段代码错误，第二段正确)；`==`重载过了，因此没问题。

结论：牢记，不要对`UnityEngine.Object`使用`??`就好！

# 深层原因

我在官方论坛上提问了下[the null coalescing operator(??) seems not working for Components](https://forum.unity3d.com/threads/the-null-coalescing-operator-seems-not-working-for-components.437376/)，@Suddoha的解释非常清楚：

> That specific operator only takes the usual 'null' into account, whereas Unity also offers a pseudo-null object to present more information to the programmers in the editor (that's what happens in the second example, it'll set such a mysterious object to that non-assigned, serialized field).

> Usual comparisons like ==, != and some boolean comparisons will check whether the variable references 'null' or that pseudo-null.

简单来说，Unity在Editor里实现了一个pseudo-null的类(我估计这样顺便实现了Inspector里区分missing和none的状态)，但是只重载了`==` `!=`等部分操作...

{% codeblock lang:csharp %}
public Transform Parent;
void Start()
{
    // overriden operator compares to null and fake-null, result is true
    Debug.Log(Parent == null);
    // casting to a System.Object reveals that there's actually something assigned to it, result is false
    Debug.Log((System.Object)Parent == null);
}
{% endcodeblock %}

可以看到虽然在Inspector里Parent是none，但是其实它是指向了某个pseudo-null的实例对象...**也就是说编辑器里看到的空并不是真正的null**

后面@Suddoha还贴了一段泛型的坑，这里就懒得转了-。-强烈建议看原帖解释

# 博客版本解释

论坛上@BoredMormon贴了一个官方博客的帖子[CUSTOM == OPERATOR, SHOULD WE KEEP IT?](https://blogs.unity3d.com/2014/05/16/custom-operator-should-we-keep-it/)，然后他整理的几个DONT很有用：

- Never check if a UnityEngine.Object is null directly, always use the bool operator
- Never cast a UnityEngine.Object to a System.Object
- Never write a generic method designed to take UnityEngine.Object and System.Object
- Never use ?? on a UnityEngine.Object
