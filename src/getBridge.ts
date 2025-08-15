import GUI from 'lil-gui';
import { Mesh, MeshStandardMaterial, PlaneGeometry } from 'three';

export function getBridge(gui: GUI) {
    // create along narrow plane
    // apply some texture and bump map to it (stone? river bed? shiny?)
    // keep it relatively simple (user shouldn't see under it or on the sides)
    const testMaterial = new MeshStandardMaterial({
        color: '#888',
        metalness: 0.5,
        roughness: 0.7,
    });

    const planeSegments = 10;
    const bridgeGeo = new PlaneGeometry(14, 90, planeSegments, planeSegments);
    const bridge = new Mesh(bridgeGeo, testMaterial);

    const folder = gui.addFolder('Bridge');
    folder.add(bridge.geometry.parameters, 'width').min(1).max(200).step(1).onChange((value: number) => {
        bridge.geometry = new PlaneGeometry(value, bridge.geometry.parameters.height, planeSegments, planeSegments);
    });
    folder.add(bridge.geometry.parameters, 'height').min(1).max(20).step(1).onChange((value: number) => {
        bridge.geometry = new PlaneGeometry(bridge.geometry.parameters.width, value, planeSegments, planeSegments);
    });
    folder.add(bridge.material, 'metalness').min(0).max(1).step(0.01);
    folder.add(bridge.material, 'roughness').min(0).max(1).step(0.01);

    return bridge;
}