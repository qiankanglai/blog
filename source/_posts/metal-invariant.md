---
title: Metal 2.1中的新关键字invariant
date: 2019-03-01 22:35:51
tags: iOS Metal
---

最近一段时间忙的天昏地暗，难得有空继续整理一发遇到的奇怪问题：iOS12设备上PreZ Pass出现了闪烁。这个问题也蛮有意思的，最后在同事的指导下找到了原因：[Metal Shading Language Specification](https://developer.apple.com/metal/Metal-Shading-Language-Specification.pdf)里面专门提到

<!--more-->

> [[invariant]] indicates that the floating-point math used in multiple function passes must
generate a vertex position that matches exactly for every pass. [[invariant]] may only be
used for a position in a vertex function (i.e., fields with the [[position]] attribute) to indicate
the result of the calculation for the output is highly likely (although not guaranteed) to be
invariant. This position invariance is essential for techniques such as shadow volumes or a zprepass. 

知道这个原因之后兴冲冲的改了下Shader，结果发现没什么用...(这里用的是UE4生成的代码为例，示意用)

{% codeblock lang:hlsl %}
#if __METAL_VERSION__ >= 210
#define POS_INVARIANT , invariant
#else
#define POS_INVARIANT
#endif

struct FVSOut
{
	float4 Position [[ position POS_INVARIANT ]];
};
{% endcodeblock %}

接下来一通骚操作最后尝试出来是文档有一定的误导性:编译Shader的时候[makeLibrary](https://developer.apple.com/documentation/metal/mtldevice/1433431-makelibrary)必须带上`MTLCompileOptions`，然后把`languageVersion`设为Metal 2.1。本来我一直以为这货留`nil`就行，因为[languageVersion](https://developer.apple.com/documentation/metal/mtlcompileoptions/1515494-languageversion)文档里是这么描述的

> By default, the most recent language version available is used.

这么爆改之后确实解决了PreZ的问题，结果引入了一个新的问题: 必须强制把`fastMathEnabled=true`设置一下，不然fastMath竟然被禁用带来性能损失。结果这样就又和文档[fastMathEnabled](https://developer.apple.com/documentation/metal/mtlcompileoptions/1515914-fastmathenabled)不太相符了...

> The default value is true.

emmm反正最后解决的很简单，对iOS12及以上的设备强制设置一波`MTLCompileOptions`即可。但解决的过程很令人智熄(早知道还不如不看文档，摔)

ps. 我后来多测了一下，发现`MTLCompileOptions`传`nil`的时候fastMath反而是默认打开的来着，囧。如果有整过这块的老司机欢迎交流，我还是觉得这块怪怪的来着...