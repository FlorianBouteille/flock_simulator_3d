import * as THREE from 'three'
import { randomColor } from './utils';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { createNoise3D } from 'simplex-noise'


export class Shark
{
    constructor(scene, posX, posY, posZ)
    {
        const geo = new THREE.SphereGeometry(1, 10, 10);
        const material = new THREE.MeshBasicMaterial({color : 0xff0000, visible : false });
        this.mesh = new THREE.Mesh(geo, material);
        scene.add(this.mesh);
        this.mesh.position.set(posX, posY, posZ);
        this.noise = createNoise3D();
        this.time = 0;
        this.speed = 2;
        this.direction = new THREE.Vector3(0, 0, 0);
    }

    update(deltaTime, current)
    {
        this.time += deltaTime * 0.1;
        const curr = current.vector.clone().normalize().multiplyScalar(0.3);
        const randomVect = new THREE.Vector3();
        randomVect.x = this.noise(this.time, 0, 0);
        randomVect.y = this.noise(this.time, 100, 100);
        randomVect.z = this.noise(this.time, 100, 100);
        this.speed = this.noise(this.time, 300, 300) * 10;
        randomVect.multiplyScalar(2);
        const targetDirection = new THREE.Vector3()
        .add(curr).add(randomVect).normalize();
        this.direction.lerp(targetDirection, 0.01).normalize();
        this.mesh.position.x += this.direction.x * this.speed * deltaTime
        this.mesh.position.y += this.direction.y * this.speed * deltaTime
        this.mesh.position.z += this.direction.z * this.speed * deltaTime
    }
}