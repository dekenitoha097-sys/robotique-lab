import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

type BoneAxis = 'x' | 'y' | 'z';

interface BoneAnimation {
    bone: THREE.Bone;
    axis: BoneAxis;
    startAngle: number;
    targetAngle: number;
    elapsed: number;
    duration: number;
    resolve: () => void;
}

export class Robot extends THREE.Group {
    public readonly modelPath: string;
    private readonly loader = new GLTFLoader();
    private readonly bones = new Map<string, THREE.Bone>();
    private readonly activeBoneAnimations = new Map<THREE.Bone, BoneAnimation>();
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
            gltf.scene.traverse((object) => {
                if (object instanceof THREE.Bone && object.name && !this.bones.has(object.name)) {
                    this.bones.set(object.name, object);
                }
            });
            this.loaded = true;
            return this;
        });

        return this.loadingPromise;
    }

    public isLoaded(): boolean {
        return this.loaded;
    }

    public hasBones(): boolean {
        return this.bones.size > 0;
    }

    public getBoneNames(): string[] {
        return [...this.bones.keys()];
    }

    public getBonePosition(boneName: string, worldSpace = true): THREE.Vector3 {
        if (!this.loaded) {
            throw new Error('Le robot doit être chargé avant de lire la position d’un os.');
        }

        const bone = this.bones.get(boneName);
        if (!bone) {
            throw new Error(`Os introuvable dans le modèle: ${boneName}`);
        }

        if (worldSpace) {
            this.updateMatrixWorld(true);
            return bone.getWorldPosition(new THREE.Vector3());
        }

        return bone.position.clone();
    }

    public getBonePositions(worldSpace = true): Map<string, THREE.Vector3> {
        const positions = new Map<string, THREE.Vector3>();
        for (const boneName of this.bones.keys()) {
            positions.set(boneName, this.getBonePosition(boneName, worldSpace));
        }
        return positions;
    }

    public animateBone(
        boneName: string,
        angleDegrees: number,
        durationMs: number,
        axis: BoneAxis = 'z'
    ): Promise<void> {
        if (!this.loaded) {
            return Promise.reject(new Error('Le robot doit être chargé avant d’animer un os.'));
        }

        const bone = this.bones.get(boneName);
        if (!bone) {
            return Promise.reject(new Error(`Os introuvable dans le modèle: ${boneName}`));
        }

        const previousAnimation = this.activeBoneAnimations.get(bone);
        previousAnimation?.resolve();

        return new Promise((resolve) => {
            const startAngle = bone.rotation[axis];
            const targetAngle = startAngle + THREE.MathUtils.degToRad(angleDegrees);
            const animation: BoneAnimation = {
                bone,
                axis,
                startAngle,
                targetAngle,
                elapsed: 0,
                duration: Math.max(0, durationMs),
                resolve
            };

            this.activeBoneAnimations.set(bone, animation);
            if (animation.duration === 0) {
                bone.rotation[axis] = targetAngle;
                this.activeBoneAnimations.delete(bone);
                resolve();
            }
        });
    }

    public update(deltaSeconds: number): void {
        for (const [bone, animation] of this.activeBoneAnimations) {
            animation.elapsed += deltaSeconds * 1000;
            const progress = Math.min(animation.elapsed / animation.duration, 1);
            const easedProgress = progress * progress * (3 - 2 * progress);
            bone.rotation[animation.axis] = THREE.MathUtils.lerp(
                animation.startAngle,
                animation.targetAngle,
                easedProgress
            );

            if (progress >= 1) {
                this.activeBoneAnimations.delete(bone);
                animation.resolve();
            }
        }
    }
}