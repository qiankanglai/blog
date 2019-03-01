---
layout: post
title: Adreno Profiler再次修改
date: 2016/12/1
tags: Android
updated: 2017/8/27
toc: false
---

记录用...之前在{% post_link customized-adreno-profiler %}里修改过dll来修BUG...最近又捡起这个工具(我下的最新版本是4.0.5511.5192)，修了一个崩溃错误。

更新：最近好几个朋友问我要，然后我发现我从Jekyll换到Hexo的时候有些文档归档掉了...这里放出我手头修改的最新版本的[QXProfilerControlsCS.dll](/downloads/QXProfilerControlsCS.dll)

** 申明: 我不会回答任何关于资源导出方面的问题。博客内容我单纯作为技术分享，并不想以此盈利，也不想惹麻烦。如果读者有志于学习渲染方面内容，我很乐意与大家交流学习，但是就本话题就此打住。 **

<!--more-->

ps. 虽然官方已经废弃Adreno，但是我觉得比SnapDragon好用啊啊啊

这次就不用非常蛋疼的反汇编出整个VS工程，直接用{% post_link reflexil %}里的方法精确修改函数就行啦～ 注释了三段代码搞定

> System.NullReferenceException: 未将对象引用设置到对象的实例。
>   在 System.Windows.Forms.DataGridViewBand.set_Thickness(Int32 value)
>   在 QXProfilerControls.TraceViewES20.PopulateIndexAndElementBuffers(Object o)
>   在 QXProfilerControls.TraceViewES20.treeListViewDrawCalls_AfterSelect(Object sender, ObjectEventArgs e)
>   在 LidorSystems.IntegralUI.Lists.ListBase.OnAfterSelect(ObjectEventArgs e)
>   在 LidorSystems.IntegralUI.Lists.TreeListView.set_SelectedNode(TreeListViewNode value)
>   在 LidorSystems.IntegralUI.Lists.TreeListView.ProcessNodeSelection(TreeListViewNode node, Boolean performTest)
>   在 LidorSystems.IntegralUI.Lists.TreeListView.OnMouseDown(MouseEventArgs e)
>   在 System.Windows.Forms.Control.OnMouseDown(MouseEventArgs e)
>   在 System.Windows.Forms.Control.WmMouseDown(Message& m, MouseButtons button, Int32 clicks)
>   在 System.Windows.Forms.Control.WndProc(Message& m)
>   在 System.Windows.Forms.NativeWindow.Callback(IntPtr hWnd, Int32 msg, IntPtr wparam, IntPtr lparam)

{% codeblock lang:csharp %}
#region " Imports "
using System;
using System.Collections.Generic;
using System.Text;
using System.Data;
#endregion 

