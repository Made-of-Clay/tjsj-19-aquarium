import GUI from 'lil-gui';
import { AnimationMixer, BoxGeometry, BufferGeometry, CatmullRomCurve3, Color, CubeTexture, DoubleSide, Float32BufferAttribute, Group, Line, LineBasicMaterial, LoadingManager, Mesh, MeshBasicMaterial, PerspectiveCamera, Points, PointsMaterial, Quaternion, Scene, ShaderMaterial, SphereGeometry, Vector3 } from 'three'
import waterVertexShader from './waterCube.vert?raw'
import waterFragmentShader from './waterCube.frag?raw';
import { Flow, GLTFLoader } from 'three/examples/jsm/Addons.js';

// Example (https://threejs.org/examples/?q=modi#webgl_modifier_curve) 
// and source (https://github.com/mrdoob/three.js/blob/master/examples/webgl_modifier_curve.html#L72)
// ----
// init testing path points
// const pointPos = [
//     10, 2, -6,
//     10, 2, 6,
//     0, 6, 10,
//     -10, 2, 6,
//     -10, 2, -6,
//     0, 6, -10,
// ];
// const curvePoints: Vector3[] = [];
// for (let i = 0; i < pointPos.length; i += 3) {
//     curvePoints.push(new Vector3(pointPos[i], pointPos[i + 1], pointPos[i + 2]));
// }

// // TODO refactor (or make new) as class that returns creature in bubble

// const dotGeo = new BufferGeometry();
// dotGeo.setAttribute('position', new Float32BufferAttribute(pointPos, 3));
// const dotMat = new PointsMaterial({ color: 0xff00ff });
// const points = new Points(dotGeo, dotMat);

export function getBubble(gui: GUI, envMap: CubeTexture, scene: Scene, loadingManager: LoadingManager) {
    // for testing
    // scene.add(points);

    // draw line from pointPos
    // const curve = new CatmullRomCurve3(curvePoints, true);
    // const line = new Line(
    //     new BufferGeometry().setFromPoints(curve.getPoints(100)),
    //     new LineBasicMaterial({ color: 0xff0000 }),
    // );
    // scene.add(line);

    // real code
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
    console.log('bubble group', bubbleGroup);

    // animate bubble group along path - NOTICE leaving this here for legacy
    // might return to path animation, but it's fairly clear I can't do Group
    // animation along a path; only mesh
    // const cube = new Mesh(
    //     new BoxGeometry(3, 3, 3),
    //     new MeshBasicMaterial({ color: 0x00ff00, wireframe: true }),
    // );
    // const cubeFlow = new Flow(cube);
    // cubeFlow.updateCurve(0, curve);
    // scene.add(cubeFlow.object3D);

    let mixer: AnimationMixer | null = null;

    const loader = new GLTFLoader(loadingManager);
    // should probably have loader as separate function that either loads and returns or clones if loaded already
    loader.load(
        'models/koi/scene.gltf',
        gltf => {
            // NOTE imported models shuold be cloned via Object3d.clone() for best efficiency
            // i.e. fish model can be reused if cloned
            // gltf.scene.clone();
            bubbleGroup.add(gltf.scene);

            if (gltf.animations?.length) {
                gltf.scene.rotateY(0); // turn fish the way I want initially
                mixer = new AnimationMixer(gltf.scene);
                console.assert(gltf.animations.length > 0, 'The model has no animations');
                mixer?.clipAction(gltf.animations[0]).play();
            }
        },
        undefined,
        console.error,
    );

    let globalPosition = new Vector3();
    // IDEA: use collision detection to increase the wave amplitude during collisions indicating disturbances
    function animateBubble(elapsedTime: number, camera: PerspectiveCamera, deltaTime: number) {
        waterCubeMaterial.uniforms.time.value = elapsedTime;
        waterCubeMaterial.uniforms.cameraQuaternion.value.copy(camera.quaternion)
        const safeDelta = Math.min(Math.max(deltaTime, 1/120), 1/24); // between 1/120s and 1/24s
        mixer?.update(safeDelta * 8);
        // cubeFlow.moveAlongCurve(0.001);
        // animatedBubbleGroup.moveAlongCurve(0.001);
        // globalPosition.setFromMatrixPosition(cubeFlow.)
        // console.log('--', cubeFlow.getWorldPosition(globalPosition));
        // console.log('>>', globalPosition);
    }
    
    return { animateBubble, bubbleGroup/* , animatedBubbleGroup */ };
}