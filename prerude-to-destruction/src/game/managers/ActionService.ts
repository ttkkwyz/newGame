import * as Phaser from 'phaser';
import { CardData, CardType } from '../constants/CardConfig';
import { StatusWindow } from '../../objects/StatusWindow';
import { Card } from '../../objects/Card';
import { CARD_LIST } from '../constants/CardConfig';
import type { Game } from '../scenes/Game';
import { Layout } from '../constants/LayoutConfig';
import { Effect } from './Effect';

export class ActionService {
    private scene: Game;
    private effect: Effect;

    constructor(scene: Game){
        this.scene = scene;
    }

    handCardEffect(
        card: Card, 
        targetStatus: StatusWindow,
        player: boolean
    ){
        const type = card.getData('type') as CardType;
        const value = card.getData('value') as number;
        const cardId = card.getData('id') as string;

        switch(type){
            case 'recovery':
                this.effect.showEffect(targetStatus, card);
                targetStatus.updateStatusWindow(targetStatus.getData('HP') - value);
                this.sendCardToTrash(card);
                break;
            case 'pollution':
                this.effect.showEffect(targetStatus, card);
                targetStatus.updateStatusWindow(targetStatus.getData('HP') + value);
                targetStatus.addPollution(cardId, targetStatus);
                this.leaveCard(card);
                break;
            case 'interference':
                targetStatus.addInterference(cardId, targetStatus);
                this.leaveCard(card);
                break;
            case 'regreen':
                this.effect.showHealSparkleEffect(targetStatus);
                targetStatus.regreenStatus(cardId, targetStatus);
                this.offsetInterference(cardId);
                this.sendCardToTrash(card);
                break;
            case 'biosphere':
                targetStatus.biosphereStatus(targetStatus, player,(selected: string) => {
                    this.scene.trash.push(CARD_LIST.find(c => c.id === selected) as CardData);
                });
                this.sendCardToTrash(card);
                break;
            case 'protect':
                targetStatus.protectAnimal(targetStatus, card);
                this.leaveCard(card);
                break;
            case 'poaching':
                this.effect.showRifleEffect(targetStatus);
                if(targetStatus.animalImage === '1'){
                    this.scene.trash.push(CARD_LIST.find(c => c.id === 'animal-protection-1') as CardData);
                } else if(targetStatus.animalImage === '2'){
                    this.scene.trash.push(CARD_LIST.find(c => c.id === 'animal-protection-2') as CardData);
                }
                targetStatus.poachAnimal(targetStatus);
                this.sendCardToTrash(card);
                break;
        }
        this.scene.checkGameOver();
    }
    
    sendCardToTrash(card: Card){
        this.scene.trash.push(CARD_LIST.find(c => c.id === card.getData('id')) as CardData);

        this.scene.add.tween({
            targets: card,
            x: Layout.trashZone.x,
            y: Layout.trashZone.y,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                if(this.scene.trashImage){
                    this.scene.trashImage.destroy();
                    this.scene.trashImage = null;
                }
                this.scene.trashImage = this.scene.add.image(
                    Layout.trashZone.x, 
                    Layout.trashZone.y, 
                    card.getData('imageKey')
                ).setScale(0.15);
                card.destroy();
            }
        });
    }

    leaveCard(card: Card){
        card.destroy();
    }
    
    offsetInterference(id: string){
        switch(id){
            case 'waste-treatment':
                this.scene.trash.push(CARD_LIST.find(c => c.id === 'waste') as CardData);
                break;
            case 'waste-water-treatment':
                this.scene.trash.push(CARD_LIST.find(c => c.id === 'ocean-pollution') as CardData);
                break;
            case 'planting':
                this.scene.trash.push(CARD_LIST.find(c => c.id === 'deforestation') as CardData);
                break;
        }
    }
}