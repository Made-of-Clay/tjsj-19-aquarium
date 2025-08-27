import GUI from 'lil-gui'
import {
    AxesHelper,
    Clock,
    CubeTextureLoader,
    GridHelper,
    LoadingManager,
    PCFSoftShadowMap,
    PerspectiveCamera,
    Scene,
    TextureLoader,
    WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'stats.js';
import { resizeRendererToDisplaySize } from './helpers/responsiveness';
import './style.css';
// getBubble will be used by Koi instances
import { animateBubble, getBubble } from './getBubble';
import { getLights } from './getLights';
import { getBridge } from './getBridge';
import { getLoadingManager } from './getLoadingManager';
import { getEnvMap } from './getEnvMap';
import { getScene } from './getScene';
import { Koi } from './Koi';
import { degreesToRadians } from './degreesToRadians';
import { convertElapsedToDegrees } from './convertElapsedToDegrees';

console.log('🐠 tjsj-19-aquarium');

const gui = new GUI({ title: '🐞 Debug GUI', width: 300 });

// ===== 🖼️ CANVAS, RENDERER, & SCENE =====
const canvas = document.createElement('canvas')
document.body.appendChild(canvas)
const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = PCFSoftShadowMap
const scene = getScene();

// ===== 👨🏻‍💼 LOADING MANAGER =====
const loadingManager = getLoadingManager();
const textureLoader = new TextureLoader(loadingManager);

scene.background = getEnvMap();

// ===== 🎥 CAMERA =====
const { ambientLight, pointLight, pointLightHelper } = getLights(gui);
scene.add(ambientLight, pointLight, pointLightHelper);

// ===== 🫧 OBJECTS =====
// const { animateBubble, bubbleGroup } = getBubble(gui, scene, loadingManager);
// TODO use new class when created for multiple bubbles/creatures
// maybe pass fish into constructor
// OR create Bubble class that Koi class decorates and customizes for animation? dunno - animation paths will differ
// REFACTORED ORIGINAL FIRST KOI
const revolvingKoi = new Koi();
revolvingKoi.group.rotateY(0)
const initCameraYRotation = Math.PI * -0.5;
revolvingKoi.group.rotation.y = initCameraYRotation;
scene.add(revolvingKoi.group);

// TODO remove bridge and leave camera centered w/ no pan/zoom
// const bridge = getBridge(gui, textureLoader);
// bridge.rotateX(-Math.PI / 2);
// bridge.rotateZ(-Math.PI / 2);
// bridge.position.x = -72;
// scene.add(bridge);

// ===== 🎥 CAMERA =====
const camera = new PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
camera.position.set(1, 0, 0);

// ===== 🕹️ CONTROLS =====
const cameraControls = new OrbitControls(camera, canvas);
cameraControls.enableDamping = true;
cameraControls.autoRotate = false;
cameraControls.enablePan = false;
cameraControls.enableZoom = false;
// cameraControls.enableRotate = false;
cameraControls.update();

const mouse = { x: 0, y: 0 };
const windowHalf = {
    get width() {
        return innerWidth / 2;
    },
    get height() {
        return innerHeight / 2;
    }
};
function handleMouseMove(event: MouseEvent) {
    mouse.x = event.clientX - windowHalf.width;
    mouse.y = event.clientY - windowHalf.height;
}
// {x: 567.5, y: -315.5}
window.addEventListener('mousemove', handleMouseMove);

const cam = {
    x: 0, y: 0, z: 0
}
gui.add(cam, 'x').min(-45).max(45).step(1).name('Cam X Rotation');
gui.add(cam, 'y').min(-45).max(45).step(1).name('Cam Y Rotation');
gui.add(cam, 'z').min(-45).max(45).step(1).name('Cam Z Rotation');

function normalizeToUnit(value: number, min: number, max: number): number {
    return ((value - min) / (max - min)) * 2 - 1;
}
function mouseToClampedAngle(mousePos: number, screenSize: number) {
  // Calculate the center point (neutral rotation)
  const center = screenSize / 2;
  
  // Deviation from center (positive or negative)
  const deviation = mousePos - center;
  
  // Maximum possible deviation (to edge of screen)
  const maxDeviation = center;
  
  // Normalize deviation to a -1 to 1 range
  const normalized = deviation / maxDeviation;
  
  // Scale to -45 to 45 degrees
  const angle = normalized * 45;
  
  // Explicitly clamp in case mousePos is out of bounds (e.g., due to window resize or edge cases)
  return Math.max(-45, Math.min(45, angle));
}

// ===== 🪄 HELPERS =====
const axesHelper = new AxesHelper(4);
axesHelper.visible = false;
scene.add(axesHelper);

const gridHelper = new GridHelper(20, 20, 'teal', 'darkgray');
gridHelper.position.y = -0.01;
gridHelper.visible = false;
scene.add(gridHelper);

const stats = new Stats();
document.body.appendChild(stats.dom);

// ==== 🐞 DEBUG GUI ====
const helpersFolder = gui.addFolder('Helpers');
helpersFolder.add(axesHelper, 'visible').name('axes');
helpersFolder.add(gridHelper, 'visible').name('grid');

const cameraFolder = gui.addFolder('Camera');
cameraFolder.add(cameraControls, 'autoRotate');

// persist GUI state in local storage on changes
gui.onFinishChange(() => {
    const guiState = gui.save()
    localStorage.setItem('guiState', JSON.stringify(guiState))
})

// load GUI state if available in local storage
const guiState = localStorage.getItem('guiState')
if (guiState) gui.load(JSON.parse(guiState))

// reset GUI state button
function resetGui() {
    localStorage.removeItem('guiState')
    gui.reset()
}
gui.add({ resetGui }, 'resetGui').name('RESET')

gui.close()

const clock = new Clock();

const target = { x: 0, y: 0 };
function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();
    animateBubble(elapsedTime, camera, clock.getDelta());

    const speedNumerator = 6.3; // don't change this
    const rotationDuration = 20; // change this
    const speed = speedNumerator / rotationDuration; // speed 1 duration 6.3
    // const speed = 0.25; // multiple of 6 (2x = 3s; 0.5x = 12s; 1x = 6s)
    revolvingKoi.animate(clock.getDelta());
    // revolvingKoi.group.position.y = Math.cos(elapsedTime * speed) * 10;
    revolvingKoi.group.position.y = Math.cos(elapsedTime * speed) * 25;
    revolvingKoi.group.position.z = Math.sin(elapsedTime * speed) * 25;
    revolvingKoi.group.rotation.x = degreesToRadians(convertElapsedToDegrees(elapsedTime, rotationDuration));
    // bubbleGroup.rotation.x = Math.PI * -0.5 * -(elapsedTime * 0.1);
    // bubbleGroup.rotation.x = Math.PI * -0.5;

    stats.begin();

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    cameraControls.update();

    
    // const xAngle = mouseToClampedAngle(mouse.x + windowHalf.width, window.innerWidth);
    // const yAngle = mouseToClampedAngle(mouse.y + windowHalf.height, window.innerHeight);
    // console.log('angle', xAngle, yAngle);
    // camera.rotation.x = degreesToRadians(xAngle);
    // camera.rotation.y = degreesToRadians(yAngle);
    // camera.rotation.x = degreesToRadians(cam.x);
    // camera.rotation.y = degreesToRadians(cam.y) + initCameraYRotation;
    // camera.rotation.z = degreesToRadians(cam.z);

    renderer.render(scene, camera);
    stats.end();
}

animate()
