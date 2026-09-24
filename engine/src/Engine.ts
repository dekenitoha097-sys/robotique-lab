import * as THREE from 'three';
import { Scene } from './Scene';
import { Renderer } from './Renderer';
import { Camera } from './Camera';
import {Physics} from './Physics';
import { CoordinateHelper } from './CoordinateHelper';
import { Robot } from './Robot';
import { Environment } from './Environment';
import { EditorControls } from './EditorControls';
import type { TransformMode } from './EditorControls';


export class Engine {
    public scene: Scene;
    public renderer: Renderer;
    public camera: Camera;
    public physics: Physics;
    public coordinateHelper: CoordinateHelper;
    public editorControls: EditorControls;
    public robots: Robot[] = [];
    public environment?: Environment;

    constructor(container: HTMLElement = document.body) {
        this.scene = new Scene();
        this.renderer = new Renderer(container);
        this.camera = new Camera(this.renderer.instance.domElement);
        this.physics = new Physics();
        this.coordinateHelper = new CoordinateHelper();
        this.editorControls = new EditorControls(
            this.scene.instance,
            this.camera.instance,
            this.renderer.instance.domElement,
            this.camera.controls
        );
        this.scene.add(this.coordinateHelper);
    }

    public async init(gravity = { x: 0, y: -9.81, z: 0 }): Promise<void> {
        await this.physics.init(gravity);
    }

    public setCoordinateHelperVisible(visible: boolean): void {
        this.coordinateHelper.visible = visible;
    }

    public enableCoordinateHelper(): void {
        this.setCoordinateHelperVisible(true);
    }

    public disableCoordinateHelper(): void {
        this.setCoordinateHelperVisible(false);
    }

    public isCoordinateHelperVisible(): boolean {
        return this.coordinateHelper.visible;
    }

    public enableCameraNavigation(): void {
        this.camera.enableNavigation();
    }

    public disableCameraNavigation(): void {
        this.camera.disableNavigation();
    }

    public async addRobot(
        robot: Robot,
        position = { x: 0, y: 0, z: 0 }
    ): Promise<Robot> {
        await robot.load();
        robot.position.set(position.x, position.y, position.z);
        this.scene.add(robot);
        this.editorControls.addSelectable(robot);
        this.robots.push(robot);
        return robot;
    }

    public async loadRobot(
        modelPath: string,
        position = { x: 0, y: 0, z: 0 }
    ): Promise<Robot> {
        return this.addRobot(new Robot(modelPath), position);
    }

    public removeRobot(robot: Robot): void {
        this.scene.remove(robot);
        this.editorControls.removeSelectable(robot);
        this.robots = this.robots.filter((currentRobot) => currentRobot !== robot);
    }

    public async addEnvironment(
        environment: Environment,
        position = { x: 0, y: 0, z: 0 }
    ): Promise<Environment> {
        await environment.load();
        this.removeEnvironment();
        environment.position.set(position.x, position.y, position.z);
        this.scene.add(environment);
        this.editorControls.addSelectable(environment);
        this.environment = environment;
        return environment;
    }

    public async loadEnvironment(
        modelPath: string,
        position = { x: 0, y: 0, z: 0 }
    ): Promise<Environment> {
        return this.addEnvironment(new Environment(modelPath), position);
    }

    public removeEnvironment(): void {
        if (this.environment) {
            this.editorControls.removeSelectable(this.environment);
            this.scene.remove(this.environment);
            this.environment = undefined;
        }
    }

    public setTransformMode(mode: TransformMode): void {
        this.editorControls.setMode(mode);
    }

    public deselectObject(): void {
        this.editorControls.deselect();
    }

    public start(updateCallback?: () => void): void {
        const clock = new THREE.Clock();

        const loop = (): void => {
            requestAnimationFrame(loop);

            const deltaSeconds = clock.getDelta();
            this.physics.update();
            this.camera.update();
            for (const robot of this.robots) {
                robot.update(deltaSeconds);
            }

            if (updateCallback) {
                updateCallback();
            }

            this.renderer.render(this.scene, this.camera);
        };

        loop();
    }

}