---
layout: post
title: 奇怪的Git实践
date: 2017/3/2
toc: false
---

最近在做一些奇怪的事情...主要是老项目太大导致sourcetree卡，想了想用一个鸡贼的方法就是直接归档历史然后另起一个新项目。

<!--more-->

首先尝试直接复制项目出来，发现不行...主要是submodule信息丢了～然后网上找了一个很鸡贼的方法：

说穿了比较简单，先找到历史上第一个commit然后soft reset过去，最后amend last commit覆盖到第一个commit即可

{% codeblock lang:bash %}
git rev-list --max-parents=0 --abbrev-commit HEAD
git reset --soft xxxx
{% endcodeblock %}

然后参考[How to remove unused objects from a git repository?](http://stackoverflow.com/questions/3797907/how-to-remove-unused-objects-from-a-git-repository)清理下本地仓库，推送到新的远程仓库即可...

后来还在尝试lfs相关，看看能不能在项目里用起来(将老项目转换过去)，结果发现了不少坑：

- 网上不少资料[Use BFG to migrate a repo to Git LFS](https://confluence.atlassian.com/bitbucket/use-bfg-to-migrate-a-repo-to-git-lfs-834233484.html#UseBFGtomigratearepotoGitLFS-A.ConverttheexistingfilesinyourrepotoGitLFS), [convert exsisting git repository to git-lfs](http://stackoverflow.com/questions/35166077/convert-exsisting-git-repository-to-git-lfs)都推荐用BFG这个工具，但是用了下发现这货会在每个文件夹下生成lfs配置，完全没法用。后来看github文档发现应该用[git-lfs-migrate](https://github.com/bozaro/git-lfs-migrate)这货...
- 因为我本地项目非常大，转换完了之后推送出现了`error: unable to rewind rpc post data - try increasing http.postBuffer`，要用` git config --global http.postBuffer`绕开
- 推送到gitlab之后发现服务器上多个lfs项目竟然是共用文件夹，而且删除项目之后lfs objects依然存在...开发者表示这些功能以后会加
- 重新checkout的时候有概率发生lfs 404...蛋疼
- 打开git lfs之后发现这玩意儿平常都占了不少硬盘访问资源，依然不知道为啥...

综上，感觉自己打开方式不太对，准备过段时间等等再说(逃