import * as THREE from 'three'
import { Fish } from './Fish.js'
import { School } from './School.js'
import { Current } from './Current.js'

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

window.addEventListener('resize', (event) =>
{
    sizes.height = window.innerHeight;
    sizes.width = window.innerWidth;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    console.log('Window has been resized');
})

// window.addEventListener('dblclick', () =>
// {
//     console.log('double click !');
//     if (!document.fullscreenElement)
//         canvas.requestFullscreen();
//     else
//         document.exitFullscreen();
// })
// Scene
const scene = new THREE.Scene()
// Object

const aspectRation = sizes.width / sizes.height;
const camera = new THREE.PerspectiveCamera(60, aspectRation, 0.1, 100);
camera.position.x = 0
camera.position.y = 0
camera.position.z = 50
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

renderer.setSize(sizes.width, sizes.height)
renderer.shadowMap.enabled = true;
const school = new School(scene, 40, 10, new THREE.Vector3(0, 0, 0));
const current = new Current(scene);
const clock = new THREE.Clock();

// Light

const light = new THREE.HemisphereLight(0xffffff, 50);
scene.add(light);


// Buttons 

const addButton = document.getElementById('addFish');
const rmButton = document.getElementById('rmFish');
addButton.onclick = () => school.addFish();
rmButton.onclick = () => school.rmFish();
const tick = () =>
{
    const deltaTime = clock.getDelta()
    renderer.render(scene, camera)
    school.update(deltaTime, current);
    current.update(deltaTime);
    window.requestAnimationFrame(tick)
}

tick()