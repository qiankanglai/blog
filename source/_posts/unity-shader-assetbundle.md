---
layout: post
title: Shader in AssetBundle
date: 2017/1/29
tags: Unity
updated: 2017/2/14
thumbnail: /images/teaser/ab_shader.jpg
toc: false
---

关于Resources和AssetBundle优劣之前已经提过很多次了(参考官方教程[The Resources folder](https://unity3d.com/learn/tutorials/topics/best-practices/resources-folder))，正好最近@张迪在做框架AssetBundle部分的优化，特此整理一下两个特常见的坑及对应解决办法。之前在[关于Unity中的资源管理，你可能遇到这些问题](http://blog.uwa4d.com/archives/QA_ResourceManagement.html)里有有人提到过这个问题：

<!--more-->

> Q6: 请问粒子特效的Shader是否不能使用依赖打包？ 我们对Shader的模型和特效使用了依赖打包，运行的时候发现模型显示是正常的，但是粒子特效使用的Shader就不能正常运行，特效显示不正常。而在编辑器中，我们看到Material中的Shader是存在的。这时候如果重新手动给这个Material指定同样的Shader，这个粒子特效就能正常显示，请问这是什么原因引起的？

这里主要分享如何在编辑器里模拟AssetBundle时处理Shader(之后我们会分享『如何从框架层面实现0冗余』相关经验)

在我们的框架里是这么区分资源的：

- Editor模式
	- 开发时直接使用`UnityEditor.AssetDatabase.LoadAssetAtPath`加载
	- 也支持模拟真机行为，使用打包出来的AssetBundle文件
- Player模式：真机使用StreamingAssets下自带的或热更新下载的AssetBundle文件

在开发过程中，Editor模拟模式下会有一个非常麻烦的情况：Android或iOS模式下加载出来的材质球都是紫色的。官方支持里有提到这个问题[Shaders Are Pink When Loaded From An AssetBundle
](https://support.unity3d.com/hc/en-us/articles/208380753-Shaders-are-pink-when-loaded-from-an-AssetBundle)，论坛里也有相关讨论[Shaders and asset bundles
](https://forum.unity3d.com/threads/shaders-and-asset-bundles.435667/)。根据我的理解，问题就出在：打包到AssetBundle里的Shader是移动平台版本的，但是编辑器需要的是Windows/OSX版本的。

找到原因之后，我们使用了以下解决方案：

- 在打包AssetBundle之后，针对所有shader重新打包一个对应编辑器版本的AssetBundle
- 载入AssetBundle时，如果是shader则载入Windows或OSX版本，同时其他资源载入对应Android或iOS版本
- 载入GameObject时，编辑器里会有额外处理：找到所有材质球，并在shader AssetBundle里找到同名shader进行替换(因为原材质球是对应的移动版本的shader)

在第一步中，除了需要打包项目内本身所有Shader之外，还需要打包builtin shaders，便于后面几步查找; 第三步利用了反射来修改所有材质球

{% codeblock lang:csharp %}
System.Type materialType = typeof(Material);
Component[] comps = go.GetComponentsInChildren<Component>();
foreach (Component comp in comps)
{
    System.Type t = comp.GetType();

    var fields = t.GetFields();
    foreach (var field in fields)
    {
        if (field.FieldType == materialsType)
        {
            Material mat = field.GetValue(comp) as Material;
            if (mat != null)
            {
                mat = FixMaterial(mat);
                if (mat != null)
                    field.SetValue(comp, mat);
            }
        }
    }
}
{% endcodeblock %}

这样的最大好处在于**不需要额外的操作**：还有一个解决方案是每个项目里解压一份builtin shader，然后强制使用项目内的版本而不是Resources/unity_builtin_extra下的版本。相比之下我们的解决方案只是在打包编辑器版本shader时解压出来然后及时删除，同时这样替换的比较干净(包括脚本里的`public Material lineMaterial;`这种也能被处理到)，不需要任何人工操作。当然代价就是打包的时候比较慢，同时载入的时候使用了反射来查找所有需要替换shader的材质球也有一定的性能损失。

ps. 知乎评论区提出了一个解决方案: 

> 这个问题，直接把编辑器环境变成opengl es2.0，具体内容在player setting pc的设置 other settings 去掉“Auto Graphics API for Windows”勾，在里面添加opengl es2.0，并且放到第一位。

我测试了下Windows下确实可以，但是OSX下没有GLES2/3，所以还是有点蛋疼的。