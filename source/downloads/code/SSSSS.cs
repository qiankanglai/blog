using UnityEngine;
using System.Collections;

public class SSSSS : MonoBehaviour {
    public Shader sssssShader = null;
    
    static Material sssssMaterial = null;

    protected void OnEnable () {
        camera.depthTextureMode |= DepthTextureMode.DepthNormals;
    }

    protected void OnDisable() {
        if( sssssMaterial ) {
            DestroyImmediate( sssssMaterial );
        }
    }    

    protected void CreateMaterials() {
        if (sssssMaterial == null) {
            sssssMaterial = new Material(sssssShader);
            sssssMaterial.hideFlags = HideFlags.DontSave;
        }
    }

    protected void Start()
    {
        // Disable if we don't support image effects
        if (!SystemInfo.supportsImageEffects) {
            enabled = false;
            Debug.Log("PostProcess SSSSS: Image Effects not supported");
            return;
        }
        if (!SystemInfo.SupportsRenderTextureFormat (RenderTextureFormat.Depth)) {
            enabled = false;
            Debug.Log("PostProcess SSSSS: Depth Texture not supported");
            return;
        }

        CreateMaterials();
        // Disable if the shader can't run on the users graphics card
        if (!sssssShader || !sssssMaterial.shader.isSupported) {
            enabled = false;
            Debug.Log("PostProcess SSSSS: shader or material not found");
            return;
        }
    }

    public float sss_strength = 1.0f;
    public float correction = 1.0f;


    void OnRenderImage (RenderTexture source, RenderTexture destination)
    {
        RenderTexture blur_x_tex_ = RenderTexture.GetTemporary (source.width/2, source.height/2, 0);

        // We may disable/enable the script when running in Editor
        CreateMaterials();
        
        sssssMaterial.SetTexture("_MainTex", source);
        sssssMaterial.SetFloat("correction", correction);
        sssssMaterial.SetVector("step", new Vector4(1.0f * sss_strength / source.width, 0, 0, 0));
        Graphics.Blit(source, blur_x_tex_, sssssMaterial, 0);
        
        sssssMaterial.SetTexture("_MainTex", blur_x_tex_);
        sssssMaterial.SetFloat("correction", correction);
        sssssMaterial.SetVector("step", new Vector4(0, 1.0f * sss_strength / source.height, 0, 0));
        sssssMaterial.SetTexture("_FrameTex", source);
        sssssMaterial.SetVector("_BlendFactor", new Vector4(0.3251f, 0.45f, 0.3584f, 1.0f));
        Graphics.Blit(blur_x_tex_, destination, sssssMaterial, 1);

        /*
        GL.PushMatrix();
        GL.LoadOrtho();
        
        RenderTexture.active = blur_x_tex_;

        sssssMaterial.SetTexture("_MainTex", source);
        sssssMaterial.SetFloat("correction", correction);
        sssssMaterial.SetVector("step", new Vector4(1.0f * sss_strength / source.width, 0, 0, 0));
        sssssMaterial.SetPass(0);
        GL.Begin(GL.QUADS);
        GL.TexCoord2(0.0f, 0.0f); GL.Vertex3(0.0f, 0.0f, 0.1f);
        GL.TexCoord2(1.0f, 0.0f); GL.Vertex3(1.0f, 0.0f, 0.1f);
        GL.TexCoord2(1.0f, 1.0f); GL.Vertex3(1.0f, 1.0f, 0.1f);
        GL.TexCoord2(0.0f, 1.0f); GL.Vertex3(0.0f, 1.0f, 0.1f);
        GL.End();

        RenderTexture.active = destination;

        sssssMaterial.SetTexture("_MainTex", blur_x_tex_);
        sssssMaterial.SetFloat("correction", correction);
        sssssMaterial.SetVector("step", new Vector4(0, 1.0f * sss_strength / source.height, 0, 0));
        sssssMaterial.SetTexture("_FrameTex", source);
        sssssMaterial.SetVector("_BlendFactor", new Vector4(0.3251f, 0.45f, 0.3584f, 1.0f));
        sssssMaterial.SetPass(1);
        GL.Begin(GL.QUADS);
        GL.TexCoord2(0.0f, 0.0f); GL.Vertex3(0.0f, 0.0f, 0.1f);
        GL.TexCoord2(1.0f, 0.0f); GL.Vertex3(1.0f, 0.0f, 0.1f);
        GL.TexCoord2(1.0f, 1.0f); GL.Vertex3(1.0f, 1.0f, 0.1f);
        GL.TexCoord2(0.0f, 1.0f); GL.Vertex3(0.0f, 1.0f, 0.1f);
        GL.End();
        
        GL.PopMatrix();
        */
        RenderTexture.ReleaseTemporary (blur_x_tex_);
    }
}
