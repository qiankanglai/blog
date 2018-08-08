/* FastObjImporter.cs
 * by Marc Kusters (Nighteyes)
 * 
 * Used for loading .obj files exported by Blender
 * Example usage: Mesh myMesh = FastObjImporter.Instance.ImportFile("path_to_obj_file.obj");
 */
 
using UnityEngine;
using UnityEditor;
using System.Collections.Generic;
using System.IO;
using System.Text;
 
public sealed class FastObjImporter
{
	[MenuItem("Assets/Import FBX")]
	static void ImportFBX()
	{
		var path = AssetDatabase.GetAssetPath(Selection.activeObject);
		Debug.LogFormat("Importing {0}", path);
		var mesh = Instance.ImportFile(path);
		var path2 = System.IO.Path.ChangeExtension(path, ".asset");
		AssetDatabase.CreateAsset(mesh, path2);
	}

    #region singleton
    // Singleton code
    // Static can be called from anywhere without having to make an instance
    private static FastObjImporter _instance;
 
    // If called check if there is an instance, otherwise create it
    public static FastObjImporter Instance
    {
        get { return _instance ?? (_instance = new FastObjImporter()); }
    }
    #endregion
 
    private List<int> triangles;
    private List<Vector3> vertices;
    private List<Vector2> uv;
    private List<Vector2> uv2;
    private List<Vector3> normals;
    private List<Color> colors;
    private List<int> intArray;
 
    private const int MIN_POW_10 = -16;
    private const int MAX_POW_10 = 16;
    private const int NUM_POWS_10 = MAX_POW_10 - MIN_POW_10 + 1;
    private static readonly float[] pow10 = GenerateLookupTable();
 
    // Use this for initialization
    public Mesh ImportFile(string filePath)
    {
        triangles = new List<int>();
        vertices = new List<Vector3>();
        uv = new List<Vector2>();
        uv2 = new List<Vector2>();
        normals = new List<Vector3>();
        colors = new List<Color>();
        intArray = new List<int>();
 
        LoadMeshData(filePath);
 
        Mesh mesh = new Mesh();
 
        mesh.vertices = vertices.ToArray();
        mesh.uv = uv.ToArray();
        mesh.uv2 = uv2.ToArray();
		mesh.colors = colors.ToArray();
        mesh.normals = normals.ToArray();
        mesh.triangles = triangles.ToArray();
 
        mesh.RecalculateBounds();
        //mesh.Optimize();
 
        return mesh;
    }
 
