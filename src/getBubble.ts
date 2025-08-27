import GUI from 'lil-gui';
import { AnimationMixer, Color, CubeTexture, DoubleSide, Group, LoadingManager, Mesh, PerspectiveCamera, Quaternion, Scene, ShaderMaterial, SphereGeometry } from 'three'
import waterVertexShader from './waterCube.vert?raw'
import waterFragmentShader from './waterCube.frag?raw';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { getEnvMap } from './getEnvMap';
import { getScene } from './getScene';

const sideLength = 2;
const widthSegments = 100;

const sphereGeo = new SphereGeometry(sideLength, widthSegments, widthSegments);

let waterMaterial: ShaderMaterial;

// const bubble = new Mesh(
//     sphereGeo,
//     waterCubeMaterial,
// );
const bubbleTweaks = {
    scale: 3,
}

// bubble.scale.set(bubbleTweaks.scale, bubbleTweaks.scale, bubbleTweaks.scale);
let mixer: AnimationMixer | null = null;

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
    // const safeDelta = Math.min(Math.max(deltaTime, 1/120), 1/24); // between 1/120s and 1/24s
    // mixer?.update(safeDelta * 8);
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
    // const bubbleGroup = new Group();
    // bubbleGroup.name = 'Bubble Group';


    // const sphereFolder = gui.addFolder('Sphere');
    // sphereFolder.add(waterCubeMaterial.uniforms.waveSpeed, 'value').min(0).max(20).step(0.01).name('Wave Speed');
    // // wave height gets *crazy* if over 1
    // sphereFolder.add(waterCubeMaterial.uniforms.waveHeight, 'value').min(0).max(0.05).step(0.001).name('Wave Height');
    // sphereFolder.add(waterCubeMaterial, 'transparent').name('Transparent');
    // sphereFolder.add(bubbleTweaks, 'scale').min(1).max(5).step(1).onChange((value: number) => {
        //     bubble.scale.set(value, value, value);
    // });

    // bubbleGroup.add(bubble);
    // console.log('bubble group', bubbleGroup);

    
    // const loader = new GLTFLoader(loadingManager);
    // should probably have loader as separate function that either loads and returns or clones if loaded already
    // loader.load(
    //     'models/koi/scene.gltf',
    //     gltf => {
    //         // NOTE imported models should be cloned via Object3d.clone() for best efficiency
    //         // i.e. fish model can be reused if cloned
    //         // gltf.scene.clone();
    //         bubbleGroup.add(gltf.scene);

    //         if (gltf.animations?.length) {
    //             gltf.scene.rotateY(0); // turn fish the way I want initially
    //             mixer = new AnimationMixer(gltf.scene);
    //             console.assert(gltf.animations.length > 0, 'The model has no animations');
    //             mixer?.clipAction(gltf.animations[0]).play();
    //         }
    //     },
    //     undefined,
    //     console.error,
    // );

    // IDEA: use collision detection to increase the wave amplitude during collisions indicating disturbances
    
    // return { animateBubble, bubbleGroup };
}