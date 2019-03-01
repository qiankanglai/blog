---
layout: post
title: Unity中光照贴图一二坑及解决办法
date: 2015/7/27
tags: Unity
---

Lightmap(光照贴图)是Unity里很常用的一个功能，毕竟移动设备上实时光照不靠谱，要出效果还是得烘焙。但是在使用中发现了几坑的地方，通过自己写了个两个脚本就轻松搞定，这里分享下。

<!--more-->

# 异步加载场景

这个其实还是挺常见的坑：在编辑器里烘焙+播放场景都没问题，但是当从别的场景利用**异步加载**方式切换之后，就发现场景里的效果一团糟。下图是我使用`Application.LoadLevelAdditiveAsync`切换后的效果：

![](/images/unity_lightmap_bug1.jpg)

如果是同步的加载场景倒是没有这个问题，但是实际游戏一般也不会让玩家卡住等待一段时间。这个问题在官方论坛和issue tracker上都有人提及，产生的原因是切换场景之后无法自动切换该场景使用的lightmap数据，具体可以参考`UnityEngine.LightmapSettings`相关API。

解决办法也很简单，我实现了一个小脚本，挂在场景中；当场景载入完成，这个物体会在`Start()`中自动刷新当前的光照贴图设置。为了美术方便，脚本能够在每次场景烘焙完之后自动保存新的光照贴图设置，这样就避免了手动操作。

{% codeblock lang:csharp %}
using UnityEngine;

[ExecuteInEditMode]
public class SerializedLightmapSetting : MonoBehaviour
{
    [HideInInspector]
    public Texture2D []lightmapFar, lightmapNear;
    [HideInInspector]
	public LightmapsMode mode;

#if UNITY_EDITOR
    public void OnEnable()
    {
        //Debug.Log("[SerializedLightmapSetting] hook");
        UnityEditor.Lightmapping.completed += LoadLightmaps;
    }
    public void OnDisable()
    {
        //Debug.Log("[SerializedLightmapSetting] unhook");
        UnityEditor.Lightmapping.completed -= LoadLightmaps;
    }
#endif

	public void Start ()
    {
        if(Application.isPlaying)
        {
            LightmapSettings.lightmapsMode = mode;
            int l1 = (lightmapFar == null) ? 0 : lightmapFar.Length;
            int l2 = (lightmapNear == null) ? 0 : lightmapNear.Length;
            int l = (l1 < l2) ? l2 : l1;

            LightmapData[] lightmaps = null;
            if (l > 0)
            {
                lightmaps = new LightmapData[l];
                for (int i = 0; i < l; i++)
                {
                    lightmaps[i] = new LightmapData();
                    if (i < l1)
                        lightmaps[i].lightmapFar = lightmapFar[i];
                    if (i < l2)
                        lightmaps[i].lightmapNear = lightmapNear[i];
                }
            }
            LightmapSettings.lightmaps = lightmaps;

            Destroy(this);
        }
	}

#if UNITY_EDITOR
    public void LoadLightmaps()
    {
        mode = LightmapSettings.lightmapsMode;
        lightmapFar = null;
        lightmapNear = null;

        if (LightmapSettings.lightmaps != null && LightmapSettings.lightmaps.Length > 0)
        {
            int l = LightmapSettings.lightmaps.Length;
            lightmapFar = new Texture2D[l];
            lightmapNear = new Texture2D[l];
            for (int i = 0; i < l; i++)
            {
                lightmapFar[i] = LightmapSettings.lightmaps[i].lightmapFar;
                lightmapNear[i] = LightmapSettings.lightmaps[i].lightmapNear;
            }
        }

		MeshLightmapSetting[] savers = GameObject.FindObjectsOfType<MeshLightmapSetting>();
		foreach(MeshLightmapSetting s in savers)
        {
            s.SaveSettings();
        }
    }
#endif
}
{% endcodeblock %}

ps. 这里额外提一个坑的地方：一开始我想避免使用`MonoBehavior`这种比较笨重的东西来保存数据，然后参考了Unity官方博客里的`ScriptableObject`。结果尝试了一下午发现博客中的代码压根不起作用，感觉就是从头就写错了...

ps2. 编辑器提供的API还是挺方便的~最早版本的脚本每次烘焙完之后需要美术手动保存光照贴图设置，总是会忘，现在改成自动的就好多了。

# Prefab化物体

在前面代码中有几行涉及到了`MeshLightmapSetting`，这个其实就是设计了第二个问题：利用`Instantiate`实例化的prefab的光照贴图也是一团糟，只有始终在场景里的物体才是正常的。

这个问题的本质原因是，prefab物体的光照贴图信息其实是保存在场景文件里，而不是对应的prefab中；这样以后当场景中有一个prefab的多个实例时，引擎能找到对应的光照贴图位置。但是实际项目中，为了提高场景的加载速度，我们的物体基本全是在代码里加载的，避免了加载场景时就同时加载了一堆prefab，所以就导致光照贴图全跪。

找到原因之后，就比较好解决了——既然引擎不保存，我可以手动保存一份就行了：

{% codeblock lang:csharp %}
using UnityEngine;

[ExecuteInEditMode]
[RequireComponent(typeof(Renderer))]
public class MeshLightmapSetting : MonoBehaviour {
	[HideInInspector]
	public int lightmapIndex;
	[HideInInspector]
	public Vector4 lightmapScaleOffset;
	
	public void SaveSettings()
	{
		Renderer renderer = GetComponent<Renderer>();
		lightmapIndex = renderer.lightmapIndex;
		lightmapScaleOffset = renderer.lightmapScaleOffset;
	}

	public void LoadSettings()
	{
		Renderer renderer = GetComponent<Renderer>();
		renderer.lightmapIndex = lightmapIndex;
		renderer.lightmapScaleOffset = lightmapScaleOffset;
	}
	
	void Start () {
		LoadSettings();
		if(Application.isPlaying)
			Destroy(this);
	}
}
{% endcodeblock %}

其实从这两点出发，可以更加灵活的使用光照贴图：

- 美术在不同光照条件下烘焙的lightmap保存起来，然后在运行时利用第一个脚本的思路切换，就实现了天气系统；
- 通过设置模型renderer的属性，可以使得不同物体复用(当然你得真正理解清楚光照贴图)；

之后有机会的话，我会再整理下利用prefab加速场景加载的话题，目前单个场景从未优化的14s左右降到4s左右~