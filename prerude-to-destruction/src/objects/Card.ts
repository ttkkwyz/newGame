import * as Phaser from 'phaser';
import { CardData, CardType } from '../game/constants/CardConfig';
import { StatusWindow } from './StatusWindow';

export class Card extends Phaser.GameObjects.Container {
    private cardImage: Phaser.GameObjects.Image;
    private frontKey: string;
    private backKey: string = 'back';

    constructor(
        scene: Phaser.Scene, 
        x: number, 
        y: number, 
        cardData: CardData, 
        isPlayer: boolean
    ) {

        super(scene, x, y);

        // const cardBg = scene.add.rectangle(0, 0, 100, 150, 0xffffff);
        // cardBg.setStrokeStyle(2, 0x000000);

        this.frontKey = cardData.imageKey;
        this.setData('imageKey', this.frontKey);

        const inititalKey = isPlayer ? this.frontKey : this.backKey;
        this.cardImage = scene.add.image(0, 0, inititalKey);
        this.cardImage.setScale(0.15);

        if(isPlayer){
            this.cardImage.setInteractive();
            scene.input.setDraggable(this.cardImage);
        } else {
            this.cardImage.setScale(0.1);
        }

        // const text = scene.add.text(0, 0, cardData.value?.toString() || '', { 
        //     fontSize: '24px', 
        //     color: cardData.type === 'recovery' ? '#000000' : '#ff0000'
        // }).setOrigin(0.5);

        this.setData('id', cardData.id);
        this.setData('name', cardData.name);
        this.setData('description', cardData.description);
        this.setData('type', cardData.type);
        this.setData('value', cardData.value);
        cardData.userPlayable ? this.setData(
            'userPlayable', 
            cardData.userPlayable
        ) : this.setData('userPlayable', () => true);
        cardData.targetPlayable ? this.setData(
            'targetPlayable', 
            cardData.targetPlayable
        ) : this.setData('targetPlayable', () => true);

        // this.add([cardBg, text]);
        this.add(this.cardImage);
        
        scene.add.existing(this);
    }

    public showFront(){
        this.cardImage.setTexture(this.frontKey);
    }

    public showBack(){
        this.cardImage.setTexture(this.backKey);
    }

    checkPlayable(userStatus: StatusWindow, targetStatus: StatusWindow){
        if(userStatus.turnCount === 1){
            switch(this.getData('type')){
                case 'recovery':
                    return true;
                case 'pollution':
                    return false;
                case 'interference':
                    return false;
                case 'regreen':
                    return false;
                case 'biosphere':
                    return false;
                case 'protect':
                    return this.getData('userPlayable')(userStatus) && this.getData('targetPlayable')(targetStatus);
                case 'poaching':
                    return false;
                default:
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