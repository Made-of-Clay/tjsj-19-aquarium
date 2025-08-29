import GUI from 'lil-gui';
import { PointLight, PointLightHelper, DirectionalLight, DirectionalLightHelper, AmbientLight } from 'three';

export function getLights(gui: GUI) {
    const ambientLight = new AmbientLight('white', 0.75);
    
    const pointLight = new PointLight('white', 40, 200);
    pointLight.position.set(5, 12, 5);
    pointLight.castShadow = true;
    pointLight.shadow.radius = 4;
    pointLight.shadow.camera.near = 0.1;
    pointLight.shadow.camera.far = 1000;
    pointLight.shadow.mapSize.width = 2048;
    pointLight.shadow.mapSize.height = 2048;

    const pointLightHelper = new PointLightHelper(pointLight, undefined, 'orange');
    pointLightHelper.visible = false;

    const directionLight = new DirectionalLight('white', 1);
    directionLight.position.set(1, 1, 3);
    directionLight.lookAt(0, 0, 0);

    const dirLightHelper = new DirectionalLightHelper(directionLight);
    dirLightHelper.visible = false;

    const lightsFolder = gui.addFolder('Lights');
    lightsFolder.add(ambientLight, 'visible').name('Ambient Light');
    lightsFolder.add(pointLight, 'visible').name('Point Light');
    lightsFolder.add(directionLight, 'visible').name('Direction Light');
    lightsFolder.add(pointLight, 'intensity').min(3).max(500).step(1).name('Point Light Intensity');
    lightsFolder.add(pointLight.position, 'x').name('Point Light  X').min(-50).max(50).step(1);
    lightsFolder.add(pointLight.position, 'y').name('Point Light  Y').min(-50).max(50).step(1);
    lightsFolder.add(pointLight.position, 'z').name('Point Light  Z').min(-50).max(50).step(1);
    lightsFolder.add(pointLightHelper, 'visible').name('Point Light Helper');
    lightsFolder.add(dirLightHelper, 'visible').name('Direction Light Helper');

    return { ambientLight, pointLight, pointLightHelper, directionLight, dirLightHelper };
}