import { Scene } from 'three';

let scene: Scene;

/**
 * Retrieves a singleton Scene instance.
 * @returns {Scene} The Scene instance
 */
export function getScene() {
    if (!scene)
        scene = new Scene();

    return scene;
}