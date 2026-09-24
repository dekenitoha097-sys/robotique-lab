import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

export type TransformMode = 'translate' | 'rotate' | 'scale';

export class EditorControls {
    public readonly transformControls: TransformControls;
    private readonly camera: THREE.Camera;
    private readonly domElement: HTMLElement;
    private readonly raycaster = new THREE.Raycaster();
    private readonly pointer = new THREE.Vector2();
    private readonly selectableObjects = new Set<THREE.Object3D>();
    private selectedObject?: THREE.Object3D;

    constructor(
        scene: THREE.Scene,
        camera: THREE.Camera,
        domElement: HTMLElement,
        orbitControls: OrbitControls
    ) {
        this.camera = camera;
        this.domElement = domElement;
        this.transformControls = new TransformControls(camera, domElement);
        this.transformControls.setMode('translate');
        this.transformControls.setSpace('world');
        this.transformControls.setSize(1.1);
        scene.add(this.transformControls.getHelper());

        this.transformControls.addEventListener('dragging-changed', (event) => {
            orbitControls.enabled = !event.value;
        });
        this.domElement.addEventListener('pointerdown', this.onPointerDown);
    }

    public addSelectable(object: THREE.Object3D): void {
        this.selectableObjects.add(object);
    }

    public removeSelectable(object: THREE.Object3D): void {
        this.selectableObjects.delete(object);
        if (this.selectedObject === object) {
            this.deselect();
        }
    }

    public select(object: THREE.Object3D): void {
        if (!this.selectableObjects.has(object)) {
            return;
        }

        this.selectedObject = object;
        this.transformControls.attach(object);
    }

    public deselect(): void {
        this.selectedObject = undefined;
        this.transformControls.detach();
    }

    public getSelectedObject(): THREE.Object3D | undefined {
        return this.selectedObject;
    }

    public setMode(mode: TransformMode): void {
        this.transformControls.setMode(mode);
    }

    public setSpace(space: 'world' | 'local'): void {
        this.transformControls.setSpace(space);
    }

    public setSize(size: number): void {
        this.transformControls.setSize(size);
    }

    public dispose(): void {
        this.domElement.removeEventListener('pointerdown', this.onPointerDown);
        this.transformControls.dispose();
        this.selectableObjects.clear();
    }

    private onPointerDown = (event: PointerEvent): void => {
        if (event.button !== 0 || this.transformControls.dragging) {
            return;
        }

        const bounds = this.domElement.getBoundingClientRect();
        this.pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        this.pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
        this.raycaster.setFromCamera(this.pointer, this.camera);

        const intersections = this.raycaster.intersectObjects(
            [...this.selectableObjects],
            true
        );
        const selectedObject = intersections[0]?.object;
        if (!selectedObject) {
            this.deselect();
            return;
        }

        let selectableParent: THREE.Object3D | null = selectedObject;
        while (selectableParent && !this.selectableObjects.has(selectableParent)) {
            selectableParent = selectableParent.parent;
        }

        if (selectableParent) {
            this.select(selectableParent);
        }
    };
}