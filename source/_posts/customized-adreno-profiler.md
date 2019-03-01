---
layout: post
title: Customized Adreno Profiler
date: 2015/9/2
tags: Android
updated: 2015/10/17
toc: false
---

Recently I found an interesting bug with Adreno Profiler: this cannot work correctly with `glVertexAttribPointer(indx=2, size=4, type=GL_HALF_FLOAT_OES, normalized=False, stride=32, ptr=0xC)`. For example, texcoords in **half** type are presented as strange numbers:

<!--more-->

![](/images/adreno_profiler_half_wrong.jpg)

I tried to seek help from [developers' forum](https://developer.qualcomm.com/forum/qdn-forums/software/adreno-gpu-profiler/29349) but got no response yet. After two days' part time work, I solved this bug by myself.

![](/images/adreno_profiler_half_correct.jpg)

Since I have no access to the source code, I have to decompile it with [ILSpy](http://ilspy.net/). The key codes can be found in `QXProfilerControlsCS.dll`. I replace the implemention for `public static float HalfToFloat(uint half)` in *StateDataStoreHelper.cs* with codes from [CShart Half](http://sourceforge.net/projects/csharp-half/). (In fact, I've got no idea what does the original code mean...)

Also, I improve the *Save Vertex Data* button so the exported model file can be imported into other tools directly. At the same time, some more codes for checking are added, because I've encountered several crashes when saving vertex data.

{% codeblock lang:csharp %}
for (int i = 0; i < drawCall.VertexBuffer.ColumnNames.Count; i++)
{
    for (int j = 0; j < drawCall.VertexBuffer.Rows.Count; j++)
    {
        string text = drawCall.VertexBuffer.ColumnNames[i].ToString();
        int num = 0;
        while (num <= text.Length && text[num] != ' ' && text[num] != '\0')
        {
            num++;
        }
        string text2 = "";
        // Kanglai: prevent crash
        if(drawCall.VertexBuffer.Rows[j] != null && drawCall.VertexBuffer.Rows[j].Count > i)
        {
            text2 = drawCall.VertexBuffer.Rows[j][i].ToString();
        }
        string str = text2.Replace(",", "");
        //Kanglai: modify existing column name
        string col = text.Substring(0, num);
        if (col.Equals("_glesVertex"))
            col = "v";
        else if (col.Equals("_glesNormal"))
            col = "vn";
        else if (col.Equals("_glesMultiTexCoord0"))
            col = "vt";
        else
            col = "#" + col;
        streamWriter.WriteLine(col + " " + str);
    }
}
{% endcodeblock %}

2015.10.17: Add support for alpha channel. Just save texture as PNG :D