uniform float time;
uniform float waveSpeed;
uniform float waveHeight;

varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Simple ripple calculation
    float distanceFactor = distance(modelPosition.xz, vec2(0.0, 0.0));
    float wave = sin(distanceFactor * 10.0 + time * waveSpeed) * waveHeight;

    // Displace the vertex along its normal
    vec3 displacedPosition = position + normal * wave;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
    vViewPosition = -gl_Position.xyz;
}