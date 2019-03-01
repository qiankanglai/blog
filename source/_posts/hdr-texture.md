---
title: HDR纹理一二坑
date: 2018-07-22 12:21:14
tags: [Unity]
---

最近在Unity里重新校正了下Diffuse SH9和Specular IBL，全套对着[cmft](https://github.com/dariomanesku/cmft)校正了下...发现不少坑，仅此记录。

<!--more-->

## RGBM编码

这个是遇到的最大的坑：Unity原生支持EXR/HDR贴图，可以`GetPixels()`获得颜色值，但是获取出来的是RGBM Encode过的，更扯淡的是获取到的颜色是**Gamma过的**。这就带来一个潜藏的坑：**最大亮度只到5**；所以之后为了更高的精度应该会用别的C#库直接读取exr。

{% codeblock lang:csharp %}
public static Color DecodeRGBM(Color color, float multiplier = 5, float gamma = 2.2f)
{
    float r = color.r * color.a * multiplier;
    float g = color.g * color.a * multiplier;
    float b = color.b * color.a * multiplier;
    if (gamma > 0)
    {
        r = Mathf.Pow(r, gamma);
        g = Mathf.Pow(g, gamma);
        b = Mathf.Pow(b, gamma);
    }
    return new Color(r, g, b, 1);
}
{% endcodeblock %}

之前一直被坑是因为显示上和Photoshop一致，导致我以为值应该没问题才对。

![](/images/hdr_texture_photoshop.jpg)

后来对比了下UE4直接就是强制非sRGB(谁能告诉我>1的纹理为什么需要Gamma??)

![](/images/hdr_texture_ue4.jpg)

ps. Unity自己卷积出来的Specular (Glossy)亮度上是没问题的，但是看颜色有一些奇怪的色偏...暂时还没精力去进一步校正。

再ps. 关于最大亮度的问题目前其实歪打正着，因为我本来就需要截断高亮度的光源(毕竟还有直接光部分的平行光)；后面要做的是根据别截断部分去恢复平行光方向和亮度。

## SphericalHarmonics到参数

用FrameDebugger抓渲染参数的时候，会发现`unity_SHAr`等系列参数和传进去的SphericalHarmonics有细微不同，原因是有些计算在CPU端完全可以做了。参考[LightProbeUtility.cs](https://github.com/keijiro/LightProbeUtility/blob/master/Assets/LightProbeUtility.cs)弄了下(原代码有一些细节问题)

{% codeblock lang:csharp %}
static void DumpSphericalHarmonicsL2(SphericalHarmonics sh)
{
    for (int i = 0; i < 3; i++)
        Debug.Log(new Vector4(sh[i, 3], sh[i, 1], sh[i, 2], sh[i, 0] - sh[i, 6]).ToString("F3"));
    for (int i = 0; i < 3; i++)
        Debug.Log(new Vector4(sh[i, 4], sh[i, 5], sh[i, 6] * 3, sh[i, 7]).ToString("F3"));
    Debug.Log(new Vector4(sh[0, 8], sh[1, 8], sh[2, 8], 1).ToString("F3"));
}
{% endcodeblock %}