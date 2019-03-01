---
layout: post
title: 优化Unity项目编译速度
date: 2016/11/27
tags: Unity
thumbnail: /images/teaser/goto.jpg
---

这个是最近一段时间带着子川一起做的一个小东西：如何优化大项目C#编译速度。这个idea主要是因为使用了slua之后，每次修改C#部分编译实在是太慢了... 下面将介绍两个不同的思路，心急的朋友可以直接看第二个解决方案及实战，因为这个说穿了其实就一句话，<del>写第一部分只不过是因为折腾了非常久的`MonoImporter/PluginImporter/MonoScript`结果发现没用上而不爽(逃</del>

<!--more-->

# 测试环境

我使用的是之前比较lua解决方案里的slua工程，引擎版本Unity 5.3.6f1(其他设备信息跳过因为都是在同一台电脑上...)。在测试之前还需要写一个脚本来统计编译时间，这里简单粗暴的写了一个小脚本去不断刷新`EditorApplication.isCompiling`即可；顺便因为每次编译完成之后重新加载dll会导致`static bool compiling`丢失，因此保存一下。

{% codeblock lang:csharp %}
[InitializeOnLoad]
public class FinishCompiling
{
    const string compilingKey = "Compiling";
    static bool compiling;
    static FinishCompiling()
    {
        compiling = EditorPrefs.GetBool(compilingKey, false);
        EditorApplication.update += Update;
    }

    static void Update()
    {
        if(compiling && !EditorApplication.isCompiling)
        {
            Debug.Log(string.Format("Compiling DONE {0}", DateTime.Now));
            compiling = false;
            EditorPrefs.SetBool(compilingKey, false);
        }
        else if (!compiling && EditorApplication.isCompiling)
        {
            Debug.Log(string.Format("Compiling START {0}", DateTime.Now));
            compiling = true;
            EditorPrefs.SetBool(compilingKey, true);
        }
    }
}
{% endcodeblock %}

![](/images/unitycompile_timeanalyze.jpg)

测试的时候随便右键一个脚本-Reimport即可，这里我们要记下第一条数据：**原始版本slua 编译时间大概在20s左右**。

# Solution 1: 打包DLL

