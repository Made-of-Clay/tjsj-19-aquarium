import GUI from 'lil-gui'
import {
    AxesHelper,
    Clock,
    GridHelper,
    PCFSoftShadowMap,
    PerspectiveCamera,
    WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'stats.js';
import { resizeRendererToDisplaySize } from './helpers/responsiveness';
import './style.css';
// getBubble will be used by Koi instances
import { animateBubble } from './getBubble';
import { getLights } from './getLights';
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

scene.background = getEnvMap();

// ===== 🎥 CAMERA =====
const { ambientLight, pointLight, pointLightHelper } = getLights(gui);
scene.add(ambientLight, pointLight, pointLightHelper);

// ===== 🫧 OBJECTS =====
const revolvingKoi = new Koi();
revolvingKoi.group.rotateY(0)
const initCameraYRotation = Math.PI * -0.5;
revolvingKoi.group.rotation.y = initCameraYRotation;
scene.add(revolvingKoi.group);

// ===== 🎥 CAMERA =====
const camera = new PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
camera.position.set(1, 0, 0);

// ===== 🕹️ CONTROLS =====
const cameraControls = new OrbitControls(camera, canvas);
cameraControls.enableDamping = true;
cameraControls.autoRotate = false;
cameraControls.enablePan = false;
cameraControls.enableZoom = false;
cameraControls.target.set(0, 0, 10);
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
window.addEventListener('mousemove', handleMouseMove);

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
cameraFolder.add(cameraControls, 'enablePan');
cameraFolder.add(cameraControls, 'enableZoom');

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

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();
    animateBubble(elapsedTime, camera, clock.getDelta());

    const speedNumerator = 6.3; // don't change this
    const rotationDuration = 20; // change this
    const speed = speedNumerator / rotationDuration; // speed 1 duration 6.3
    revolvingKoi.animate(clock.getDelta());
    revolvingKoi.group.position.y = Math.cos(elapsedTime * speed) * 25;
    revolvingKoi.group.position.z = Math.sin(elapsedTime * speed) * 25;
    revolvingKoi.group.rotation.x = degreesToRadians(convertElapsedToDegrees(elapsedTime, rotationDuration));

    stats.begin();

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    cameraControls.update();

    renderer.render(scene, camera);
    stats.end();
}

animate()
