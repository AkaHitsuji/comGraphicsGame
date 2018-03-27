uniform vec3 lightDirectionUniform;

varying vec3 V; //viewVector
varying vec3 N; //normal
varying vec3 L;

void main() {
  vec3 eyeCoord = vec3(modelViewMatrix * vec4(position,1.0));
  V = -eyeCoord;
  N = normalMatrix * normal;
  L = vec3(viewMatrix * vec4(lightDirectionUniform,0.0));;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
