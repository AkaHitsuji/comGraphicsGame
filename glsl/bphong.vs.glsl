//VARYING VAR
varying vec3 Normal_V;
varying vec3 Position_V;
varying vec2 Texcoord_V;

uniform float leftArmAngle;
uniform float rightArmAngle;
uniform mat4 left_tMat;
uniform mat4 left_invMat;
uniform mat4 right_tMat;
uniform mat4 right_invMat;
uniform mat4 leftLeg_tMat;
uniform mat4 leftLeg_invMat;
uniform mat4 rightLeg_tMat;
uniform mat4 rightLeg_invMat;
uniform float leftLegAngle;
uniform float rightLegAngle;

mat4 rotationMatrix(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(
			oc*axis.x*axis.x+c,oc*axis.x*axis.y-axis.z*s,oc*axis.z*axis.x+axis.y*s,0.0,
			oc*axis.x*axis.y+axis.z*s,oc*axis.y*axis.y+c,oc*axis.y*axis.z-axis.x*s,0.0,
      oc*axis.z*axis.x-axis.y*s,oc*axis.y*axis.z+axis.x*s,oc*axis.z*axis.z+c,0.0,
			0.0,0.0,0.0,1.0);
}

void main() {

	Normal_V = normalMatrix * normal;
	Position_V = vec3(modelViewMatrix * vec4(position, 1.0));
	Texcoord_V = uv;
	vec3 xAxis = vec3(1.0,0.0,0.0);

	if (position.x>0.5 && position.y>0.5) {
		// color = vec3(0.0, 1.0, 0.0);
		gl_Position = projectionMatrix * modelViewMatrix * left_invMat * rotationMatrix(xAxis,-4.3+leftArmAngle) * left_tMat *  vec4(position, 1.0);
	}
	else if (position.x<-0.55 && position.y>0.5) {
		// color = vec3(1.0,0.0,0.0);
		gl_Position = projectionMatrix * modelViewMatrix * right_invMat * rotationMatrix(xAxis,-4.3+rightArmAngle) * right_tMat * vec4(position, 1.0);
	}
	else if (position.x>0.2 && position.y<0.3) {
		// color = vec3(0.0,0.0,1.0);
		gl_Position = projectionMatrix * modelViewMatrix * leftLeg_invMat * rotationMatrix(xAxis,leftLegAngle) * leftLeg_tMat * vec4(position, 1.0);

	}
	else if (position.x<-0.3 && position.y<0.3) {
		// color = vec3(1.0,0.0,1.0);
		gl_Position = projectionMatrix * modelViewMatrix * rightLeg_invMat * rotationMatrix(xAxis,rightLegAngle) * rightLeg_tMat * vec4(position, 1.0);

	}
  else {
  	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
}
