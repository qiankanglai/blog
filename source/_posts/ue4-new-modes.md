---
title: Modes面板添加自定义Class
date: 2019-09-04 10:07:31
tags:
---

纯笔记。昨天尝试往Modes面板添加了自定义的AActor，直接参考[[UE4] レベルエディタの配置ツールに独自の項目とアセットを追加する方法](http://historia.co.jp/archives/10875/)里的代码实现:

<!--more-->

{% codeblock lang:cpp %}
void FMyPluginModule::StartupModule()
{
	int Priority = 45;
	FPlacementCategoryInfo Info(
		LOCTEXT("MyCategory", "MyCategory"),
		"MyCategory",
		TEXT("PMMyCategory"),
		Priority
	);
	IPlacementModeModule::Get().RegisterPlacementCategory(Info);
	IPlacementModeModule::Get().RegisterPlaceableItem(Info.UniqueHandle, MakeShareable(new FPlaceableItem(nullptr, FAssetData	(AMyActor::StaticClass()))));
}
 
void FMyPluginModule::ShutdownModule()
{
	if (IPlacementModeModule::IsAvailable())
	{
		IPlacementModeModule::Get().UnregisterPlacementCategory("Video");
	}
}
{% endcodeblock %}

结果华丽丽遇到崩溃

![](/images/ue4_new_modes.png)

大概看了下是初始化顺序导致的，改一发uplugin定义

{% codeblock lang:json %}
"Modules": [
    {
      "Name": "xxx",
      "Type": "Editor",
      "LoadingPhase": "PostEngineInit"
    }
  ],
{% endcodeblock %}

改定之后才发现日文博客里有提到这个(卒)

> プラグインが作成できたら、プラグイン名.upluginファイルを開き、ModulesのTypeを”Runtime”から”Editor”にLoadingPhaseを”Default”から”PostEngineInit”に変更します。