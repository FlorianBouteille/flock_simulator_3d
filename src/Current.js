import * as THREE from 'three'
import { createNoise3D } from 'simplex-noise'

export class Current
{
    constructor(scene)
    {
        this.vector = new THREE.Vector3();
        this.force = 1;
        this.arrow = new THREE.Group();
        const shaft = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
        const shaftMaterial = new THREE.MeshBasicMaterial({ color : 0xee1212 });
        this.shaft = new THREE.Mesh(shaft, shaftMaterial);
        const coneGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
        const coneMaterial = new THREE.MeshBasicMaterial({ color : 0xead2f0 });
        this.cone = new THREE.Mesh(coneGeometry, coneMaterial);
        this.cone.position.y = 0.65;
        this.arrow.add(this.shaft);
        this.arrow.add(this.cone);
        this.arrow.position.x = 0;
        this.arrow.position.y = 25;
        this.arrow.position.z = 4;
        this.noise = createNoise3D();
        this.time = 0;
        scene.add(this.arrow);
    }

    update(deltaTime)
    {
        this.time += deltaTime * 0.1;
        this.vector.x = this.noise(this.time, 0, 0);
        this.vector.y = this.noise(this.time, 100, 0);
        this.vector.z = this.noise(this.time, 200, 0);
        this.force = this.noise(this.time, 300, 0);
        const direction = this.vector.clone().normalize()
        this.arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
        console.log(this.force);
    }
}