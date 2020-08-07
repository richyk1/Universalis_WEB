import * as THREE from 'three';
import { CompressedTexture, PerspectiveCamera, Scene, WebGLRenderer, Texture, MeshStandardMaterial, PlaneGeometry } from 'three';

// Globals
const Constants =
{
	FOV: 50,
	NEAR: 0.1,
	FAR: 100,
	ASPECT: window.innerWidth / window.innerHeight,
	RENDER_WIDTH: 5632,
	RENDER_HEIGHT: 2048
}


// Init
const scene: Scene = new THREE.Scene();
const camera: PerspectiveCamera = new THREE.PerspectiveCamera( Constants.FOV, Constants.ASPECT, Constants.NEAR, Constants.FAR );

const renderer: WebGLRenderer = new THREE.WebGLRenderer();
renderer.setSize( Constants.RENDER_WIDTH, Constants.RENDER_HEIGHT );
document.body.appendChild( renderer.domElement );


// Juice
/*
var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );
*/


var textureHeightmap = new THREE.TextureLoader().load( 'images/heightmap.bmp' );
var textureNormal = new THREE.TextureLoader().load( 'images/world_normal.bmp' );
var texture = new THREE.TextureLoader().load( 'images/provinces.bmp' );


// immediately use the texture for material creation
var material = new THREE.MeshStandardMaterial({ 
	map: texture,
	displacementMap: textureHeightmap,
	normalMap: textureNormal
	});
var geometry = new THREE.PlaneGeometry(Constants.RENDER_WIDTH, Constants.RENDER_HEIGHT, 256, 256)

const map: THREE.Mesh<PlaneGeometry, MeshStandardMaterial> = new THREE.Mesh(geometry, material)


scene.add(map);

camera.position.z = 5;

var animate = function () {
    requestAnimationFrame( animate );


    renderer.render( scene, camera );
};

animate();
