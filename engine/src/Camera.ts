import * as THREE from 'three';

export class Camera {
    public instance: THREE.PerspectiveCamera;

    constructor(){
        this.instance = new THREE.PerspectiveCamera(75, 
            window.innerWidth / window.innerHeight,
            0.1, 1000
        );
        this.instance.position.set(0, 0, 5);
        window.addEventListener('resize', this.onResize);

    }

    private onResize = () => {
        this.instance.aspect = window.innerWidth / window.innerHeight;
        this.instance.updateProjectionMatrix();
    }

    public setPosition(x: number, y: number, z: number): void {
        this.instance.position.set(x, y, z);
    }

    public setRotation(x: number, y: number, z: number): void {
        this.instance.rotation.set(x, y, z);
    }
    
    public setScale(x: number, y: number, z: number): void {
        this.instance.scale.set(x, y, z);
    }

    public lookAt(x: number, y: number, z: number): void {
        this.instance.lookAt(new THREE.Vector3(x, y, z));
    }
    
}