import { AnimationMixer, Group, Object3DEventMap } from 'three';
import { getGLTFLoader } from './getGLTFLoader';
import { getBubble } from './getBubble';
import { GLTF } from 'three/examples/jsm/Addons.js';

const loader = getGLTFLoader();

export type KoiModel = Group<Object3DEventMap>;

let gltf: GLTF;
function getKoiModel(): Promise<GLTF> {
    if (!gltf) {
        return new Promise<GLTF>((resolve, reject) => {
            loader.load(
                'models/koi/scene.gltf',
                g => {
                    gltf = g;
                    resolve(gltf);
                },
                undefined,
                reject,
            );
        });
    } else {
        return Promise.resolve(gltf);
    }
}

export class Koi {
    group: Group<Object3DEventMap>;
    mixer: AnimationMixer | null = null;

    constructor() {
        this.group = new Group();
        getKoiModel().then(gltf => this.#init(gltf));
    }

    #init(gltf: GLTF) {
        const model = gltf.scene.clone();
        console.assert(!!gltf.animations?.length, 'No koi animations were found when expected');
        if (gltf.animations?.length) {
            model.rotateY(0); // turn fish the way I want initially
            this.mixer = new AnimationMixer(model);
            console.assert(gltf.animations.length > 0, 'The model has no animations');
            this.mixer.clipAction(gltf.animations[0]).play();
        }
        this.group.add(model);
        const bubble = getBubble();
        bubble.scale.set(3, 3, 3);
        this.group.add(bubble);
    }

    animate(delta: number) {
        const safeDelta = Math.min(Math.max(delta, 1/120), 1/24); // between 1/120s and 1/24s
        const speedAccelerator = 3;
        this.mixer?.update(safeDelta * speedAccelerator);
    }
}
