import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Camera {
    public instance: THREE.PerspectiveCamera;
    public controls: OrbitControls;

    constructor(domElement: HTMLElement = document.body){
        this.instance = new THREE.PerspectiveCamera(75, 
            window.innerWidth / window.innerHeight,
            0.1, 1000
        );
        this.instance.position.set(0, 0, 5);
        this.controls = new OrbitControls(this.instance, domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;
        this.controls.screenSpacePanning = true;
        this.controls.minDistance = 0.5;
        this.controls.maxDistance = 100;
        this.controls.minPolarAngle = 0.05;
        this.controls.maxPolarAngle = Math.PI - 0.05;
        window.addEventListener('resize', this.onResize);

    }

    private onResize = () => {
        this.instance.aspect = window.innerWidth / window.innerHeight;
        this.instance.updateProjectionMatrix();
    }

    public setPosition(x: number, y: number, z: number): void {
        this.instance.position.set(x, y, z);
        this.controls.update();
    }

    public setRotation(x: number, y: number, z: number): void {
        this.instance.rotation.set(x, y, z);
    }
    
    public setScale(x: number, y: number, z: number): void {
        this.instance.scale.set(x, y, z);
    }

    public lookAt(x: number, y: number, z: number): void {
        this.controls.target.set(x, y, z);
        this.controls.update();
    }

    public setTarget(x: number, y: number, z: number): void {
        this.lookAt(x, y, z);
    }

    public update(): void {
        this.controls.update();
    }

    public enableNavigation(): void {
        this.controls.enabled = true;
    }

    public disableNavigation(): void {
        this.controls.enabled = false;
    }

    public reset(): void {
        this.controls.reset();
    }

    public dispose(): void {
        this.controls.dispose();
        window.removeEventListener('resize', this.onResize);
    }
    
}