    private void LoadMeshData(string fileName)
    {
 
        StringBuilder sb = new StringBuilder();
        string text = File.ReadAllText(fileName);
        int start = 0;
 
        StringBuilder sbFloat = new StringBuilder();
 
        for (int i = 0; i < text.Length; i++)
        {
            if (text[i] == '\n')
            {
                sb.Remove(0, sb.Length);
 
                // Start +1 for whitespace '\n'
                sb.Append(text, start + 1, i - start);
                start = i;
 
                if (sb[0] == 'v' && sb[1] == ' ') // Vertices
                {
                    int splitStart = 2;
 
                    vertices.Add(new Vector3(GetFloat(sb, ref splitStart, ref sbFloat),
                        GetFloat(sb, ref splitStart, ref sbFloat), GetFloat(sb, ref splitStart, ref sbFloat)));
                }
                else if (sb[0] == 'v' && sb[1] == 't' && sb[2] == ' ') // UV0
                {
                    int splitStart = 3;
 
                    uv.Add(new Vector2(GetFloat(sb, ref splitStart, ref sbFloat),
                        GetFloat(sb, ref splitStart, ref sbFloat)));
                }
                else if (sb[0] == 'v' && sb[1] == 't' && sb[2] == '2' && sb[3] == ' ') // UV1
                {
                    int splitStart = 4;
 
                    uv2.Add(new Vector2(GetFloat(sb, ref splitStart, ref sbFloat),
                        GetFloat(sb, ref splitStart, ref sbFloat)));
                }
                else if (sb[0] == 'v' && sb[1] == 'c' && sb[2] == ' ') // UV0
                {
                    int splitStart = 3;
 
                    colors.Add(new Color(GetFloat(sb, ref splitStart, ref sbFloat),
                        GetFloat(sb, ref splitStart, ref sbFloat), GetFloat(sb, ref splitStart, ref sbFloat), GetFloat(sb, ref splitStart, ref sbFloat)));
                }
                else if (sb[0] == 'v' && sb[1] == 'n' && sb[2] == ' ') // Normals
                {
                    int splitStart = 3;
 
                    normals.Add(new Vector3(GetFloat(sb, ref splitStart, ref sbFloat),
                        GetFloat(sb, ref splitStart, ref sbFloat), GetFloat(sb, ref splitStart, ref sbFloat)));
                }
                else if (sb[0] == 'f' && sb[1] == ' ')
                {
                    int splitStart = 2;
 
                    int j = 1;
                    intArray.Clear();
                    int info = 0;
                    // Add faceData, a face can contain multiple triangles, facedata is stored in following order vert, uv, normal. If uv or normal are / set gles, facedata is stored in following order vert, uv, normal. If uv or normal are / set it to a 0
                    while (splitStart < sb.Length && char.IsDigit(sb[splitStart]))
                    {
						intArray.Add(GetInt(sb, ref splitStart, ref sbFloat));
						GetInt(sb, ref splitStart, ref sbFloat);
						GetInt(sb, ref splitStart, ref sbFloat);
                        j++; 
                    }
 
                    info += j;
                    j = 1;
                    while (j + 2 < info) //Create triangles out of the face data.  There will generally be more than 1 triangle per face.
                    {
                        triangles.Add(intArray[0] - 1);
                        triangles.Add(intArray[j] - 1);
                        triangles.Add(intArray[j + 1] - 1);
 
                        j++;
                    }
                }
            }
        }
    }
 
    private float GetFloat(StringBuilder sb, ref int start, ref StringBuilder sbFloat)
    {
        sbFloat.Remove(0, sbFloat.Length);
        while (start < sb.Length &&
               (char.IsDigit(sb[start]) || sb[start] == '-' || sb[start] == '.'))
        {
            sbFloat.Append(sb[start]);
            start++;
        }
        start++;
 
        return ParseFloat(sbFloat);
    }
 
    private int GetInt(StringBuilder sb, ref int start, ref StringBuilder sbInt)
    {
        sbInt.Remove(0, sbInt.Length);
        while (start < sb.Length &&
               (char.IsDigit(sb[start])))
        {
            sbInt.Append(sb[start]);
            start++;
        }
        start++;
 
        return IntParseFast(sbInt);
    }
 
 
    private static float[] GenerateLookupTable()
    {
        var result = new float[(-MIN_POW_10 + MAX_POW_10) * 10];
        for (int i = 0; i < result.Length; i++)
            result[i] = (float)((i / NUM_POWS_10) *
                    Mathf.Pow(10, i % NUM_POWS_10 + MIN_POW_10));
        return result;
    }
 
    private float ParseFloat(StringBuilder value)
    {
        float result = 0;
        bool negate = false;
        int len = value.Length;
        int decimalIndex = value.Length;
        for (int i = len - 1; i >= 0; i--)
            if (value[i] == '.')
            { decimalIndex = i; break; }
        int offset = -MIN_POW_10 + decimalIndex;
        for (int i = 0; i < decimalIndex; i++)
            if (i != decimalIndex && value[i] != '-')
                result += pow10[(value[i] - '0') * NUM_POWS_10 + offset - i - 1];
            else if (value[i] == '-')
                negate = true;
        for (int i = decimalIndex + 1; i < len; i++)
            if (i != decimalIndex)
                result += pow10[(value[i] - '0') * NUM_POWS_10 + offset - i];
        if (negate)
            result = -result;
        return result;
    }
 
    private int IntParseFast(StringBuilder value)
    {
        // An optimized int parse method.
        int result = 0;
        for (int i = 0; i < value.Length; i++)
        {
            result = 10 * result + (value[i] - 48);
        }
        return result;
    }
}
