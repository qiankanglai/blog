---
layout: post
title: pomelo调试心得
date: 2014/9/15
tags: [JavaScript,pomelo]
---

最近被pomelo的一个bug搞的心力憔悴，之前本地开发和阿里云环境上都是好好的，但是在另一套环境下时不时就挂。为了这个问题加起来折腾了好几天，今天终于算处理掉了(虽然还没从根子上解决)。写篇文章记录一下思路和解决方案。

<!--more-->

# 初步定位

之前接到的反馈是pomelo中的一类backend server过几天就会失去响应，需要重启之后才能继续运行。因此先从最基本的地方开始一步步定位问题。用了俩常见命令：

- `pomelo list` 查看发现服务器进程都很正常
- `netstat -ap|grep xxx` 查看端口是否被node占用

发现这两个都ok的样子。当程序挂起的时候，无论是自己写的http模块，或者是原生的connector都无法响应，直接rpc超时。但是其他pomelo server都十分正常。

# 尝试复现

由于暂时没有别的思路，所以先开始尝试复现这个问题。因为开发环境里有webstorm，所以如果能在本机复现无疑能大大降低解决问题难度。

首先确保开发机环境和生产环境相同的情况下(包括node版本，pomelo等npm仓库，代码版本)，模拟请求本机，发现挂了两天都很正常；然后用压力测试工具模拟大量请求，也没有任何问题。

ps. 中间曾出现了一段时间的失去响应，后来发现是本机的另一个程序占用了端口……改回来就好了，白高兴一场。

# 继续定位(c++)

看了论坛上帖子[服务器运行一段时间侯，客户端就无法链接了，报ECONNRESET错！](http://nodejs.netease.com/topic/530ca6efd7cfa4bd3d86bfdd)，按照帖子中的回复检查一下v8引擎是否正常工作：

{% codeblock lang:bash %}
> sudo gdb
(gdb) attach 4186
(gdb) bt
#0  0x00007f7152ca7619 in syscall () from /lib/x86_64-linux-gnu/libc.so.6
#1  0x000000000097328a in uv__epoll_wait (epfd=<optimized out>, events=<optimized out>, nevents=<optimized out>, timeout=<optimized out>) at ../deps/uv/src/unix/linux-syscalls.c:282
#2  0x0000000000971a28 in uv__io_poll (loop=0xe7fa80, timeout=1000) at ../deps/uv/src/unix/linux-core.c:187
#3  0x0000000000965558 in uv_run (loop=0xe7fa80, mode=<optimized out>) at ../deps/uv/src/unix/core.c:317
#4  0x000000000081cfe0 in node::Start(int, char**) ()
#5  0x00007f7152bd876d in __libc_start_main () from /lib/x86_64-linux-gnu/libc.so.6
#6  0x000000000058d5b1 in _start ()
{% endcodeblock %}

{% codeblock lang:bash %}
> sudo strace -p 4186 
clock_gettime(CLOCK_MONOTONIC, {12498531, 474744851}) = 0
epoll_wait(5, {}, 1024, 396)            = 0
clock_gettime(CLOCK_MONOTONIC, {12498531, 871268177}) = 0
clock_gettime(CLOCK_MONOTONIC, {12498531, 871300395}) = 0
futex(0x7f6b1c0008c8, FUTEX_WAKE_PRIVATE, 1) = 1
clock_gettime(CLOCK_REALTIME, {1410747202, 464533490}) = 0
futex(0xe7fe24, FUTEX_WAKE_OP_PRIVATE, 1, 1, 0xe7fe20, {FUTEX_OP_SET, 0, FUTEX_OP_CMP_GT, 1}) = 1
futex(0xe7fde0, FUTEX_WAKE_PRIVATE, 1)  = 1
clock_gettime(CLOCK_REALTIME, {1410747202, 464742281}) = 0
{% endcodeblock %}

和正常的pomelo server比较了下发现也是没问题的。

# 继续定位(JS)

整理一下思路：目前问题表现在服务器失去响应；但是此时这个server上挂载的express模块也在正常工作，而且`pomelo list`能显示说明至少和master的交互是没问题的，不然早被restart了。

进一步分析发现，主要是涉及到去调用pomelo server就超时(其实是没有响应)，因此考虑能不能在服务器上直接进行调试。论坛里@wangyx提到的node-inspector工具需要之前设置好，类似的还有利用`longjohn`来打log的方法。但是由于这个bug只能在线上环境显示，而且需要几天才会出现，因此我希望能够直接利用线上出问题的server直接调试就好了。

最后发现node自带了一个debugger

- http://nodejs.org/api/debugger.html
- http://offthelip.org/2012/08/22/debugging-a-running-node-js-process/

首先通过`sudo kill -s USR1 pid`指令向这个node server发送信号，然后用`node debug 127.0.0.1:5858`就可以连上了！使用方法基本和gdb是一样的：

![](/images/node_debug.jpg)

常见指令列表：

- `c` 继续 continue
- `n` 下一行 step next
- `s` 进入函数 step in
- `o` 跳出函数 step out
- `sb('server.js', 73)` 给server.js的73行加断点。如果有多个同名文件的话会提示，这时候可以写长路径例如`'pomelo/lib/server/server.js'`这样的

最后发现其实是之前参考论坛大神@roytan的帖子，我弄的流控插件有点问题……具体还需要再查查，不过关闭之后没出现丢失响应了。

最后吐槽pomelo官方团队不是很好联系上-.-