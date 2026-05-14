import * as Phaser from 'phaser';
import { CardData, CardType } from '../game/constants/CardConfig';
import { StatusWindow } from './StatusWindow';

export class Card extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, x: number, y: number, cardData: CardData, isPlayer: boolean) {

        super(scene, x, y);

        const cardBg = scene.add.rectangle(0, 0, 100, 150, 0xffffff);
        cardBg.setStrokeStyle(2, 0x000000);

        const text = scene.add.text(0, 0, cardData.value?.toString() || '', { 
            fontSize: '24px', 
            color: cardData.type === 'recovery' ? '#000000' : '#ff0000'
        }).setOrigin(0.5);

        this.setData('id', cardData.id);
        this.setData('name', cardData.name);
        this.setData('description', cardData.description);
        this.setData('type', cardData.type);
        this.setData('value', cardData.value);
        cardData.playable ? this.setData('playable', cardData.playable) : this.setData('playable', () => true);

        if(isPlayer){
            cardBg.setInteractive();
            scene.input.setDraggable(cardBg);
        }

        this.add([cardBg, text]);
        
        scene.add.existing(this);
    }

    checkPlayable(status: StatusWindow){
        if(!this.getData('playable')){
            return true;
        }
        return this.getData('playable')(status);
    }
}