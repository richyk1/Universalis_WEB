import * as THREE from 'three';
import { OrbitControls, MapControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from "three/examples/jsm/libs/dat.gui.module";
import * as Tiles from "./tiles";
import { Vector3 } from 'three';

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
scene.background = new THREE.Color("white")

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
controls.minDistance = 50
controls.maxDistance = 1000

//Setting up live stats
const stats = Stats()
document.body.appendChild(stats.dom)



// Event handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}, undefined)


// Loading map
const tiles: Tiles.Tile[] = Tiles.GetTiles()
const test: Tiles.Tile[] = []
for (var i = 0; i < 10; i++)
    test.push(tiles[i])

function DrawShapes(tiles: Tiles.Tile[]) {

    for (const tile of tiles) {
        var group: THREE.Group = new THREE.Group();
        var shapeMat = new THREE.MeshBasicMaterial({
            color: Math.random() * 0xffffff
        });
        for (const border of tile.borders) {
            const shape = new THREE.Shape();
            shape.moveTo(border.points[0].x, window.innerHeight - border.points[0].y)
            for (var i = 1; i < border.points.length; i++)
                shape.lineTo(border.points[i].x, window.innerHeight - border.points[i].y)
            shape.moveTo(border.points[0].x, window.innerHeight -  border.points[0].y)
            

            var shapeGeometry = new THREE.ShapeBufferGeometry(shape)
            var shapeMesh = new THREE.Mesh(shapeGeometry, shapeMat)
            shapeMesh.frustumCulled = true;
            group.add(shapeMesh);
            shapeMesh.material.color = new THREE.Color(0x333333);
        }
        group.visible = true;
        scene.add(group);
    }
}
    /*

function DrawLines(tiles: Tiles.Tile[]) {
    var points: THREE.Vector3[] = []
    for (const tile of test) {
        const shape = new THREE.Shape();
        points.push(new THREE.Vector3(tile[0].x, window.innerHeight - tile[0].y, 1))
        for (var i = 1; i < tile.length; i++)
            points.push(new THREE.Vector3(tile[i].x, window.innerHeight - tile[i].y, 1))
        points.push(new THREE.Vector3(tile[0].x, window.innerHeight - tile[0].y, 1))
    }

    var pointGeometry = new THREE.BufferGeometry().setFromPoints(points);
    var material = new THREE.LineBasicMaterial({ color: Math.random() * 0xffffff });
    var finalShape = new THREE.Line(pointGeometry, material);

    scene.add(finalShape);
}

function DrawTestLines(tiles: Tiles.Tile[]) {
    for (const tile of tiles) {
        var points: THREE.Vector2[] = []
        points.push(new THREE.Vector2(tile[0].x, window.innerHeight - tile[0].y))
        for (var i = 1; i < tile.length; i++)
            points.push(new THREE.Vector2(tile[i].x, window.innerHeight - tile[i].y))
        points.push(new THREE.Vector2(tile[0].x, window.innerHeight - tile[0].y))


        var pointGeometry = new THREE.BufferGeometry().setFromPoints(points);
        var material = new THREE.LineBasicMaterial({ color: Math.random() * 0xffffff });
        var finalShape = new THREE.Line(pointGeometry, material);

        scene.add(finalShape);
    }
}


*/
function DrawMap() {

    const planeGeometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(5632, 2048, 5632 / 8, 2048 / 8)
    const material: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial()

    const texture = new THREE.TextureLoader().load("images/provinces.bmp")

    material.map = texture

    const normalTexture = new THREE.TextureLoader().load("images/world_normal.bmp")
    material.normalMap = normalTexture

    const displacementMap = new THREE.TextureLoader().load("images/heightmap.bmp")
    material.displacementMap = displacementMap

    const plane: THREE.Mesh = new THREE.Mesh(planeGeometry, material, )
    plane.position.set(0, 0, 0)

    scene.add(plane)
}

DrawShapes(tiles);

// Graphical User Interface for value tweaking
const gui = new GUI()
const mapFolder = gui.addFolder("Map")
mapFolder.open()
const cameraFolder = gui.addFolder("Camera")
cameraFolder.add(camera.position, "z", 0, 1000, 0.01)
cameraFolder.open()
const lightFolder = gui.addFolder("Light")



// Rendering
var animate = function () {
    requestAnimationFrame(animate)

    renderer.render(scene, camera)

    gui.updateDisplay()
    stats.update()
};
animate();