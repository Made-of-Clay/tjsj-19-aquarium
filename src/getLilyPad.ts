import { getGLTFLoader } from './getGLTFLoader';
import { GLTF } from 'three/examples/jsm/Addons.js';

const loader = getGLTFLoader();

export function getLilyPad(): Promise<GLTF> {
    return new Promise<GLTF>((resolve, reject) => {
        loader.load(
            'models/low_poly_lily_pad/scene.gltf',
            (gltf => {
                console.log('🌸 lily pad loaded', gltf);
                resolve(gltf);
            }),
            undefined,
            reject,
        );
    });
}