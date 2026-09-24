import { Scene } from './Scene';
import { Renderer } from './Renderer';
import { Camera } from './Camera';
import {Physics} from './Physics';
import { CoordinateHelper } from './CoordinateHelper';


export class Engine {
    public scene: Scene;
    public renderer: Renderer;
    public camera: Camera;
    public physics: Physics;
    public coordinateHelper: CoordinateHelper;

    constructor(container: HTMLElement = document.body) {
        this.scene = new Scene();
        this.renderer = new Renderer(container);
        this.camera = new Camera();
        this.physics = new Physics();
        this.coordinateHelper = new CoordinateHelper();
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

    public start(updateCallback?: () => void): void {
        const loop = (): void => {
            requestAnimationFrame(loop);

            this.physics.update();

            if (updateCallback) {
                updateCallback();
            }

            this.renderer.render(this.scene, this.camera);
        };

        loop();
    }

}