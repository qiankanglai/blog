---
layout: post
title: pomelo php client
date: 2014/10/29
tags: [JavaScript,pomelo,PHP]
---

** This is depecrated since pomelo is only supporting libpomelo2 with various bindings. I've removed the github repo and you may find the archive here([Download](/downloads/pomelo-php-client-master.zip)).**

<!--more-->

PHP client lib for pomelo (hybridconnector). This work is inspired by [jzsues's Java implemention](https://github.com/jzsues/pomelo-websocket-java-client). 

# Requirements

The implemention is under [Swoole](http://www.swoole.com/) for better socket support. Please follow the [Installation Instructions](http://wiki.swoole.com/wiki/page/6.html). No other third party libraries are needed.

Test under ubuntu 13.10 & Mac OSX 10.9.

# Usage

details in `test.php`

- `connect()`
- `onConnect`, `onError`, `onKick`, `onClose`
- `request`, `listen`

# TODO

Currently this client lib does not support protobuf yet. I'll finish it when I'm free.