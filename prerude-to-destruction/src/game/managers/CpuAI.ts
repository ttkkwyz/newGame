import * as Phaser from 'phaser';
import { StatusWindow } from "../../objects/StatusWindow";
import { Card } from '../../objects/Card';

interface CpuBrain {
    choicePlayCard(
        cpuId: number,
        handCards: Phaser.GameObjects.Container[],
        playerStatus: StatusWindow,
        enemyStatusWindows: StatusWindow[]
    ): { card: Card | null, index: number, target: number } | null;

    choiceDiscardCard(
        cpuId: number,
        handCards: Phaser.GameObjects.Container[],
        playerStatus: StatusWindow,
        enemyStatusWindows: StatusWindow[]
    ): { card: Card, index: number } | null;
}

class brainLevel1 implements CpuBrain {
    choicePlayCard(
        cpuId: number,
        handCards: Phaser.GameObjects.Container[],
        playerStatus: StatusWindow,
        enemyStatusWindows: StatusWindow[]
    ): { card: Card | null, index: number, target: number } | null {
        const cpuCount = enemyStatusWindows.length;
        const userStatus = enemyStatusWindows[cpuId];
        if(!userStatus) return null;
        if(userStatus.isDead) return null;
        if(handCards.length === 0) return null;

        for(let i = 0; i < handCards.length; i++){
            const handCard = handCards[i];
            for(let j = -1; j < cpuCount; j++){
                const targetStatus = j === -1 ? playerStatus : enemyStatusWindows[j];
                if(j === cpuId) continue;
                if(!(handCard as Card).checkPlayable(userStatus, targetStatus)) continue;
                return { card: handCard as Card, index: i, target: j };
            }
        }
        return null;
    }

    choiceDiscardCard(
        cpuId: number,
        handCards: Phaser.GameObjects.Container[],
        playerStatus: StatusWindow,
        enemyStatusWindows: StatusWindow[]
    ): { card: Card, index: number } | null {
        return { card: handCards[0] as Card, index: 0 };
    }
}

class brainLevel2 implements CpuBrain {
    choicePlayCard(
        cpuId: number,
        handCards: Phaser.GameObjects.Container[],
        playerStatus: StatusWindow,
        enemyStatusWindows: StatusWindow[]
    ): { card: Card | null, index: number, target: number } | null {
        const cpuCount = enemyStatusWindows.length;
        const userStatus = enemyStatusWindows[cpuId];
        if(!userStatus) return null;
        if(userStatus.isDead) return null;
        if(handCards.length === 0) return null;

        for(let i = 0; i < handCards.length; i++){
            const handCard = handCards[i];
            for(let j = -1; j < cpuCount; j++){
                if(j === cpuId) continue;
                const targetStatus = j === -1 ? playerStatus : enemyStatusWindows[j];
                console.log(targetStatus, j);
                if(!(handCard as Card).checkPlayable(userStatus, targetStatus)) continue;
                return { card: handCard as Card, index: i, target: j };
            }
        }
        return null;
    }

    choiceDiscardCard(
        cpuId: number,
        handCards: Phaser.GameObjects.Container[],
        playerStatus: StatusWindow,
        enemyStatusWindows: StatusWindow[]
    ): { card: Card, index: number } | null {
        return { card: handCards[0] as Card, index: 0 };
    }
}

class brainLevel3 implements CpuBrain {
    choicePlayCard(
        cpuId: number,
        handCards: Phaser.GameObjects.Container[],
        playerStatus: StatusWindow,
        enemyStatusWindows: StatusWindow[]
    ): { card: Card | null, index: number, target: number } | null {
        console.log(enemyStatusWindows);
        const cpuCount = enemyStatusWindows.length;
        const userStatus = enemyStatusWindows[cpuId];
        if(!userStatus) return null;
        if(userStatus.isDead) return null;
        if(handCards.length === 0) return null;

        for(let i = 0; i < handCards.length; i++){
            const handCard = handCards[i];
            for(let j = -1; j < cpuCount; j++){
                const targetStatus = j === -1 ? playerStatus : enemyStatusWindows[j];
                if(j === cpuId) continue;
                if(!(handCard as Card).checkPlayable(userStatus, targetStatus)) continue;
                return { card: handCard as Card, index: i, target: j };
            }
        }
        return null;
    }

