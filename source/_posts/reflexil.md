---
layout: post
title: Reflexi简明教程
date: 2016/3/5
tags: [Unity,C#,Translation]
updated: 2016/3/7
---

本文是[Assembly Manipulation and C# / VB.NET Code Injection](http://www.codeproject.com/Articles/20565/Assembly-Manipulation-and-C-VB-NET-Code-Injection)的翻译，已得到作者授权。该教程作者(亦工具作者)现在在微软开发UnityVS...

<!--more-->

本文使用的老版本界面与最新版本有所不同，而且内容覆盖的功能比较全，但介绍的比较笼统；之后我会结合Unity写一些具体的例子。
就我的使用经验来说，直接操作IL code还是比较丧心病狂的，利用后面的C#/VB.NET注入功能会方便很多，而且修改作用域、属性等功能其实用的不多。

ps. 图片来自codeproject，可能载入速度较慢，见谅

# 最新版本下载

最新版本的Reflexi可以在[官网](http://reflexil.net/)下载。

# 简介

[Reflector](http://reflector.net/)和[JustDecompile](http://www.telerik.com/products/decompiler)都是能用来对各类程序集进行深度检查的工具，他们同时也都能对.NET的IL code进行反汇编。但是这两个工具都无法修改对应程序集的结构或IL code。在[Jb EVAIN](http://evain.net/blog/)实现的强大**[Mono.Cecil](http://www.mono-project.com/Cecil)**帮助下，Reflexil达到了这个目标。作为一个专门用来处理IL code的插件，Reflexil实现了一个完整的指令编辑器，并允许直接注入C#/VB.NET代码。下面将用两个例子具体说明。

# Demo应用

让我们先实现一个简单的求和应用。

{% codeblock lang:csharp %}
using System;
using System.Windows.Forms;

namespace ReflexilDemo
{
    public partial class DemoForm : Form
    {
        public DemoForm()
        {
            InitializeComponent();
        }

        private void ComputeAndDisplay(decimal x, decimal y)
        {
            MessageBox.Show(String.Format("{0}+{1}={2}", x, y, x + y));
        }

        private void DisplayResultButton_Click(object sender, EventArgs e)
        {
            ComputeAndDisplay(LeftOperand.Value, RightOperand.Value);
        }
    }
}
{% endcodeblock %}

![](https://www.codeproject.com/KB/msil/reflexil/demoapp.jpg)
![](https://www.codeproject.com/KB/msil/reflexil/demores.jpg)

## 使用指令编辑器

通过指令编辑器，我们可以在`ComputeAndDisplay`方法内修改对`MessageBox.Show`方法的调用，增加一个调用参数title(因为这个函数有多个重载形式)，从而在显示结果的窗口上添加标题。

为了达成这个目标，首先需要在栈里增加一个`ldstr`操作码，来存放一个string参数。

![](https://www.codeproject.com/KB/msil/reflexil/methedt-create.jpg)
![](https://www.codeproject.com/KB/msil/reflexil/inscreate.jpg)

接下来，通过修改函数里调用`MessageBox.Show`方法的指令，将刚才创建的string作为参数传进去。

![](https://www.codeproject.com/KB/msil/reflexil/methedt-edit.jpg)
![](https://www.codeproject.com/KB/msil/reflexil/insedit.jpg)
![](https://www.codeproject.com/KB/msil/reflexil/methsel.jpg)

最后保存我们刚才的修改，然后测试一下新的程序集。

![](https://www.codeproject.com/KB/msil/reflexil/modsave.jpg}

可以看到保存过的程序能正常显示标题，说明它使用了新的重载函数，并将正确的参数传进去了。

![](https://www.codeproject.com/KB/msil/reflexil/demoresult.jpg)

## 指令编辑器功能特性

指令编辑器支持**Mono.Cecil**中定义的所有操作码，如下所示：

- 基本数据类型: byte, sbyte, int32, int64, single, double
- 字符串
- 指令引用
- 多指令引用(switch)
- 参数或类型引用
- 内部泛型引用
- 类型、属性或方法引用(Reflector实现了一个浏览器，从中选择合适的即可)

需要注意的是，**Reflector**和**Reflexil**的对象更新不是同步的：对IL code进行的修改并不会影响**Reflector**的反汇编窗口，同时**Mono.Cecil**不会对生成的代码进行检查。在两者之间唯一的保证是对于程序集中同一个操作码(opcode)，其对应的操作符(operand type)是一致的。如果你觉得直接修改IL比较麻烦的话，下面将展示如何直接更新一个函数本身的方法。

# 使用C#/VB.NET代码注入

通过下图所示配置表，你可以选择适合的诸如语言以及输入、显示的进制设置：

![](https://www.codeproject.com/KB/msil/reflexil/configuration.jpg)

下面使用"替换所有代码"来修改`ComputeAndDisplay`函数主体：

![](https://www.codeproject.com/KB/msil/reflexil/methedt-inject.jpg)

在弹出的编译窗口中，我们能直接查看到结果IL code；在这个窗口中提供了基本的智能感知：

![](https://www.codeproject.com/KB/msil/reflexil/inject-cs.jpg)

当然，我们也能通过VB.NET语言进行修改。注意在这个简单例子中，我们在两种语言下得到了完全相同的IL code(但这个并不一定始终成立)：

![](https://www.codeproject.com/KB/msil/reflexil/inject-vb.jpg)

最后我们保存、测试一下修改结果：

![](https://www.codeproject.com/KB/msil/reflexil/demoresult-inject.jpg)

## C#/VB.NET代码注入功能特性

修改的代码是使用`System.CodeDom`在一个单独的`AppDomain`下编译。一旦编译成功，生成的指令被剥离出来，然后塞入原来的函数体中。参数、变量、方法、作用域等被调整适应于原作用方法中。当然代码注入也有一定的限制：无法引用到其定义在父类中的属性或方法。此外可以指定编译进程中的目标框架。

## 方法属性编辑器

通过这个编辑器能够很轻松的修改方法签名或可见范围，也可以修改返回类型：

![](https://www.codeproject.com/KB/msil/reflexil/methattr.jpg)

方法参数及变量也是可编辑的。Reflexil能够载入(MDB、PDB等文件提供的)符号信息，来显示原始变量名：

![](https://www.codeproject.com/KB/msil/reflexil/paramattr.jpg)

## 异常处理

**Reflexil**能够在方法体内增加、修改、删除异常处理，包括以下类型：

- `Catch`
- `Filter`
- `Finally`
- `Fault`

![](https://www.codeproject.com/KB/msil/reflexil/exception.jpg)

## 类型标签编辑器

类似方法，变量的可见域也是可以修改的，譬如说将一个`private`变量暴露出来：

![](https://www.codeproject.com/KB/msil/reflexil/typeedt.jpg)

## 操作成员

**Reflexil**能够对类、接口、结构体、枚举、事件、方法、构造函数、属性或引用进行重命名、删除或插入操作。

![](https://www.codeproject.com/KB/msil/reflexil/injmenu.jpg)

智能插入：插入一个属性(property)会生成一个字段(field)及对应的getter/setter方法。

![](https://www.codeproject.com/KB/msil/reflexil/injprop.jpg)

## 资源编辑器

可以修改或插入内嵌资源、链接资源和程序集链接资源，并提供了一个完整的十六进制编辑器来更新、导入或导出文件。

![](https://www.codeproject.com/KB/msil/reflexil/resources.jpg)

## 自定义标签编辑器

完全支持自定义标签

![](https://www.codeproject.com/KB/msil/reflexil/custattr.jpg)

## 程序集及引用编辑器

可修改程序入口

![](https://www.codeproject.com/KB/msil/reflexil/asmdef.jpg)

也可以更新关于认证的所有信息：版本号，公钥，名字和区域信息。当然你也可以修改引用的资源从而使用不同版本内容：

![](https://www.codeproject.com/KB/msil/reflexil/asmnamedef.jpg)

## 模块编辑器

可用来修改应用类型，譬如从可执行程序变成DLL库：

![](https://www.codeproject.com/KB/msil/reflexil/moddef.jpg)

## 程序集签名支持

当原程序集自带签名时，保存出来的修改后程序集是"延迟签名"状态。**Reflexil**能调用SDK工具来修复这个问题。

![](https://www.codeproject.com/KB/msil/reflexil/signed.jpg)

**Reflexil**能自动移除程序集强命名或更新其引用资源。当然你也可以手动完成：移除公钥后将`HasPublicKey`设为`false`即可：

![](https://www.codeproject.com/KB/msil/reflexil/snremover.jpg)

<del>由于这块实在没用过，所以这段翻译的可信度较低...逃</del>

## 反混淆支持

**Reflexil**使用了**de4dot**进行反混淆：

![](https://www.codeproject.com/KB/msil/reflexil/obfsearch.jpg)

支持Babel NET, CliSecure, CodeFort, CodeVeil, CodeWall, CryptoObfuscator, DeepSea, Dotfuscator, dotNET Reactor, Eazfuscator NET, Goliath NET, ILProtector, MaxtoCode, MPRESS, Rummage, Skater NET, SmartAssembly, Spices Net和Xenocode。

![](https://www.codeproject.com/KB/msil/reflexil/obffound.jpg)
![](https://www.codeproject.com/KB/msil/reflexil/obfclean.jpg)

## 程序集验证

通过使用.NET SDK自带的`peverify.exe`，可以检查生成的IL code和对应原信息是否满足类型安全的需要。

![](https://www.codeproject.com/KB/msil/reflexil/asmcheck.jpg)
![](https://www.codeproject.com/KB/msil/reflexil/asmcheckok.jpg)

# 总结

**Reflexil**完全基于**Mono.Cecil**。核心在于**Mono.Cecil**能够脱离运行时环境载入程序集，所以操作起来不需要对应的资源限制、能在孤立的`AppDOmain`里完成。另外`System.Type`和`Mono.Cecil.TypeDefinition`分别独立实现了.NET类型概念，两者之间并没有联系。因此如果我们希望通过写程序(而不是直接修改IL code)的方式完成第一个例子(重载`Show`来修改窗口标题栏)，在**Mono.Cecil**帮助下也能很方便的完成。

# 翻译后记

这是我第一次翻译一些内容，因为除了汉语之外只看得懂一些英文，所以每次想动手但又觉得没啥必要...最近受Trace激励，觉得还是得动手整点，不管有没有人看~

一遍下来还是挺耗费精力的，而且有些细节也不是拿捏的非常清楚：譬如opcodes和operand区别，我参考了[Opcodes and Operands](http://www.teach-ict.com/as_as_computing/ocr/H447/F453/3_3_8/features/miniweb/pg4.htm)但不知道翻译成操作符和操作码是否精确；C#相关的一些术语我也不确认翻译的是否精确，也许有些地方直接写英文反而更好。

总之，如果有什么意见和勘误请在下方留言:D