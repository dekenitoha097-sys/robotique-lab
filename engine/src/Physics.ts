import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

export class Physics {
    public world!: RAPIER.World;
    private syncList: Array<{ mesh: THREE.Object3D, body: RAPIER.RigidBody }> = [];

    public async init(gravity = { x: 0, y: -9.81, z: 0 }): Promise<void> {
        await RAPIER.init();
        this.world = new RAPIER.World(gravity);
    }

    public addPair(mesh: THREE.Object3D, body: RAPIER.RigidBody): void {
        this.syncList.push({ mesh, body });
    }

    public update() {
        this.world.step();
        for (const pair of this.syncList) {
            const position = pair.body.translation();
            const rotation = pair.body.rotation();
            pair.mesh.position.set(position.x, position.y, position.z);
            pair.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        }
    }

    public setGravity(x: number, y: number, z: number): void {
        if (this.world) {
            this.world.gravity = { x, y, z };
        }
    }
}