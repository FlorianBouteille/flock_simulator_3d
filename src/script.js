import * as THREE from 'three'
import { Fish } from './Fish.js'
import { School } from './School.js'
import { Current } from './Current.js'
import { Shark } from './Shark.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MapControls } from 'three/addons/controls/MapControls.js';

/**
 * Base
 */
// Boutons

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const mouse = 
{
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0
}

window.addEventListener('mousemove', (event) =>
{
    let newX = (event.clientX / sizes.width) * 2 - 1
    let newY =  - (event.clientY / sizes.height) * 2 + 1
    mouse.deltaX = mouse.x - newX;
    mouse.deltaY = mouse.y - newY;
    mouse.x = newX;
    mouse.y = newY;
})

window.addEventListener('wheel', (event) =>
{
    event.preventDefault();
    
    // Rayon depuis la caméra vers la souris
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({x: mouse.x, y: mouse.y}, camera);
    
    // Direction du rayon (où pointe la souris)
    const direction = raycaster.ray.direction.clone().normalize();
    
    // Zoom vers/loin de la souris
    const zoomSpeed = 15;
    const zoomAmount = event.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    
    camera.position.addScaledVector(direction, zoomAmount);
}, { passive: false });

window.addEventListener('resize', (event) =>
{
    sizes.height = window.innerHeight;
    sizes.width = window.innerWidth;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    console.log('Window has been resized');
})

//Renderer 
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
// Scene
const scene = new THREE.Scene()
// Camera Controls

//const controls = new OrbitControls(camera, canvas);

const aspectRation = sizes.width / sizes.height;
const camera = new THREE.PerspectiveCamera(60, aspectRation, 0.1, 400);
camera.position.x = 0
camera.position.y = 0
camera.position.z = 100
scene.add(camera)
const controls = new MapControls(camera, canvas)
controls.enableDamping = true;
controls.update();


// Environment map

const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMap = cubeTextureLoader.load([
    'assets/env_map/px.png',
    'assets/env_map/nx.png',
    'assets/env_map/py.png',
    'assets/env_map/ny.png',
    'assets/env_map/pz.png',
    'assets/env_map/nz.png'
])

scene.background = environmentMap;
scene.environment = environmentMap;

renderer.setSize(sizes.width, sizes.height)
renderer.shadowMap.enabled = true;
const school = new School(scene, 750, 10, new THREE.Vector3(0, 0, 0));
const current = new Current(scene);
const theShark = new Shark(scene, 3, 3, 0);
const clock = new THREE.Clock();

// Light

const light = new THREE.HemisphereLight(0xffffff, 20);
scene.add(light);


// Buttons and sliders 

const settings = 
{
    current: 0.3,
    separation: 1.5,
    cohesion: 0.8,
    alignment: 0.3
}

const addButton = document.getElementById('addFish');
const rmButton = document.getElementById('rmFish');
const currentSlider = document.getElementById('current');
const separationSlider = document.getElementById('separation');
const cohesionSlider = document.getElementById('cohesion');
const alignmentSlider = document.getElementById('alignment');

currentSlider.onchange = () => { 
    settings.current = currentSlider.value;
};
separationSlider.onchange = () => {
    settings.separation = separationSlider.value;
};
cohesionSlider.onchange = () => {
    settings.cohesion = cohesionSlider.value;
};
alignmentSlider.onchange = () => {
    settings.alignment = alignmentSlider.value;
};

addButton.onclick = () => school.addFish();
rmButton.onclick = () => school.rmFish();


const tick = () =>
{
    const deltaTime = clock.getDelta()
    renderer.render(scene, camera)
    school.update(deltaTime, current, settings);
    theShark.update(deltaTime, current);    
    current.update(deltaTime);
    window.requestAnimationFrame(tick)
}

tick()