import * as THREE from 'three'
import { Fish } from './Fish.js'
import { School } from './School.js'
import { Current } from './Current.js'
import { Shark } from './Shark.js'
import { Border } from './Border.js'
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

// window.addEventListener('wheel', (event) =>
// {
//     event.preventDefault();
    
//     // Rayon depuis la caméra vers la souris
//     const raycaster = new THREE.Raycaster();
//     raycaster.setFromCamera({x: mouse.x, y: mouse.y}, camera);
    
//     // Direction du rayon (où pointe la souris)
//     const direction = raycaster.ray.direction.clone().normalize();
    
//     // Zoom vers/loin de la souris
//     const zoomSpeed = 15;
//     const zoomAmount = event.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    
//     camera.position.addScaledVector(direction, zoomAmount);
// }, { passive: false });

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
const camera = new THREE.PerspectiveCamera(60, aspectRation, 0.1, 1000);
camera.position.x = 0
camera.position.y = 0
camera.position.z = 100
scene.add(camera)
const controls = new MapControls(camera, canvas)
// controls.enableDamping = true;
controls.update();


// Environment map

const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMap = cubeTextureLoader.load([
    '/assets/env_map/px.png',
    '/assets/env_map/nx.png',
    '/assets/env_map/py.png',
    '/assets/env_map/ny.png',
    '/assets/env_map/pz.png',
    '/assets/env_map/nz.png'
])

scene.background = environmentMap;
scene.environment = environmentMap;

renderer.setSize(sizes.width, sizes.height)
renderer.shadowMap.enabled = true;
const school = new School(scene, 500, 10, new THREE.Vector3(0, 0, 0));
const current = new Current(scene);
const theShark = new Shark(scene, 100, 100, 100);
const clock = new THREE.Clock();

// Light

const light = new THREE.HemisphereLight(0xffffff, 20);
scene.add(light);

// Border

const limit = new Border(scene, 300, 300, 300);

// Buttons and sliders 

const settings = 
{
    current: 0.3,
    separation: 1,
    cohesion: 0.5,
    cohesionRadius: 12,
    cohesionFullPull: 35,
    alignment: 1.2,
    speed: 6,
    random: 0.2,
    boundary: 2.2,
    fleeTime: 3
}

const addButton = document.getElementById('addFish');
const nbToAddButton = document.getElementById('multiplyAdd');
const rmButton = document.getElementById('rmFish');
const nbToRemoveButton = document.getElementById('multiplyRemove');
const scatterButton = document.getElementById('scatter')
const currentSlider = document.getElementById('current');
const separationSlider = document.getElementById('separation');
const cohesionSlider = document.getElementById('cohesion');
const alignmentSlider = document.getElementById('alignment');
const speedSlider = document.getElementById('speed');
const randomSlider = document.getElementById('random');
const boundarySlider = document.getElementById('boundary');
const currentValue = document.getElementById('currentValue');
const separationValue = document.getElementById('separationValue');
const cohesionValue = document.getElementById('cohesionValue');
const alignmentValue = document.getElementById('alignmentValue');
const speedValue = document.getElementById('speedValue');
const randomValue = document.getElementById('randomValue');
const boundaryValue = document.getElementById('boundaryValue');

const setupSlider = (slider, output, key) =>
{
    const update = () =>
    {
        settings[key] = Number(slider.value);
        output.textContent = slider.value;
    };
    slider.addEventListener('input', update);
    slider.addEventListener('change', update);
    update();
};

setupSlider(currentSlider, currentValue, 'current');
setupSlider(separationSlider, separationValue, 'separation');
setupSlider(cohesionSlider, cohesionValue, 'cohesion');
setupSlider(alignmentSlider, alignmentValue, 'alignment');
setupSlider(speedSlider, speedValue, 'speed');
setupSlider(randomSlider, randomValue, 'random');
setupSlider(boundarySlider, boundaryValue, 'boundary');

let numToAdd = 1;
let numToRemove = 1;

nbToAddButton.onclick = () =>
{
    if (numToAdd == 100)
        numToAdd = 1;
    else
        numToAdd *= 10;
    nbToAddButton.innerHTML = "x" + numToAdd;
}

nbToRemoveButton.onclick = () =>
{
    if (numToRemove == 100)
        numToRemove = 1;
    else
        numToRemove *= 10;
    nbToRemoveButton.innerHTML = "x" + numToRemove;
} 

scatterButton.onclick = () => school.scatterFish();
addButton.onclick = () => school.addFish(numToAdd);
rmButton.onclick = () => school.rmFish(numToRemove);


const tick = () =>
{
    const deltaTime = clock.getDelta()
    renderer.render(scene, camera)
    theShark.update(deltaTime, current, limit.box);    
    school.update(deltaTime, current, settings, limit.box, theShark);
    current.update(deltaTime);
    window.requestAnimationFrame(tick)
}

tick()