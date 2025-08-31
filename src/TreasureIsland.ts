import { AnimationMixer, Group, Object3DEventMap } from 'three';
import { getGLTFLoader } from './getGLTFLoader';
import { GLTF } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';

const loader = getGLTFLoader();

function getModel(path: string): Promise<GLTF> {
    return new Promise<GLTF>((resolve, reject) => {
        loader.load( path, resolve, undefined, reject);
    });
}

const getTreasureChestModel = () => getModel('models/treasure_chest/scene-scaled.gltf');
const getIslandModel = () => getModel('models/floating_island/scene.gltf');

// const maxBubbleCount = 1;
// let isBubbleCreationDelayed = false;

export class TreasureIsland {
    group: Group<Object3DEventMap>;
    mixer: AnimationMixer | null = null;
    // #bubbles: TreasureBubble[] = [];

    constructor(gui: GUI) {
        this.group = new Group();
        this.#init().then(() => this.#updateGui(gui));
    }

    async #init() {
        const [treasureModel, islandModel] = await Promise.all([getTreasureChestModel(), getIslandModel()]);
        treasureModel.scene.scale.set(0.25, 0.25, 0.25);
        treasureModel.scene.position.y = 0.65;
        treasureModel.scene.name = 'Treasure Chest';
        islandModel.scene.name = 'Island';
        this.group.add(treasureModel.scene, islandModel.scene);

        this.group.position.x = -2.5;
        this.group.position.y = -1;
        this.group.position.z = 3.5;
        this.group.rotation.y = Math.PI;
    }

    #updateGui(gui: GUI) {
        const folder = gui.addFolder('🏝️ Treasure Island');
        const chest = this.group.children.find(child => child.name === 'Treasure Chest');
        if (chest) {
            folder.add(chest.position, 'y').min(0).max(5).step(0.01).name('Chest Y Position');
        }
        const demo = this.group.children.find(child => child.name === 'demo');
        if (demo) {
            folder.add(demo.position, 'x').min(-5).max(5).step(0.1).name('Demo X Position');
            folder.add(demo.position, 'y').min(-5).max(5).step(0.1).name('Demo Y Position');
            folder.add(demo.position, 'z').min(-5).max(5).step(0.1).name('Demo Z Position');
        }
    }

    animate(_delta: number, elapsedTime: number) {
        const speed = 0.5;
        const distance = 0.25;
        const yPosOffset = -1.5;
        this.group.position.y = (Math.cos(elapsedTime * speed) * distance) + yPosOffset;

        // TODO add bubble to be "emitted" once every N seconds
        // bubble rises up and "pops" (removed) after N2 seconds
        // then add random left/right fwd/bkwd direction to path upward (more natural)
        // start w/ simple spheres, then try my bubble depending on perf.

        // check if at max bubble count
        // if not create new bubble
        // else, call move bubble on all inst

        // if (!isBubbleCreationDelayed && this.#bubbles.length <= maxBubbleCount) {
        //     console.log('added bubble')
        //     this.#bubbles.push(new TreasureBubble());
        //     isBubbleCreationDelayed = true;
        //     setTimeout(() => {
        //         isBubbleCreationDelayed = false;
        //     }, 1500);
        // }

        // for (const bubble of this.#bubbles) {
        //     bubble.move();
        // }
        // this.#bubbles = this.#bubbles.filter(b => !b.isPopped);
    }
}

// class TreasureBubble {
//     mesh: Mesh;
//     #popped = false;

//     get isPopped() {
//         return this.#popped;
//     }

//     constructor() {
//         this.mesh = new Mesh(
//             new SphereGeometry(0.1),
//             new MeshBasicMaterial({ color: '#777' }),
//         );
//         this.mesh.position.set(0.5, 0.6, -0.9);
//     }

//     move() {
//         if (this.mesh.position.y >= 2) {
//             this.pop();
//             return false;
//         }
//         console.log('this.mesh.position.y', this.mesh.position.y);
//         // this.mesh.position.y += 0.01;
//         this.mesh.position.setY(this.mesh.position.y + 0.01)
//         return true;
//     }

//     pop() {
//         console.log('pop bubble');
//         this.#popped = true;
//         // clean up and destroy
//         this.mesh.remove();
//     }
// }
