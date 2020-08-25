import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from "three/examples/jsm/libs/dat.gui.module";
import * as Tiles from "./tiles";
import * as io from 'socket.io-client'

const socket = io.connect("http://localhost:3000");
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

function Main() {
  /*
  A light that gets emitted from a single point in all directions. 
  A common use case for this is to replicate the light emitted from a bare lightbulb.
  */
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 0, 1000);
  scene.add(light);
  scene.background = new THREE.Color("black")

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
  }, undefined)


  // Loading map
  const tiles: Tiles.Tile[] = Tiles.GetTiles(socket)
  const test: Tiles.Tile[] = []
  for (var i = 0; i < 10; i++)
    test.push(tiles[i])


  // Graphical User Interface for value tweaking
  const gui = new GUI()
  const mapFolder = gui.addFolder("Map")
  mapFolder.open()
  const cameraFolder = gui.addFolder("Camera")
  cameraFolder.add(camera.position, "z", 0, 1000, 0.01)
  cameraFolder.add(camera.position, "y", 0, 2048, 0.01)
  cameraFolder.add(camera.position, "x", 0, 5632, 0.01)
  cameraFolder.open()
  const lightFolder = gui.addFolder("Light")

  // Start rendering
  Render(renderer, camera, gui, stats);
}


function DrawShapes(tiles: Tiles.Tile[]) {
  const map: THREE.Mesh = DrawMap();

  for (const tile of tiles) {
    var group: THREE.Group = new THREE.Group();
    var shapeMat = new THREE.MeshBasicMaterial({
      color: Math.random() * 0xffffff
    });
    for (const border of tile.borders) {
      const shape = new THREE.Shape();
      shape.moveTo(border.points[0].x - (5632 / 2), (2048 / 2) - border.points[0].y)
      for (var i = 1; i < border.points.length; i++)
        shape.lineTo(border.points[i].x - (5632 / 2), (2048 / 2) - border.points[i].y)
      shape.moveTo(border.points[0].x - (5632 / 2), (2048 / 2) - border.points[0].y)

      var shapeGeometry = new THREE.ShapeBufferGeometry(shape)
      var shapeMesh = new THREE.Mesh(shapeGeometry, shapeMat)
      shapeMesh.frustumCulled = true;

      group.add(shapeMesh)
    }

    group.visible = true;
    tile.name
    scene.add(group)
  }
  scene.add(map);
}

function DrawMap(): THREE.Mesh {
  const planeGeometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(5632, 2048, 1,)

  const material: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial()

  const texture = new THREE.TextureLoader().load("images/colormap_water.dds")

  material.map = texture

  const normalTexture = new THREE.TextureLoader().load("images/world_normal.bmp")
  material.normalMap = normalTexture

  const displacementMap = new THREE.TextureLoader().load("images/heightmap.bmp")
  material.displacementMap = displacementMap
  const plane: THREE.Mesh = new THREE.Mesh(planeGeometry, material);

  return plane;
}

// Rendering
function Render(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera, gui: GUI, stats: Stats) {
  requestAnimationFrame(() => 
  {
    Render(renderer, camera, gui, stats);
  });

  renderer.render(scene, camera);

  gui.updateDisplay();
  stats.update();
};


Main();