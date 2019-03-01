---
layout: post
title: HDRShop和CubeManGen生成环境贴图
date: 2014/12/21
tags: [Unreal,Unity]
---

上周业余时间除了搞了搞KlayGE之外，还尝试用Unity山寨UE4的PBR，在对比的时候发现两个引擎各种细节还是差距挺大的。同样是材质的预览窗口，UE4自带了HDR、Tone Mapping和环境贴图：下图左边是UE4材质编辑器的预览，可以看到有比较清晰的天空反射；右边是山寨货在Unity里的效果(参数还得再调，边缘fresnel有点过强了，可能是后处理带来的)。

<!--more-->

![](/images/lightprobe_compare.jpg)

ps. 最近真是发现要用点啥都找不到靠谱的资料，莫非最近使用google搜索的能力变差了，真是心塞-.- 不过搞懂之后发现这俩工具还是很灵的~

# 扒取UE4贴图

这个比较简单，直接搜了下UE4的MaterialEditor部分代码，就找到了

{% codeblock lang:cpp %}
struct FConstructorStatics
{
  ConstructorHelpers::FObjectFinder<UStaticMesh> EditorCubeMesh;
  ConstructorHelpers::FObjectFinder<UStaticMesh> EditorSphereMesh;
  ConstructorHelpers::FObjectFinder<UStaticMesh> EditorCylinderMesh;
  ConstructorHelpers::FObjectFinder<UStaticMesh> EditorPlaneMesh;
  ConstructorHelpers::FObjectFinder<UStaticMesh> EditorSkySphereMesh;
  ConstructorHelpers::FObjectFinder<UMaterial> FloorPlaneMaterial;
  ConstructorHelpers::FObjectFinder<UTextureCube> DaylightAmbientCubemap;
  FConstructorStatics()
    : EditorCubeMesh(TEXT("/Engine/EditorMeshes/EditorCube"))
    , EditorSphereMesh(TEXT("/Engine/EditorMeshes/EditorSphere"))
    , EditorCylinderMesh(TEXT("/Engine/EditorMeshes/EditorCylinder"))
    , EditorPlaneMesh(TEXT("/Engine/EditorMeshes/EditorPlane"))
    , EditorSkySphereMesh(TEXT("/Engine/EditorMeshes/EditorSkySphere"))
    , FloorPlaneMaterial(TEXT("/Engine/EditorMaterials/Thumbnails/FloorPlaneMaterial"))
    , DaylightAmbientCubemap(TEXT("/Engine/MapTemplates/Sky/DaylightAmbientCubemap"))
  {
  }
};
{% endcodeblock %}

对应即`Engine\Content\MapTemplates\Sky\DaylightAmbientCubemap.uasset`，这种蛋疼的uasset在之前的日志{% post_link unreal-resources %}中已简单分析过。这次的比较简单，随便拷贝到一个Unreal项目文件夹下，然后引擎会自动读取，右键Export就可以得到一个HDR格式的资源文件。

这一步导出的文件可以直接用Photoshop打开，但还不是常见的六个面cube texture，需要再次转换。之前搜了一通都是语焉不详的零散介绍，英文资料里就一个CryEngine的文档比较靠谱，但也就提到了CubeMapGen和HDRShop，没具体看懂怎么用。于是一通摸索……

# HDRShop

这个工具目前是收费的(而且还挺贵-v-)，不过网上有V1版本的免费版、虽然官网上的已经没对应下载链接了。这个工具主要是将各种形式的图片相互转换。打开Image-Panorama-Panoramic Transformations，输入图片设为Latitude/Longitude, 输出图片设为Cubic Environment。将Wrap过的图片保存即可。

![](/images/lightprobe_hdrshop.jpg)

需要注意的是修改Width/Height, 保证生成的每个小贴图的长宽相同、都是4的倍数，不然在最后倒入的时候可能遇到麻烦。下图为生成的结果，每个小的正方形是256x256，所以变换的时候是3\*256x4\*256即768x1024。

此外，经过桌子提醒这个贴图的顶部出现了菊花，我查了下UE4里自己就有嘿嘿~其实最简单的办法是抹掉原图最上面一条，这样变换之后顶部中心没内容就好。

![](/images/lightprobe_ue4.jpg)

![](/images/lightprobe_hdrshop_cubecross.jpg)

顺便解释一下这几种可以相互转换的格式，部分参考[这个教程](http://www.cicw.org/bbs/read.php?tid=333&page=2)：

- Latitude/Longitude: 就是从UE4扒拉出来的输入图，横纵坐标对应的经纬度，再举个栗子就是[世界地图](http://en.wikipedia.org/wiki/Geographic_coordinate_system)；
![](/images/lightprobe_Earthmap720x360_grid.jpg)
- Cubic Environment: 使用六张图组成的环境贴图，参考刚才的输出图，不过和我们平常用的一横条六个图不一样，这里是组成了一个Vertical Cross(竖十字架)；
- Mirrored Ball: 反光球
![](/images/lightprobe_hdrshop_mirrorball.jpg)
- Light Probe: 光探针
![](/images/lightprobe_hdrshop_lightprobe.jpg)

可以看到后两种的映射方式其实是不一样的，细节等有心情再补

# CubeManGen

将上一步生成的Cubic Environment(cross)，导入到CubeManGen里，再导出就能得到我们需要的格式: 在右边点Load Cube Cross导入，然后点Save CubeMap(.dds)~注意检查下纹理大小和格式

![](/images/lightprobe_cubemangen1.jpg)

此外！CubeManGen还有两个很实用的功能：

- MipMap模糊: 这个在PBR里很有用，因为模拟Roughness直接在mipmap上采样就行了，我一般是在右边选项蓝色模块里设置Gaussian Filter+30 Base Filter Angle
- Edge Fixup: 因为cubemap是六个图贴起来的，所以如果直接各自模糊会导致边缘出现问题，这里勾上可以修一下

对比图(MipMap开的比较高)：
![](/images/lightprobe_cubemangen2.jpg)

# Unity

从4.6开始，Unity支持直接导入cube格式的dds纹理。话说这里我还踩过雷，桌子说他在Windows的Unity上能导入，但是我在OSX下死活不行，而且我打开他的工程竟然也可以-.- 一开始以为是引擎bug，最终发现我用的4.5他用的4.6，累再不爱QAQ

导入之前记得确认dds格式以及大小，不然可能导入的时候导致Unity崩溃(细节差距啊)~导入之后确认下有MipMap勾上了

![](/images/lightprobe_unity3d.jpg)