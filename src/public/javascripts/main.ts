import * as THREE from 'three';
import { OrbitControls, MapControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from "three/examples/jsm/libs/dat.gui.module";

const scene: THREE.Scene = new THREE.Scene()

// Extending global namespace Window so that Three.js Inspector can recgonize it
declare global {
    interface Window { 
		scene: any;
		THREE: any;
	 }
}
window.scene = scene;
window.THREE = THREE;

/*
A light that gets emitted from a single point in all directions. 
A common use case for this is to replicate the light emitted from a bare lightbulb.
*/
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 0, 1000);
scene.add(light);

// Setting up camera
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 1000

// Setting up renderer
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Setting up controls
const controls = new MapControls(camera, renderer.domElement)
controls.enableRotate = false
controls.screenSpacePanning = true //so that panning up and down doesn't zoom in/out
controls.minDistance = 250
controls.maxDistance = 1000

//Setting up live stats
const stats = Stats()
document.body.appendChild(stats.dom)

const planeGeometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(5632, 2048, 5632 / 8, 2048 / 8)
const material: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial()

const texture = new THREE.TextureLoader().load("images/provinces.bmp")

material.map = texture

const normalTexture = new THREE.TextureLoader().load("images/world_normal.bmp")
material.normalMap = normalTexture

const displacementMap = new THREE.TextureLoader().load("images/heightmap.bmp")
material.displacementMap = displacementMap

const plane: THREE.Mesh = new THREE.Mesh(planeGeometry, material)
scene.add(plane)

// Graphical User Interface for value tweaking
const gui = new GUI()
const mapFolder = gui.addFolder("Map")

mapFolder.open()
const cameraFolder = gui.addFolder("Camera")
cameraFolder.add(camera.position, "z", 0, 1000, 0.01)
cameraFolder.open()
const lightFolder = gui.addFolder("Light")

// Event handling
window.addEventListener('resize', () => 
{
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}, undefined)


// Rendering
var animate = function () {
    requestAnimationFrame(animate)

    renderer.render(scene, camera)

    gui.updateDisplay()
    stats.update()
};
animate();