import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        // 1. カードを作成 (x: 400, y: 300, 幅: 100, 高さ: 150)
    for(let i = 0; i < 10; i++){
        const card = this.add.rectangle(400, 300, 100, 150, 0xffffff);
        
        // 縁取りを追加してカードっぽく
        card.setStrokeStyle(2, 0x000000);

        // 2. インタラクティブ（操作可能）にする
        card.setInteractive();

        // 3. ドラッグを有効にする
        this.input.setDraggable(card);

        // 4. ドラッグ中のイベントを設定
        this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Rectangle) => {
            gameObject.setDepth(100);
            gameObject.setScale(1.1);
            gameObject.setAlpha(0.8);
        });

        this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Rectangle, dragX: number, dragY: number) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Rectangle) => {
            gameObject.setDepth(1);
            gameObject.setScale(1.0);
            gameObject.setAlpha(1.0);
        });
    }



        // this.camera = this.cameras.main;
        // this.camera.setBackgroundColor(0x00ff00);

        // this.background = this.add.image(512, 384, 'background');
        // this.background.setAlpha(0.5);

        // this.msg_text = this.add.text(512, 384, 'Make something fun!\nand share it with us:\nsupport@phaser.io', {
        //     fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
        //     stroke: '#000000', strokeThickness: 8,
        //     align: 'center'
        // });
        // this.msg_text.setOrigin(0.5);

        // this.input.once('pointerdown', () => {

        //     this.scene.start('GameOver');

        // });
    }
}
