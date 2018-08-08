using UnityEngine;
using UnityEditor;
using System.Collections;

public class CubemapCaptureScript : MonoBehaviour {
    public string filename = "mycubemap";
    public bool PreviewCamera {
        get { return m_PreviewCamera; }
        set {
            if(m_PreviewCamera != value) {
                m_PreviewCamera = value;
                Setup();
            }
        }
    }
    private bool m_PreviewCamera = false;
    public int TextureSize {
        get { return m_TextureSize; }
        set { 
            int size = Mathf.NextPowerOfTwo(value);
            if(m_TextureSize != size) {
                m_TextureSize = size; 
                Setup(); 
            }
        }
    }
    private int m_TextureSize = 16;
    private int m_LastTextureSize = -1;
    public bool m_saveImage = false;
    private RenderTexture m_RenderTexture = null;

    private RenderTexture BuildRenderTexture() {
        RenderTexture texture = new RenderTexture( m_TextureSize, m_TextureSize, 16 );
        texture.name = "__CubemapRenderTexture" + GetInstanceID();
        texture.isPowerOfTwo = true;
        texture.hideFlags = HideFlags.DontSave;
        return texture;
    }

    public void Setup() {
        if (m_RenderTexture != null && m_LastTextureSize != m_TextureSize) {
            DestroyImmediate( m_RenderTexture );
            m_RenderTexture = null;
        }

        if (m_RenderTexture == null) {
            m_RenderTexture = new RenderTexture( m_TextureSize, m_TextureSize, 16 , RenderTextureFormat.ARGB32);
            m_RenderTexture.name = "__CubemapRenderTexture" + GetInstanceID();
            m_RenderTexture.isPowerOfTwo = true;
            m_RenderTexture.hideFlags = HideFlags.DontSave;
            m_LastTextureSize = m_TextureSize;
        }
        
        if (camera == null) {
            gameObject.AddComponent<Camera>();
        }
        camera.targetTexture = m_PreviewCamera?null:m_RenderTexture;
    }
    public void Cleanup() {
        if (m_RenderTexture != null) {
            DestroyImmediate (m_RenderTexture);
            m_RenderTexture = null;
        }
        m_LastTextureSize = -1;
    }

    public void SaveRenderTexture( RenderTexture texture, Cubemap cube, CubemapFace face, bool flipX = false, bool flipY = true ) {
        RenderTexture.active = texture;
        // read render target
        Texture2D texture_ = new Texture2D(m_TextureSize, m_TextureSize, TextureFormat.ARGB32, false);
        texture_.ReadPixels( new Rect(0, 0, m_TextureSize, m_TextureSize), 0, 0);
        texture_.Apply ();
        // flip
        if (flipY) {
            for (int x = 0; x < m_TextureSize; x++) {
                for (int y1 = 0, y2 = m_TextureSize-1; y1 < y2; y1++, y2--) {
                    Color t1 = texture_.GetPixel (x, y1);
                    texture_.SetPixel (x, y1, texture_.GetPixel (x, y2));
                    texture_.SetPixel (x, y2, t1);
                }
            }
        }
        texture_.Apply ();
        if (flipX) {
            for (int x1 = 0, x2 = m_TextureSize-1; x1 < x2; x1++, x2--) {
                for (int y = 0; y < m_TextureSize; y++) {
                    Color t1 = texture_.GetPixel (x1, y);
                    texture_.SetPixel (x1, y, texture_.GetPixel (x2, y));
                    texture_.SetPixel (x2, y, t1);
                }
            }
        }
        texture_.Apply ();
        if (m_saveImage) {
            byte[] bytes = texture_.EncodeToPNG();
            string[] path_ = EditorApplication.currentScene.Split(char.Parse("/"));
            path_[path_.Length -1] = filename+"_"+face.ToString()+".png";
            System.IO.File.WriteAllBytes(string.Join("/", path_), bytes);
        }
        // save to cubemap
        cube.SetPixels (texture_.GetPixels (), face);
        cube.Apply ();
        DestroyImmediate(texture_);
        
        RenderTexture.active = null;
    }

    public void BuildCubemap() {
        Setup ();
        Cubemap cube = new Cubemap (m_TextureSize, TextureFormat.ARGB32, false);

        // OnWillRenderObject
        camera.ResetWorldToCameraMatrix ();
        camera.targetTexture = m_RenderTexture;

        Quaternion oldRotation = transform.rotation;
        // get 6 directions
        camera.ResetProjectionMatrix ();
        camera.Render();
        SaveRenderTexture (m_RenderTexture, cube, CubemapFace.PositiveZ);

        transform.Rotate (Vector3.up * 90);
        camera.ResetProjectionMatrix ();
        camera.Render();
        SaveRenderTexture (m_RenderTexture, cube, CubemapFace.PositiveX);
        
        transform.Rotate (Vector3.up * 90);
        camera.ResetProjectionMatrix ();
        camera.Render();
        SaveRenderTexture (m_RenderTexture, cube, CubemapFace.NegativeZ);

        transform.Rotate (Vector3.up * 90);
        camera.ResetProjectionMatrix ();
        camera.Render();
        SaveRenderTexture (m_RenderTexture, cube, CubemapFace.NegativeX);
        
        transform.rotation = oldRotation;
        transform.Rotate (Vector3.right * 90);
        camera.ResetProjectionMatrix ();
        camera.Render();
        SaveRenderTexture (m_RenderTexture, cube, CubemapFace.NegativeY);
        
        transform.Rotate (Vector3.right * -180);
        camera.ResetProjectionMatrix ();
        camera.Render();
        SaveRenderTexture (m_RenderTexture, cube, CubemapFace.PositiveY);

        // restore
        transform.rotation = oldRotation;
        camera.targetTexture = m_PreviewCamera?null:m_RenderTexture;

        //save cubemap
        string[] path_ = EditorApplication.currentScene.Split(char.Parse("/"));
        path_[path_.Length -1] = filename+".cubemap";
        AssetDatabase.CreateAsset(cube, string.Join("/",path_));
    }
}
