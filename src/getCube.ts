import GUI from 'lil-gui';
import { BoxGeometry, Color, CubeTexture, DoubleSide, Mesh, MeshLambertMaterial, MeshStandardMaterial, PlaneGeometry, Scene, ShaderMaterial } from 'three'
import waterVertexShader from './waterCube.vert?raw'
import waterFragmentShader from './waterCube.frag?raw';

export function getCube(gui: GUI, envMap: CubeTexture, scene: Scene) {
    // CUBE
    const sideLength = 2;
    const widthSegments = 100;

    const waterCubeMaterial = new ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            waveSpeed: { value: 2 },
            waveHeight: { value: 0.1 },
            envMap: { value: envMap ?? null },
            fogColor: { value: scene.fog?.color ?? new Color(0x000000) },
            fogNear: { value: (scene.fog && 'near' in scene.fog) ? scene.fog?.near : 1 },
            fogFar: { value: (scene.fog && 'far' in scene.fog) ? scene.fog?.far : 1000 },
        },
        vertexShader: waterVertexShader,
        fragmentShader: waterFragmentShader,
        transparent: true,
        side: DoubleSide,
    });

    const testingMaterial = new MeshStandardMaterial({
        color: '#f69f1f',
        metalness: 0.5,
        roughness: 0.7,
    });

    const cube = new Mesh(
        new BoxGeometry(sideLength, sideLength, sideLength, widthSegments, widthSegments, widthSegments),
        // testingMaterial,
        waterCubeMaterial,
    )
    cube.castShadow = true
    cube.position.y = 0.5

    // PLANE
    const plane = new Mesh(
        new PlaneGeometry(3, 3),
        new MeshLambertMaterial({
            color: 'gray',
            emissive: 'teal',
            emissiveIntensity: 0.2,
            side: 2,
            transparent: true,
            opacity: 0.4,
        })
    )
    plane.rotateX(Math.PI / 2)
    plane.receiveShadow = true

    return { cube, plane }
}