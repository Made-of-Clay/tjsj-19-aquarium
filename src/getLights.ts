import GUI from 'lil-gui';
import { AmbientLight, PointLight, PointLightHelper } from 'three';

export function getLights(gui: GUI) {
    const ambientLight = new AmbientLight('white', 0.4);
    const pointLight = new PointLight('white', 40, 100);
    pointLight.position.set(-5, 5, 5);
    pointLight.castShadow = true;
    pointLight.shadow.radius = 4;
    pointLight.shadow.camera.near = 0.1;
    pointLight.shadow.camera.far = 1000;
    pointLight.shadow.mapSize.width = 2048;
    pointLight.shadow.mapSize.height = 2048;

    const pointLightHelper = new PointLightHelper(pointLight, undefined, 'orange');
    pointLightHelper.visible = false;

    const lightsFolder = gui.addFolder('Lights');
    lightsFolder.add(ambientLight, 'visible').name('Ambient Light');
    lightsFolder.add(pointLight, 'visible').name('Point Light');
    lightsFolder.add(pointLight, 'intensity').min(3).max(100).step(1).name('Point Light Intensity');

    return { ambientLight, pointLight, pointLightHelper };
}