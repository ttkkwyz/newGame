import * as Phaser from 'phaser';

interface CardData {
    type: string;
    value?: number;
}

export class Card extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, x: number, y: number, cardData: CardData) {

        super(scene, x, y);

        const cardBg = scene.add.rectangle(0, 0, 100, 150, 0xffffff);
        cardBg.setStrokeStyle(2, 0x000000);

        const text = scene.add.text(0, 0, cardData.value?.toString() || '', { 
            fontSize: '24px', 
            color: cardData.type === 'recovery' ? '#000000' : '#ff0000'
        }).setOrigin(0.5);

        this.setData('type', cardData.type);
        this.setData('value', cardData.value);

        cardBg.setInteractive();
        scene.input.setDraggable(cardBg);

        this.add([cardBg, text]);
        
        // scene.add.existing(cardBg);
        scene.add.existing(this);
    }
}