namespace QXProfilerControls
{
    class TraceViewES20
    {
        // Limited support!
        // You can only reference methods or fields defined in the class (not in ancestors classes)
        // Fields and methods stubs are needed for compilation purposes only.
        // Reflexil will automaticaly map current type, fields or methods to original references.
        void PopulateIndexAndElementBuffers(object o)
        {
        
            DrawCall drawCall = o as DrawCall;
            DataTable dataTable = drawCall.ConstructVBO(ref this._WorkerHalt);
            if (dataTable != null)
            {
                this.vertexGridView.DataSource = dataTable;
                this.vertexGridView.RowHeadersVisible = false;
                /*if (this.vertexGridView.Columns.Count > 0)
                {
                    this.vertexGridView.Columns[0].DefaultCellStyle.BackColor = System.Drawing.Color.LightGray;
                    this.vertexGridView.Columns[0].Width = 50;
                    this.vertexGridView.Columns[0].MinimumWidth = 50;
                    System.Collections.IEnumerator enumerator = this.vertexGridView.Columns.GetEnumerator();
                    try
                    {
                        while (enumerator.MoveNext())
                        {
                            System.Windows.Forms.DataGridViewColumn dataGridViewColumn = (System.Windows.Forms.DataGridViewColumn)enumerator.Current;
                            dataGridViewColumn.SortMode = System.Windows.Forms.DataGridViewColumnSortMode.NotSortable;
                        }
                        goto IL_E1;
                    }
                    finally
                    {
                        System.IDisposable disposable = enumerator as System.IDisposable;
                        if (disposable != null)
                        {
                            disposable.Dispose();
                        }
                    }
                    return;
                }
                IL_E1:*/
                DataTable dataTable2 = drawCall.ConstructIndexBuffer(ref this._WorkerHalt);
                if (dataTable2 != null)
                {
                    this.indexGridView.DataSource = dataTable2;
                    this.indexGridView.RowHeadersVisible = false;
                    /*if (this.indexGridView.Columns.Count > 0)
                    {
                        this.indexGridView.Columns[0].DefaultCellStyle.BackColor = System.Drawing.Color.LightGray;
                        this.indexGridView.Columns[0].Width = 50;
                        this.indexGridView.Columns[0].MinimumWidth = 50;
                        System.Collections.IEnumerator enumerator2 = this.indexGridView.Columns.GetEnumerator();
                        try
                        {
                            while (enumerator2.MoveNext())
                            {
                                System.Windows.Forms.DataGridViewColumn dataGridViewColumn2 = (System.Windows.Forms.DataGridViewColumn)enumerator2.Current;
                                dataGridViewColumn2.SortMode = System.Windows.Forms.DataGridViewColumnSortMode.NotSortable;
                            }
                            goto IL_1A7;
                        }
                        finally
                        {
                            System.IDisposable disposable2 = enumerator2 as System.IDisposable;
                            if (disposable2 != null)
                            {
                                disposable2.Dispose();
                            }
                        }
                        return;
                    }
                    IL_1A7:*/
                    DataTable dataTable3 = drawCall.ConstructElementBuffer(ref this._WorkerHalt);
                    if (dataTable3 != null)
                    {
                        this.elementGridView.DataSource = dataTable3;
                        this.elementGridView.RowHeadersVisible = false;
                        /*if (this.elementGridView.Columns.Count > 0)
                        {
                            this.elementGridView.Columns[0].DefaultCellStyle.BackColor = System.Drawing.Color.LightGray;
                            this.elementGridView.Columns[0].Width = 50;
                            this.elementGridView.Columns[0].MinimumWidth = 50;
                            foreach (System.Windows.Forms.DataGridViewColumn dataGridViewColumn3 in this.elementGridView.Columns)
                            {
                                dataGridViewColumn3.SortMode = System.Windows.Forms.DataGridViewColumnSortMode.NotSortable;
                            }
                        }
                        return;*/
                    }
                }
                return;
            }
        }       

        int _WorkerHalt;
        System.Windows.Forms.DataGridView vertexGridView;
        System.Windows.Forms.DataGridView indexGridView;
        System.Windows.Forms.DataGridView elementGridView;
    }
}
{% endcodeblock %}

再次更新一下一个BUG FIX，我发现某些游戏的顶点数据是不全的，导出的时候会崩溃...

![](/images/adreno_zmq_crash.jpg)

{% codeblock lang:csharp %}
#region " Imports "
using System;
using System.Collections.Generic;
using System.Text;
using System.Data;
using LidorSystems.IntegralUI.Lists;
#endregion 

