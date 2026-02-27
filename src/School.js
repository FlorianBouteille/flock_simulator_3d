import { SphereGeometry } from 'three';
import * as THREE from 'three';
import { Fish } from './Fish.js'

export class School
{
    constructor(scene, amount, radius, center)
    {
        this.fishes = [];
        this.startPos = center;
        this.position = center;
        this.radius = radius;
        this.scene = scene;
        this.totalFishes = amount;
        // const bowl = new THREE.SphereGeometry(1, 10, 10);
        // const material = new THREE.MeshBasicMaterial({ color : 0xee1212 });
        // this.centerBall = new THREE.Mesh(bowl, material);
        // scene.add(this.centerBall);
        for (let i = 0; i < amount; i++)
        {
            this.position.x = center.x + ((Math.random() - 0.5) * radius);
            this.position.y = center.y + ((Math.random() - 0.5) * radius);
            this.position.z = center.z + ((Math.random() - 0.5) * radius);
            this.fishes.push(new Fish(scene, this.position.x, this.position.y, this.position.z));
        }
    }

    update(deltaTime, current, settings)
    {
        for (let i = 0; i < this.fishes.length; i++)
        {
            this.fishes[i].update(deltaTime, current, this.fishes, settings);
        }
    }

    addFish()
    {
        this.position.x = (Math.random() - 0.5) * this.radius;
        this.position.y = (Math.random() - 0.5) * this.radius;
        this.position.z = (Math.random() - 0.5) * this.radius;
        this.fishes.push(new Fish(this.scene, this.position.x, this.position.y, this.position.z));
        console.log('fishes ' + this.fishes.length);
    }

    rmFish()
    {
        this.scene.remove(this.fishes[this.fishes.length - 1].mesh);
        this.fishes.pop();
    }
}