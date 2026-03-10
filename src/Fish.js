import * as THREE from 'three'
import { randomColor } from './utils';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { TagComponent } from 'three/examples/jsm/libs/ecsy.module.js';

export class Fish
{
    constructor(scene, posX, posY, posZ)
    {
        const loader = new GLTFLoader();
        this.color = randomColor(0xcdef00, 0xff0000);
        this.geo = new THREE.BoxGeometry(1, 1, 2);
        this.material = new THREE.MeshBasicMaterial({color : randomColor(0x000000, 0xff0000), visible : false});
        this.mesh = new THREE.Mesh(this.geo, this.material);
        this.mesh.position.x = posX;
        this.mesh.position.y = posY;
        this.mesh.position.z = posZ;
        this.box = new THREE.Box3();
        this.direction = new THREE.Vector3(1, 0, 0);
        this.flee = false;
        this.fleeTimer = 0;
        this.baseSpeed = 6;
        this.speed = this.baseSpeed;
        this.box.setFromObject(this.mesh);
        this.fleeDirection = new THREE.Vector3(Math.random() - 0.5, Math.random()- 0.5, Math.random() - 0.5);
        this.randomScale = 1 + ((Math.random() - 0.5) / 2);
        loader.load('/assets/FisheV1.glb', (gltf) => 
        {
            this.visual = gltf.scene
            this.visual.scale.set(this.randomScale, this.randomScale, this.randomScale) // à ajuster
            this.visual.position.set(0, -0, 0) // recentrage par rapport à la box
            this.mesh.add(this.visual)
            this.visual.traverse((child) => 
            {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial ({ color : this.color })
                    this.material = child.material
                }
            })
        })
        // this.boxHelper = new THREE.Box3Helper(this.box, 0xff0000);
        // scene.add(this.boxHelper);
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
            if (angle > 0.4)
            {
                neighbors.push({fish : other, distance : distance, direction : other.direction });
            }
        }
        neighbors.sort((a, b) => a.distance - b.distance);
        const result = neighbors.slice(0, amount);
        return (result);
    }

    getCohesionCenter(neighbors)
    {
        const center = new THREE.Vector3();
        for (const other of neighbors)
            center.add(other.fish.mesh.position);
        center.divideScalar(neighbors.length);
        this.cohesionCenter = center;
        return (center);
    }

    cohesion(neighbors, settings)
    {
        if (neighbors.length === 0)
        {
            this.cohesionCenter = null;
            return (new THREE.Vector3());
        }

        const center = this.getCohesionCenter(neighbors);
        const toCenter = center.clone().sub(this.mesh.position);
        const distance = toCenter.length();

        const desiredRadius = settings.cohesionRadius ?? 12;
        const fullPullRadius = settings.cohesionFullPull ?? 35;

        if (distance <= desiredRadius)
            return (new THREE.Vector3());

        const denom = Math.max(fullPullRadius - desiredRadius, 0.0001);
        const t = THREE.MathUtils.clamp((distance - desiredRadius) / denom, 0, 1);
        const strength = t * t * (3 - 2 * t);

        return (toCenter.normalize().multiplyScalar(strength));
    }

    alignment(neighbors)
    {
        if (neighbors.length === 0)
            return (new THREE.Vector3())
        const avg = new THREE.Vector3();
        for (const other of neighbors)
            avg.add(other.direction);
        return (avg.divideScalar(neighbors.length).normalize());
    }

    separation(neighbors)
    {
        const steer = new THREE.Vector3();
        for (const other of neighbors)
        {
            if (other.distance > 8)
                continue ;
            const away = this.mesh.position.clone().sub(other.fish.mesh.position);
            const d = Math.max(other.distance, 0.0001);
            steer.add(away.divideScalar(d * d));
        }
        return (steer.normalize());
    }

    containment(bounds, margin = 30)
    {
        if (!bounds)
            return (new THREE.Vector3());

        const force = new THREE.Vector3();
        const pos = this.mesh.position;

        if (pos.x < bounds.min.x + margin)
            force.x += (bounds.min.x + margin - pos.x) / margin;
        else if (pos.x > bounds.max.x - margin)
            force.x -= (pos.x - (bounds.max.x - margin)) / margin;

        if (pos.y < bounds.min.y + margin)
            force.y += (bounds.min.y + margin - pos.y) / margin;
        else if (pos.y > bounds.max.y - margin)
            force.y -= (pos.y - (bounds.max.y - margin)) / margin;

        if (pos.z < bounds.min.z + margin)
            force.z += (bounds.min.z + margin - pos.z) / margin;
        else if (pos.z > bounds.max.z - margin)
            force.z -= (pos.z - (bounds.max.z - margin)) / margin;

        if (!bounds.containsPoint(pos))
        {
            const target = pos.clone().clamp(bounds.min, bounds.max);
            const backInside = target.sub(pos);
            if (backInside.lengthSq() > 0)
                force.add(backInside.normalize().multiplyScalar(2));
        }

        return (force);
    }

    random()
    {
        const randomDirection = new THREE.Vector3(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
        );

        if (randomDirection.lengthSq() === 0)
            return (randomDirection);
        return (randomDirection.normalize());
    }

    shouldFlee(shark)
    {
        const vectorToShark = shark.mesh.position.clone().sub(this.mesh.position);
        const distance = vectorToShark.length();
        if (distance < 50)
        {
            this.flee = true;
            return (new THREE.Vector3(0, 0, 0).sub(vectorToShark));
        }
        return (this.fleeDirection);
    }

    fleeShark(fleeDirection, deltaTime, settings)
    {
        this.fleeTimer += deltaTime;
        if (this.fleeTimer > settings.fleeTime)
        {
            this.fleeTimer = 0;
            this.flee = false;
            return (new THREE.Vector3(0, 0, 0));
        }
        if (this.speed < this.baseSpeed * 5)
            this.speed *= 2;
        this.direction.lerp(fleeDirection, 0.05).normalize();
        this.mesh.position.x += this.direction.x * this.speed * deltaTime
        this.mesh.position.y += this.direction.y * this.speed * deltaTime
        this.mesh.position.z += this.direction.z * this.speed * deltaTime
        const targetPoint = new THREE.Vector3();
        targetPoint.copy(this.mesh.position).add(this.direction);
        this.mesh.lookAt(targetPoint);
    }

    update(deltaTime, current, fishes, settings, bounds, shark)
    {
        this.baseSpeed = settings.speed ?? this.baseSpeed;

        if (!this.flee)
            this.fleeDirection = this.shouldFlee(shark);
        if (this.flee)
        {
            this.fleeShark(this.fleeDirection, deltaTime, settings);
            return ;
        }
        const neighbors = this.findNeighbors(fishes, 8);

        const sep = this.separation(neighbors).multiplyScalar(settings.separation);
        const coh = this.cohesion(neighbors, settings).multiplyScalar(settings.cohesion);
        const ali = this.alignment(neighbors).multiplyScalar(settings.alignment);
        const rand = this.random().multiplyScalar(settings.random);
        const curr = current.vector.clone().normalize().multiplyScalar(settings.current);
        const keepInside = this.containment(bounds).multiplyScalar(settings.boundary / 10);

        const targetDirection = new THREE.Vector3()
        .add(sep).add(coh).add(ali).add(rand).add(curr).add(keepInside).normalize();

        const distance = this.cohesionCenter ? this.cohesionCenter.distanceTo(this.mesh.position) : 0;
        if (distance > 5 && this.speed < this.baseSpeed * 2.5 && neighbors.length > 0)
        {
            this.speed += 0.1;
        }
        else if (this.speed > this.baseSpeed)
        {
            this.speed -= 0.1;
        }
        this.direction.lerp(targetDirection, 0.05).normalize();
        this.mesh.position.x += this.direction.x * this.speed * deltaTime
        this.mesh.position.y += this.direction.y * this.speed * deltaTime
        this.mesh.position.z += this.direction.z * this.speed * deltaTime
        const targetPoint = new THREE.Vector3();
        targetPoint.copy(this.mesh.position).add(this.direction);
        this.mesh.lookAt(targetPoint);
    }
}