---
layout: post
title: Jenkins自动化出包流程分享
date: 2016/8/25
tags: Unity
thumbnail: /images/teaser/jenkins_list.jpg
---

目前我司所有Unity项目已经全部部署在Jenkins服务器上，实现一键自动出包+自动上传Test Flight。

<!--more-->

这么做有两个好处：

- 保持出包环境一致，所有流程自动化，避免人为操作带来的问题；
- 方便偷懒...而且出包机器是一台28核56线程的黑苹果(某宝万能） ~~以后还能拿来跑Swarm~~

# Jenkins安装配置

`brew install jenkins`之后，根据需要修改下`homebrew.mxcl.jenkins.plist`:

{% codeblock lang:xml %}
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>homebrew.mxcl.jenkins</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>JENKINS_HOME</key>
        <string>/Volumes/macdata/jenkins</string>
    </dict>
    <key>ProgramArguments</key>
    <array>
      <string>/usr/bin/java</string>
      <string>-Dmail.smtp.starttls.enable=true</string>
      <string>-jar</string>
      <string>/usr/local/opt/jenkins/libexec/jenkins.war</string>
      <string>--httpPort=8080</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
  </dict>
</plist>
{% endcodeblock %}

我的配置里修改了Jenkins数据目录以及监听外网8080端口。

# Jenkins编译Unity

这部分网上有不少现成的资料，我主要参考了[Jenkins 集成Unity3D Xcode](http://www.cnblogs.com/qingjoin/p/3944392.html)。

Unity其实是在命令行模式下调用一个静态方法，实现具体的逻辑。我司维护了一套公用的SDK切换工具，会从命令行读取更多的参数，实现诸如刷新Plugins文件夹内容、切换宏、修改图标/版本号/配置文件等、加密数据这些功能。

![](/images/sgplugins_thirdpartysdk.jpg)

Android版本直接就出了apk，iOS版本还需要调用XCode。最后编译完了之后，调用Shell将包加上时间戳归档。

ps. 调用`BuildPipeline.BuildPlayer`的时候一定要检查返回值，因为当C#代码出错的时候，Unity会自动使用之前编译的dll；这种情况下ret code是0，Jenkins无法发现这里出错了，只会埋头继续运行...

pss. XCode Plugin可以在Custom xcodebuild arguements里加一行`DEPLOYMENT_POSTPROCESSING=YES`

# 自动上传Test Flight

主要参考了[详解Shell脚本实现iOS自动化编译打包提交](http://www.jianshu.com/p/bd4c22952e01)一文，其实就是`altool`的调用。之前说了包的文件名是有时间戳的，因此可以排序之后找到最新的一个包，调用上传即可。

![](/images/jenkins_upload_testflight.jpg)

![](/images/jenkins_upload_testflight2.jpg)
