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
    WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'stats.js'
import { resizeRendererToDisplaySize } from './helpers/responsiveness'
import './style.css'
import { getBubble } from './getBubble'
import { getLights } from './getLights'

const gui = new GUI({ title: '🐞 Debug GUI', width: 300 })

// ===== 🖼️ CANVAS, RENDERER, & SCENE =====
const canvas = document.createElement('canvas')
document.body.appendChild(canvas)
const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = PCFSoftShadowMap
const scene = new Scene();

// ===== 👨🏻‍💼 LOADING MANAGER =====
const loadingManager = new LoadingManager(console.log, console.log, console.error)

const cubeTextureLoader = new CubeTextureLoader(loadingManager);
const envMap = cubeTextureLoader.load([
  'cubemap_images/px.png',
  'cubemap_images/nx.png',
  'cubemap_images/py.png',
  'cubemap_images/ny.png',
  'cubemap_images/pz.png',
  'cubemap_images/nz.png',
]);

scene.background = envMap;

const { ambientLight, pointLight, pointLightHelper } = getLights(gui)
scene.add(ambientLight, pointLight, pointLightHelper)

const { animateBubble, bubble } = getBubble(gui, envMap, scene, loadingManager);
scene.add(bubble);

// ===== 🎥 CAMERA =====
const camera = new PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
camera.position.set(-10, 5, 10)

// ===== 🕹️ CONTROLS =====
const cameraControls = new OrbitControls(camera, canvas);
cameraControls.enableDamping = true;
cameraControls.autoRotate = false;
cameraControls.update();

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

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    animateBubble(elapsedTime, camera);

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
