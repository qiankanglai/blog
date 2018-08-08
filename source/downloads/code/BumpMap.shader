Shader "Kanglai/BumpTest" {
    Properties {
        _MainTex ("Base (RGB)", 2D) = "white" {}
        _BumpMap ("Bump (R)", 2D) = "black" {}
        _BumpScale ("Bump Scale", Range(-0.3, 0.3)) = 0.01
    }
    SubShader {
        Pass {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma glsl
            #pragma target 3.0

            #include "UnityCG.cginc"

            sampler2D _MainTex, _BumpMap;
            float _BumpScale;
            
            struct v2f{
                float4 pos : SV_POSITION;
                float4 tex : TEXCOORD0;
                float4 wpos : TEXCOORD1;
                float3 normal : TEXCOORD2;
            };

            float3 perturbNormalArb( float3 surf_pos, float3 surf_norm, float2 dHdxy ) {
                float3 vSigmaX = ddx( surf_pos );
                float3 vSigmaY = ddy( surf_pos );
                float3 vN = surf_norm;     // normalized

                float3 R1 = cross( vSigmaY, vN );
                float3 R2 = cross( vN, vSigmaX );

                float fDet = dot( vSigmaX, R1 );

                float3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
                return normalize( abs( fDet ) * surf_norm - vGrad );
            }
            
            v2f vert(appdata_base i){
                v2f o;
                o.normal = mul ((float3x3)UNITY_MATRIX_IT_MV, i.normal);
                float _Amount = tex2D (_BumpMap, i.texcoord.xy).r * _BumpScale;
                o.wpos = mul (UNITY_MATRIX_MV, i.vertex);
                o.wpos.xyz += o.normal * _Amount;
                o.pos = mul (UNITY_MATRIX_P, o.wpos);
                o.tex = i.texcoord;
                return o;
            }
            float4 frag(v2f i) : COLOR {
                float3 albedo = tex2D(_MainTex, i.tex.xy);
                
                float2 TexDx = ddx(i.tex.xy);
                float2 TexDy = ddy(i.tex.xy);
                float Hll = tex2D(_BumpMap, i.tex.xy).x;
                float Hlr = tex2D(_BumpMap, i.tex.xy + TexDx).x;
                float Hul = tex2D(_BumpMap, i.tex.xy + TexDy).x;
                float dBs = (Hlr - Hll) * _BumpScale ;
                float dBt = (Hul - Hll) * _BumpScale ;
                
                i.normal = perturbNormalArb(i.wpos, i.normal, float2(dBs, dBt));
                
                #ifndef USING_DIRECTIONAL_LIGHT
                float3 lightDir = _WorldSpaceLightPos0.xyz - i.wpos;
                #else
                float3 lightDir = _WorldSpaceLightPos0.xyz;
                #endif
                float diff = max (0, dot (i.normal, normalize(lightDir)));
                return float4(albedo * diff, 1.0);
            }
            ENDCG
        }
    } 
    FallBack "Diffuse"
}
