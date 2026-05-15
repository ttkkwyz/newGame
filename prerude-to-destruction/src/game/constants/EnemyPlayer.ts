import { Card } from "../../objects/Card";
import { StatusWindow } from "../../objects/StatusWindow";

export class EnemyPlayer {
    public id: number;
    public statusWindow: StatusWindow;
    public dropZone: Phaser.GameObjects.Zone;
    public handCards: Phaser.GameObjects.Container[] = [];

    constructor(scene: Phaser.Scene, id: number, x: number, y: number) {
        this.id = id;
        this.statusWindow = new StatusWindow(scene, x, y, `CPU${id}`);
        this.dropZone = scene.add.zone(x, y + 100, 200, 200).setRectangleDropZone(200, 200);
    }
}