namespace QXProfilerControls
{
  class TraceViewES20
  {
    private void toolStripSaveVertexDataButton_Click(object sender, System.EventArgs e)
    {
      if (this._State != State.Idle)
      {
        return;
      }
      TreeListViewNode selectedNode = this.treeListViewDrawCalls.SelectedNode;
      if (selectedNode == null)
      {
        System.Windows.Forms.MessageBox.Show("Please select the draw call to save vertex data for.", "Adreno Profiler");
        return;
      }
      ItemData itemData = (ItemData)selectedNode.Tag;
      if (itemData.DrawCall && this._Container.StateDataStore != null)
      {
        StateDataStore stateDataStore = this._Container.StateDataStore;
        System.Windows.Forms.SaveFileDialog saveFileDialog = new System.Windows.Forms.SaveFileDialog();
        saveFileDialog.Filter = "OBJ Files (*.obj)|*.obj";
        saveFileDialog.FilterIndex = 2;
        saveFileDialog.RestoreDirectory = true;
        System.IO.Stream stream;
        if (saveFileDialog.ShowDialog() == System.Windows.Forms.DialogResult.OK && (stream = saveFileDialog.OpenFile()) != null)
        {
          System.IO.StreamWriter streamWriter = new System.IO.StreamWriter(stream);
          streamWriter.WriteLine("# Adreno Profiler vertex and index data saved in obj format");
          streamWriter.WriteLine("# To actually view in an OBJ model viewer you will need to search and replace");
          streamWriter.WriteLine("# all attribute names with 'v' for vertex, 'vt' for texture vertex, and");
          streamWriter.WriteLine("# 'vn' for normal vertex.");
          streamWriter.WriteLine("# For example change '#gles_vertex 0 0 0' to 'v 0 0 0'");
          streamWriter.WriteLine(" ");
          if (itemData.DrawCallIndex < stateDataStore.DrawCalls.Count)
          {
            DrawCall drawCall = stateDataStore.DrawCalls[itemData.DrawCallIndex];
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
                // Kanglai: Protection code, while some vertex don't have all column data
                if (drawCall.VertexBuffer.Rows[j].Count <= i) break;
                string text2 = drawCall.VertexBuffer.Rows[j][i].ToString();
                string str = text2.Replace(",", "");
                streamWriter.WriteLine("#" + text.Substring(0, num) + " " + str);
              }
            }
            streamWriter.WriteLine("# " + drawCall.VertexBuffer.Rows.Count.ToString() + " vertices");
            DataTable dataTable = null;
            if (drawCall.Indices.Count > 0)
            {
              int num2 = 0;
              dataTable = drawCall.ConstructElementBuffer(ref num2);
            }
            if (dataTable != null && dataTable.Columns.Count > 0)
            {
              for (int k = 0; k < dataTable.Columns.Count; k++)
              {
                streamWriter.WriteLine("# " + dataTable.Columns[k].ToString());
                for (int l = 0; l < dataTable.Rows.Count; l++)
                {
                  string text3 = dataTable.Rows[l][k].ToString();
                  string text4 = text3.Replace(" ", "");
                  string[] array = text4.Split(new char[]
                  {
                    ','
                  });
                  streamWriter.Write("f ");
                  for (int m = 0; m < array.Length; m++)
                  {
                    string text5 = System.Convert.ToString(System.Convert.ToInt32(array[m]) + 1);
                    streamWriter.Write(string.Concat(new string[]
                    {
                      text5,
                      "/",
                      text5,
                      "/",
                      text5
                    }));
                    if (m < array.Length - 1)
                    {
                      streamWriter.Write(" ");
                    }
                  }
                  streamWriter.WriteLine("");
                }
              }
              streamWriter.WriteLine("# " + dataTable.Rows.Count + " elements");
            }
          }
          streamWriter.Close();
        }
      }
    }

    private enum State
    {
      Idle,
      Listening,
      PendingFrameStart,
      Capturing,
      Restoring
    }

    State _State;
    private TreeListView treeListViewDrawCalls;
    QXProfilerControls.FrameCaptureViewES20 _Container;

    [System.Serializable]
    private class ItemData
    {
      public string Log;

      public uint TokenNumber;

      public uint SliceID;

      public uint FrameIndex;

      public bool DrawCall;

      public int DrawCallIndex;
    }

  }
}
{% endcodeblock %}