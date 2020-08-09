import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import dat, { GUI } from "three/examples/jsm/libs/dat.gui.module";
import index from 'three-dat.gui';

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

// An axis object to visualize the 3 axes in a simple way.
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

/*
A light that gets emitted from a single point in all directions. 
A common use case for this is to replicate the light emitted from a bare lightbulb.
*/
const light = new THREE.PointLight(0xffffff, 2);
light.position.set(0, 5, 10);
scene.add(light);

// Setting up camera
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 3

// Setting up renderer
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Setting up controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.screenSpacePanning = true //so that panning up and down doesn't zoom in/out

//Setting up live stats
const stats = Stats()
document.body.appendChild(stats.dom)

const planeGeometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(5632, 2048, 100, 100)
const material: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial()

const texture = new THREE.TextureLoader().load("images/provinces.bmp")
material.map = texture

const normalTexture = new THREE.TextureLoader().load("images/world_normal.bmp")
material.normalMap = normalTexture

const displacementMap = new THREE.TextureLoader().load("images/heightmap.bmp")
material.displacementMap = displacementMap

const plane: THREE.Mesh = new THREE.Mesh(planeGeometry, material)
scene.add(plane)


const gui = new dat.GUI()


window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

function render() {
    renderer.render(scene, camera)
}
var animate = function () {
    requestAnimationFrame(animate)

    render()

    stats.update()
};
animate();