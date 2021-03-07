---
title: UE4中Auto Convex的诡异结果
date: 2021-03-06 20:54:01
tags: [UE4]
thumbnail: /images/teaser/ue4_auto_convex.jpg
---

最近尝试利用UE4自带的功能生成物理简模，参考[Setting Up Collisions With Static Meshes](https://docs.unrealengine.com/en-US/WorkingWithContent/Types/StaticMeshes/HowTo/SettingCollision/index.html)有几种模式:
- 直接生成简单的包围盒/球/胶囊体;
- 利用DOP(discrete oriented polytopy)即若干对齐轴平面向内挤压;
- Auto Convex自动生成。

此外可以将多个简模组合使用，这里不再赘述。我们一开始是批量Auto Convex，结果发现对于一些"规则"网格生成的结果非常诡异。例如题图中的一个长方形盒子，生成的Auto Convex似乎只有一个表面。

<!--more-->

趁着手头有空就跟了下这个问题，因为觉得这种“低级BUG”不太可能会出现，所以看看究竟是使用问题还是另有玄机。

## Auto Convex实现

对应代码是在`ConvexDecompTool.cpp`里调用的

{% codeblock lang:cpp %}
// Start the V-HACD operation
bool StartJob(IVHACD *InVHACD,IVHACD::IUserCallback *InCallback)
{
	IVHACD::Parameters VHACD_Params;
	InitParameters(VHACD_Params, HullCount, MaxHullVerts, Resolution);
	VHACD_Params.m_callback = InCallback;
	bool ret = InVHACD->Compute(Vertices, VertCount, Triangles, TriCount, VHACD_Params);
	ReleaseMesh();
	return ret;
}
{% endcodeblock %}

发现是调用的第三方库[VHACD](https://github.com/kmammou/v-hacd)。

## 尝试官方版本

既然有论文作者提供的代码，那就先试试导出这个模型的fbx跑跑看。正好github上也有对应Blender插件，直接导入使用即可。

### Blender 2.9 fix

按照文档导入之后F3无法呼出对应的菜单，囧。搜了下发现是因为我的Blender比较新，所以参考[Unable to find custom Blender operator in F3 operator search (Blender 2.9)](https://stackoverflow.com/questions/63863764/unable-to-find-custom-blender-operator-in-f3-operator-search-blender-2-9)补一下插件实现

{% codeblock lang:python %}
def menu_func(self, context):
    self.layout.operator(VHACD_OT_VHACD.bl_idname)

def register():
    for c in classes:
    	bpy.utils.register_class(c)
    bpy.types.VIEW3D_MT_object.append(menu_func)
{% endcodeblock %}

使用Blender插件+预编译的VHACD二进制跑了下居然结果是没问题的，看来事情变得有趣起来。

### 对比参数

为了进一步比较UE4和Blender版本的差异，我仔细对照了下输入的参数:

| 参数名 | Blender参数 | UE4参数 |
| ------ | ------ | ------ |
|resolution                                   |VoxelResolution 100000        |Hull Precision, 默认100000	|
|max. concavity                               |Maximum Concavity 0.0025      |默认给0                    |
|plane down-sampling                          |Panel Downsampling 4          |无                         |
|convex-hull down-sampling                    |Convex Hull Downsampling 4    |无                         |
|alpha                                        |0.05                          |无                         |
|beta                                         |0.05                          |无                         |
|maxhulls                                     |无*                           |Hull Count, 默认4          |
|pca                                          |0                             |无                        |
|mode                                         |ACD Mode 0                    |无                        |
|max. vertices per convex-hull                |Maximum Vertices Per CH 32    |Max Hull Verts, 默认16     |
|min. volume to add vertices to convex-hulls  |Minimum Volume Per CH 0.00010 |默认给0.003                |
|convex-hull approximation                    |无                            |无                         |

其中UE4中有几个参数是直接代码里写死的

{% codeblock lang:cpp %}
static void InitParameters(IVHACD::Parameters &VHACD_Params, uint32 InHullCount, uint32 InMaxHullVerts,uint32 InResolution)
{
	VHACD_Params.m_resolution = InResolution; // Maximum number of voxels generated during the voxelization stage (default=100,000, range=10,000-16,000,000)
	VHACD_Params.m_maxNumVerticesPerCH = InMaxHullVerts; // Controls the maximum number of triangles per convex-hull (default=64, range=4-1024)
	VHACD_Params.m_concavity = 0;		// Concavity is set to zero so that we consider any concave shape as a potential hull. The number of output hulls is better controlled by recursion depth and the max convex hulls parameter
	VHACD_Params.m_maxConvexHulls = InHullCount;	// The number of convex hulls requested by the artists/designer
	VHACD_Params.m_oclAcceleration = false;
	VHACD_Params.m_minVolumePerCH = 0.003f; // this should be around 1 / (3 * m_resolution ^ (1/3))
	VHACD_Params.m_projectHullVertices = true; // Project the approximate hull vertices onto the original source mesh and use highest precision results opssible.
}
{% endcodeblock %}

### 意外发现盲点

突然找到一个奇怪地方: Blender插件里有一个参数叫gamma，但是对应cpp实现里没有——看了下git log才发现这货其实应该是`maxhulls`，从而发现**预编译exe版本已经非常老**了，和github上最新的代码对不上。于是自己编译了一份，发现能够在Blender中也复现出一模一样的情况了:

![](/images/blender_vhacd_new.jpg)

进一步二分定位发现，这个其实是因为VHACD的`ProjectHullVertices`功能导致的——如果禁用这个功能，就不会得到错误的效果。

## 临时解决

回到之前UE4版本，突然想起来应该是一样的问题——本质不是只生成了“上表面”，而是生成的Convex在模型内部被挡住了...切线框模式看了下果然如此

![](/images/ue4_auto_convex_wireframe.jpg)

由于`m_projectHullVertices`是代码里强行hard code，所以这个算法本身带来的BUG还不好改。暂时对于这种“规则”网格就只能直接使用最简单的包围盒策略先凑合下；不过对于稍微复杂点的模型来说，Auto Convex的结果还是不错的。