---
layout: post
title: Compile libcurl 7.37.0 with Android 4.4 or other versions
date: 2014/8/31
tags: [C++,cocos2d-x,Android]
---

Recently I need compile libcurl for different platforms, since cocos-2dx 3.0 ships with libcurl 7.26.0 and there are several fixes in newer versions according to [changelog](http://curl.haxx.se/changes.html). There are several blogs describing how to build libcurl with android source, such as [porting-of-libcurl-to-android-os-using](http://thesoftwarerogue.blogspot.com/2010/05/porting-of-libcurl-to-android-os-using.html), [How_to_compile_libcurl](http://www.cocos2d-x.org/wiki/How_to_compile_libcurl) and [Android ndk下编译libcurl](http://blog.csdn.net/ly131420/article/details/9177063). However, they are all out dated, especially android source has changed a lot!

<!--more-->

After struggling a whole weekend, I finally compiled libcurl 7.37.0 with android 4.4 source. The steps described in `packages/Android/Android.mk` skip many details. I'll explain every steps and hope you can make it. If you use the similar version, you could just copy & paste mine.

# Build Environment (Android 4.4)

Follow instructions in [Download and Building](https://source.android.com/source/building.html) and build android first. If you encounter connecting problems in China, you may refer to {% post_link android-GFW %}. My android source folder is put at `/home/anthony/android`.

![](/images/android.jpg)

# Generate LIBS

In order to determine which libs are needed, we first make an execuable library to see arguments passed in. Run `make dhcpcd showcommands` at `/home/anthony/android`, and we will get this in terminal output:

{% codeblock lang:bash %}
prebuilts/gcc/linux-x86/arm/arm-linux-androideabi-4.8/bin/arm-linux-androideabi-g++ -nostdlib -Bdynamic -pie -Wl,-dynamic-linker,/system/bin/linker -Wl,--gc-sections -Wl,-z,nocopyreloc  -Lout/target/product/generic/obj/lib -Wl,-rpath-link=out/target/product/generic/obj/lib out/target/product/generic/obj/lib/crtbegin_dynamic.o         out/target/product/generic/obj/EXECUTABLES/dhcpcd_intermediates/arp.o out/target/product/generic/obj/EXECUTABLES/dhcpcd_intermediates/bind.o out/target/product/generic/obj/EXECUTABLES/dhcpcd_intermediates/common.o out/target/product/generic/obj/EXECUTABLES/dhcpcd_intermediates/control.o out/target/product/generic/obj/EXECUTABLES/dhcpcd_intermediates/dhcp.o out/target/product/generic/obj/EXECUTABLES/dhcpcd_intermediates/dhcpcd.o out/target/product/generic/obj/EXECUTABLES/dhcpcd_intermediates/duid.o out/target/product/generic/obj/EXECUTABLES/dhcpcd_intermediates/eloop.o out/target/product/generic/obj/EXECUTABLES/dhcpcd_intermediates/if-options.o out/target/product/generic/obj/EXECUTABLES/dhcpcd_intermediates/if-pref.o out/target/product/generic/obj/EXECUTABLES/dhcpcd_intermediates/ipv4ll.o out/target/product/generic/obj/EXECUTABLES/dhcpcd_intermediates/net.o out/target/product/generic/obj/EXECUTABLES/dhcpcd_intermediates/signals.o out/target/product/generic/obj/EXECUTABLES/dhcpcd_intermediates/configure.o out/target/product/generic/obj/EXECUTABLES/dhcpcd_intermediates/if-linux.o out/target/product/generic/obj/EXECUTABLES/dhcpcd_intermediates/if-linux-wireless.o out/target/product/generic/obj/EXECUTABLES/dhcpcd_intermediates/lpf.o out/target/product/generic/obj/EXECUTABLES/dhcpcd_intermediates/platform-linux.o out/target/product/generic/obj/EXECUTABLES/dhcpcd_intermediates/compat/closefrom.o out/target/product/generic/obj/EXECUTABLES/dhcpcd_intermediates/ifaddrs.o out/target/product/generic/obj/EXECUTABLES/dhcpcd_intermediates/ipv6rs.o        -Wl,--whole-archive   -Wl,--no-whole-archive   out/target/product/generic/obj/STATIC_LIBRARIES/libcompiler_rt-extras_intermediates/libcompiler_rt-extras.a    -lc -lcutils -lm -lnetutils -lstdc++  -o out/target/product/generic/obj/EXECUTABLES/dhcpcd_intermediates/LINKED/dhcpcd  -Wl,-z,noexecstack -Wl,-z,relro -Wl,-z,now -Wl,--warn-shared-textrel -Wl,--fatal-warnings -Wl,--icf=safe -Wl,--fix-cortex-a8    -Wl,--no-undefined prebuilts/gcc/linux-x86/arm/arm-linux-androideabi-4.8/bin/../lib/gcc/arm-linux-androideabi/4.8/../../../../arm-linux-androideabi/lib/armv7-a/libatomic.a prebuilts/gcc/linux-x86/arm/arm-linux-androideabi-4.8/bin/../lib/gcc/arm-linux-androideabi/4.8/armv7-a/libgcc.a out/target/product/generic/obj/lib/crtend_android.o 
{% endcodeblock %}

This indicates the link step and we can find libraries like `-lc -lcutils -lm -lnetutils -lstdc++` and `libatomic.a libgcc.a crtbegin_dynamic.o crtend_android.o`. 

# Put libcurl into android source

Extract libcurl into `android/external` and rename it from curl-7.37.0 to curl. Now we need to fix two places in `packages/Android/Android.mk`:

- Add in line 73: `LOCAL_C_INCLUDES += $(LOCAL_PATH)/include/ $(LOCAL_PATH)/lib/`
- Comment line 86: `#ALL_PREBUILT += $(LOCAL_PATH)/NOTICE`

# Generate CPPFLAGS and CFLAGS

Similar to the previous step, run `make libcurl showcommands` at `/home/anthony/android` and we will fail with the following output (Remember we haven't `./configure` yet):

{% codeblock lang:bash %}
prebuilts/gcc/linux-x86/arm/arm-linux-androideabi-4.8/bin/arm-linux-androideabi-gcc 
-I external/curl/packages/Android/../../include/ -I external/curl/packages/Android/../.. -I out/target/product/generic/obj/STATIC_LIBRARIES/libcurl_intermediates -I out/target/product/generic/gen/STATIC_LIBRARIES/libcurl_intermediates -I libnativehelper/include/nativehelper  -isystem system/core/include -isystem hardware/libhardware/include -isystem hardware/libhardware_legacy/include -isystem hardware/ril/include -isystem libnativehelper/include -isystem frameworks/native/include -isystem frameworks/native/opengl/include -isystem frameworks/av/include -isystem frameworks/base/include -isystem external/skia/include -isystem out/target/product/generic/obj/include -isystem bionic/libc/arch-arm/include -isystem bionic/libc/include -isystem bionic/libstdc++/include -isystem bionic/libc/kernel/uapi -isystem bionic/libc/kernel/uapi/asm-arm -isystem bionic/libm/include -isystem bionic/libm/include/arm -c -fno-exceptions -Wno-multichar -msoft-float -ffunction-sections -fdata-sections -funwind-tables -fstack-protector -Wa,--noexecstack -Werror=format-security -D_FORTIFY_SOURCE=2 -fno-short-enums -no-canonical-prefixes -fno-canonical-system-headers -march=armv7-a -mfloat-abi=softfp -mfpu=vfpv3-d16 -include build/core/combo/include/arch/linux-arm/AndroidConfig.h -I build/core/combo/include/arch/linux-arm/ -Wno-unused-but-set-variable -fno-builtin-sin -fno-strict-volatile-bitfields -Wno-psabi -mthumb-interwork -DANDROID -fmessage-length=0 -W -Wall -Wno-unused -Winit-self -Wpointer-arith -Werror=return-type -Werror=non-virtual-dtor -Werror=address -Werror=sequence-point -DNDEBUG -g -Wstrict-aliasing=2 -fgcse-after-reload -frerun-cse-after-loop -frename-registers -DNDEBUG -UDEBUG -mthumb -Os -fomit-frame-pointer -fno-strict-aliasing   -Wpointer-arith -Wwrite-strings -Wunused -Winline -Wnested-externs -Wmissing-declarations -Wmissing-prototypes -Wno-long-long -Wfloat-equal -Wno-multichar -Wsign-compare -Wno-format-nonliteral -Wendif-labels -Wstrict-prototypes -Wdeclaration-after-statement -Wno-system-headers -DHAVE_CONFIG_H -fPIC -MD -MF out/target/product/generic/obj/STATIC_LIBRARIES/libcurl_intermediates/lib/file.d -o out/target/product/generic/obj/STATIC_LIBRARIES/libcurl_intermediates/lib/file.o external/curl/packages/Android/../../lib/file.c
{% endcodeblock %}

We should copy `-I -isystem` and flags like `-W -D -M` into the following step.

# Build.sh

Now we have enough parameters needed to pass in, so we can write a script called `build.sh`. Follow Dan Fandrich's instructions: putting the -I, -isystem and -D options into CPPFLAGS, putting the -W, -m, -f, -O and -nostdlib options into CFLAGS, and putting the -Wl, -L and -l options into LIBS, along with the path to the files libgcc.a, crtbegin_dynamic.o, and ccrtend_android.o. Remember that the paths must be absolute since you will not be running configure from the same directory as the Android make.  The normal cross-compiler options must also be set. Note that the -c, -o, -MD and similar flags must not be set.

Here is my script, with parameters from the above steps.

{% codeblock lang:bash %}
#!/bin/sh

ANDROID_ROOT="$HOME/android" && \
PATH=$ANDROID_ROOT/prebuilts/gcc/linux-x86/arm/arm-linux-androideabi-4.8/bin:$PATH \
CPPFLAGS="-I $ANDROID_ROOT/external/curl/packages/Android/../../include/ -I $ANDROID_ROOT/external/curl/packages/Android/../.. -I $ANDROID_ROOT/out/target/product/generic/obj/STATIC_LIBRARIES/libcurl_intermediates -I $ANDROID_ROOT/out/target/product/generic/gen/STATIC_LIBRARIES/libcurl_intermediates -I $ANDROID_ROOT/libnativehelper/include/nativehelper  -isystem $ANDROID_ROOT/system/core/include -isystem $ANDROID_ROOT/hardware/libhardware/include -isystem $ANDROID_ROOT/hardware/libhardware_legacy/include -isystem $ANDROID_ROOT/hardware/ril/include -isystem $ANDROID_ROOT/libnativehelper/include -isystem $ANDROID_ROOT/frameworks/native/include -isystem $ANDROID_ROOT/frameworks/native/opengl/include -isystem $ANDROID_ROOT/frameworks/av/include -isystem $ANDROID_ROOT/frameworks/base/include -isystem $ANDROID_ROOT/external/skia/include -isystem $ANDROID_ROOT/out/target/product/generic/obj/include -isystem $ANDROID_ROOT/bionic/libc/arch-arm/include -isystem $ANDROID_ROOT/bionic/libc/include -isystem $ANDROID_ROOT/bionic/libstdc++/include -isystem $ANDROID_ROOT/bionic/libc/kernel/uapi -isystem $ANDROID_ROOT/bionic/libc/kernel/uapi/asm-arm -isystem $ANDROID_ROOT/bionic/libm/include -isystem $ANDROID_ROOT/bionic/libm/include/arm -include  $ANDROID_ROOT/build/core/combo/include/arch/linux-arm/AndroidConfig.h -I  $ANDROID_ROOT/build/core/combo/include/arch/linux-arm/ -D_FORTIFY_SOURCE=0 -DANDROID -DNDEBUG -DNDEBUG -UDEBUG -DHAVE_CONFIG_H " \
CFLAGS="-nostdlib -fno-exceptions -Wno-multichar -msoft-float -ffunction-sections -fdata-sections  -funwind-tables -fstack-protector -Wa,--noexecstack -Werror=format-security -fno-short-enums -no-canonical-prefixes -fno-canonical-system-headers -march=armv7-a -mfloat-abi=softfp -mfpu=vfpv3-d16 -Wno-unused-but-set-variable -fno-builtin-sin -fno-strict-volatile-bitfields -Wno-psabi -mthumb-interwork -fmessage-length=0 -W -Wall -Wno-unused -Winit-self -Wpointer-arith -Werror=return-type -Werror=non-virtual-dtor -Werror=address -Werror=sequence-point -g -Wstrict-aliasing=2 -fgcse-after-reload -frerun-cse-after-loop -frename-registers -mthumb -Os -fomit-frame-pointer -fno-strict-aliasing   -Wpointer-arith -Wwrite-strings -Wunused -Winline -Wnested-externs -Wmissing-declarations -Wmissing-prototypes -Wno-long-long -Wfloat-equal -Wno-multichar -Wsign-compare -Wno-format-nonliteral -Wendif-labels -Wstrict-prototypes -Wdeclaration-after-statement -Wno-system-headers -fPIC " \
LDFLAGS="-L$ANDROID_ROOT/out/target/product/generic/obj/lib " \
LIBS="$ANDROID_ROOT/out/target/product/generic/obj/lib/crtbegin_dynamic.o $ANDROID_ROOT/out/target/product/generic/obj/lib/crtend_android.o $ANDROID_ROOT/prebuilts/gcc/linux-x86/arm/arm-linux-androideabi-4.8/lib/gcc/arm-linux-androideabi/4.8/armv7-a/libgcc.a -lc -lcutils -lm -lnetutils -lstdc++ " \
./configure CC=arm-linux-androideabi-gcc --host=arm-linux-androideabi --host=arm-eabi --disable-shared --disable-tftp --disable-sspi --disable-ipv6 --disable-ldaps --disable-ldap --disable-telnet --disable-pop3 --disable-ftp --without-ssl --disable-imap --disable-smtp --disable-pop3 --disable-rtsp --disable-ares --without-ca-bundle --disable-warnings --disable-manual --without-nss --enable-shared --without-zlib --without-random
{% endcodeblock %}

# Configure and Make

Run the script to configure by `./build.sh` and `make libcurl` from android source root. You will find what you want in `out/target/product/generic/obj`:

![](/images/libcurl_android.jpg)

# Downgrade to lower Android version

If you wish to compile with lower version, the first thing you need is `repo init -b xxx` and `repo sync` to get a different android source.

**Attention: you should use the corresponding APP_PLATFORM in NDK when building apps, and don't forget android:minSdkVersion!**

## Android 4.3

{% codeblock lang:bash %}
#!/bin/sh

ANDROID_ROOT="$HOME/android" && \
PATH=$ANDROID_ROOT/prebuilts/gcc/linux-x86/arm/arm-linux-androideabi-4.7/bin:$PATH \
CPPFLAGS="-I $ANDROID_ROOT/external/curl-7.37.0/packages/Android/../../include/ -I $ANDROID_ROOT/external/curl-7.37.0/packages/Android/../../lib/ -I $ANDROID_ROOT/external/curl-7.37.0/packages/Android/../.. -I $ANDROID_ROOT/out/target/product/generic/obj/STATIC_LIBRARIES/libcurl_intermediates -I $ANDROID_ROOT/libnativehelper/include/nativehelper  -isystem $ANDROID_ROOT/system/core/include -isystem $ANDROID_ROOT/hardware/libhardware/include -isystem $ANDROID_ROOT/hardware/libhardware_legacy/include -isystem $ANDROID_ROOT/hardware/ril/include -isystem $ANDROID_ROOT/libnativehelper/include -isystem $ANDROID_ROOT/frameworks/native/include -isystem $ANDROID_ROOT/frameworks/native/opengl/include -isystem $ANDROID_ROOT/frameworks/av/include -isystem $ANDROID_ROOT/frameworks/base/include -isystem $ANDROID_ROOT/external/skia/include -isystem $ANDROID_ROOT/out/target/product/generic/obj/include -isystem $ANDROID_ROOT/bionic/libc/arch-arm/include -isystem $ANDROID_ROOT/bionic/libc/include -isystem $ANDROID_ROOT/bionic/libstdc++/include -isystem $ANDROID_ROOT/bionic/libc/kernel/common -isystem $ANDROID_ROOT/bionic/libc/kernel/arch-arm -isystem $ANDROID_ROOT/bionic/libm/include -isystem $ANDROID_ROOT/bionic/libm/include/arm -isystem $ANDROID_ROOT/bionic/libthread_db/include -I $ANDROID_ROOT/build/core/combo/include/arch/linux-arm/ -include $ANDROID_ROOT/build/core/combo/include/arch/linux-arm/AndroidConfig.h -D_FORTIFY_SOURCE=0 -DANDROID -DNDEBUG -DNDEBUG -UDEBUG -DHAVE_CONFIG_H" \
CFLAGS="-nostdlib -fno-exceptions -Wno-multichar -msoft-float -fpic -fPIE -ffunction-sections -fdata-sections -funwind-tables -fstack-protector -Wa,--noexecstack -Werror=format-security -fno-short-enums -march=armv7-a -mfloat-abi=softfp -mfpu=vfpv3-d16 -Wno-unused-but-set-variable -fno-builtin-sin -fno-strict-volatile-bitfields -Wno-psabi -mthumb-interwork -fmessage-length=0 -W -Wall -Wno-unused -Winit-self -Wpointer-arith -Werror=return-type -Werror=non-virtual-dtor -Werror=address -Werror=sequence-point -g -Wstrict-aliasing=2 -fgcse-after-reload -frerun-cse-after-loop -frename-registers -mthumb -Os -fomit-frame-pointer -fno-strict-aliasing    -Wpointer-arith -Wwrite-strings -Wunused -Winline -Wnested-externs -Wmissing-declarations -Wmissing-prototypes -Wno-long-long -Wfloat-equal -Wno-multichar -Wsign-compare -Wno-format-nonliteral -Wendif-labels -Wstrict-prototypes -Wdeclaration-after-statement -Wno-system-headers   -MD -MF" \
LDFLAGS="-L$ANDROID_ROOT/out/target/product/generic/obj/lib " \
LIBS="$ANDROID_ROOT/out/target/product/generic/obj/lib/crtbegin_dynamic.o $ANDROID_ROOT/out/target/product/generic/obj/lib/crtend_android.o $ANDROID_ROOT/prebuilts/gcc/linux-x86/arm/arm-linux-androideabi-4.7/lib/gcc/arm-linux-androideabi/4.7/armv7-a/libgcc.a -lc -lcutils -lnetutils -lc -lstdc++ -lm " \
./configure CC=arm-linux-androideabi-gcc --host=arm-linux-androideabi --host=arm-eabi --disable-shared --disable-tftp --disable-sspi --disable-ipv6 --disable-ldaps --disable-ldap --disable-telnet --disable-pop3 --disable-ftp --without-ssl --disable-imap --disable-smtp --disable-pop3 --disable-rtsp --disable-ares --without-ca-bundle --disable-warnings --disable-manual --without-nss --enable-shared --without-zlib --without-random
{% endcodeblock %}

## Android 2.3.3

You may need [downgrade your gcc](http://stackoverflow.com/questions/13365348/is-it-possible-to-build-aosp-project-gingerbread-in-kubuntu12-04-xubuntu) and do as the above. 

{% codeblock lang:bash %}
#!/bin/sh

ANDROID_ROOT="$HOME/android" && \
PATH=$ANDROID_ROOT/prebuilt/linux-x86/toolchain/arm-eabi-4.4.3/bin:$PATH \
CPPFLAGS="-I $ANDROID_ROOT/external/curl/packages/Android/../../include   -I $ANDROID_ROOT/external/curl/packages/Android/../../lib   -I $ANDROID_ROOT/external/curl/packages/Android/../..   -I $ANDROID_ROOT/out/target/product/generic/obj/EXECUTABLES/curl_intermediates   -I $ANDROID_ROOT/out/target/product/generic/obj/STATIC_LIBRARIES/libwebcore_intermediates   -I $ANDROID_ROOT/dalvik/libnativehelper/include/nativehelper   -I $ANDROID_ROOT/system/core/include   -I $ANDROID_ROOT/hardware/libhardware/include   -I $ANDROID_ROOT/hardware/libhardware_legacy/include   -I $ANDROID_ROOT/hardware/ril/include   -I $ANDROID_ROOT/dalvik/libnativehelper/include   -I $ANDROID_ROOT/frameworks/base/include   -I $ANDROID_ROOT/frameworks/base/opengl/include   -I $ANDROID_ROOT/frameworks/base/native/include   -I $ANDROID_ROOT/external/skia/include   -I $ANDROID_ROOT/out/target/product/generic/obj/include   -I $ANDROID_ROOT/bionic/libc/arch-arm/include   -I $ANDROID_ROOT/bionic/libc/include   -I $ANDROID_ROOT/bionic/libstdc++/include   -I $ANDROID_ROOT/bionic/libc/kernel/common   -I $ANDROID_ROOT/bionic/libc/kernel/arch-arm   -I $ANDROID_ROOT/bionic/libm/include   -I $ANDROID_ROOT/bionic/libm/include/arch/arm   -I $ANDROID_ROOT/bionic/libthread_db/include -D__ARM_ARCH_5__ -D__ARM_ARCH_5T__ -D__ARM_ARCH_5E__ -D__ARM_ARCH_5TE__ -include $ANDROID_ROOT/system/core/include/arch/linux-arm/AndroidConfig.h -I $ANDROID_ROOT/system/core/include/arch/linux-arm/ -DANDROID -DNDEBUG -UDEBUG -DHAVE_CONFIG_H " \
CFLAGS="-nostdlib -fno-exceptions -Wno-multichar -msoft-float -fpic -ffunction-sections -funwind-tables -fstack-protector -Wa,--noexecstack -Werror=format-security -fno-short-enums -march=armv5te -mtune=xscale -Wno-psabi -mthumb-interwork -fmessage-length=0 -W -Wall -Wno-unused -Winit-self -Wpointer-arith -Werror=return-type -Werror=non-virtual-dtor -Werror=address -Werror=sequence-point -g -Wstrict-aliasing=2 -finline-functions -fno-inline-functions-called-once -fgcse-after-reload -frerun-cse-after-loop -frename-registers -mthumb -Os -fomit-frame-pointer -fno-strict-aliasing -finline-limit=64   -Wpointer-arith -Wwrite-strings -Wunused -Winline -Wnested-externs -Wmissing-declarations -Wmissing-prototypes -Wno-long-long -Wfloat-equal -Wno-multichar -Wsign-compare -Wno-format-nonliteral -Wendif-labels -Wstrict-prototypes -Wdeclaration-after-statement -Wno-system-headers -MD" \
LDFLAGS="-L$ANDROID_ROOT/out/target/product/generic/obj/lib " \
LIBS="$ANDROID_ROOT/out/target/product/generic/obj/lib/crtbegin_dynamic.o $ANDROID_ROOT/out/target/product/generic/obj/lib/crtend_android.o $ANDROID_ROOT/prebuilt/linux-x86/toolchain/arm-eabi-4.4.3/lib/gcc/arm-eabi/4.4.3/libgcc.a -lc -llog -lcutils -lstdc++ -lm" \
./configure CC=arm-eabi-g++ --host=arm-eabi --disable-shared --disable-tftp --disable-sspi --disable-ipv6 --disable-ldaps --disable-ldap --disable-telnet --disable-pop3 --disable-ftp --without-ssl --disable-imap --disable-smtp --disable-pop3 --disable-rtsp --disable-ares --without-ca-bundle --disable-warnings --disable-manual --without-nss --enable-shared --without-zlib --without-random
{% endcodeblock %}

# bionic ERROR

This is not specified to libcurl itself. This happens for builds with higher version Android like the following errors:

{% codeblock lang:bash %}
bionic/libc/include/string.h:109: error: undefined reference to '__memcpy_chk'
bionic/libc/include/stdio.h:496: error: undefined reference to '__sprintf_chk'
bionic/libc/include/string.h:109: error: undefined reference to '__memcpy_chk'
{% endcodeblock %}

You should disable **_FORTIFY_SOURCE** in the build.sh! These checks are implemented in Android source rather than NDK so you will get these errors.

**Solution** First of all, check your build.sh(or other scrips) and ensure `D_FORTIFY_SOURCE=0`. Second, add `-D_FORTIFY_SOURCE=0` into `LOCAL_CFLAGS` in Android.mk.

You could check your libraries with `nm`:

{% codeblock lang:bash %}
anthony@anthony-VirtualBox:~$ nm Downloads/libcurl_4.3.a |grep __memcpy_chk
         U __memcpy_chk
         U __memcpy_chk
anthony@anthony-VirtualBox:~$ nm android/out/target/product/generic/obj/STATIC_LIBRARIES/libcurl_intermediates/libcurl.a |grep __memcpy_chk
anthony@anthony-VirtualBox:~$ 
{% endcodeblock %}

The new library with the macro does not have these *chk* any more!
