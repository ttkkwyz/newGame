import * as Phaser from 'phaser';
import { CardData, CardType } from '../constants/CardConfig';
import { StatusWindow } from '../../objects/StatusWindow';
import { Card } from '../../objects/Card';
import { CARD_LIST } from '../constants/CardConfig';

export class ActionService {

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
                this.leaveCard(card, dropZone);
                break;
            case 'interference':
                targetStatus.addInterference(id, targetStatus);
                this.leaveCard(card, dropZone);
                break;
            case 'regreen':
                targetStatus.regreenStatus(id, targetStatus);
                this.offsetInterference(card, trash);
                break;
        }
    }
    
    sendCardToTrash(card: Card, trash: CardData[]){
        trash.push(card.getData('id') as CardData);
        card.destroy();
        console.log(trash);
    }

    leaveCard(card: Card, dropZone: Phaser.GameObjects.Zone){
        card.destroy();
    }
    
    offsetInterference(card: Card, trash: CardData[]){
        const id = card.getData('id') as string;

        switch(id){
            case 'waste-treatment':
                trash.push(card.getData('id') as CardData);
                card.destroy();
                trash.push(CARD_LIST.find(c => c.id === 'waste') as CardData);
                break;
            case 'waste-water-treatment':
                trash.push(card.getData('id') as CardData);
                card.destroy();
                trash.push(CARD_LIST.find(c => c.id === 'ocean-pollution') as CardData);
                break;
            case 'planting':
                trash.push(card.getData('id') as CardData);
                card.destroy();
                trash.push(CARD_LIST.find(c => c.id === 'deforestation') as CardData);
                break;
        }
    }
}