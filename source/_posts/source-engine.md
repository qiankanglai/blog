---
layout: post
title: Source资源格式
date: 2017/5/29
thumbnail: /images/teaser/tanker_op_by_slim_charles-dany4nk.jpg
---

最近闲来无事，研究了一下V社的资源格式，发现真是『开放』啊。

<!--more-->

从[Call of Duty Modern Warfare Remastered Models Release Thread](https://facepunch.com/showthread.php?t=1541193)下了几个模型练手，了解了下具体的格式，很多细节都可以从[Valve Developer Community](https://developer.valvesoftware.com/wiki/Main_Page)里找到。

# 模型文件

[Studiomodel](https://developer.valvesoftware.com/wiki/Studiomodel)是Source引擎能直接加载的**处理过的**模型，包含以下信息

- mdl 模型信息的总和，譬如文件名、路径、骨骼、动画及对应的vvd/phy/ani等文件
- vmt 材质信息
- vvd 顶点信息
- phy 物理信息
- ani 动画信息

# 模型文件处理

二进制格式的mdl是无法直接进行编辑的，可以考虑使用[Hooch's fixed version of MDL Decompiler](http://gamebanana.com/tools/5083)或其他工具处理得到文本格式的SMD和QC文件，然后使用[Blender Source Tools
](https://developer.valvesoftware.com/wiki/Blender_Source_Tools)导入到[Blender](https://www.blender.org/)中。

安装这个插件比较简单就不多说了。

在空场景里使用导入QC:

![](/images/blender_source_import.jpg)

这是使用QC是因为可以一次性把相关的模型部分都导入，如果使用SMD就需要一个个分别导入人肉组合。

![](/images/blender_source_import_qc.jpg)

然后导出FBX之前，建议删掉Camera/Cube/Lamp/VTA vertices/**UnknownModelName/phymodel**等信息

![](/images/blender_source_useless_parts.jpg)

# 贴图处理

Source使用了vtf格式来存储贴图，直接使用[VTFEdit](https://developer.valvesoftware.com/wiki/VTFEdit)批量倒tga出来就行了

# 材质处理

前面在处理mdl的时候会生成vmt文件

{% codeblock lang:text %}
"VertexLitGeneric"
{
	"$baseTexture" "models\ninja/COD4R/CHR/SASCT/h1_sp_sas_ct_charles_pouches_col"
	"$bumpmap"    "models\ninja/COD4R/CHR/SASCT/h1_sp_sas_ct_charles_pouches_nml"
	
	"$phong"	"1"
	"$phongexponent"	"6"
	"$phongalbedotint"	"1"
	"$phongboost"	"0.10"
	"$phongfresnelranges"	"[5 7 8]"
    "$lightwarptexture" 	"models\ninja/COD4R/Clothes_wrp"
	"$phongexponenttexture" "models\ninja/COD4R/CHR/SASCT/h1_sp_sas_ct_charles_pouches_spc"
}
{% endcodeblock %}

这里就非常简单了，参考文档里的[Material](https://developer.valvesoftware.com/wiki/Vmt)有更详细介绍~
