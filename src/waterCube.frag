// A simplified fragment shader example to get you started
// In a real-world scenario, this would be much more complex.

precision mediump float;

uniform samplerCube envMap;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;
uniform vec4 cameraQuaternion;

varying vec3 vNormal;
varying vec3 vViewPosition;

/**
 * @brief Rotate a vector by a quaternion.
 * @param v The vector to rotate.
 * @param q The quaternion (q.xyz = vector, q.w = scalar).
 * @return The rotated vector.
 */
vec3 rotateByQuaternion(vec3 v, vec4 q) {
    return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(vViewPosition);

    // Reflection (simplified)
    vec3 reflectedDirection = reflect(viewDirection, normal);
    vec3 rotatedReflected = rotateByQuaternion(reflectedDirection, cameraQuaternion);
    vec3 reflectionColor = textureCube(envMap, rotatedReflected).rgb;

    // Transparency/Fresnel (simplified)
    float fresnel = 1.0 - dot(viewDirection, normal);
    vec3 baseColor = vec3(0.4, 0.4, 0.2);
    vec3 finalColor = mix(baseColor, reflectionColor, fresnel);

    // TODO experiment with other water effects like caustics, refraction, etc. (maybe less Fresnel)

    // Apply fog
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fogFactor = smoothstep(fogNear, fogFar, depth);
    finalColor = mix(finalColor, fogColor, fogFactor);

    gl_FragColor = vec4(finalColor, 0.5); // 2nd param is our opacity
}