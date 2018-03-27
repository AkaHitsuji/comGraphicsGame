//VARYING VAR
varying vec3 Normal_V;
varying vec3 Position_V;
varying vec4 PositionFromLight_V;
varying vec2 Texcoord_V;

//UNIFORM VAR
uniform vec3 lightColorUniform;
uniform vec3 ambientColorUniform;
uniform vec3 lightDirectionUniform;

uniform float kAmbientUniform;
uniform float kDiffuseUniform;
uniform float kSpecularUniform;
uniform float shininessUniform;

uniform sampler2D colorMap;
uniform sampler2D normalMap;
uniform sampler2D aoMap;
uniform sampler2D shadowMap;

// PART D)
// Use this instead of directly sampling the shadowmap, as the float
// value is packed into 4 bytes as WebGL 1.0 (OpenGL ES 2.0) doesn't
// support floating point bufffers for the packing see depth.fs.glsl
float getShadowMapDepth(vec2 texCoord)
{
	vec4 v = texture2D(shadowMap, texCoord);
	const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0 * 256.0), 1.0/(256.0*256.0*256.0));
	return dot(v, bitShift);
}

void main() {
	// PART B) TANGENT SPACE NORMAL
	vec3 N_1 = normalize(texture2D(normalMap, Texcoord_V).xyz * 2.0 - 1.0);

	// PRE-CALCS
	vec3 N = normalize(Normal_V);
	vec3 upVector = normalize(vec3(0.0,1.0,0.0));
  vec3 T = normalize(cross(N, upVector));
  vec3 B = normalize(cross(N, T));
	mat3 inverseTBNMatrix = mat3(
		vec3(T.x,T.y,T.z),
		vec3(B.x,B.y,B.z),
		vec3(N.x,N.y,N.z)
		);
	vec3 L = normalize(inverseTBNMatrix * vec3(viewMatrix * vec4(lightDirectionUniform, 0.0)));
	vec3 V = normalize(inverseTBNMatrix * -Position_V);
	vec3 H = normalize(V + L);

	// AMBIENT
	vec3 light_AMB = texture2D(aoMap, Texcoord_V).xyz * ambientColorUniform * kAmbientUniform;

	// DIFFUSE
	vec3 diffuse = texture2D(colorMap, Texcoord_V).xyz * kDiffuseUniform * lightColorUniform;
	vec3 light_DFF = diffuse * max(0.0, dot(N_1, L));

	// SPECULAR
	vec3 specular = kSpecularUniform * lightColorUniform;
	vec3 light_SPC = specular * pow(max(0.0, dot(H, N_1)), shininessUniform);

	// SHADOW
	// Fill in attenuation for shadow here
	//convert to normalized space
	vec4 PositionFromLight_L = PositionFromLight_V/PositionFromLight_V.w;
	//to convert to light space
	PositionFromLight_L = PositionFromLight_L/2.0 + 0.5;

	// For Shadow
	// float visibility = 1.0;
	// float bias = 0.0005;
	// if (getShadowMapDepth(PositionFromLight_L.xy) < (PositionFromLight_L.z-bias)) {
	// 	visibility = 0.2;
	// }

	// TOTAL
	vec3 TOTAL = (light_AMB + light_DFF  + light_SPC);

	gl_FragColor = vec4(TOTAL, 1.0);
}
