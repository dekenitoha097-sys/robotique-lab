import * as THREE from 'three';

export class Scene {
    public instance: THREE.Scene;

    constructor(){
        this.instance = new THREE.Scene();
    }

    public add(object: THREE.Object3D): void {
        this.instance.add(object);
    }

    public remove(object: THREE.Object3D): void {
        this.instance.remove(object);
    }
}