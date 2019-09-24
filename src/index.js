import * as THREE from '../three/src/Three.js';
import { OBJLoader } from '../three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from '../three/examples/jsm/loaders/MTLLoader.js';

class ModelSubscribtion {
    constructor() {
        this.subscribers = {}
    }

    publish(event, data) {
        console.log(this.subscribers);
        if (!this.subscribers[event]) return;
        this.subscribers[event].forEach(subscriberCallback =>
            subscriberCallback(data));
    }

    subscribe(event, callback) {
        let index;
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        index = this.subscribers[event].push(callback) - 1;
        
        return {
            unsubscribe() {
                this.subscribers[event].splice(index, 1);
            }
        };
    }
}

const modelNotifier = new ModelSubscribtion();


var materials;

var container;
var camera, scene, renderer;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
let obj = null;

let mouse = null;
let rotation_z = 0;
let mouse_down = false;

init();
animate();

const Suit = {
    innerLining: ['Mat_57', 'Mat_58', 'Mat_59', 'Mat_60', 'Mat_61', 'Mat_62'],
    upperStraps: ['Mat_10', 'Mat_16']
};

function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    camera = new THREE.PerspectiveCamera( 45, windowHalfX / window.innerHeight, 1, 2000 );
    camera.position.z = 1000;
    // scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.6);
    scene.add( ambientLight );
    var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
    camera.add( pointLight );
    scene.add( camera );
    
    let path = '819004_ENDURANCE_SUPER_PRO_Colorway_1';
    let objPath = path + '/819004_ENDURANCE_SUPER_PRO_Colorway_1.obj';
    let mtlPath = path + '/819004_ENDURANCE_SUPER_PRO_Colorway_1.mtl';

    var mtlLoader = new MTLLoader();
    mtlLoader.load(mtlPath, (materials_) => {
    
        materials_.preload();
        materials = materials_;
        materials.materials.Mat_9.transparent = true;
        let names = ['fab_8','fab_9','fab_10','fab_14','fab_17','fab_18','fab_19','fab_21','fab_22'];
        names.forEach(name => {
            let material = materials.materials[name];
            material.transparent = true;
        });

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
                    if (child.material == materials_.materials.fab_7) {
                        console.log(child);
                    }
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
    container.addEventListener('click', onDocumentMouseDown );

    const dragStart = (event) => {
        mouse_down = true;
        let rect = event.target.getBoundingClientRect();
        let x = event.clientX - rect.left; //x position within the element.
        let y = event.clientY - rect.top;  //y position within the element.
        mouse = {x, y};
        rotation_z = obj.rotation.z;
    };

    const dragEnd = (event) => {
        if (mouse_down) {
            mouse_down = false;
            let rect = event.target.getBoundingClientRect();
            let x = event.clientX - rect.left; //x position within the element.
            let y = event.clientY - rect.top;  //y position within the element.
            let mouse2 = {x, y};
            let dmouse = {x: mouse2.x - mouse.x, y: mouse2.y - mouse.y};
            obj.rotation.z = rotation_z - 3 * dmouse.x / rect.width;
        }
    };

    const dragMove = (event) => {
        if (mouse_down) {
            let rect = event.target.getBoundingClientRect();
            let x = event.clientX - rect.left; //x position within the element.
            let y = event.clientY - rect.top;  //y position within the element.
            let mouse2 = {x, y};
            let dmouse = {x: mouse2.x - mouse.x, y: mouse2.y - mouse.y};
            obj.rotation.z = rotation_z - 3 * dmouse.x / rect.width;
        }
    }

    container.addEventListener('mousedown', dragStart);
    container.addEventListener('mouseup', dragEnd);
    container.addEventListener('mousemove', dragMove);
    container.addEventListener('mouseleave', dragEnd);

        container.addEventListener('touchstart', (event) => {
            mouse_down = true;
            let rect = event.touches[0].target.getBoundingClientRect();
            let x = event.touches[0].clientX - rect.left; //x position within the element.
            let y = event.touches[0].clientY - rect.top;  //y position within the element.
            mouse = {x, y};
            rotation_z = obj.rotation.z;
        });
        container.addEventListener('touchmove', (event) => {
            if (mouse_down) {
                let rect = event.touches[0].target.getBoundingClientRect();
                let x = event.touches[0].clientX - rect.left; //x position within the element.
                let y = event.touches[0].clientY - rect.top;  //y position within the element.
                let mouse2 = {x, y};
                let dmouse = {x: mouse2.x - mouse.x, y: mouse2.y - mouse.y};
                obj.rotation.z = rotation_z - 3 * dmouse.x / rect.width;
            }
        });

    /*
    container.addEventListener('touchend', dragEnd);
    container.addEventListener('touchmove', dragMove);
    container.addEventListener('touchcancel', dragEnd);
    */
    window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = windowHalfX / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth / 2, window.innerHeight );
}

function onDocumentMouseDown( event ) {  
    event.preventDefault();
    let rect = event.target.getBoundingClientRect();
    let x = event.clientX - rect.left; //x position within the element.
    let y = event.clientY - rect.top;  //y position within the element.
    var raycaster = new THREE.Raycaster(); 
    raycaster.setFromCamera( {x: 2 * x / rect.width - 1, y: 1 - 2 * y / rect.height}, camera ); 
    let intersects = raycaster.intersectObjects( obj.children ); 
    if (intersects.length > 0) {
        let object = intersects[0].object;
        if (object.name === 'Mat_6') {
            modelNotifier.publish('front-side', [object]);
        } else if (object.name === 'Mat_13') {
            modelNotifier.publish('back-strap', [object]);
        } else if (object.name === 'Mat_15') {
            modelNotifier.publish('right-side', [object]);
        } else if (object.name === 'Mat_18') {
            modelNotifier.publish('left-side', [object]);
        } else if (Suit.innerLining.includes(object.name)) {
            modelNotifier.publish('inner-lining', obj.children.filter(child => Suit.innerLining.includes(child.name)));
        } else if (Suit.upperStraps.includes(object.name)) {
            modelNotifier.publish('upper-straps', obj.children.filter(child => Suit.upperStraps.includes(child.name)));
        } else {
            console.log(object);
        }
    } else {
        modelNotifier.publish('clear');
    }
}

function animate() {
    requestAnimationFrame(animate);
    render();
    update();
}

function update() {
   // obj.rotation.z += 0.05;
}

function render() {
    renderer.render( scene, camera );
}

function stitching(foo) {
    let names = ['fab_14','fab_17','fab_18','fab_19','fab_21','fab_22'];
    names.forEach(name => {
        let material = materials.materials[name];
        material.color.setHex(foo);
    });
}

function front(hex) {
    obj.children.forEach(child => {
        if (child.name === Suit.front) {
            child.material = child.material.clone();
            child.material.color.setHex(hex);
        }
    });
}

function left(hex) {
    obj.children.forEach(child => {
        if (child.name === Suit.leftSide) {
            child.material = child.material.clone();
            child.material.color.setHex(hex);
        }
    });
}

function right(hex) {
    obj.children.forEach(child => {
        if (child.name === Suit.rightSide) {
            child.material = child.material.clone();
            child.material.color.setHex(hex);
        }
    });
}
function strap(foo) {
    materials.materials.fab_8.color.setHex(foo);
    materials.materials.fab_9.color.setHex(foo);
    materials.materials.fab_10.color.setHex(foo);
}

function fabric(foo) { 
   materials.materials.fab_7.color.setHex(foo);
}

function liner(foo) { 
    materials.materials.fab_6.color.setHex(foo);
}
 
export {stitching, fabric, liner, strap, front, left, right, modelNotifier};