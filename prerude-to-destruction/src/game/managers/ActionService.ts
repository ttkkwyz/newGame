import * as Phaser from 'phaser';
import { CardData, CardType } from '../constants/CardConfig';
import { StatusWindow } from '../../objects/StatusWindow';
import { Card } from '../../objects/Card';

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
        }
    }
    
    sendCardToTrash(card: Card, trash: CardData[]){
        trash.push(card.getData('id') as CardData);
        card.destroy();
        console.log(trash);
    }

    leaveCard(card: Card, dropZone: Phaser.GameObjects.Zone){
    }
}