Shader "Hidden/TemporalAA1Tx" {
    Properties {
        _MainTex ("Base (RGB)", 2D) = "white" {}
    }
    SubShader {
        ZTest Off Cull Off ZWrite Off Blend Off
        Fog { Mode off }
        
        Pass {
            CGPROGRAM
            #include "UnityCG.cginc"
            #pragma vertex vert
            #pragma fragment frag  
            #pragma fragmentoption ARB_precision_hint_fastest 
            
            struct v2f {
                float4 pos : SV_POSITION;
                float2 uv  : TEXCOORD0;
                float2 projPos : TEXCOORD1;
            };
            
            v2f vert( appdata_img v ) 
            {
                v2f o;
                o.pos = mul(UNITY_MATRIX_MVP, v.vertex);
                o.projPos = o.pos.xy / o.pos.w;
                o.uv =  v.texcoord.xy;    
                return o;
            } 
            
            sampler2D _MainTex, _MainTex1;
            sampler2D _CameraDepthTexture;
            float4x4 combinedVP;
            float2 texel;
            float4 vParams;

            float4 frag(v2f i) : SV_Target 
            {
                float3 PosN = float3(i.projPos.xy, 0.0f);
                PosN.z = tex2D(_CameraDepthTexture, i.uv.xy).r;
                float4 temp = mul(combinedVP, float4(PosN, 1));
                
                float2 BackN = temp.xy / temp.w;
                
                float2 v = BackN.xy - PosN.xy;
                // Kanglai: Proj Space -> Screen Space
                v *= 0.5f;
                v.y *= _ProjectionParams.x;
                
                float fMaxFramesL = vParams.z;        // Frames to keep in history (low freq). Higher = less aliasing, but blurier result. Lower = sharper result, but more aliasing.
                float fMaxFramesH = vParams.w;        // Frames to keep in history (high freq). Higher = less aliasing, but blurier result. Lower = sharper result, but more aliasing.
                
                 // Curr frame and neighboor texels
                half3 cM  = tex2D(_MainTex, i.uv.xy);
                half3 cTL = tex2D(_MainTex, i.uv.xy + texel * float2(-0.5f, -0.5f));
                half3 cTR = tex2D(_MainTex, i.uv.xy + texel * float2( 0.5f, -0.5f));
                half3 cBL = tex2D(_MainTex, i.uv.xy + texel * float2(-0.5f,  0.5f));
                half3 cBR = tex2D(_MainTex, i.uv.xy + texel * float2( 0.5f,  0.5f));
                
                half3 cBlur = (cTL + cTR + cBL + cBR) * 0.25f;
                cM.rgb = lerp(cBlur, cM, vParams.x);
                    
                half3 cMin = min(min(min(min(cTL, cTR), cBL), cBR), cM);
                half3 cMax = max(max(max(max(cTL, cTR), cBL), cBR), cM);    
                
                float3 cAcc = tex2D(_MainTex1, i.uv.xy + v);    
                cAcc.rgb = clamp(cAcc, cMin, cMax); // Limit acc buffer color range to current frame
                
                half3 cHiFreq = sqrt(abs( cBlur.rgb - cM.rgb));
                
                float4 c = 0;
                c.rgb = lerp(cAcc, cM, saturate(lerp(fMaxFramesL, fMaxFramesH, cHiFreq)) );
                return c;
            }
            
            ENDCG
        }
    } 
    FallBack Off
}
