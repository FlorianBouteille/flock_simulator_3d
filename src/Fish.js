import * as THREE from 'three'
import { randomColor } from './utils';

export class Fish
{
    constructor(scene, posX, posY, posZ)
    {
        this.geo = new THREE.BoxGeometry(1, 1, 2);
        this.material = new THREE.MeshBasicMaterial({color : randomColor()});
        this.mesh = new THREE.Mesh(this.geo, this.material);
        this.position = new THREE.Vector3(posX, posY, posZ);
        this.box = new THREE.Box3();
        this.direction = new THREE.Vector3(1, 0, 0);
        this.speed = 2;
        this.box.setFromObject(this.mesh);
        // this.boxHelper = new THREE.Box3Helper(this.box, 0xff0000);
        // scene.add(this.boxHelper);
        scene.add(this.mesh);
    }

    update(deltaTime, current)
    {
        const targetDirection = current.vector.clone().normalize();
        this.direction.lerp(targetDirection, 0.05);
        this.direction.normalize();
        this.mesh.position.x += this.direction.x * this.speed * deltaTime
        this.mesh.position.y += this.direction.y * this.speed * deltaTime
        this.mesh.position.z += this.direction.z * this.speed * deltaTime
        const targetPoint = new THREE.Vector3();
        targetPoint.copy(this.mesh.position).add(this.direction);
        this.mesh.lookAt(targetPoint);
    }
}