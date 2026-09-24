import * as THREE from 'three';

export class CoordinateHelper extends THREE.Group {
    constructor(size = 20, divisions = 20) {
        super();

        const grid = new THREE.GridHelper(size, divisions, 0x2563eb, 0x94a3b8);
        grid.position.y = -0.01;

        const axes = new THREE.AxesHelper(size / 2);

        this.add(grid, axes);
    }
}