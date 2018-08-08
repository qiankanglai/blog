---
layout: post
title: glloader代码阅读笔记
date: 2015/3/28
tags: KlayGE
---

(准备慢慢把之前移植KlayGE过程中的笔记整理出来，估计先梳理完几个子项目，然后按照模块和例子写个系列吧...主要记录思路和一些学习体会~)

<!--more-->

[glloader](http://www.klayge.org/category/klayge/glloader/)是一个跨平台的OpenGL扩展库，可以拿来载入OpenGL 1.0-4.2，OpenGL ES 1.0-2.0，同时也支持WGL、GLX、EGL和其他GL/GLES扩展。目前windows/linux/darwin及iOS/Android都可以使用，拿来做跨平台的项目非常方便，封装掉了不同平台的GL细节；另一个牛逼的地方在于可以通过维护xml，来保持这个项目与最新的spec一致。下面主要分两块来看：一个是基于xml描述的registry，另一个则是跨平台的载入机制。

# GL registry

[OpenGL Registry](https://www.opengl.org/registry/)里定义的spec在glloader里是通过维护[一堆xml](https://github.com/gongminmin/KlayGE/tree/master/glloader/xml)实现的，然后通过调用`autogen.py`生成不同的代码文件。下面举个栗子来说明\_(:з」∠)\_

[EGL_EXT_device_base.xml](https://github.com/gongminmin/KlayGE/blob/master/glloader/xml/EGL_EXT_device_base.xml)对应了[EGL_EXT_device_base](https://www.khronos.org/registry/egl/extensions/EXT/EGL_EXT_device_base.txt)这个registry；这个文件本身也很容易看懂，定义了2个typedef、3个token和4个function(包括每个函数的函数名、返回值和参数列表)。这些内容会被对应的写入到`glloader_egl.h`和`glloader_egl.c`中：

- typedef部分(头文件):
{% codeblock lang:c %}
typedef void* EGLDeviceEXT;
typedef intptr_t EGLAttrib;
{% endcodeblock %}
- token部分(头文件):
{% codeblock lang:c %}
#define EGL_NO_DEVICE_EXT ((EGLDeviceEXT)0)
#define EGL_BAD_DEVICE_EXT 0x322B
#define EGL_DEVICE_EXT 0x322C
{% endcodeblock %}
- function部分(头文件):
{% codeblock lang:c %}
typedef EGLBoolean (GLLOADER_APIENTRY *eglQueryDeviceAttribEXTFUNC)(EGLDeviceEXT device, EGLint attribute, EGLAttrib* value);
extern GLLOADER_API eglQueryDeviceAttribEXTFUNC eglQueryDeviceAttribEXT;
{% endcodeblock %}
- function部分(源文件):
{% codeblock lang:c %}
static EGLBoolean GLLOADER_APIENTRY self_init_eglQueryDeviceAttribEXT(EGLDeviceEXT device, EGLint attribute, EGLAttrib* value)
{
	glloader_init();
	return eglQueryDeviceAttribEXT(device, attribute, value);
}
eglQueryDeviceAttribEXTFUNC eglQueryDeviceAttribEXT = self_init_eglQueryDeviceAttribEXT;
{% endcodeblock %}

token/typedef这两种都很直观，主要是function部分稍微有点绕：OpenGL API本质上是一堆函数指针，最开始默认情况下`eglQueryDeviceAttribEXT`指向了`self_init_eglQueryDeviceAttribEXT`，当第一次调用这个函数的时候，会到`glloader_init()`里，然后调用`egl_init()`，接着是这个函数:
{% codeblock lang:c %}
void init_EGL_EXT_device_base()
{
	glloader_EGL_EXT_device_base = _glloader_EGL_EXT_device_base;

	{
		eglQueryDeviceAttribEXT = NULL;
		eglQueryDeviceStringEXT = NULL;
		eglQueryDevicesEXT = NULL;
		eglQueryDisplayAttribEXT = NULL;
	}

	_EGL_EXT_device_base = 0;
	if (glloader_is_supported("EGL_EXT_device_base"))
	{
		_EGL_EXT_device_base = 1;

		LOAD_FUNC1(eglQueryDeviceAttribEXT);
		LOAD_FUNC1(eglQueryDeviceStringEXT);
		LOAD_FUNC1(eglQueryDevicesEXT);
		LOAD_FUNC1(eglQueryDisplayAttribEXT);
	}
}
{% endcodeblock %}
通过`LOAD_FUNC1`这个宏，将`eglQueryDeviceAttribEXT`赋值为真正OpenGL函数对应的函数指针。按照我的理解，这里其实是做了一个Lazy Initialization：一开始所有GL函数都是指向glloader里的`self_init_`，当第一次使用的时候初始化相关函数指针，之后就直接访问系统的GL了。这么设计可能是因为需要实现动态加载GL，没法直接编译链接上系统的GL；而且GL Context是程序启动之后才建立的。

ps. 这部分还漏介绍了Mapping，不过很简单就不管了...

# 载入机制

前面通过xml和`autogen.py`，实现了从OpenGL Registry生成对应的函数接口和相关声明。至于具体的载入机制，也就是`LOAD_FUNC1`这个东西需要看`glloader.h`和`util.c`:

## glloader.h

这个比较简单，根据系统相关的宏，判断支持哪些扩展以及声明一些类型。

## util.c

在不同系统下，都有一套动态加载的机制。windows对应的是`LoadLibraryExA/GetProcAddress`，linux/darwin下是`dlopen/dlsym`。需要注意的是iOS/Android这种移动平台上必须静态链接，不过可以用类似的方法来获取函数指针。通过这个机制，就可以实现前面一小节所说的`LOAD_FUNC1`:

{% codeblock lang:c %}
#define LOAD_FUNC1(f) f = (f##FUNC)(glloader_get_gl_proc_address(#f));
void* glloader_get_gl_proc_address(const char* name)
{
	void* ret = get_gl_proc_address_by_dll(name);
	if (NULL == ret)
	{
		ret = get_gl_proc_address_by_api(name);
	}
	return ret;
}
{% endcodeblock %}

其中`get_gl_proc_address_by_dll`这个函数是直接尝试从`opengl32.dll`或`libGL.so`等动态链接库里获取函数指针，而`get_gl_proc_address_by_api`是使用GL扩展里的方法获取函数，例如`eglGetProcAddress`、`CFBundleGetFunctionPointerForName`等。这里不同平台需要各自写，略微有点麻烦~

# 小结

glloader里的XML其实可以视作一个小的DSL，配合python脚本转化到C代码，最大的好处就是易于维护、扩展；此外，通过实现一个跨平台的载入机制，将不同平台的细节包装起来，对使用者来说只要引入glloader头文件之后直接调用API即可，还是挺方便的...