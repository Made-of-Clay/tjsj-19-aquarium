// A simplified fragment shader example to get you started
// In a real-world scenario, this would be much more complex.

uniform samplerCube envMap;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(vViewPosition);

    // Reflection (simplified)
    vec3 reflectedDirection = reflect(viewDirection, normal);
    vec3 reflectionColor = textureCube(envMap, reflectedDirection).rgb;

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