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
        const cpuCount = enemyStatusWindows.length;
        const userStatus = enemyStatusWindows[cpuId];
        if(!userStatus) return null;
        if(userStatus.isDead) return null;
        if(handCards.length === 0) return null;

        //interferenced
        if(
            userStatus.waste 
            || userStatus.oceanPollution 
            || userStatus.deforestation
        ) {
            if(
                userStatus.waste 
                && handCards.find(card => 
                    card.getData('id') === 'waste-treatment'
                )
            ) {
                const card = handCards.find(card => 
                    card.getData('id') === 'waste-treatment'
                ) as Card;
                return { 
                    card: card, 
                    index: handCards.indexOf(card), 
                    target: cpuId 
                };
            } else if(
                userStatus.oceanPollution 
                && handCards.find(card => 
                    card.getData('id') === 'waste-water-treatment'
                )
            ) {
                const card = handCards.find(card => 
                    card.getData('id') === 'waste-water-treatment'
                ) as Card;
                return { 
                    card: card, 
                    index: handCards.indexOf(card), 
                    target: cpuId 
                };
            } else if(
                userStatus.deforestation 
                && handCards.find(card => 
                    card.getData('id') === 'planting'
                )
            ) {
                const card = handCards.find(card => 
                    card.getData('id') === 'planting'
                ) as Card;
                return { 
                    card: card, 
                    index: handCards.indexOf(card), 
                    target: cpuId 
                };
            } else if(
                handCards.find(card => card.getData('id') === 'biosphere')
            ) {
                const card = handCards.find(card => 
                    card.getData('id') === 'biosphere'
                ) as Card;
                return { 
                    card: card, 
                    index: handCards.indexOf(card), 
                    target: cpuId 
                };
            } else return { 
                card: null, 
                index: -1, 
                target: -1 
            };
        }

        //Game clear
        if(
            userStatus.animalProtection 
            && handCards.find(card => 
                card.getData('type') === 'recovery' 
                && card.getData('value') === userStatus.getData('HP')
            )
        ) {
            const card = handCards.find(card => 
                card.getData('type') === 'recovery' 
                && card.getData('value') === userStatus.getData('HP')
            ) as Card;
            return { 
                card: card, 
                index: handCards.indexOf(card), 
                target: cpuId 
            };
       }
       if(
            userStatus.animalProtection 
            && handCards.find(card => 
                card.getData('type') === 'pollution' 
                && card.getData('value') + userStatus.getData('HP') === 0
            )
        ) {
            const card = handCards.find(card => 
                card.getData('type') === 'pollution' 
                && card.getData('value') + userStatus.getData('HP') === 0
            ) as Card;
            return { 
                card: card, 
                index: handCards.indexOf(card), 
                target: cpuId 
            };
        }
       
       //player Game over
       if(
            playerStatus.getData('HP') >= 85 
            && handCards.find(card => 
                card.getData('id') === 'pollution-15'
            )
        ) {
            const card = handCards.find(card => 
                card.getData('id') === 'pollution-15'
            ) as Card;
            return { 
                card: card, 
                index: handCards.indexOf(card), 
                target: -1 
            };
        }

        if(
            playerStatus.getData('HP') >=90 
            && handCards.find(card => 
                card.getData('id') === 'pollution-10'
            )
        ) {
            const card = handCards.find(card => 
                card.getData('id') === 'pollution-10'
            ) as Card;
            return { 
                card: card, 
                index: handCards.indexOf(card), 
                target: -1 
            };
        }

        //animal protection
       if(
            userStatus.getData('HP') <= 20 
            && !userStatus.animalProtection 
            && handCards.find(card => 
                card.getData('id') === 'animal-protection'
            )
        ) {
            const card = handCards.find(card => 
                card.getData('id') === 'animal-protection'
            ) as Card;
            return { 
                card: card, 
                index: handCards.indexOf(card), 
                target: cpuId 
            };
       }

        //score
        let choice: { 
            card: Card | null, 
            index: number, 
            target: number,
            score: number
         } | null = null;

        for(let i = 0; i < handCards.length; i++){
            const handCard = handCards[i];
            for(let j = -1; j < cpuCount; j++){
                const targetStatus = j === -1 ? playerStatus : enemyStatusWindows[j];
                if(!(handCard as Card).checkPlayable(userStatus, targetStatus)) continue;
                let score = calculatePlayScore(
                    handCard as Card, 
                    handCards,
                    userStatus, 
                    cpuId,
                    targetStatus,
                    j
                );
                if(!choice || score > choice.score){
                    choice = { 
                        card: handCard as Card, 
                        index: i, 
                        target: j, 
                        score: score 
                    };
                }
            }
        }
        return choice;
    }

    choiceDiscardCard(
        cpuId: number,
        handCards: Phaser.GameObjects.Container[],
        playerStatus: StatusWindow,
        enemyStatusWindows: StatusWindow[]
    ): { card: Card, index: number } | null {
        const userStatus = enemyStatusWindows[cpuId];
        let choice: { 
            card: Card, 
            index: number, 
            score: number
         } | null = null;
        for(let i = 0; i < handCards.length; i++){
            const handCard = handCards[i];
            let score = calculateDiscardScore(
                handCard as Card, 
                handCards,
                userStatus
            );
            if(!choice || score < choice.score){
                choice = { 
                    card: handCard as Card, 
                    index: i, 
                    score: score 
                };
            }
        }
        return choice;
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

function calculatePlayScore(
    card: Card, 
    handCards: Phaser.GameObjects.Container[],
    userStatus: StatusWindow, 
    cpuId: number,
    targetStatus: StatusWindow,
    targetIndex: number
): number {
    let score = 0;
    const myself = cpuId === targetIndex;
    const userHP = userStatus.getData('HP');
    const targetHP = targetStatus.getData('HP');
    const cardValue = card.getData('value');
    switch(card.getData('type')){
        case 'recovery':
            switch(myself){
                case true:
                    if(userHP > cardValue){
                        score += cardValue;
                    } else {
                        score -= cardValue * 5;
                    }
                    break;
                case false:
                    if(
                        !targetStatus.animalProtection
                        && targetHP - cardValue === 0
                    ) {
                        score += 100;
                    } else if (
                        targetStatus.animalProtection
                        && targetHP - cardValue === 0
                    ) {
                        score -= 100;
                    } else if (
                        targetHP - cardValue < 0
                    ) {
                        score += cardValue - 1;
                    }
                    break;
                default:
                    break;
            }
            break;
        case 'pollution':
            switch(myself){
                case true:
                    if(
                        !userStatus.animalProtection
                        && userHP + cardValue === 0
                    ) {
                        score -= cardValue * 5;
                    } else if(userHP < 0){
                        score += cardValue * 5;
                    } 
                    break;
                case false:
                    if( targetHP > 0){
                        score += cardValue;
                    } else {
                        score -= cardValue * 5;
                    }
                    break;
            }
            break;
        case 'interference':
            switch(card.getData('id')){
                case 'waste':
                    if( !myself && !targetStatus.waste){
                        score += 50;
                    } else {
                        score -= 100;
                    }
                    break;
                case 'ocean-pollution':
                    if( !myself && !targetStatus.oceanPollution){
                        score += 50;
                    } else {
                        score -= 100;
                    }
                    break;
                case 'deforestation':
                    if( !myself && !targetStatus.deforestation){
                        score += 50;
                    } else {
                        score -= 100;
                    }
                    break;
            }
            break;
        case 'regreen':
            if( !myself ) score -=100;
            break;
        case 'biosphere':
            if( !myself ) score -=100;
            break;
        case 'protect':
            if(myself && !userStatus.animalProtection) {
                score += 40;
            } else {
                score -= 100;
            }
            break;
        case 'poaching':
            if( !myself && targetStatus.animalProtection) {
                score += (100 - targetHP);
            } else {
                score -= 100;
            }
            break;
        default:
            score += 0;
            break;
    }
    return score;
}

function calculateDiscardScore(
    card: Card, 
    handCards: Phaser.GameObjects.Container[],
    userStatus: StatusWindow
): number {
    let score = 50;
    const cardValue = card.getData('value');
    const userHP = userStatus.getData('HP');
    switch(card.getData('type')){
        case 'recovery':
            if(userHP > cardValue){
                score += cardValue;
            } else if(userHP === cardValue){
                score += cardValue * 5;
            } else {
                score -= cardValue * 5;
            }
            break;
        case 'pollution':
            score += cardValue;
            break;
        case 'interference':
            score += 50;
            break;
        case 'regreen':
            score += 50;
            break;
        case 'biosphere':
            score += 100;
            break;
        case 'protect':
            score += 50;
            break;
        case 'poaching':
            score += 50;
            break;
        default:
            score += 0;
            break;
    }

    const duplicatedCards = handCards.filter(card => 
        card.getData('id') === card.getData('id')
    );
    score -= duplicatedCards.length * 50;
    return score;
}