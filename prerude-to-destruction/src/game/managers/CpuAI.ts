import * as Phaser from 'phaser';
import { StatusWindow } from "../../objects/StatusWindow";
import { Card } from '../../objects/Card';


export class CpuAI {
    choicePlayCardStupidly(handCards: Phaser.GameObjects.Container[], playerstatus: StatusWindow, enemystatus: StatusWindow): { card: Card | null, index: number } {
        console.log(handCards);
        console.log(playerstatus);
        console.log(enemystatus);
        for(let i = 0; i < handCards.length; i++){
            const handCard = handCards[i];
            if(!(handCard as Card).checkPlayable(playerstatus, enemystatus)){
                continue;
            }
            console.log(handCard);
            console.log(i);
            return { card: handCard as Card, index: i };
        }
        return { card: null, index: -1 };

    }

}