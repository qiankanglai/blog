---
layout: post
title: Polygon mode sprites
date: 2016/3/5
tags: Unity
updated: 2016/3/7
toc: false
---

这也是最近在做的另一个优化：如何在有限的图中压缩更多的Sprites。最近的Unity和Texture Packer都导入了一个新的特性 Polygon Mode，也就是说将原来的矩形Sprite用更加紧致的Polygon来描述，从而能更有效的利用空白空间，如下图中的胜利标志(红线圈出部分)：

<!--more-->

![](/images/polygon_mode_sprites.jpg)

当然，目前Unity只在Sprite Render里支持了这个模式，在UGUI的Image中还无法正常使用。官方论坛其实也有提到这个[THE 5.3 "POLYGON SPRITE MODE" SHOULD BE UTILIZED BY THE UI "IMAGE" COMPONENT.](https://feedback.unity3d.com/suggestions/the-5-dot-3-polygon-sprite-mode-should-be-utilized-by-the-ui-image-component)，但是还没有反馈~

| 原图 | 线框模式 |
|--------------------------------------------------------------------------|----------------------------------------------------------------------------|
| ![](/images/polygon_mode_origin.jpg) | ![](/images/polygon_mode_origin_wireframe.jpg) |

我对照UGUI代码中的Image.cs看了一下，发现其实只要能搞定生成顶点部分的代码，使用具体的Polygon而不是俩三角形就能搞定。而且原生的Sprite Render都能直接读取Texture Packer的数据，没道理我自己写解决不了...最后在`UnityEngine.Sprite.vertices`和`UnityEngine.Sprite.triangles`找到了对应的数据

| 原图 | 线框模式 |
|--------------------------------------------------------------------------|----------------------------------------------------------------------------|
| ![](/images/polygon_mode_new.jpg) | ![](/images/polygon_mode_new_wireframe.jpg) |

当然，和原来的方法相比，绘制的Verts和Tris会略多(由于大部分图片都是矩形的，少部分不规则，其实这种情况并不多)；好处是能节约不少图片，以我们项目举例：原来要2.5张2048贴图，利用这个方法能压到1.7张左右。

ps. Super Cell的游戏貌似都是这种用法，贴图非常的紧致，当时看COC的时候就惊艳到了~我随便用红色圈出了一个梯形，可以看到周围很紧密的排列。

![](/images/polygon_mode_cr.jpg)

附代码(Unity 5.1.4/5.2.4/5.3.3测试通过)

注1：我简单粗暴的使用了原始`UIVertex`中的0/2号顶点作为左下和右上，这个在大多数情况下是成立的。如果要做的比较理想，可以参考UGUI源码中`Image.GetDrawingDimensions`的实现。

注2: UGUI 5.1里要求Image部分的顶点都是Quad，我就用了一个退化成三角形的来做了... Unity 4.x版本不支持Polygon，所以就不管了。

{% codeblock lang:csharp %}
using System.Collections.Generic;

namespace UnityEngine.UI
{
/// author: Kanglai Qian, SoulGame
/// date: 2016-3-6
/// a Simple script to support Polygon Sprites for UGUI Image in Unity 5
/// just drag it to GameObjects with Image attached
    [AddComponentMenu("UI/Effects/PolygonImage", 16)]
    [RequireComponent(typeof(Image))]
#if UNITY_5_1
    public class PolygonImage : BaseVertexEffect
#else
    public class PolygonImage : BaseMeshEffect
#endif
    {
        protected PolygonImage()
        { }

#if UNITY_5_1
        public override void ModifyVertices(List<UIVertex> verts)
#else
        public override void ModifyMesh(VertexHelper vh)
#endif
        {
            Image image = GetComponent<Image>();
            if(image.type != Image.Type.Simple)
            {
                return;
            }
            Sprite sprite = image.overrideSprite;
            if(sprite == null || sprite.triangles.Length == 6)
            {
                // only 2 triangles
                return;
            }

            // Kanglai: at first I copy codes from Image.GetDrawingDimensions
            // to calculate Image's dimensions. But now for easy to read, I just take usage of corners.
#if UNITY_5_1
            if (verts.Count != 4)
            {
                return;
            }
            UIVertex vertice;
            Vector2 lb = verts[0].position;
            Vector2 rt = verts[2].position;
#else
            if (vh.currentVertCount != 4)
            {
                return;
            }
            UIVertex vertice = new UIVertex();
            vh.PopulateUIVertex(ref vertice, 0);
            Vector2 lb = vertice.position;
            vh.PopulateUIVertex(ref vertice, 2);
            Vector2 rt = vertice.position;
#endif
            // Kanglai: recalculate vertices from Sprite!
            int len = sprite.vertices.Length;
            var vertices = new List<UIVertex>(len);
            Vector2 Center = sprite.bounds.center;
            Vector2 invExtend = new Vector2(1 / sprite.bounds.size.x, 1 / sprite.bounds.size.y);
            for (int i = 0; i < len; i++)
            {
                vertice = new UIVertex();
                // normalize
                float x = (sprite.vertices[i].x - Center.x) * invExtend.x + 0.5f;
                float y = (sprite.vertices[i].y - Center.y) * invExtend.y + 0.5f;
                // lerp to position
                vertice.position = new Vector2(Mathf.Lerp(lb.x, rt.x, x), Mathf.Lerp(lb.y, rt.y, y));
                vertice.color = image.color;
                vertice.uv0 = sprite.uv[i];
                vertices.Add(vertice);
            }

            len = sprite.triangles.Length;

#if UNITY_5_1
            verts.Clear();
            for (int i = 0; i < len; i+=3)
            {
                verts.Add(vertices[sprite.triangles[i + 0]]);
                verts.Add(vertices[sprite.triangles[i + 1]]);
                verts.Add(vertices[sprite.triangles[i + 2]]);
                // a degeneration quad :(
                verts.Add(vertices[sprite.triangles[i + 0]]);
            }
#else
            var triangles = new List<int>(len);
            for (int i = 0; i < len; i++)
            {
                triangles.Add(sprite.triangles[i]);
            }

            vh.Clear();
            vh.AddUIVertexStream(vertices, triangles);
#endif
        }
    }
}
{% endcodeblock %}