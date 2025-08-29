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
import { getEnvMap } from './getEnvMap';
import { getScene } from './getScene';
import { Koi } from './Koi';
import { SchoolingFish } from './SchoolingFish';
import { convertElapsedToDegrees } from './convertElapsedToDegrees';
import { degreesToRadians } from './degreesToRadians';
import { getLilyPad } from './getLilyPad';
import { GLTF } from 'three/examples/jsm/Addons.js';

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

scene.background = getEnvMap();

// ===== 🎥 CAMERA =====
scene.add(...Object.values(getLights(gui)));

// ===== 🫧 OBJECTS =====
const revolvingKoi = new Koi();
const initCameraYRotation = Math.PI * -0.5;
revolvingKoi.group.rotation.y = initCameraYRotation;
scene.add(revolvingKoi.group);

const roamingKoi = new Koi();
roamingKoi.group.position.y = -15;
scene.add(roamingKoi.group);

// NOTICE whales aren't working

// ! killer whale is too massive and has no animations
// const killerWhale = new KillerWhale();
// scene.add(killerWhale.group);

// ! blue whale has bouncing eyes when animated & is also massive 
// const blueWhale = new BlueWhale();
// scene.add(blueWhale.group);

const school = new SchoolingFish();
scene.add(school.group);

// TODO add loading state with overlay for better presentation
let lilyPad: GLTF;
getLilyPad().then(gltf => {
    lilyPad = gltf;
    scene.add(lilyPad.scene);
    lilyPad.scene.scale.set(5, 5, 5);
    lilyPad.scene.position.y = -5;
});

// ===== 🎥 CAMERA =====
const camera = new PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)

// ===== 🕹️ CONTROLS =====
const cameraControls = new OrbitControls(camera, canvas);
cameraControls.enableDamping = true;
cameraControls.autoRotate = false;
cameraControls.enablePan = false;
cameraControls.enableZoom = false;
cameraControls.target.set(0, 0, 1);
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

let prevRoamingPos = 0;
let isRoamingNegative = false;

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    const elapsedTime = clock.getElapsedTime();
    animateBubble(elapsedTime, camera);

    revolvingKoi.animate(delta); // common fish animation
    const speedNumerator = 6.3; // don't change this (seems to complete a revolution in good speed)
    const rotationDuration = 30; // change this (higher = takes longer to complete / "slower")
    const speed = speedNumerator / rotationDuration;
    revolvingKoi.group.position.y = Math.cos(elapsedTime * speed) * 25;
    revolvingKoi.group.position.z = Math.sin(elapsedTime * speed) * 25;
    revolvingKoi.group.rotation.x = degreesToRadians(convertElapsedToDegrees(elapsedTime, rotationDuration));
    revolvingKoi.group.children[0]?.rotateX(degreesToRadians(Math.sin(elapsedTime) * 10) * 0.25);

    roamingKoi.animate(delta);
    roamingKoi.group.position.x = Math.sin(elapsedTime * 0.1) * 120;
    isRoamingNegative = prevRoamingPos - roamingKoi.group.position.x < 0;
    prevRoamingPos = roamingKoi.group.position.x;
    roamingKoi.group.rotation.y = isRoamingNegative ? 0 : degreesToRadians(180);

    // blueWhale.animate(delta, elapsedTime);
    // killerWhale.animate(delta, elapsedTime);
    school.animate(delta, elapsedTime);

    lilyPad.scene.rotateY(-0.005);

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
