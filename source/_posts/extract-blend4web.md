---
layout: post
title: 拆解blend4web资源
date: 2014/11/15
tags:
- JavaScript
---

昨儿有人给我发了一个[神秘网址](https://dl.dropboxusercontent.com/u/76187276/test.html)，表示希望能获得资源<del>施法</del>

<!--more-->

![](/images/blend4web1.jpg)

我看了下这个网页，是用[blend4web](https://github.com/TriumphLLC/Blend4Web)转的，这个可以将blender里的模型很方便的通过WebGL输出到网页上(新技能GET)...所以稍微花了点时间研究了下，如何导出blend4web网页中的模型资源~

# 抓取文件内容

第一步当然是找一下资源文件在哪里~用chrome的inspector network面板发现没有其他请求，然后查看了一下源代码，好大的页面……很容易就找到了看起来像是乱码的资源

![](/images/blend4web2.jpg)

一开始非常逗比的试图去复制粘贴，结果把sublime挤爆了~于是再读了下代码发现这货其实是一个函数，因此机智的想到了chrome的控制台里有一个`copy`函数，可以将内容复制到剪贴板

![](/images/blend4web3.jpg)

这样一步步就把这几个文件都单独保存出来了。

# 解析编码

对于`main.json`和`main_file`来说，明文一看即知。对于另外几个文件，也很容易看出来其实是base64编码，写了个小脚本转出来：

{% codeblock lang:javascript %}
var fs = require('fs');
var c = fs.readFileSync('Joc_ML_Cap10_baseTexBaked.dds');
var c2 = new Buffer(c.toString(), 'base64');
fs.writeFileSync('Joc_ML_Cap10_baseTexBaked2.dds',c2.toString('binary'),{"encoding":"binary"});
{% endcodeblock %}

妥妥的没问题

![](/images/blend4web_dds.jpg)

# 解析模型

最后就剩下一个main.bin文件，用脚趾头想都知道是模型。将其转码之后，我一开始尝试了直接修改后缀名、用blender打开失败，猜测用了某种奇怪的格式。分析了下对应的main.json发现有这么一段

{% codeblock lang:javascript %}
"binaries": [{"binfile": "main.bin", "int": 0, "float": 1200000, "short": 2246000, "ushort": 2978200}]
{% endcodeblock %}

没办法，只能倒回去找一下压缩的代码(这里还是比较繁琐的，因为那个插件有部分代码是C++写的，Python写了一堆工具，然后网页相关的代码是JavaScript)，最后找到了[exporter.py](https://github.com/TriumphLLC/Blend4Web/blob/master/external/blender_scripts/addons/blend4web/exporter.py)。先是找到`binfile`

{% codeblock lang:python %}
binary_data["int"] = 0
binary_data["float"] = len(_bpy_bindata_int)
binary_data["short"] = binary_data["float"] + len(_bpy_bindata_float)
binary_data["ushort"] = binary_data["short"] + len(_bpy_bindata_short)
_export_data["binaries"].append(binary_data)
{% endcodeblock %}

那么就猜测解析出来的`main.bin`文件可以分成四大段，其中[0,1200000)是int(即1200000byte)，[1200000,2246000)是float(即1046000byte)，[2246000,2978200)是short(即732200byte)，之后都是ushort；我看了下解析出来的`main.bin`正好是2,978,200 bytes，所以继续去找这几段`_bpy_bindata_int`之类的是哪里来的：

{% codeblock lang:python %}
int_props = ["indices"]
for prop_name in int_props:
    if prop_name in submesh:
        if len(submesh[prop_name]):
            submesh_data[prop_name] = [
                len(_bpy_bindata_int) // BINARY_INT_SIZE,
                len(submesh[prop_name]) // BINARY_INT_SIZE
            ]
            _bpy_bindata_int.extend(submesh[prop_name])
        else:
            submesh_data[prop_name] = [0, 0]
{% endcodeblock %}

这里只弄了一段，写的也很清晰，倒回去找一下`main.json`里

{% codeblock lang:javascript %}
"submeshes": [{"base_length": 52300, "indices": [0, 300000], "normal": [0, 156900], "tangent": [156900, 209200], "color": [0, 0], "group": [0, 0], "position": [0, 156900], "texcoord": [156900, 104600], "texcoord2": [0, 0], "vertex_colors": []}]
{% endcodeblock %}

小小的算一下：indices有300000个int，相当于100000个三角形，正好占了1200000个byte；normal有156900个short，tangent有209200个short，正好加起来是732200byte；position有156900float,tex是104600float，对应1046000byte。和前面的`main.bin`分布完全对上！到这里思路其实很清晰了，只要解析出52300个顶点的pos和uv，以及100000个面即可~ yi'ran是写了个小脚本来搞定(其实我还试了试`readFloatLE/readFloatBE`...)

{% codeblock lang:javascript %}
var fs = require('fs');
var c = fs.readFileSync('main.bin');
var buf = new Buffer(c.toString(), 'base64');
//var c_int = buf.slice(0, 1200000), c_float = buf.slice(1200000, 2246000), c_short = buf.slice(2246000, 2978200);
// v/vt must be written first
var count = 100000*3*4;
for(var vertex = 0; vertex < 52300; vertex++){
	var v1 = buf.readFloatLE(count);
	count += 4;
	var v2 = buf.readFloatLE(count);
	count += 4;
	var v3 = buf.readFloatLE(count);
	count += 4;
	console.log('v '+v1+' '+v2+' '+v3);
}
for(var vertex = 0; vertex < 52300; vertex++){
	var t1 = buf.readFloatLE(count);
	count += 4;
	var t2 = 1-buf.readFloatLE(count);
	count += 4;
	console.log('vt '+t1+' '+t2);
}

count = 0;
for(var faces = 0; faces < 100000; faces++){
	var face1 = buf.readInt32LE(count)+1;
	count += 4;
	var face2 = buf.readInt32LE(count)+1;
	count += 4;
	var face3 = buf.readInt32LE(count)+1;
	count += 4;
	console.log('f '+face1+'/'+face1+' '+face2+'/'+face2+' '+face3+'/'+face3);
}
{% endcodeblock %}

这样就得到了obj模型文件，然后有俩比较坑的地方：

- ** 必须先输出v和vt，再输出f，否则读取会崩！ **
- f的索引是从1开始的
- 输出的uv.y要反一下，贴图才对

最后倒入unity表示没问题...

![](/images/blend4web4.jpg)