import * as THREE from 'three';
import { Scene } from './Scene';
import { Camera } from './Camera';

export class Renderer {
    public instance: THREE.WebGLRenderer;

    constructor(container: HTMLElement = document.body){
        this.instance = new THREE.WebGLRenderer();
        this.instance.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(this.instance.domElement);
        window.addEventListener('resize', this.onResize);
    }

    private onResize = () => {
        this.instance.setSize(window.innerWidth, window.innerHeight);
    }

    public render(scene : Scene, camera: Camera): void {
        this.instance.render(scene.instance, camera.instance);
    }
}