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
        cardData.userPlayable ? this.setData('userPlayable', cardData.userPlayable) : this.setData('userPlayable', () => true);
        cardData.targetPlayable ? this.setData('targetPlayable', cardData.targetPlayable) : this.setData('targetPlayable', () => true);

        if(isPlayer){
            cardBg.setInteractive();
            scene.input.setDraggable(cardBg);
        } else {
            cardBg.setScale(0.5);
            text.setScale(0.5);
        }

        this.add([cardBg, text]);
        
        scene.add.existing(this);
    }

    checkPlayable(userStatus: StatusWindow, targetStatus: StatusWindow){
        if(userStatus.turnCount === 0){
            if(this.getData('type') === 'recovery' || this.getData('type') === 'protect'){
                return true;
            } else {
                return false;
            }
        }
        if(this.getData('userPlayable') && this.getData('targetPlayable')){
            return this.getData('userPlayable')(userStatus) && this.getData('targetPlayable')(targetStatus);
        } else if(this.getData('userPlayable')){
            return this.getData('userPlayable')(userStatus);
        } else if(this.getData('targetPlayable')){
            return this.getData('targetPlayable')(targetStatus);
        } else {
        return true;
        }
    }
}