    choiceDiscardCard(
        cpuId: number,
        handCards: Phaser.GameObjects.Container[],
        playerStatus: StatusWindow,
        enemyStatusWindows: StatusWindow[]
    ): { card: Card, index: number } | null {
        return { card: handCards[0] as Card, index: 0 };
    }
}

export function createBrain(level: number): CpuBrain {
    switch (level) {
        case 1:  return new brainLevel1();
        case 2:  return new brainLevel2();
        case 3:  return new brainLevel3();
        default: return new brainLevel2();
    }
}

// export class CpuAI {
    // private scene: Game;

    // constructor(scene: Game){
    //     this.scene = scene;
    // }

    // choicePlayCardStupidly(
    //     handCards: Phaser.GameObjects.Container[], 
    //     userstatus: StatusWindow, 
    //     targetstatus: StatusWindow
    // ): { card: Card | null, index: number } {
    //     for(let i = 0; i < handCards.length; i++){
    //         const handCard = handCards[i];
    //         if(!(handCard as Card).checkPlayable(userstatus, targetstatus)){
    //             continue;
    //         }
    //         return { card: handCard as Card, index: i };
    //     }
    //     return { card: null, index: -1 };

    // }

    // choiceDiscardCardStupidly(
    //     handCards: Phaser.GameObjects.Container[], 
    //     userstatus: StatusWindow, 
    //     targetstatus: StatusWindow
    // ): { card: Card | null, index: number } {
    //     return { card: handCards[0] as Card, index: 0 };
    // }

//     choicePlayCardWisely(
//         handCards: Phaser.GameObjects.Container[],
//         userStatus: StatusWindow,
//         targetStatus: StatusWindow
//        ): { card: Card | null, index: number } {
       
//         //interferenced
//         if(userStatus.waste || userStatus.oceanPollution || userStatus.deforestation) {
//             if(userStatus.waste && handCards.find(card => card.getData('id') === 'waste-treatment')) {
//                 const card = handCards.find(card => card.getData('id') === 'waste-treatment') as Card;
//                 return { card: card, index: handCards.indexOf(card) };

//             } else if(userStatus.oceanPollution && handCards.find(card => card.getData('id') === 'waste-water-treatment')) {
//                 const card = handCards.find(card => card.getData('id') === 'waste-water-treatment') as Card;
//                 return { card: card, index: handCards.indexOf(card) };
            
//             } else if(userStatus.deforestation && handCards.find(card => card.getData('id') === 'planting')) {
//                 const card = handCards.find(card => card.getData('id') === 'planting') as Card;
//                 return { card: card, index: handCards.indexOf(card) };
            
//             } else if(handCards.find(card => card.getData('id') === 'biosphere')) {
//                 const card = handCards.find(card => card.getData('id') === 'biosphere') as Card;
//                 return { card: card, index: handCards.indexOf(card) };
            
//             } else return { card: null, index: -1 };
//         }
       
//         //Game clear
//         if(userStatus.animalProtection && handCards.find(card => card.getData('value') === userStatus.getData('HP'))) {
//             const card = handCards.find(card => card.getData('value') === userStatus.getData('HP')) as Card;
//             return { card: card, index: handCards.indexOf(card) };
//        }
       
//        //user Game over
//        if(this.scene.playerStatus.getData('HP') >= 85 && handCards.find(card => card.getData('id') === 'pollution-15')) {
//         const card = handCards.find(card => card.getData('id') === 'pollution-15') as Card;
//         return { card: card, index: handCards.indexOf(card) };
//         }
       
//        //animal protection
//        if(userStatus.getData('HP') <= 20 && !userStatus.animalProtection && handCards.find(card => card.getData('id') === 'animal-protection')) {
//         const card = handCards.find(card => card.getData('id') === 'animal-protection') as Card;
//         return { card: card, index: handCards.indexOf(card) };
//        }
       
//        //score
       
//         return { card: null, index: -1 };

// }
// }