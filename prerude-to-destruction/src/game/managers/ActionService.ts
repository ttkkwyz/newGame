import * as Phaser from 'phaser';
import { CardData, CardType } from '../constants/CardConfig';
import { StatusWindow } from '../../objects/StatusWindow';
import { Card } from '../../objects/Card';
import { CARD_LIST } from '../constants/CardConfig';
import type { Game } from '../scenes/Game';

export class ActionService {
    private scene: Game;

    constructor(scene: Game){
        this.scene = scene;
    }

    handCardEffect(card: Card, targetStatus: StatusWindow, dropZone: Phaser.GameObjects.Zone, trash: CardData[]){
        const type = card.getData('type') as CardType;
        const value = card.getData('value') as number;
        const id = card.getData('id') as string;
        const name = card.getData('name') as string;

        switch(type){
            case 'recovery':
                targetStatus.updateStatusWindow(targetStatus.getData('HP') - value);
                this.sendCardToTrash(card, trash);
                break;
            case 'pollution':
                targetStatus.updateStatusWindow(targetStatus.getData('HP') + value);
                targetStatus.addPollution(id, targetStatus);
                this.leaveCard(card, dropZone);
                break;
            case 'interference':
                targetStatus.addInterference(id, targetStatus);
                this.leaveCard(card, dropZone);
                break;
            case 'regreen':
                targetStatus.regreenStatus(id, targetStatus);
                this.sendCardToTrash(card, trash);
                this.offsetInterference(id, trash);
                break;
            case 'biosphere':
                targetStatus.biosphereStatus(targetStatus, (selected: string) => {
                    trash.push(CARD_LIST.find(c => c.id === selected) as CardData);
                    console.log('biosphere', selected);
                    console.log(targetStatus.getActiveStatus());
                });
                this.sendCardToTrash(card, trash);
                console.log('biosphere', trash);
                break;
            case 'protect':
                targetStatus.protectAnimal(targetStatus);
                this.leaveCard(card, dropZone);
                break;
            case 'poaching':
                targetStatus.poachAnimal(targetStatus);
                this.leaveCard(card, dropZone);
                break;
        }
        this.scene.checkGameOver();
    }
    
    sendCardToTrash(card: Card, trash: CardData[]){
        trash.push(CARD_LIST.find(c => c.id === card.getData('id')) as CardData);
        card.destroy();
    }

    leaveCard(card: Card, dropZone: Phaser.GameObjects.Zone){
        card.destroy();
    }
    
    offsetInterference(id: string, trash: CardData[]){
        switch(id){
            case 'waste-treatment':
                trash.push(CARD_LIST.find(c => c.id === 'waste') as CardData);
                break;
            case 'waste-water-treatment':
                trash.push(CARD_LIST.find(c => c.id === 'ocean-pollution') as CardData);
                break;
            case 'planting':
                trash.push(CARD_LIST.find(c => c.id === 'deforestation') as CardData);
                break;
        }
    }
}