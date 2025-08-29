import { AnimationMixer, Group, Object3DEventMap } from 'three';
import { getGLTFLoader } from './getGLTFLoader';
import { getBubble } from './getBubble';
import { GLTF } from 'three/examples/jsm/Addons.js';

const loader = getGLTFLoader();

export type SchoolingFishModel = Group<Object3DEventMap>;

let gltf: GLTF;
function getSchoolingFishModel(): Promise<GLTF> {
    if (!gltf) {
        return new Promise<GLTF>((resolve, reject) => {
            loader.load(
                'models/the_fish_particle/scene.gltf',
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

export class SchoolingFish {
    group: Group<Object3DEventMap>;
    mixer: AnimationMixer | null = null;

    constructor() {
        this.group = new Group();
        getSchoolingFishModel().then(gltf => this.#init(gltf));
    }

    #init(gltf: GLTF) {
        const model = gltf.scene.clone();
        console.assert(!!gltf.animations?.length, 'No schooling fish animations were found when expected');
        if (gltf.animations?.length) {
            this.mixer = new AnimationMixer(model);
            console.assert(gltf.animations.length > 0, 'The model has no animations');
            this.mixer.clipAction(gltf.animations[0]).play();
        }
        this.group.add(model);
        const bubble = getBubble();
        bubble.scale.set(1.5, 1.5, 1.5);
        bubble.position.set(0.25, 0.75, 0);
        this.group.add(bubble);
    }

    animate(delta: number) {
        // I'm not pleased with this animation. It's clearly going backwards at points, or you see the animation loop.
        const safeDelta = Math.min(Math.max(delta, 1/120), 1/24); // between 1/120s and 1/24s
        this.mixer?.update(safeDelta);
    }
}
