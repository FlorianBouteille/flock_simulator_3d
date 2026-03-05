import * as THREE from 'three'

export class Border
{
    constructor(scene, sizeX, sizeY, sizeZ)
    {
        this.geo = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);
        this.material = new THREE.MeshBasicMaterial({color: 0x0000ff, visible:false});
        this.mesh = new THREE.Mesh(this.geo, this.material);
        this.box = new THREE.Box3();
        this.box.setFromObject(this.mesh);
        this.boxHelper = new THREE.Box3Helper(this.box, 0xff0000);
        scene.add(this.mesh);
        scene.add(this.boxHelper);
    }
}