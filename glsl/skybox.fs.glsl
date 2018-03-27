// UNIFORMS
uniform samplerCube skybox;
varying vec3 texCoordinates;

void main() {
	gl_FragColor = textureCube(skybox,texCoordinates);
}
