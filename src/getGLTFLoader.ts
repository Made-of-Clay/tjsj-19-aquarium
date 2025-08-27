// import { GLTFLoader } from 'three';

import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { getLoadingManager } from './getLoadingManager';

let loader: GLTFLoader | null = null;

export function getGLTFLoader() {
    if (!loader)
        loader = new GLTFLoader(getLoadingManager());

    return loader;
}