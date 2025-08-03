import GUI from 'lil-gui'
import {
    AxesHelper,
    Clock,
    GridHelper,
    LoadingManager,
    PCFSoftShadowMap,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'stats.js'
import * as animations from './helpers/animations'
import { resizeRendererToDisplaySize } from './helpers/responsiveness'
import './style.css'
import { getDemoObjects } from './getDemoObjects'
import { getLights } from './getLights'

const gui = new GUI({ title: '🐞 Debug GUI', width: 300 })

const animation = { enabled: true, play: true }

// ===== 🖼️ CANVAS, RENDERER, & SCENE =====
const canvas = document.createElement('canvas')
document.body.appendChild(canvas)
const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = PCFSoftShadowMap
const scene = new Scene()

    // ===== 👨🏻‍💼 LOADING MANAGER =====
const loadingManager = new LoadingManager(console.log, console.log, console.error)

const { ambientLight, pointLight, pointLightHelper } = getLights(gui)
scene.add(ambientLight, pointLight, pointLightHelper)

const { cube, plane } = getDemoObjects(gui, animation);
scene.add(cube, plane)

// ===== 🎥 CAMERA =====
const camera = new PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
camera.position.set(2, 2, 5)

// ===== 🕹️ CONTROLS =====
const cameraControls = new OrbitControls(camera, canvas)
cameraControls.target = cube.position.clone()
cameraControls.enableDamping = true
cameraControls.autoRotate = false
cameraControls.update()

// ===== 🪄 HELPERS =====
const axesHelper = new AxesHelper(4)
axesHelper.visible = false
scene.add(axesHelper)

const gridHelper = new GridHelper(20, 20, 'teal', 'darkgray')
gridHelper.position.y = -0.01
scene.add(gridHelper)

// ===== 📈 STATS & CLOCK =====
const clock = new Clock()
const stats = new Stats()
document.body.appendChild(stats.dom)

// ==== 🐞 DEBUG GUI ====
const helpersFolder = gui.addFolder('Helpers')
helpersFolder.add(axesHelper, 'visible').name('axes')
helpersFolder.add(pointLightHelper, 'visible').name('pointLight')

const cameraFolder = gui.addFolder('Camera')
cameraFolder.add(cameraControls, 'autoRotate')

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

function animate() {
    requestAnimationFrame(animate)

    stats.begin()
    if (animation.enabled && animation.play) {
        animations.rotate(cube, clock, Math.PI / 3)
        animations.bounce(cube, clock, 1, 0.5, 0.5)
    }

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement
        camera.aspect = canvas.clientWidth / canvas.clientHeight
        camera.updateProjectionMatrix()
    }

    cameraControls.update()

    renderer.render(scene, camera)
    stats.end()
}

animate()
