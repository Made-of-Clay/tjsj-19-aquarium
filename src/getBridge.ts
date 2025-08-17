import GUI from 'lil-gui';
import { Mesh, MeshStandardMaterial, PlaneGeometry, RepeatWrapping, TextureLoader } from 'three';

export function getBridge(gui: GUI, textureLoader: TextureLoader) {
    const bridgeWidth = 14;
    const bridgeHeight = 200;
    const aspect = bridgeHeight / bridgeWidth;
    const scaleMultiplier = 1;

    const colorMap = textureLoader.load('/textures/ganges_river_pebbles/textures/ganges_river_pebbles_diff_1k.jpg');
    colorMap.wrapS = colorMap.wrapT = RepeatWrapping;
    colorMap.repeat.set(scaleMultiplier, aspect * scaleMultiplier);
    const normalMap = textureLoader.load('/textures/ganges_river_pebbles/textures/ganges_river_pebbles_nor_gl_1k.jpg');
    normalMap.wrapS = normalMap.wrapT = RepeatWrapping;
    normalMap.repeat.set(scaleMultiplier, aspect * scaleMultiplier);
    const armMap = textureLoader.load('/textures/ganges_river_pebbles/textures/ganges_river_pebbles_arm_1k.jpg');
    armMap.wrapS = armMap.wrapT = RepeatWrapping;
    armMap.repeat.set(scaleMultiplier, aspect * scaleMultiplier);

    const bridgeMat = new MeshStandardMaterial({
        color: 'cornflowerblue',
        map: colorMap,
        normalMap: normalMap,
        aoMap: armMap,
        roughnessMap: armMap,
        metalnessMap: armMap,
        metalness: 0.5,
        roughness: 0.7,
    });

    const planeSegments = 10;
    const bridgeGeo = new PlaneGeometry(bridgeWidth, bridgeHeight, planeSegments, planeSegments);
    const bridge = new Mesh(bridgeGeo, bridgeMat);

    const folder = gui.addFolder('Bridge');
    folder.add(bridge.geometry.parameters, 'width').min(1).max(200).step(1).onChange((value: number) => {
        bridge.geometry = new PlaneGeometry(value, bridge.geometry.parameters.height, planeSegments, planeSegments);
    });
    folder.add(bridge.geometry.parameters, 'height').min(1).max(20).step(1).onChange((value: number) => {
        bridge.geometry = new PlaneGeometry(bridge.geometry.parameters.width, value, planeSegments, planeSegments);
    });
    folder.add(bridge.material, 'metalness').min(0).max(1).step(0.01);
    folder.add(bridge.material, 'roughness').min(0).max(1).step(0.01);
    folder.add(bridge.position, 'x').min(-100).max(100).step(1);
    folder.add(bridge.position, 'y').min(-100).max(100).step(1);
    folder.add(bridge.position, 'z').min(-100).max(100).step(1);

    return bridge;
}