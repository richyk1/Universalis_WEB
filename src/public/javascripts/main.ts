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

// Graphical User Interface for value tweaking
const gui = new GUI()

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
    scene.add(DrawMap());

    socket.emit("find_continent", test, (responseData: Tiles.Tile[]) => {
        
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
    Render(renderer, camera, controls, gui, stats);
}


function DrawShapes(tiles: Tiles.Tile[]) {
    const tilesGrouped: THREE.Group = new THREE.Group();

    for (const tile of tiles) {
        var tileGroup: THREE.Group = new THREE.Group();

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
                textMesh.name = "DisplayText";
                textMesh.visible = false;
                tileGroup.add(textMesh);
            }
        }

        tileGroup.visible = true;
        tileGroup.name = tile.name;
        tileGroup.translateZ(1);

        tilesGrouped.add(tileGroup);
    }

    scene.add(tilesGrouped);
}

function DrawMap(): THREE.Mesh {
    const planeGeometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(5632, 2048)
    const material: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial()
    const texture = new THREE.TextureLoader().load("images/terrain.bmp")
    material.map = texture

    const normalTexture = new THREE.TextureLoader().load("images/world_normal.bmp")
    material.normalMap = normalTexture

    const displacementMap = new THREE.TextureLoader().load("images/heightmap.bmp")
    material.displacementMap = displacementMap

    const plane: THREE.Mesh = new THREE.Mesh(planeGeometry, material);

    return plane;
}


const cameraWorldPosition = new THREE.Vector3();
var boxPlane: THREE.Box3 = new THREE.Box3().setFromObject(scene);

function Render(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera, controls: MapControls, gui: GUI, stats: Stats) {
    requestAnimationFrame(() => {
        Render(renderer, camera, controls, gui, stats);
    });
    
    camera.getWorldPosition(cameraWorldPosition);

    if(!boxPlane) boxPlane = new THREE.Box3().setFromObject(scene);

    var min_x = cameraWorldPosition.x - 5632 / 2 - boxPlane.min.x;
    var max_x = cameraWorldPosition.x + 5632 / 2 - boxPlane.max.x;
    var min_y = cameraWorldPosition.y - 2048 / 2 - boxPlane.min.y;
    var max_y = cameraWorldPosition.y + 2048 / 2 - boxPlane.max.y;

    let pos_x =  Math.min(max_x, Math.max(min_x, camera.position.x));
    let pos_y =  Math.min(max_y, Math.max(min_y, camera.position.y));
    
    camera.position.set(pos_x, pos_y, camera.position.z);
    camera.lookAt(pos_x, pos_y, 0);


    controls.target.x = pos_x;
    controls.target.y = pos_y;
    controls.update();


    scene.position.setY(0);
    if(cameraWorldPosition.y > 2200/2)
        camera.position.setY(2200/2);
    if(cameraWorldPosition.y < -2200/2)
    camera.position.setY(-2200/2);
 

    /*
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

    */

    renderer.render(scene, camera);

    gui.updateDisplay();
    stats.update();
};

Main();

class MyCamera extends THREE.PerspectiveCamera
{

}