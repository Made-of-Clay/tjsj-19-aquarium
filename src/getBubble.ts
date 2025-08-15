import GUI from 'lil-gui';
import { AnimationMixer, Color, CubeTexture, DoubleSide, Group, LoadingManager, Mesh, PerspectiveCamera, Quaternion, Scene, ShaderMaterial, SphereGeometry } from 'three'
import waterVertexShader from './waterCube.vert?raw'
import waterFragmentShader from './waterCube.frag?raw';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

export function getBubble(gui: GUI, envMap: CubeTexture, scene: Scene, loadingManager: LoadingManager) {
    const bubbleGroup = new Group();
    bubbleGroup.name = 'Bubble Group';

    const sideLength = 2;
    const widthSegments = 100;

    const sphereGeo = new SphereGeometry(sideLength, widthSegments, widthSegments);

    const waterCubeMaterial = new ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            waveSpeed: { value: 8 },
            waveHeight: { value: 0.02 },
            envMap: { value: envMap ?? null },
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

    const sphereFolder = gui.addFolder('Sphere');
    sphereFolder.add(waterCubeMaterial.uniforms.waveSpeed, 'value').min(0).max(20).step(0.01).name('Wave Speed');
    // wave height gets *crazy* if over 1
    sphereFolder.add(waterCubeMaterial.uniforms.waveHeight, 'value').min(0).max(0.05).step(0.001).name('Wave Height');
    sphereFolder.add(waterCubeMaterial, 'transparent').name('Transparent');

    const bubble = new Mesh(
        sphereGeo,
        waterCubeMaterial,
    );
    const bubbleTweaks = {
        scale: 3,
    }
    bubble.scale.set(bubbleTweaks.scale, bubbleTweaks.scale, bubbleTweaks.scale);
    sphereFolder.add(bubbleTweaks, 'scale').min(1).max(5).step(1).onChange((value: number) => {
        bubble.scale.set(value, value, value);
    });

    bubbleGroup.add(bubble);

    let mixer: AnimationMixer | null = null;

    const loader = new GLTFLoader(loadingManager);
    loader.load(
        'models/koi/scene.gltf',
        gltf => {
            bubbleGroup.add(gltf.scene);

            if (gltf.animations?.length) {
                gltf.scene.rotateY(90); // turn fish the way I want initially
                mixer = new AnimationMixer(gltf.scene);
                console.assert(gltf.animations.length > 0, 'The model has no animations');
                mixer?.clipAction(gltf.animations[0]).play();
            }
        },
        undefined,
        console.error,
    );

    // IDEA: use collision detection to increase the wave amplitude during collisions indicating disturbances
    function animateBubble(elapsedTime: number, camera: PerspectiveCamera, deltaTime: number) {
        waterCubeMaterial.uniforms.time.value = elapsedTime;
        waterCubeMaterial.uniforms.cameraQuaternion.value.copy(camera.quaternion)
        const safeDelta = Math.min(Math.max(deltaTime, 1/120), 1/24); // between 1/120s and 1/24s
        mixer?.update(safeDelta * 8);
    }
    
    return { animateBubble, bubbleGroup }
}