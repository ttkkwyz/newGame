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
        card.setData('value', 10);
        this.handCards.push(card);
        
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

    this.updateHandLayout();

    const HPbar = this.add.rectangle(400, 100, 100, 10, 0x00ff00);
    HPbar.setOrigin(0, 0.5);
    HPbar.setAlpha(1.0);
    HPbar.setDepth(10);
    HPbar.setData('value', 100);
    HPbar.setData('max', 100);
    HPbar.setData('min', 0);
    HPbar.setStrokeStyle(2, 0x000000);
    const HPbarText = this.add.text(HPbar.x, HPbar.y, HPbar.getData('value').toString(), { fontSize: '16px', color: '#000000', align: 'center' });
    HPbarText.setOrigin(0, 0.5);
    HPbarText.setDepth(11);
    HPbarText.setAlpha(1.0);

    const zone = this.add.zone(400, 500, 200, 250).setRectangleDropZone(200, 250);

    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffff00);
    graphics.strokeRect(zone.x - zone.input!.hitArea!.width / 2, zone.y - zone.input!.hitArea!.height / 2, zone.input!.hitArea!.width, zone.input!.hitArea!.height);

    this.input.on('drop', (pointer: Phaser.Input.Pointer, gameObject: any, dropZone: Phaser.GameObjects.Zone) => {
        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;
    });

    this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: any, dropped: boolean) => {
        if (!dropped){
            gameObject.x = gameObject.input.dragStartX;
            gameObject.y = gameObject.input.dragStartY;
        }
    });

    this.input.on('dragenter', (pointer: Phaser.Input.Pointer, gameObject: any, dropZone: Phaser.GameObjects.Zone) => {
        graphics.clear();
        graphics.lineStyle(2, 0x00ff00);
        graphics.strokeRect(zone.x - zone.input!.hitArea!.width / 2, zone.y - zone.input!.hitArea!.height / 2, zone.input!.hitArea!.width, zone.input!.hitArea!.height);
    });

    this.input.on('drop', (pointer: Phaser.Input.Pointer, gameObject: any, dropZone: Phaser.GameObjects.Zone) => {
        HPbar.setData('value', HPbar.getData('value') - gameObject.getData('value'));
        HPbarText.setText(HPbar.getData('value').toString());

        const ratio = HPbar.getData('value') / HPbar.getData('max');
        HPbar.setScale(ratio, 1.0);

        if (HPbar.getData('value') <= 0){
            this.scene.start('GameOver');
        }

        this.handCards.splice(this.handCards.indexOf(gameObject), 1);
        this.updateHandLayout();
    });

    }

    private handCards: Phaser.GameObjects.Rectangle[] = [];

    updateHandLayout(){
        const centerX = 400;
        const centerY = 550;
        const cardSpacing = Math.min(60, 400 / this.handCards.length);

        this.handCards.forEach((card, index) => {
            const offset = index - (this.handCards.length -1) /2;

            const targetX = centerX + offset * cardSpacing;
            const targetY = centerY + (Math.abs(offset) * 10);
            const targetAngle = offset * 5;

            this.add.tween({
                targets: card,
                x: targetX,
                y: targetY,
                angle: targetAngle,
                duration: 200,
                ease: 'Power2',
            });

            card.setDepth(100 + index);
        });
    }
}