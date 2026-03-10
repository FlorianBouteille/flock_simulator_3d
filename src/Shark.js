import * as THREE from 'three'
import { randomColor } from './utils';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { createNoise3D } from 'simplex-noise'


export class Shark
{
    constructor(scene, posX, posY, posZ)
    {
        const geo = new THREE.SphereGeometry(1, 10, 10);
        const material = new THREE.MeshBasicMaterial({color : 0x0000ff, visible : false });
        this.mesh = new THREE.Mesh(geo, material);
        const loader = new GLTFLoader();
        this.color = randomColor();
        this.mixer = null;
        this.halfLength = 4;
        loader.load('/assets/requinV3.glb', (gltf) => 
        {
            this.visual = gltf.scene
            this.visual.scale.set(this.halfLength * 2, this.halfLength * 2, this.halfLength * 2) // à ajuster
            this.visual.position.set(0, 0, this.halfLength) // recentrage par rapport à la box
            this.mesh.add(this.visual)
            if (gltf.animations && gltf.animations.length > 0)
            {
                this.mixer = new THREE.AnimationMixer(this.visual);
                const action = this.mixer.clipAction(gltf.animations[0]);
                action.reset();
                action.play();
            }
            this.visual.traverse((child) => 
            {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial ({ color : randomColor() })
                    this.material = child.material
                }
            })
        })
        scene.add(this.mesh);
        this.mesh.position.set(posX, posY, posZ);
        this.noise = createNoise3D();
        this.time = 0;
        this.speed = 50;
        this.maxTurnRate = 2.2;
        this.direction = new THREE.Vector3(1, 0, 0);
        this.wanderTarget = new THREE.Vector3(1, 0, 0);
        this.headPos = new THREE.Vector3();
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

    update(deltaTime, current, bounds)
    {
        if (this.mixer)
            this.mixer.update(deltaTime);

        this.time += deltaTime;

        const curr = current.vector.clone().normalize().multiplyScalar(0.25);
        const contain = this.containment(bounds, 35).multiplyScalar(3.2);

        const jitter = new THREE.Vector3(
            this.noise(this.time, 10, 30),
            this.noise(this.time, 120, 220),
            this.noise(this.time, 340, 450)
        ).multiplyScalar(0.1 * deltaTime);

        this.wanderTarget.add(jitter);
        if (this.wanderTarget.lengthSq() === 0)
            this.wanderTarget.set(1, 0, 0);
        this.wanderTarget.normalize();

        const wander = this.direction.clone().multiplyScalar(1.2).add(this.wanderTarget).normalize();

        const targetDirection = new THREE.Vector3()
        .addScaledVector(wander, 1.1)
        .addScaledVector(curr, 0.5)
        .addScaledVector(contain, 1)
        .normalize();

        const turnLerp = Math.min(this.maxTurnRate * deltaTime, 1);
        this.direction.lerp(targetDirection, turnLerp).normalize();

        const speedJitter = 0.85 + ((this.noise(this.time * 3.3, 700, 50) + 1) * 0.2);
        const outsideBoost = bounds && !bounds.containsPoint(this.mesh.position) ? 1.4 : 1;
        const finalSpeed = this.speed * speedJitter * outsideBoost;

        this.mesh.position.x += this.direction.x * finalSpeed * deltaTime
        this.mesh.position.y += this.direction.y * finalSpeed * deltaTime
        this.mesh.position.z += this.direction.z * finalSpeed * deltaTime
        this.headPos = this.mesh.position.clone();
        this.headPos.z -= this.halfLength;
        const targetPoint = new THREE.Vector3();
        targetPoint.copy(this.mesh.position).add(this.direction);
        this.mesh.lookAt(targetPoint);
    }
}