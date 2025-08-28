import { Color, DoubleSide, Mesh, PerspectiveCamera, Quaternion, ShaderMaterial, SphereGeometry } from 'three'
import waterVertexShader from './waterCube.vert?raw'
import waterFragmentShader from './waterCube.frag?raw';
import { getEnvMap } from './getEnvMap';
import { getScene } from './getScene';

const sideLength = 2;
const widthSegments = 100;

const sphereGeo = new SphereGeometry(sideLength, widthSegments, widthSegments);

let waterMaterial: ShaderMaterial;

/**
 * Animate all instances of bubble (for now just one)
 * @param {Number} elapsedTime Time passed since animation started
 * @param {PerspectiveCamera} camera Active perspective camera
 * @param {Number} deltaTime From clock.getDelta(); time since last checked 
 */
export function animateBubble(elapsedTime: number, camera: PerspectiveCamera, deltaTime: number) {
    if (waterMaterial) {
        waterMaterial.uniforms.time.value = elapsedTime;
        waterMaterial.uniforms.cameraQuaternion.value.copy(camera.quaternion)
    }
}

export function getBubble() {
    if (!waterMaterial) {
        const scene = getScene();
        waterMaterial = new ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                waveSpeed: { value: 8 },
                waveHeight: { value: 0.02 },
                envMap: { value: getEnvMap() },
                fogColor: { value: scene.fog?.color ?? new Color(0x000000) },
                fogNear: { value: (scene.fog && 'near' in scene.fog) ? scene.fog?.near : 1 },
                fogFar: { value: (scene.fog && 'far' in scene.fog) ? scene.fog?.far : 1000 },
                cameraQuaternion: { value: new Quaternion() },
            },
            vertexShader: waterVertexShader,
            fragmentShader: waterFragmentShader,
            transparent: true,
            opacity: 0.5,
            side: DoubleSide,
        });
    }
    return new Mesh(sphereGeo, waterMaterial);
}