为了优化编译速度，我的第一反应就是把部分代码打包成dll，就像DOTween这种插件直接提供了dll一样。动手之前上网搜了下，论坛上已经有人这么干了[Reducing script compile time or a better workflow to reduce excessive recompiling
](https://forum.unity3d.com/threads/reducing-script-compile-time-or-a-better-workflow-to-reduce-excessive-recompiling.148078)，而且效果非常好<del>顺便吐槽下论坛这个帖子的作者一开始是用的UnityScript，改成C#之后就已经好很多了... </del>:

> Overall, using all 3 methods above, my script compile times are now down from 15 seconds every time I update a script to just 2 seconds. That's a 7.5X performance increase!

这部分官方文档里的[Managed Plugins](https://docs.unity3d.com/Manual/UsingDLL.html)介绍了如何打包，但是文档里建立Visual Studio工程还是挺麻烦，所以分析了编辑器的Editor.log之后，我选择了自己生成命令行编译：

{% codeblock lang:bash %}
"C:/Program Files/Unity/Editor/Data/MonoBleedingEdge/lib/mono/4.5/mcs" @compile2dll.txt
{% endcodeblock %}

其中compile2dll.txt的文件内容如下

{% codeblock lang:bash %}
-sdk:2
/target:library
/out:"LuaObject-Player.dll"
/define:"UNITY_5_3_OR_NEWER;UNITY_5_3;UNITY_5;..."
/r:"C:/Program Files/Unity/Editor/Data/Managed/UnityEngine.dll;..."
"Assets/Slua/LuaObject/Custom/BindCustom.cs"
...
{% endcodeblock %}

这里必须使用文件来传递参数而不是直接在控制台传递过去的原因是Windows有一个奇葩限制 [Command prompt (Cmd. exe) command-line string limitation](https://support.microsoft.com/en-us/kb/830473)

![](/images/unitycompile_compile2dll.jpg)

编译的时候我是根据文件夹去分Player/Editor两个版本的dll，搭配不同的宏和DLL引用。这里比较麻烦的是DLL部分，一方面要引入引擎相关的，此外还要引入项目里的`Library/ScriptAssemblies/Assembly-CSharp.dll`及其他非native的Plugin。编译完成之后删掉原来的cs文件导入新的dll就行了。

在这里还需要稍微修改下Slua的注入部分

{% codeblock lang:csharp %}
if (System.IO.File.Exists("Assets/Slua/LuaObject/LuaObject-Player.dll"))
{
    assembly = Assembly.Load("LuaObject-Player");
    list.AddRange(getBindList(assembly, "SLua.BindUnity"));
    list.AddRange(getBindList(assembly, "SLua.BindUnityUI"));
    list.AddRange(getBindList(assembly, "SLua.BindDll"));
    list.AddRange(getBindList(assembly, "SLua.BindCustom"));
}
{% endcodeblock %}

搞定之后试了下原来场景能够正常运行，就可以记下第二条数据：**dll版本的slua 编译时间大概在4s左右**。

是不是很激动人心？然后要来自己给自己泼冷水了...我使用这个工具去尝试打包[Text Mesh Pro](https://www.assetstore.unity3d.com/en/#!/content/17662)的时候发现，这种解决方案有两个非常大的硬伤:

- 无法处理代码里有`UNITY_ANDROID` `UNITY_EDITOR`等宏
- 无法处理`MonoBehaivor`

前面一种其实硬要做也是可以的：针对每个平台及是否是编辑器编译一份dll进行使用。但是第二个问题非常难搞不定。根据我的分析，Unity在序列化prefab/scene的时候：

{% codeblock lang:yaml %}
  m_Script: {fileID: 1362688015, guid: 1587d74042d69a744a8765d5984d126d, type: 3}
{% endcodeblock %}

`guid`是对应的DLL文件，`fileID`是里面的C#脚本，如果要在用不同版本DLL的时候自己根据映射去切换太尴尬了。

后来还想了一个鸡贼的办法，和前面提到的论坛帖子里方法类似：把原来的类改名，譬如`SgLuaMonoBehavior`改成`SgLuaMonoBehavior_`编译到dll里面去，然后在外面写一个空的类`public class SgLuaMonoBehavior : SgLuaMonoBehavior_`来继承。测试了下发现编辑器部分的`[CustomEditor(typeof(SgLuaMonoBehavior_))]`不认子类，还有很多`CreateMenu`也要重写，工作量简直尴尬而且可维护性太差...

再后来还YY过一个工程编译出两个partial dll，以及extension写法等，发现没一个走的通。

ps. 我比较好奇UGUI这种dll是如何在升级版本的时候保证一致的，我猜测是一方面通过工程里Assembly-Info里的`GUID d4f464c7-9b15-460d-b4bc-2cacd1c1df73`配合引擎内部的guidmapper实现。这方面如果有了解的希望不吝赐教～

# Solution 2: 利用Unity多阶段编译

上面那个解决方案限制太多实用性其实不高，然后某天偶然发现了这个插件[Mad Compile Time Optimizer](https://www.assetstore.unity3d.com/en/#!/content/34012)，根据其描述瞬间打开了新世界的大门：官方文档[Special folders and script compilation order](https://docs.unity3d.com/Manual/ScriptCompileOrderFolders.html)表示引擎默认就会分四步编译，那么只要将不常修改的代码放到特定文件夹就完事儿了其实...这里我选择的是**Standard Assets**文件夹，因为我司有一套切换SDK的脚本会覆盖**Plugins**内容(见{% post_link jenkins %})。同样也要修改下slua的载入部分：

{% codeblock lang:csharp %}
//var assemblyName = "Assembly-CSharp";
var assemblyName = "Assembly-CSharp-firstpass";
Assembly assembly = Assembly.Load(assemblyName);
list.AddRange(getBindList(assembly,"SLua.BindUnity"));
list.AddRange(getBindList(assembly,"SLua.BindUnityUI"));
list.AddRange(getBindList(assembly,"SLua.BindDll"));
list.AddRange(getBindList(assembly,"SLua.BindCustom"));
{% endcodeblock %}

然后把Slua拖到Standard Assets下，一运行就报错了...蜜汁尴尬

> UNetWeaver error: Exception :System.ArgumentException: An element with the same key already exists in the dictionary.
  at System.Collections.Generic.Dictionary`2[System.UInt32,System.UInt32].Add (UInt32 key, UInt32 value) [0x0007e] in /Users/builduser/buildslave/mono/build/mcs/class/corlib/System.Collections.Generic/Dictionary.cs:404 
  at Mono.Cecil.MetadataSystem.SetReverseNestedTypeMapping (UInt32 nested, UInt32 declaring) [0x00000] in <filename unknown>:0 
  at Mono.Cecil.MetadataReader.AddNestedMapping (UInt32 declaring, UInt32 nested) [0x00000] in <filename unknown>:0 

在[Unity Issue Tracker](https://issuetracker.unity3d.com/issues/project-doesnt-play-with-unetweaver-error)和[slua issues](https://github.com/pangweiwei/slua/issues/73)上搜到了相关信息，偷懒起见直接用了[Unity C# 5.0 and 6.0 Integration](https://bitbucket.org/alexzzzz/unity-c-5.0-and-6.0-integration/overview)。这下第三条数据到手：**Plugin版本的slua 编译时间大概在5s左右**。

ps. 这里由于引入了CSharp 6.0 Support，多了脚本+换了个编译器，因此我重测了下原始版本slua+这个的编译时间大概15s左右<del>这只能说明老mono早该换了</del>

pss. 这里只是测试偷懒换了编译器，但是我个人不建议在实际项目里这么干...

# 实战测试

使用了手头在优化的一个项目：原版编译时间大概23s左右

![](/images/unitycompile_test1.jpg)

新版本编译时间大概7s左右

![](/images/unitycompile_test2.jpg)

没错...说穿了就是**把包括插件在内的基本不会修改的代码挪到Standard Assets里就完事儿了**，经常修改的代码放在外面原地不动。这样唯一的一个限制是Standard Assets里的代码无法引用外面的代码，不过我这里全是放的插件，完全没有问题。

解决方案2完胜解决方案1(逃

ps. 后来发现雨松MONO之前在论坛也提过这个思路 [让unity的编译速度在快一些](http://forum.china.unity3d.com/thread-13028-1-1.html)

pss. 其实解决方案1也不是完全一无是处，譬如对于slua这种奇怪的会撞编译器bug的代码，就可以考虑用命令行编译之后拷贝回来...