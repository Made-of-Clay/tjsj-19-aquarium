import { CubeTexture, CubeTextureLoader } from 'three';
import { getLoadingManager } from './getLoadingManager';

let envMap: CubeTexture;

const cubeTextureLoader = new CubeTextureLoader(getLoadingManager());

/**
 * Retrieves a singleton environment map texture.
 * @returns {CubeTexture} The environment map texture
 */
export function getEnvMap() {
    if (!envMap) {
        envMap = cubeTextureLoader.load([
          'cubemap_images/px.png',
          'cubemap_images/nx.png',
          'cubemap_images/py.png',
          'cubemap_images/ny.png',
          'cubemap_images/pz.png',
          'cubemap_images/nz.png',
        ]);
    }

    return envMap;
}
