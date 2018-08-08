import re

def output_shader(shader_name, vertOut, variables, vs_codes, fs_codes, defines):
	print("Shader \"Custom/"+shader_name+"\" {")

	properties = []
	for i in range(0, len(variables)):
		t = variables[i].split(" ")[0]
		n = variables[i].split(" ")[1][:-1].strip()
		if(t == "float"):
			properties.append("            "+n+" (\""+n+"\", float) = 0")
		elif(t[0:5] == "float"):
			if(n[-3:] == "_ST"):
				continue
			properties.append("            "+n+" (\""+n+"\", vector) = (0, 0, 0, 0)")
		elif(t == "sampler2D"):
			properties.append("            "+n+" (\""+n+"\", 2D) = \"black\" {}")
		else:
			print("ERROR: unknwon "+variables[i])
	properties.sort()
	print('''        Properties {''')
	for i in range(0, len(properties)):
		print(properties[i])

	print('''        }
    SubShader {
        Pass {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma target 3.0
            #include \"UnityCG.cginc\"
            #include \"Lighting.cginc\"''')
	print("")

	for i in range(0, len(variables)):
		print("            "+variables[i])
	print("")

	print("\n".join(defines))

	print("            struct vertOut {")
	vertOut = list(vertOut.values())
	for i in range(0, len(vertOut)):
		print("                "+vertOut[i]+";")
	print("            };")
	print("")

	print("            vertOut vert(appdata_full v) {")
	print("                vertOut o;")
	for i in range(0, len(vs_codes)):
		print("                "+vs_codes[i])
	print("                return o;")
	print("            }")
	print("")

	print("            fixed4 frag(vertOut o) : SV_Target {")
	for i in range(0, len(fs_codes)):
		print("                "+fs_codes[i])
	print("            }")

	print('''            ENDCG
        }
    }
}''')

unity_builtin = ["_Time", "_SinTime", "_CosTime", "_LightColor0", "_Object2World", "_World2Object"]
def parse(filename, is_vs):
	f = open(filename)
	in_variables = []
	out_variables = []
	variables = []
	codes = []
	defines = []
	in_codes = False
	for line in f:
		line = line.strip()
		if(len(line) == 0):
			continue
		if(line[0] == '#'):
			defines.append(line)
			continue
		if(line[0:2] == "//"):
			continue
		if(line[0:4]=="void"):
			in_codes = True

		if(not in_codes):
			if(line[0:6] == "layout"):
				continue
			if(line[0:9] == "precision"):
				continue
		
		line = fixvariableinline("uniform", "", line)
		line = fixvariableinline("highp", "", line)
		line = fixvariableinline("mediump", "", line)
		line = fixvariableinline("lowp", "", line)

		line = re.sub('\s+', ' ', line).strip()
		
		line = fixvariableinline("vec2", "float2", line)
		line = fixvariableinline("vec3", "float3", line)
		line = fixvariableinline("vec4", "float4", line)
		line = fixvariableinline("mat2", "float2x2", line)
		line = fixvariableinline("mat3", "float3x3", line)
		line = fixvariableinline("mat4", "float4x4", line)

		if(in_codes):
			line = fixvariableinline("mix", "lerp", line)
			line = fixvariableinline("texture2D", "tex2D", line)
			line = fixvariableinline("texture", "tex2D", line)
			line = fixvariableinline("fract", "frac", line)
			
			codes.append(line)
		else:
			name = line.split(' ')[-1]
			name = name[0:-1]	#skip ;
			if(name[0:7] == "glstate"):
				continue
			if(name in unity_builtin or name[:6] == "unity_"):
				continue

			if(line[0:2] == "in" or (is_vs and line[0:9]=="attribute") or ((not is_vs) and line[0:7]=="varying")):
				in_variables.append(' '.join(line.split(' ')[1:]))
			elif(line[0:3] == "out" or (is_vs and line[0:7]=="varying")):
				out_variables.append(' '.join(line.split(' ')[1:]))
			else:
				variables.append(line)
	f.close()
	codes = codes[2:-1]	#only keeps the function body
	return (variables, in_variables, out_variables, codes, defines)

def fixvariableinline(k, v, line):
	idx = line.find(k)
	while(idx >= 0):
		trailing = line[idx+len(k)]
		if(trailing>='a' and trailing<='z') or (trailing>='A' and trailing<='Z'):
			pass
		else:
			line=line[:idx]+v+line[idx+len(k):]
		idx = line.find(k, idx + len(k))
	return line

def fixvariablesincode(variable_mapping, codes):
	for i in range(0, len(codes)):
		line = codes[i]
		for k,v in variable_mapping.items():
			line = fixvariableinline(k, v, line)
		codes[i] = line
	return codes

def fixvariables(vs_in_variables, vs_out_variables, vs_codes, fs_codes):
	vertOut = {"gl_Position":"float4 pos:SV_POSITION"}
	variable_mapping = {
		"position":"v.vertex",
		"in_POSITION0":"v.vertex",
		"_glesVertex":"v.vertex",
		"_glesColor":"v.color",
		"_glesNormal":"v.normal",
		"in_NORMAL0":"v.normal",
		"normal":"v.normal",
		"in_TANGENT0":"v.tangent",
		"tangent":"v.tangent",
		"_glesMultiTexCoord0":"v.texcoord",
		"in_TEXCOORD0":"v.texcoord",
		"texCoord":"v.texcoord",
		"texcoord0":"v.texcoord",
		"_glesMultiTexCoord1":"v.texcoord1",
		"texcoord1":"v.texcoord1",
		"glstate_matrix_mvp":"UNITY_MATRIX_MVP",
		"gl_Position":"o.pos",
		#tricky FS output
		"_glesFragData[0] =":"return",
		"gl_FragColor =":"return",
	}
	idx = 0
	for vs_out in vs_out_variables:
		variable = vs_out.split(" ")[-1][:-1]
		vertOut[variable] = vs_out[:-1]+":TEXCOORD"+str(idx)
		variable_mapping[variable] = "o."+variable
		idx = idx+1
	for vs_in in vs_in_variables:
		variable = vs_in.split(" ")[-1][:-1]
		if(not variable in variable_mapping):
			print("ERROR: unknwon in variable:"+variable)

	vs_codes = fixvariablesincode(variable_mapping, vs_codes)
	fs_codes = fixvariablesincode(variable_mapping, fs_codes)

	return(vertOut, vs_codes, fs_codes)

if __name__ == '__main__':
	(vs_variables, vs_in_variables, vs_out_variables, vs_codes, vs_defines) = parse("vs.txt", True)
	(fs_variables, fs_in_variables, fs_out_variables, fs_codes, fs_defines) = parse("fs.txt", False)
	
	(vertOut, vs_codes, fs_codes) = fixvariables(vs_in_variables, vs_out_variables, vs_codes, fs_codes)
	
	variables = list(vs_variables)
	variables.extend(x for x in fs_variables if x not in variables)
	
	output_shader("test", vertOut, variables, vs_codes, fs_codes, vs_defines+fs_defines)