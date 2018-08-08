using UnityEngine;
using System.Collections;

[RequireComponent (typeof (Camera))]
public class TemporalAA : MonoBehaviour {
    public Shader shader = null;
    private Material mat = null;

    private bool initialized = false, usingRT1 = true;
    private RenderTexture rt1 = null, rt2 = null;

    private Matrix4x4 prevViewProj;
    private int JitterIdx = 0;

    private Matrix4x4 getViewProjMatrix() {
        return GL.GetGPUProjectionMatrix(camera.projectionMatrix, false) * camera.worldToCameraMatrix;
    }

    void Start () {
        mat = new Material(shader);
        mat.hideFlags = HideFlags.HideAndDontSave;
    }

    void OnEnable() {
        prevViewProj = getViewProjMatrix();
        
        camera.depthTextureMode |= DepthTextureMode.Depth;

        initialized = false;
        usingRT1 = true;
    }
    void OnDisable() {
        RenderTexture.Destroy(rt1);
        rt1 = null;
        RenderTexture.Destroy(rt2);
        rt2 = null;
    }
    
    private float []JitterOffsetX = { -8.0f/16.0f, 0.0f/16.0f };
    private float []JitterOffsetY = { 0.0f/16.0f, 8.0f/16.0f };
    float Halton( int Index, int Base )
    {
        float Result = 0.0f;
        float InvBase = 1.0f / Base;
        float Fraction = InvBase;
        while( Index > 0 )
        {
            Result += ( Index % Base ) * Fraction;
            Index /= Base;
            Fraction *= InvBase;
        }
        return Result;
    }

    void Update () {
        JitterIdx = (JitterIdx + 1) % 8;

        Matrix4x4 matrix = camera.projectionMatrix;
        matrix[0,2] += (Halton(JitterIdx+1, 2)-0.5f)/Screen.width;//JitterOffsetX[JitterIdx]/Screen.width;
        matrix[1,2] += (Halton(JitterIdx+1, 3)-0.5f)/Screen.height;//JitterOffsetY[JitterIdx]/Screen.height;
        camera.projectionMatrix = matrix;
    }

    public Vector4 vParams = new Vector4(0.8f, 0, 24.0f, 32.0f);
    void OnRenderImage(RenderTexture src, RenderTexture dest) {
        if(rt1 == null) {
            rt1 = new RenderTexture(Screen.width, Screen.height, 0, RenderTextureFormat.ARGBHalf);
            rt1.Create();
        }
        if(rt2 == null) {
            rt2 = new RenderTexture(Screen.width, Screen.height, 0, RenderTextureFormat.ARGBHalf);
            rt2.Create();
        }
        
        camera.ResetProjectionMatrix();
        Matrix4x4 ViewProj = getViewProjMatrix();
        mat.SetMatrix("combinedVP", prevViewProj * Matrix4x4.Inverse(ViewProj));
        prevViewProj = ViewProj;

        RenderTexture prev = null, current = null;
        if(usingRT1) {
            current = rt1;
            prev = rt2;
            usingRT1 = false;
        }
        else {
            current = rt2;
            prev = rt1;
            usingRT1 = true;
        }

        if(!initialized){
            prev = src;
            initialized = true;
        }

        mat.SetVector("texel", new Vector4(1.0f/src.width, 1.0f/src.height, 0, 0));
        mat.SetVector("vParams", new Vector4(vParams.x , 0, 1.0f / vParams.z, 1.0f / vParams.w));
        mat.SetTexture("_MainTex1", prev);
        current.DiscardContents();
        Graphics.Blit(src, current, mat);

        Graphics.Blit(current, dest);
    }
}
