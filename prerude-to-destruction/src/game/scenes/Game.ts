import { Scene } from 'phaser';
import * as Phaser from 'phaser';

interface CardData {
    type: string;
    value?: number;
}

interface HP {
    current: number;
    max: number;
    text: Phaser.GameObjects.Text;
    bar: Phaser.GameObjects.Rectangle;
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

    private turnPlayer: number = 0;

    private playerTargetZone: Phaser.GameObjects.Zone;
    private cpuTargetZone: Phaser.GameObjects.Zone;
    private playerHP: HP;
    private cpuHP: HP;

    // 手札のカードを管理する配列
    // private handCards: Phaser.GameObjects.Container[] = [];
    private playerHandCards: Phaser.GameObjects.Container[] = [];
    private cpuHandCards: Phaser.GameObjects.Container[] = [];

    create ()
    {

    this.initializeDeck();

    const deckVisual = this.add.rectangle(500, 400, 100, 150, 0x555555);
    deckVisual.setInteractive();

    for(let i=0; i<5; i++){
        const newCard = this.drawCard(700, 500);
        if(newCard){
            this.playerHandCards.push(newCard);
        }
    }
    for(let i=0; i<5; i++){
        const newCard = this.drawCard(500, 400);
        if(newCard){
            this.cpuHandCards.push(newCard);
        }
    }
    this.updateHandLayout(this.playerHandCards);
    this.updateHandLayout(this.cpuHandCards);

    deckVisual.on('pointerdown', () => {
        const newCard = this.drawCard(700, 500);
        if(newCard){
            this.playerHandCards.push(newCard);
        }
        this.updateHandLayout(this.playerHandCards);
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
                this.updateHandLayout(this.playerHandCards);
            }
        })} else {
            this.updateHandLayout(this.playerHandCards);
        }
    });

    // const HPbar = this.add.rectangle(400, 100, 100, 10, 0x00ff00);
    // HPbar.setOrigin(0, 0.5);
    // HPbar.setAlpha(1.0);
    // HPbar.setDepth(10);
    // HPbar.setData('value', 100);
    // HPbar.setData('max', 100);
    // HPbar.setData('min', 0);
    // HPbar.setStrokeStyle(2, 0x000000);
    // const HPbarText = this.add.text(HPbar.x, HPbar.y, HPbar.getData('value').toString(), { fontSize: '16px', color: '#000000', align: 'center' });
    // HPbarText.setOrigin(0, 0.5);
    // HPbarText.setDepth(11);
    // HPbarText.setAlpha(1.0);
    this.playerHP = {
        current: 100, 
        max: 100, 
        text: this.add.text(900, 400, '100', { fontSize: '16px', color: '#000000', align: 'center' }),
        bar: this.add.rectangle(900, 400, 100, 10, 0x00ff00) 
    };
    this.playerHP.bar.setOrigin(0, 0.5);
    this.playerHP.bar.setAlpha(1.0);
    this.playerHP.bar.setDepth(10);
    this.playerHP.text.setOrigin(0, 0.5);
    this.playerHP.text.setDepth(11);
    this.playerHP.text.setAlpha(1.0);

    this.cpuHP = {
        current: 100,
        max: 100,
        text: this.add.text(100, 300, '100', { fontSize: '16px', color: '#000000', align: 'center' }),
        bar: this.add.rectangle(100, 300, 100, 10, 0x00ff00)
    }
    this.cpuHP.bar.setOrigin(0, 0.5);
    this.cpuHP.bar.setAlpha(1.0);
    this.cpuHP.bar.setDepth(10);
    this.cpuHP.text.setOrigin(0, 0.5);
    this.cpuHP.text.setDepth(11);
    this.cpuHP.text.setAlpha(1.0);

    // Zone作成
    // const zone = this.add.zone(400, 200, 100, 150).setRectangleDropZone(100, 150);

    this.cpuTargetZone = this.add.zone(100, 200, 100, 150).setRectangleDropZone(100, 150);
    this.playerTargetZone = this.add.zone(900, 550, 100, 150).setRectangleDropZone(100, 150);

    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffff00);
    graphics.strokeRect(this.cpuTargetZone.x - this.cpuTargetZone.input!.hitArea!.width / 2, this.cpuTargetZone.y - this.cpuTargetZone.input!.hitArea!.height / 2, this.cpuTargetZone.input!.hitArea!.width, this.cpuTargetZone.input!.hitArea!.height);
    graphics.strokeRect(this.playerTargetZone.x - this.playerTargetZone.input!.hitArea!.width / 2, this.playerTargetZone.y - this.playerTargetZone.input!.hitArea!.height / 2, this.playerTargetZone.input!.hitArea!.width, this.playerTargetZone.input!.hitArea!.height);

    // Zoneにドラッグしてきたときの処理
    this.input.on('dragenter', (pointer: Phaser.Input.Pointer, gameObject: any, dropZone: Phaser.GameObjects.Zone) => {
        graphics.clear();
        graphics.lineStyle(2, 0x00ff00);
        graphics.strokeRect(this.cpuTargetZone.x - this.cpuTargetZone.input!.hitArea!.width / 2, this.cpuTargetZone.y - this.cpuTargetZone.input!.hitArea!.height / 2, this.cpuTargetZone.input!.hitArea!.width, this.cpuTargetZone.input!.hitArea!.height);
        graphics.strokeRect(this.playerTargetZone.x - this.playerTargetZone.input!.hitArea!.width / 2, this.playerTargetZone.y - this.playerTargetZone.input!.hitArea!.height / 2, this.playerTargetZone.input!.hitArea!.width, this.playerTargetZone.input!.hitArea!.height);
    });

    this.input.on('dragleave', (pointer: Phaser.Input.Pointer, gameObject: any, dropZone: Phaser.GameObjects.Zone) => {
        graphics.clear();
        graphics.lineStyle(2, 0xffff00);
        graphics.strokeRect(this.cpuTargetZone.x - this.cpuTargetZone.input!.hitArea!.width / 2, this.cpuTargetZone.y - this.cpuTargetZone.input!.hitArea!.height / 2, this.cpuTargetZone.input!.hitArea!.width, this.cpuTargetZone.input!.hitArea!.height);
        graphics.strokeRect(this.playerTargetZone.x - this.playerTargetZone.input!.hitArea!.width / 2, this.playerTargetZone.y - this.playerTargetZone.input!.hitArea!.height / 2, this.playerTargetZone.input!.hitArea!.width, this.playerTargetZone.input!.hitArea!.height);
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

        const index = this.playerHandCards.indexOf(container);
        if (index > -1){
            this.playerHandCards.splice(index, 1);
            this.trash.push(container);
        }

        if(dropZone === this.cpuTargetZone){
            this.cpuHP.current += this.damageCalculation({type: container.getData('type'), value: container.getData('value')});
            this.updateHPLayout(this.cpuHP);    
        } else if(dropZone === this.playerTargetZone){
            this.playerHP.current += this.damageCalculation({type: container.getData('type'), value: container.getData('value')});
            this.updateHPLayout(this.playerHP);
        // HPbar.setData('value', HPbar.getData('value') - gameObject.getData('value'));
        // HPbarText.setText(HPbar.getData('value').toString());

        // const ratio = HPbar.getData('value') / HPbar.getData('max');
        // HPbar.setScale(ratio, 1.0);

        // if (HPbar.getData('value') <= 0){
        //     this.scene.start('GameOver');
        // }
        }
        this.turnPlayer = (this.turnPlayer + 1) % 2 ;
        this.cpuTurn();
    });
    }

    // 手札のレイアウトを更新するメソッド
    // updateHandLayout(){
    //     const centerX = 400;
    //     const centerY = 550;
    //     const cardSpacing = Math.min(60, 400 / this.handCards.length);

    //     this.handCards.forEach((card, index) => {
    //         const offset = index - (this.handCards.length -1) /2;

    //         const targetX = centerX + offset * cardSpacing;
    //         const targetY = centerY + (Math.abs(offset) * 10);
    //         const targetAngle = offset * 5;

    //         this.add.tween({
    //             targets: card,
    //             x: targetX,
    //             y: targetY,
    //             angle: targetAngle,
    //             duration: 200,
    //             ease: 'Power2',
    //         });

    //         card.setDepth(100 + index);
    //     });
    //     console.log(this.handCards.length);
    // }

    updateHandLayout(handCards: Phaser.GameObjects.Container[]){
        const centerX = 400;
        const centerY = handCards == this.playerHandCards ? 550 : 250 ;
        const cardSpacing = Math.min(60, 400 / handCards.length);

        handCards.forEach((card, index) => {
            const offset = index - (handCards.length -1) /2;

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

    // デックを初期化するメソッド
    initializeDeck(){
        const allKindsOfCards: {CardData: CardData, NumberOfCards: number}[] = [
            {CardData: {type: 'recovery', value: 5}, NumberOfCards: 10},
            {CardData: {type: 'recovery', value: 10}, NumberOfCards: 16},
            {CardData: {type: 'recovery', value: 15}, NumberOfCards: 14},
            {CardData: {type: 'recovery', value: 20}, NumberOfCards: 6},
            {CardData: {type: 'pollution', value: 10}, NumberOfCards: 5},
            {CardData: {type: 'pollution', value: 15}, NumberOfCards: 5}
        ];
        this.deck = [];

        allKindsOfCards.forEach(cardData => {
            for(let i = 0; i < cardData.NumberOfCards; i++){
                this.deck.push(cardData.CardData);
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
        container.setData('type', cardData.type);
        container.setData('value', cardData.value);

        const valuetext = this.add.text(0, 0, cardData.value!.toString(), {
            fontSize: '24px',
            color: cardData.type === 'recovery' ? '#000000' : '#ff0000'
        }).setOrigin(0.5);

        container.add([card, valuetext]);
        card.setInteractive();
        this.input.setDraggable(card);

        if(this.deck.length === 0){
            const emptyDeck = this.add.rectangle(500, 400, 100, 150, 0xeeeeee);
        }
        return container;
    }

    updateHPLayout(HP: HP){
        const ratio = HP.current / HP.max;
        HP.bar.setScale(ratio, 1.0);
        HP.text.setText(HP.current.toString());
    }

    cpuTurn(){
        const newCard = this.drawCard(500, 400);
        if(newCard){
            this.cpuHandCards.push(newCard);
        }
        this.updateHandLayout(this.cpuHandCards);
        const targetCard = this.cpuHandCards[0];
        
        this.add.tween({
            targets: targetCard,
            x: this.playerTargetZone.x,
            y: this.playerTargetZone.y,
            angle: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.playerHP.current -= targetCard.getData('value');
                this.updateHPLayout(this.playerHP);
                this.trash.push(targetCard);
                this.cpuHandCards.splice(0, 1);
                this.updateHandLayout(this.cpuHandCards);
            }
        })
        this.turnPlayer = (this.turnPlayer + 1) % 2 ;
    }

    damageCalculation(card: CardData){
        if(card.value === undefined){
            return 0;
        }
        return card.type === 'recovery' ? -card.value : card.value;
    }
}