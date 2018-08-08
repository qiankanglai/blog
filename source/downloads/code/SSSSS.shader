Shader "Kanglai/SSSSS" {
    Properties {
        _MainTex ("Base (RGB)", 2D) = "white" {}
    }
    CGINCLUDE
    
    #include "UnityCG.cginc"
    
    struct v2f {
        float4 pos : SV_POSITION;
        float2 uv : TEXCOORD0;
    };
    
    sampler2D _MainTex;
    sampler2D _CameraDepthNormalsTexture;    //built-in
    
    float2 step;
    float correction;
        
    sampler2D _FrameTex;
    float4 _BlendFactor;
    
    v2f vert( appdata_img v ) {
        v2f o;
        o.pos = mul(UNITY_MATRIX_MVP, v.vertex);
        o.uv = v.texcoord.xy;

        return o;
    } 
    
    half4 GaussianBlur(v2f i){
        // Gaussian weights for the six samples around the current pixel:
        //   -3 -2 -1 +1 +2 +3
        float w[6] = { 0.006f,   0.061f,   0.242f,  0.242f,  0.061f, 0.006f };
        float o[6] = {  -1.0f, -0.6667f, -0.3333f, 0.3333f, 0.6667f,   1.0f };

        // Fetch color and linear depth for current pixel:
        float4 colorM = tex2D(_MainTex, i.uv);
        float depthM =  DecodeFloatRG(tex2D (_CameraDepthNormalsTexture, i.uv).zw);

        // Accumulate center sample, multiplying it with its gaussian weight:
        float4 colorBlurred = colorM;
        colorBlurred.rgb *= 0.382f;
        
        // Calculate the step that we will use to fetch the surrounding pixels,
        // where "step" is:
        //     step = sssStrength * gaussianWidth * pixelSize * dir
        // The closer the pixel, the stronger the effect needs to be, hence
        // the factor 1.0 / depthM.
        float2 finalStep = colorM.a * step / depthM * 0.0125f;
        for (int j = 0; j < 6; ++ j)
        {
            // Fetch color and depth for current sample:
            float2 offset = i.uv + o[j] * finalStep;
            float3 color = tex2D(_MainTex, offset).rgb;
            float depth =  DecodeFloatRG(tex2D (_CameraDepthNormalsTexture, offset).zw);

            // If the difference in depth is huge, we lerp color back to "colorM":
            float s = min(correction * abs(depthM - depth), 1);
            color = lerp(color, colorM.rgb, s);

            // Accumulate:
            colorBlurred.rgb += w[j] * color;
        }
        return colorBlurred;
    }
    
    half4 frag1(v2f i) : SV_Target{
        half4 o = GaussianBlur(i);
        return o;
    }
    
    half4 frag2(v2f i) : SV_Target{
        half4 colorBlurred = GaussianBlur(i);
        half4 frame_input = tex2D(_FrameTex, i.uv);
        half4 o;
        o.rgb = lerp(frame_input.rgb, colorBlurred.rgb, _BlendFactor.rgb);
        o.a = frame_input.a + colorBlurred.a;
        return o;
    }

    ENDCG 
    SubShader {
        Pass {
            ZTest Always Cull Off ZWrite Off
            Fog { Mode off }

            CGPROGRAM
            #pragma fragmentoption ARB_precision_hint_fastest 
            #pragma glsl
            #pragma target 3.0
            #pragma vertex vert
            #pragma fragment frag1
            ENDCG
        }
        
        Pass {
            ZTest Always Cull Off ZWrite Off
            Fog { Mode off }   
            CGPROGRAM
            #pragma fragmentoption ARB_precision_hint_fastest 
            #pragma glsl
            #pragma target 3.0
            #pragma vertex vert
            #pragma fragment frag2
            ENDCG
        }
    } 
    FallBack off
}
