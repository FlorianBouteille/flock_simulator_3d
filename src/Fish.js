import * as THREE from 'three'
import { randomColor } from './utils';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export class Fish
{
    constructor(scene, posX, posY, posZ)
    {
        const loader = new GLTFLoader();
        this.geo = new THREE.BoxGeometry(1, 1, 2);
        this.material = new THREE.MeshBasicMaterial({color : randomColor(), visible : false});
        this.mesh = new THREE.Mesh(this.geo, this.material);
        this.mesh.position.x = posX;
        this.mesh.position.y = posY;
        this.mesh.position.z = posZ;
        this.box = new THREE.Box3();
        this.direction = new THREE.Vector3(1, 0, 0);
        this.speed = 2;
        this.box.setFromObject(this.mesh);
        loader.load('assets/FisheV1.glb', (gltf) => 
        {
            this.visual = gltf.scene
            this.visual.scale.set(1, 1, 1) // à ajuster
            //this.visual.rotateY(Math.PI / 2);
            this.visual.position.set(0, -1, 0) // recentrage par rapport à la box
            this.mesh.add(this.visual)
            this.visual.traverse((child) => 
            {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial ({ color : randomColor() })
                    this.material = child.material
                }
            })
        })
        // this.boxHelper = new THREE.Box3Helper(this.box, 0xff0000);
        // scene.add(this.boxHelper);
        console.log('adding a fish at ', posX, posY, posZ);
        scene.add(this.mesh);
    }

    followCurrent(current)
    {
        const targetDirection = current.vector.clone().normalize();
        this.direction.lerp(targetDirection, 0.01);
        this.direction.normalize();
    }

    findNeighbors(fishes, amount)
    {
        const neighbors = [];
        for (let other of fishes)
        {
            if (other === this)
                continue ;
            const vectorToFish = other.mesh.position.clone().sub(this.mesh.position);
            const distance = vectorToFish.length();

            const angle = this.direction.dot(vectorToFish.normalize());
            if (angle > 0.7)
            {
                neighbors.push({fish : other, distance : distance, direction : other.direction });
            }
        }
        neighbors.sort((a, b) => a.distance - b.distance);
        const result = neighbors.slice(0, amount);
        return (result);
    }

    avoidNeighbors(neighbors)
    {
        let avoid = new THREE.Vector3();
        for (let other of neighbors)
        {
            const vect = this.mesh.position.clone()
            .sub(other.fish.mesh.position)
            .divideScalar(Math.max(other.distance, 0.0001));
            avoid.add(vect);
        }
        const targetDirection = avoid.clone().normalize();
        this.direction.lerp(targetDirection, 0.01);
        this.direction.normalize();
    }    

    update(deltaTime, current, fishes)
    {
        this.followCurrent(current);
        const neighbors = this.findNeighbors(fishes, 3);
        if (neighbors.length > 0)
        {
            this.avoidNeighbors(neighbors);
        }
        this.mesh.position.x += this.direction.x * this.speed * deltaTime
        this.mesh.position.y += this.direction.y * this.speed * deltaTime
        this.mesh.position.z += this.direction.z * this.speed * deltaTime
        const targetPoint = new THREE.Vector3();
        targetPoint.copy(this.mesh.position).add(this.direction);
        this.mesh.lookAt(targetPoint);
    }
}