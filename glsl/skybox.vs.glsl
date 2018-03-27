uniform vec3 cameraPositionUniform;

varying vec3 texCoordinates;

void main() {
	texCoordinates = position;

	gl_Position = projectionMatrix * viewMatrix * vec4(position + cameraPositionUniform, 1.0);
}
