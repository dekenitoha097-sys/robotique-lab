import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Environment extends THREE.Group {
    public readonly modelPath: string;
    private readonly loader = new GLTFLoader();
    private loadingPromise?: Promise<this>;
    private loaded = false;

    constructor(modelPath: string) {
        super();
        this.modelPath = modelPath;
    }

    public async load(): Promise<this> {
        if (this.loaded) {
            return this;
        }

        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = this.loader.loadAsync(this.modelPath).then((gltf) => {
            this.add(gltf.scene);
            this.loaded = true;
            return this;
        });

        return this.loadingPromise;
    }

    public isLoaded(): boolean {
        return this.loaded;
    }
}