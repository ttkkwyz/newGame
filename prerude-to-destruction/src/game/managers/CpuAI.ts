import * as Phaser from 'phaser';
import { StatusWindow } from "../../objects/StatusWindow";
import { Card } from '../../objects/Card';


export class CpuAI {
    choicePlayCardStupidly(handCards: Phaser.GameObjects.Container[], userstatus: StatusWindow, targetstatus: StatusWindow): { card: Card | null, index: number } {
        for(let i = 0; i < handCards.length; i++){
            const handCard = handCards[i];
            if(!(handCard as Card).checkPlayable(userstatus, targetstatus)){
                console.log('not playable', handCard);
                continue;
            }
            return { card: handCard as Card, index: i };
        }
        return { card: null, index: -1 };

    }

    choiceDiscardCardStupidly(handCards: Phaser.GameObjects.Container[], userstatus: StatusWindow, targetstatus: StatusWindow): { card: Card | null, index: number } {
        return { card: handCards[0] as Card, index: 0 };
    }

}