import GUI from 'lil-gui';
import { BoxGeometry, Color, CubeTexture, DoubleSide, LoadingManager, Mesh, MeshStandardMaterial, Scene, ShaderMaterial, SphereGeometry } from 'three'
import waterVertexShader from './waterCube.vert?raw'
import waterFragmentShader from './waterCube.frag?raw';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

export function getBubble(gui: GUI, envMap: CubeTexture, scene: Scene, loadingManager: LoadingManager) {
    // CUBE
    const sideLength = 2;
    const widthSegments = 100;

    const sphereGeo = new SphereGeometry(sideLength, widthSegments, widthSegments);
    
    const cubeGeo = new BoxGeometry(sideLength / 2, sideLength / 2, sideLength / 2, widthSegments, widthSegments, widthSegments);

    const waterCubeMaterial = new ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            waveSpeed: { value: 8 },
            waveHeight: { value: 0.02 },
            envMap: { value: envMap ?? null },
            fogColor: { value: scene.fog?.color ?? new Color(0x000000) },
            fogNear: { value: (scene.fog && 'near' in scene.fog) ? scene.fog?.near : 1 },
            fogFar: { value: (scene.fog && 'far' in scene.fog) ? scene.fog?.far : 1000 },
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

    const testingMaterial = new MeshStandardMaterial({
        color: '#f69f1f',
        metalness: 0.5,
        roughness: 0.7,
    });

    const cube = new Mesh(
        cubeGeo,
        testingMaterial,
        // waterCubeMaterial,
    )
    cube.position.y = 0.5

    const bubble = new Mesh(
        sphereGeo,
        waterCubeMaterial,
    );
    const bubbleTweaks = {
        scale: 2,
    }
    bubble.scale.set(bubbleTweaks.scale, bubbleTweaks.scale, bubbleTweaks.scale);
    sphereFolder.add(bubbleTweaks, 'scale').min(1).max(5).step(1).onChange((value: number) => {
        bubble.scale.set(value, value, value);
    });

    const loader = new GLTFLoader(loadingManager);
    loader.load(
        'models/koi/scene.gltf',
        gltf => {
            console.log('gltf', gltf);
            scene.add(gltf.scene);
        },
        console.log,
        console.error,
    );

    // IDEA: use collision detection to increase the wave amplitude during collisions indicating disturbances
    function animateBubble(elapsedTime: number) {
        // move swimming creature in here
        waterCubeMaterial.uniforms.time.value = elapsedTime;
    }
    
    return { cube, animateBubble, bubble }
}