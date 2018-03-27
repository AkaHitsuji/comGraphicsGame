uniform vec3 lightColorUniform;
uniform float kDiffuseUniform;
uniform float shininessUniform;

varying vec3 V; //viewVector
varying vec3 N; //normal
varying vec3 L;

vec3 CoolColor = vec3(1.0, 0, 1.0);
vec3 WarmColor = vec3(1.0, 0, 0);

void main() {
	vec3 l = normalize(L);
  vec3 n = normalize(N);
  vec3 v = normalize(V);
  vec3 h = normalize(l+v);

	float diffuse = max(0.0,dot(l,n));
	float specular = pow(max(dot(n,h), 0.0),shininessUniform);
	vec3 cool = min(CoolColor+lightColorUniform*kDiffuseUniform,1.0);
  vec3 warm = min(WarmColor+lightColorUniform*kDiffuseUniform,1.0);

	vec3 resultingColor = min(mix(cool,warm,diffuse)+specular,1.0);

	gl_FragColor = vec4(resultingColor,1);
}
