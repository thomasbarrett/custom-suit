import * as THREE from '../three/src/Three.js';
import { OBJLoader } from '../three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from '../three/examples/jsm/loaders/MTLLoader.js';

console.log(THREE);

const material = new THREE.MeshPhongMaterial({
color: 0xFF0000,    // red (can also use a CSS color string here)
flatShading: true,
});

var materials;

var container;
var camera, scene, renderer;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
let obj = null;
var projector, mouse = {
    x: 0,
    y: 0
},
INTERSECTED;

init();
animate();
function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    camera = new THREE.PerspectiveCamera( 45, windowHalfX / window.innerHeight, 1, 2000 );
    camera.position.z = 1000;
    // scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
    scene.add( ambientLight );
    var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
    camera.add( pointLight );
    scene.add( camera );
    
    // model
    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
        }
    };
    var onError = function () { };

    let path = '819004_ENDURANCE_SUPER_PRO_Colorway_1';
    let objPath = path + '/819004_ENDURANCE_SUPER_PRO_Colorway_1.obj';
    let mtlPath = path + '/819004_ENDURANCE_SUPER_PRO_Colorway_1.mtl';

    var mtlLoader = new MTLLoader();
    mtlLoader.load(mtlPath, (materials_) => {
    
        materials_.preload();
        materials = materials_;
        console.log(materials);
        let objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(objPath,
            (object) => {
                obj = object;
                let boundingBox = new THREE.Box3();
                boundingBox.expandByObject(object);
                let center = boundingBox.getCenter();
                object.children.forEach(child => {
                    child.position.x = -center.x;
                    child.position.y = -center.y;
                    child.position.z = -center.z;
                })
                object.rotation.x = 1.57;
                scene.add(object);
            },
            (xhr) => console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ),
            (error) => console.log( 'An error happened' )
        );
    
    });

    //
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth / 2,  window.innerHeight );
    container.appendChild( renderer.domElement );
    //
    window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = windowHalfX / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth / 2, window.innerHeight );
}


function animate() {
    requestAnimationFrame(animate);
    render();
    update();
}

function update() {
    if (obj) obj.rotation.z += 0.005;
}

function render() {
    renderer.render( scene, camera );
}

function stitching(foo) {
    let names = ['fab_8','fab_9','fab_10','fab_14','fab_17','fab_18','fab_19','fab_21','fab_22'];
    names.forEach(name => {
        let material = materials.materials[name];
        material.color.setHex(foo);
    });
}

function front(foo) {
    materials.materials.Mat_9.map = THREE.ImageUtils.loadTexture( foo );
    materials.materials.Mat_9.needsUpdate = true;
}

function strap(foo) {
    materials.materials.Mat_11.color.setHex(foo);
    materials.materials.Mat_11.emissive.setHex(foo);
    materials.materials.Mat_11.emissiveIntensity = 0.4; 

    materials.materials.Mat_13.color.setHex(foo);
    materials.materials.Mat_13.emissive.setHex(foo);
    materials.materials.Mat_13.emissiveIntensity = 0.4; 

}

function fabric(foo) { 
   materials.materials.fab_7.color.setHex(foo);
   materials.materials.fab_7.emissive.setHex(foo);
   materials.materials.fab_7.emissiveIntensity = 0.4; 
}

function liner(foo) { 
    materials.materials.fab_6.color.setHex(foo);
}
 
export {stitching, fabric, liner, strap, front};