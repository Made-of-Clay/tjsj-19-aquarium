import GUI from 'lil-gui';
import { BoxGeometry, Mesh, MeshLambertMaterial, MeshStandardMaterial, PlaneGeometry } from 'three'

export function getDemoObjects(gui: GUI, animation: { enabled: boolean; play: boolean }) {
    // CUBE
    const sideLength = 1
    const cube = new Mesh(
        new BoxGeometry(sideLength, sideLength, sideLength),
        new MeshStandardMaterial({
            color: '#f69f1f',
            metalness: 0.5,
            roughness: 0.7,
        }),
    )
    cube.castShadow = true
    cube.position.y = 0.5

    const cubeOneFolder = gui.addFolder('Cube one')

    cubeOneFolder.add(cube.position, 'x').min(-5).max(5).step(0.5).name('pos x')
    cubeOneFolder
        .add(cube.position, 'y')
        .min(-5)
        .max(5)
        .step(1)
        .name('pos y')
        .onChange(() => (animation.play = false))
        .onFinishChange(() => (animation.play = true))
    cubeOneFolder.add(cube.position, 'z').min(-5).max(5).step(0.5).name('pos z')

    cubeOneFolder.add(cube.material as MeshStandardMaterial, 'wireframe')
    cubeOneFolder.addColor(cube.material as MeshStandardMaterial, 'color')
    cubeOneFolder.add(cube.material as MeshStandardMaterial, 'metalness', 0, 1, 0.1)
    cubeOneFolder.add(cube.material as MeshStandardMaterial, 'roughness', 0, 1, 0.1)

    cubeOneFolder
        .add(cube.rotation, 'x', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
        .name('rotate x')
    cubeOneFolder
        .add(cube.rotation, 'y', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
        .name('rotate y')
        .onChange(() => (animation.play = false))
        .onFinishChange(() => (animation.play = true))
    cubeOneFolder
        .add(cube.rotation, 'z', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
        .name('rotate z')

    cubeOneFolder.add(animation, 'enabled').name('animated')

    // PLANE
    const plane = new Mesh(
        new PlaneGeometry(3, 3),
        new MeshLambertMaterial({
            color: 'gray',
            emissive: 'teal',
            emissiveIntensity: 0.2,
            side: 2,
            transparent: true,
            opacity: 0.4,
        })
    )
    plane.rotateX(Math.PI / 2)
    plane.receiveShadow = true

    return { cube, plane }
}