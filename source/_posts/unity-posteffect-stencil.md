---
layout: post
title: Take advantage of Stencil buffer in Post Process
date: 2015/3/7
tags: Unity
updated: 2015/12/2
toc: false
---

As I posted in {% post_link unity-sssss %} before, I cannot find a way to take advantage of stencil buffer in `OnRenderImage`. This makes the post effect full screen all the time. Other guys have come up with the same question in the [formu](http://forum.unity3d.com/threads/using-the-stencil-buffer-in-a-post-fx.222983/) or [AnswerHub](http://answers.unity3d.com/questions/621279/using-the-stencil-buffer-in-a-post-process.html). After several days hard work, I finally find a way to use stencil.

<!--more-->

Here is an example for fast Bloom:

W/O Stencil: 

![](/images/unity_pp_stencil_off.jpg)

With Stencil(Ocean Only): 

![](/images/unity_pp_stencil_on.jpg)

The key idea is keeping the depth buffer (along with stencil) when rendering, with the help of `Graphics.SetRenderTarget`. First of all, create and set the camera render target. (I also tried depth bit as 16, which makes `RenderTexture.SupportsStencil` return false, and it still works. I don't know why...)

{% codeblock lang:csharp %}
RenderTextureFormat format = RenderTextureFormat.Default;
if(SystemInfo.SupportsRenderTextureFormat(RenderTextureFormat.ARGBHalf)){
	format = RenderTextureFormat.ARGBHalf;
}
RenderTexture renderTexture = new RenderTexture(Screen.width, Screen.height, 24, format);
renderTexture.Create();
camera.targetTexture = renderTexture;

RenderTexture bloomRT0  = new RenderTexture(renderTexture.width, renderTexture.height, 0, format);
bloomRT0.Create();	//Ensure these two RT have the same size
{% endcodeblock %}

Instead of downsample in `OnRenderImage`, we have to `Blit` in `OnPostRender`
{% codeblock lang:csharp %}
public void OnPostRender(){
	postProcessingMaterial.SetPass(1);

	bloomRT0.DiscardContents();
	Graphics.SetRenderTarget(bloomRT0);
	GL.Clear(true, true, new Color(0,0,0,0));	// clear the full RT
	// *KEY POINT*: Draw with the camera's depth buffer
	Graphics.SetRenderTarget(bloomRT0.colorBuffer, renderTexture.depthBuffer);
	Graphics.Blit(renderTexture, postProcessingMaterial, 1);
}
{% endcodeblock %}

The shaderlab side is quite simple, and you can find many resources online. Here are two code snippets:

Ocean Shader
{% codeblock lang:GLSL %}
Stencil {
	Ref 2
	Comp Always
	Pass replace
}
{% endcodeblock %}

Post Processing Shader
{% codeblock lang:GLSL %}
Stencil{
	Ref 2
	ReadMask 2
	Comp Equal
}
{% endcodeblock %}

ps. You could try draw to screen directly, without setting an extra `renderTexture`. Currently I am combining some Post Process together, along with dynamic resolution, which makes this unavoidable.

![](/images/unity_postprocesschain.jpg)
