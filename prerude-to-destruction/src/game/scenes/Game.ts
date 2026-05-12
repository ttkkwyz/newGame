import { Scene } from 'phaser';
import * as Phaser from 'phaser';

interface CardData {
    type: string;
    value?: number;
}

export class Game extends Scene
{
    // camera: Phaser.Cameras.Scene2D.Camera;
    // background: Phaser.GameObjects.Image;
    // msg_text : Phaser.GameObjects.Text;

    constructor ()
    {
        super('Game');
    }

    private deck: CardData[] = [];
    private trash: CardData[] = [];

    create ()
    {

    this.initializeDeck();

    const deckVisual = this.add.rectangle(500, 400, 100, 150, 0x555555);
    deckVisual.setInteractive();

    for(let i=0; i<5; i++){
        const newCard = this.drawCard(700, 500);
        if(newCard){
            this.handCards.push(newCard);
        }
    }
    this.updateHandLayout();

    deckVisual.on('pointerdown', () => {
        const newCard = this.drawCard(700, 500);
        if(newCard){
            this.handCards.push(newCard);
            this.updateHandLayout();
        }
    });

    // for(let i = 0; i < 10; i++){
    //     const container: Phaser.GameObjects.Container = this.add.container(400, 300);
    //     const card = this.add.rectangle(0, 0, 100, 150, 0xffffff);
    //     card.setStrokeStyle(2, 0x000000);
    //     card.setData('type', 'recovery');
    //     card.setData('value', 10);
    //     const valueText = this.add.text(
    //         0, 0, card.getData('value').toString(), { 
    //             fontSize: '24px', color: '#000000' 
    //         }).setOrigin(0.5);
    //     container.add([card, valueText]);
    //     card.setInteractive();
    //     this.input.setDraggable(card);

    //     this.handCards.push(container);
    // }
    // this.updateHandLayout();

        this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container) => {
            const container = gameObject.parentContainer;
            if(container){
                container.setDepth(1000);
                container.setScale(1.1);
                container.setAlpha(0.8);
                container.setAngle(0);
                container.setData('startX', container.x);
                container.setData('startY', container.y);
            }
        });

        this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container, dragX: number, dragY: number) => {
            const container = gameObject.parentContainer;
            if(container){
                container.x = pointer.worldX;
                container.y = pointer.worldY;
            } else {
                gameObject.x = pointer.worldX;
                gameObject.y = pointer.worldY;
            }
        });
        
        this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container, dropped: boolean) => {
            const container = gameObject.parentContainer;
            if(container){
                // container.setDepth(1);
                container.setScale(1.0);
                container.setAlpha(1.0);
            }
            if (!dropped){
                const startX = container.getData('startX');
                const startY = container.getData('startY');

             this.add.tween({
                targets: container,
                x: startX,
                y: startY,
                duration: 200,
                ease: 'Power2',
                onComplete: () => {
                    this.updateHandLayout();
                }
            })} else {
                this.updateHandLayout();
            }
        });

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
    
    const playerHPbar = this.add.rectangle(900, 400, 100, 10, 0x00ff00);
    playerHPbar.setOrigin(0, 0.5);
    playerHPbar.setAlpha(1.0);
    playerHPbar.setDepth(10);
    playerHPbar.setData('value', 100);
    playerHPbar.setData('max', 100);
    playerHPbar.setData('min', 0);
    playerHPbar.setStrokeStyle(2, 0x000000);
    const playerHPbarText = this.add.text(playerHPbar.x, playerHPbar.y, playerHPbar.getData('value').toString(), { fontSize: '16px', color: '#000000', align: 'center' });
    playerHPbarText.setOrigin(0, 0.5);
    playerHPbarText.setDepth(11);
    playerHPbarText.setAlpha(1.0);

    const cpuHPbar = this.add.rectangle(100, 300, 100, 10, 0x00ff00);
    cpuHPbar.setOrigin(0, 0.5);
    cpuHPbar.setAlpha(1.0);
    cpuHPbar.setDepth(10);
    cpuHPbar.setData('value', 100);
    cpuHPbar.setData('max', 100);
    cpuHPbar.setData('min', 0);
    cpuHPbar.setStrokeStyle(2, 0x000000);
    const cpuHPbarText = this.add.text(cpuHPbar.x, cpuHPbar.y, cpuHPbar.getData('value').toString(), { fontSize: '16px', color: '#000000', align: 'center' });
    cpuHPbarText.setOrigin(0, 0.5);
    cpuHPbarText.setDepth(11);
    cpuHPbarText.setAlpha(1.0);

    // Zone作成
    // const zone = this.add.zone(400, 200, 100, 150).setRectangleDropZone(100, 150);

    const cpuTargetZone = this.add.zone(100, 200, 100, 150).setRectangleDropZone(100, 150);
    const playerTargetZone = this.add.zone(900, 550, 100, 150).setRectangleDropZone(100, 150);

    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffff00);
    graphics.strokeRect(cpuTargetZone.x - cpuTargetZone.input!.hitArea!.width / 2, cpuTargetZone.y - cpuTargetZone.input!.hitArea!.height / 2, cpuTargetZone.input!.hitArea!.width, cpuTargetZone.input!.hitArea!.height);
    graphics.strokeRect(playerTargetZone.x - playerTargetZone.input!.hitArea!.width / 2, playerTargetZone.y - playerTargetZone.input!.hitArea!.height / 2, playerTargetZone.input!.hitArea!.width, playerTargetZone.input!.hitArea!.height);

    // Zoneにドラッグしてきたときの処理
    this.input.on('dragenter', (pointer: Phaser.Input.Pointer, gameObject: any, dropZone: Phaser.GameObjects.Zone) => {
        graphics.clear();
        graphics.lineStyle(2, 0x00ff00);
        graphics.strokeRect(cpuTargetZone.x - cpuTargetZone.input!.hitArea!.width / 2, cpuTargetZone.y - cpuTargetZone.input!.hitArea!.height / 2, cpuTargetZone.input!.hitArea!.width, cpuTargetZone.input!.hitArea!.height);
        graphics.strokeRect(playerTargetZone.x - playerTargetZone.input!.hitArea!.width / 2, playerTargetZone.y - playerTargetZone.input!.hitArea!.height / 2, playerTargetZone.input!.hitArea!.width, playerTargetZone.input!.hitArea!.height);
    });

    this.input.on('dragleave', (pointer: Phaser.Input.Pointer, gameObject: any, dropZone: Phaser.GameObjects.Zone) => {
        graphics.clear();
        graphics.lineStyle(2, 0xffff00);
        graphics.strokeRect(cpuTargetZone.x - cpuTargetZone.input!.hitArea!.width / 2, cpuTargetZone.y - cpuTargetZone.input!.hitArea!.height / 2, cpuTargetZone.input!.hitArea!.width, cpuTargetZone.input!.hitArea!.height);
        graphics.strokeRect(playerTargetZone.x - playerTargetZone.input!.hitArea!.width / 2, playerTargetZone.y - playerTargetZone.input!.hitArea!.height / 2, playerTargetZone.input!.hitArea!.width, playerTargetZone.input!.hitArea!.height);
    });

    let depth = 1;

    // Zoneにドロップしたときの効果処理
    // this.input.on('drop', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container, dropZone: Phaser.GameObjects.Zone) => {
    //     const container = gameObject.parentContainer;
    //     container.x = dropZone.x;
    //     container.y = dropZone.y;
    //     container.setAngle(0);
    //     container.setDepth(depth);
    //     depth++;

    //     const index = this.handCards.indexOf(container);
    //     if (index > -1){
    //         this.handCards.splice(index, 1);
    //     }
        
    //     HPbar.setData('value', HPbar.getData('value') - gameObject.getData('value'));
    //     HPbarText.setText(HPbar.getData('value').toString());

    //     const ratio = HPbar.getData('value') / HPbar.getData('max');
    //     HPbar.setScale(ratio, 1.0);

    //     if (HPbar.getData('value') <= 0){
    //         this.scene.start('GameOver');
    //     }
    // });
    // }

    // Zoneにドロップしたときの効果処理
    this.input.on('drop', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container, dropZone: Phaser.GameObjects.Zone) => {
        const container = gameObject.parentContainer;
        container.x = dropZone.x;
        container.y = dropZone.y;
        container.setAngle(0);
        container.setDepth(depth);
        depth++;

        const index = this.handCards.indexOf(container);
        if (index > -1){
            this.handCards.splice(index, 1);
        }

        if(dropZone === cpuTargetZone){
            this.cpuHP.current -= gameObject.getData('value');
            cpuHPbar.setData('value', this.cpuHP.current);
            cpuHPbarText.setText(this.cpuHP.current.toString());
            const ratio = this.cpuHP.current / this.cpuHP.max;
            cpuHPbar.setScale(ratio, 1.0);
            if (this.cpuHP.current <= 0){
                this.scene.start('GameOver');
            }
        } else if(dropZone === playerTargetZone){
            this.playerHP.current -= gameObject.getData('value');
            playerHPbar.setData('value', this.playerHP.current);
            playerHPbarText.setText(this.playerHP.current.toString());
            const ratio = this.playerHP.current / this.playerHP.max;
            playerHPbar.setScale(ratio, 1.0);
            if (this.playerHP.current <= 0){
                this.scene.start('GameOver');
            }
        // HPbar.setData('value', HPbar.getData('value') - gameObject.getData('value'));
        // HPbarText.setText(HPbar.getData('value').toString());

        // const ratio = HPbar.getData('value') / HPbar.getData('max');
        // HPbar.setScale(ratio, 1.0);

        // if (HPbar.getData('value') <= 0){
        //     this.scene.start('GameOver');
        // }
        }
    });
    }

    // 手札のカードを管理する配列
    private handCards: Phaser.GameObjects.Container[] = [];
    private playerHandCards: Phaser.GameObjects.Container[] = [];
    private cpuHandCards: Phaser.GameObjects.Container[] = [];

    // プレイヤーとCPUのHPを管理するオブジェクト
    private playerHP = {current: 100, max: 100, text: null, bar: null };
    private cpuHP = {current: 100, max: 100, text: null, bar: null };

    // 手札のレイアウトを更新するメソッド
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
        console.log(this.handCards.length);
    }

    // デックを初期化するメソッド
    initializeDeck(){
        const values = [5, 10, 15, 20];
        this.deck = [];

        values.forEach(value => {
            for(let i = 0; i < 5; i++){
                this.deck.push({
                    type: 'recovery',
                    value: value
                });
            }
        });

        Phaser.Utils.Array.Shuffle(this.deck);
    }

    drawCard(x: number, y: number){
        if(this.deck.length === 0){
            return;
        }
        const cardData = this.deck.pop()!;
        
        const container: Phaser.GameObjects.Container = this.add.container(x, y);

        const card = this.add.rectangle(0, 0, 100, 150, 0xffffff);
        card.setStrokeStyle(2, 0x000000);
        card.setData('type', cardData.type);
        card.setData('value', cardData.value);

        const valuetext = this.add.text(0, 0, cardData.value!.toString(), {
            fontSize: '24px',
            color: '#000000'
        }).setOrigin(0.5);

        container.add([card, valuetext]);
        card.setInteractive();
        this.input.setDraggable(card);

        if(this.deck.length === 0){
            const emptyDeck = this.add.rectangle(500, 400, 100, 150, 0xeeeeee);
        }
        return container;
    }
}