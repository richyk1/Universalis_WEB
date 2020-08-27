import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from "three/examples/jsm/libs/dat.gui.module";
import * as Tiles from "./tiles";
import * as io from 'socket.io-client'
import { Vector3, Group } from 'three';

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

// Graphical User Interface for value tweaking
const gui = new GUI()

// Two grops that hold identical maps for infinite looping
var currentMapGroup: THREE.Group = new THREE.Group();
var nextMapGroup: THREE.Group = new THREE.Group();

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
    camera.position.setY(0);


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
        test.push(tiles[i]);

    socket.emit("find_continent", tiles, (responseData: Tiles.Tile[]) => {

        DrawShapes(responseData.filter((tile: Tiles.Tile) => tile.continent));
    });


    const mapFolder = gui.addFolder("Map")
    mapFolder.open()
    const cameraFolder = gui.addFolder("Camera")
    cameraFolder.add(camera.position, "z", 0, 1000, 0.01)
    cameraFolder.add(camera.position, "y", 0, 2048, 0.01)
    cameraFolder.add(camera.position, "x", 0, 5632, 0.01)

    cameraFolder.open()

    // Start rendering
    Render(renderer, camera, gui, stats);
}


function DrawShapes(tiles: Tiles.Tile[]) {
    const map: THREE.Mesh = DrawMap();
    const tilesGrouped: THREE.Group = new THREE.Group();

    for (const tile of tiles) {
        var tileGroup: THREE.Group = new THREE.Group();

        if (tile.name === "Sabha") {
            console.log("derp");

        }

        const tileColor: THREE.Color = (tile.color ? new THREE.Color(tile.color) : new THREE.Color())

        var shapeMat = new THREE.MeshBasicMaterial({
            color: tileColor
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
            shapeMesh.geometry.boundingBox?.getSize

            tileGroup.add(shapeMesh)
        }

        const boxChildren: THREE.Box3[] = tileGroup.children.map((child: THREE.Object3D) => new THREE.Box3().setFromObject(child))
        if (boxChildren.length > 0) {
            const biggestChild: THREE.Box3 = boxChildren.reduce((a: THREE.Box3, b: THREE.Box3) => {
                if ((a.max.x - a.min.x) * (a.max.y - a.min.y) >
                    (b.max.x - b.min.x) * (b.max.y - b.min.y))
                    return a;
                return b;
            })
            const center = new THREE.Vector3();
            biggestChild.getCenter(center);

            const size = new THREE.Vector3();
            biggestChild.getSize(size);

            const textMesh = Tiles.dcText(tile.name, size.y, size.y, 50, 0xff00ff);
            if (textMesh) {

                textMesh.position.set(center.x, center.y, 2); // move geometry up and out
                tileGroup.add(textMesh);
            }
        }

        tileGroup.visible = true;
        tileGroup.translateZ(1);

        tilesGrouped.add(tileGroup)
    }

    currentMapGroup.add(map);
    currentMapGroup.add(tilesGrouped);
 
    scene.add(currentMapGroup);
}

function DrawMap(): THREE.Mesh {
    const planeGeometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(5632, 2048)

    const material: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial()

    const texture = new THREE.TextureLoader().load("images/colormap_water.bmp")
    material.map = texture

    const normalTexture = new THREE.TextureLoader().load("images/world_normal.bmp")
    material.normalMap = normalTexture

    const displacementMap = new THREE.TextureLoader().load("images/heightmap.bmp")
    material.displacementMap = displacementMap


    const plane: THREE.Mesh = new THREE.Mesh(planeGeometry, material);

    return plane;
}

var startTile: number = 0;
// Rendering
function Render(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera, gui: GUI, stats: Stats) {
    requestAnimationFrame(() => {
        Render(renderer, camera, gui, stats);
    });
    
    

    const cameraWorldPosition = new THREE.Vector3();
    camera.getWorldPosition(cameraWorldPosition);

    currentMapGroup.position.setY(0);
    if(cameraWorldPosition.y > 2200/2)
        camera.position.setY(2200/2);
    if(cameraWorldPosition.y < -2200/2)
    camera.position.setY(-2200/2);
 

    const currentMapGroupPosition = new THREE.Vector3();
    currentMapGroup.getWorldPosition(currentMapGroupPosition);

    const nextMapGroupPosition = new THREE.Vector3();
    nextMapGroup.getWorldPosition(nextMapGroupPosition);
    
    if (cameraWorldPosition.x > currentMapGroupPosition.x) { // Camera going to the right, loop the map -> right
        if(cameraWorldPosition.x < (currentMapGroupPosition.x + 5632 / 2) 
            && nextMapGroup.children.length == 0 || nextMapGroupPosition.x != currentMapGroupPosition.x + 5632)
        {
            nextMapGroup = currentMapGroup.clone();
            nextMapGroup.translateX(5632);

            scene.add(nextMapGroup);
        }
        else if(cameraWorldPosition.x > (currentMapGroupPosition.x + 5632))
        {
            scene.remove(currentMapGroup);
            currentMapGroup = nextMapGroup;

            nextMapGroup = new THREE.Group();
        }
    }
    else if (cameraWorldPosition.x < currentMapGroupPosition.x) { // Camera going to the right, loop the map -> right
        if(cameraWorldPosition.x > (currentMapGroupPosition.x - 5632 / 2) 
            && nextMapGroup.children.length == 0 || nextMapGroupPosition.x != currentMapGroupPosition.x - 5632)
        {
            nextMapGroup = currentMapGroup.clone();
            nextMapGroup.translateX(-5632);

            scene.add(nextMapGroup);
        }
        else if(cameraWorldPosition.x < (currentMapGroupPosition.x - 5632))
        {
            scene.remove(currentMapGroup);
            currentMapGroup = nextMapGroup;

            nextMapGroup = new THREE.Group();
        }
    }


    renderer.render(scene, camera);

    gui.updateDisplay();
    stats.update();
};



Main();