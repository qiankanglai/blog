using UnityEngine;
using UnityEditor;
using System.Collections;

[CustomEditor(typeof(CubemapCaptureScript))]
public class CubemapCaptureEditor : Editor {
    void OnEnable() {
        CubemapCaptureScript myScript = (CubemapCaptureScript)target;
        myScript.Setup ();
    }

    void OnDisable() {
        CubemapCaptureScript myScript = (CubemapCaptureScript)target;
        myScript.Cleanup ();
    }

    public override void OnInspectorGUI()
    {
        DrawDefaultInspector();
        
        CubemapCaptureScript myScript = (CubemapCaptureScript)target;
        myScript.TextureSize = EditorGUILayout.IntField ("Texture Size", myScript.TextureSize);
        myScript.PreviewCamera = EditorGUILayout.Toggle ("Preview", myScript.PreviewCamera);
        if(GUILayout.Button("Build Cubemap"))
        {
            myScript.BuildCubemap();
        }
    }
}
