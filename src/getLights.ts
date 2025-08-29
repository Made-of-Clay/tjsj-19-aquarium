import GUI from 'lil-gui';
import { DirectionalLight, DirectionalLightHelper, AmbientLight } from 'three';

export function getLights(gui: GUI) {
    const ambientLight = new AmbientLight('white', 0.75);

    const directionLight = new DirectionalLight('white', 1);
    directionLight.position.set(1, 1, 3);
    directionLight.lookAt(0, 0, 0);

    const dirLightHelper = new DirectionalLightHelper(directionLight);
    dirLightHelper.visible = false;

    const lightsFolder = gui.addFolder('Lights');
    lightsFolder.add(ambientLight, 'visible').name('Ambient Light');
    lightsFolder.add(directionLight, 'visible').name('Direction Light');
    lightsFolder.add(dirLightHelper, 'visible').name('Direction Light Helper');

    return { ambientLight, directionLight, dirLightHelper };
}