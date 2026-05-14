import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import { Card } from '../../objects/Card';
import { StatusWindow } from '../../objects/StatusWindow';
import { CARD_LIST, EARTH_CARDS, DECK_CARDS, CardData, CardType } from '../constants/CardConfig';
import { ActionService } from '../managers/ActionService';

export class Game extends Scene
{
    // camera: Phaser.Cameras.Scene2D.Camera;
    // background: Phaser.GameObjects.Image;
    // msg_text : Phaser.GameObjects.Text;

    constructor ()
    {
        super('Game');
    }

    private deck: CardData[] = [];
    private trash: CardData[] = [];
    private earth = EARTH_CARDS;

    private turnPlayer: number = 0;

    private actionService: ActionService = new ActionService();

    private playerTargetZone: Phaser.GameObjects.Zone;
    private cpuTargetZone: Phaser.GameObjects.Zone;
    
    private playerStatus: StatusWindow;
    private cpuStatus: StatusWindow;

    private Players:string[] = [];

    // 手札のカードを管理する配列
    private playerHandCards: Phaser.GameObjects.Container[] = [];
    private cpuHandCards: Phaser.GameObjects.Container[] = [];

    create ()
    {
    // this.actionService = new ActionService();
    this.Players = ['player', 'cpu'];
        
    this.cpuTargetZone = this.add.zone(100, 200, 100, 150).setRectangleDropZone(100, 150);
    this.playerTargetZone = this.add.zone(900, 550, 100, 150).setRectangleDropZone(100, 150);
    
    this.playerStatus =  new StatusWindow(this, 900, 400, 'Player');
    this.cpuStatus = new StatusWindow(this, 100, 300, 'CPU');

    this.dealTheEarth();

    this.initializeDeck();

    const deckVisual = this.add.rectangle(500, 400, 100, 150, 0x555555);
    deckVisual.setInteractive();

    for(let i=0; i<5; i++){
        const newCard = this.drawCard(500, 400, true);
        if(newCard){
            this.playerHandCards.push(newCard);
        }
    }
    for(let i=0; i<5; i++){
        const newCard = this.drawCard(500, 400, false);
        if(newCard){
            this.cpuHandCards.push(newCard);
        }
    }
    this.updateHandLayout(this.playerHandCards);
    this.updateHandLayout(this.cpuHandCards);

    deckVisual.on('pointerdown', () => {
        const newCard = this.drawCard(700, 500, true);
        if(newCard){
            this.playerHandCards.push(newCard);
        }
        this.updateHandLayout(this.playerHandCards);
    });

    this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container) => {
        const container = gameObject.parentContainer;
        console.log(container.getData('id'));

        if(container){
            container.setDepth(1000);
            container.setScale(1.1);
            container.setAlpha(0.8);
            container.setAngle(0);
            container.setData('startX', container.x);
            container.setData('startY', container.y);
        }
    });

    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container, dragX: number, dragY: number) => {
        const container = gameObject.parentContainer;
        if(container){
            container.x = pointer.worldX;
            container.y = pointer.worldY;
        } else {
            gameObject.x = pointer.worldX;
            gameObject.y = pointer.worldY;
        }
    });
        
    this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container, dropped: boolean) => {
        const container = gameObject.parentContainer;

        if(container){
            container.setScale(1.0);
            container.setAlpha(1.0);
        }
        
        if (!dropped){
            const startX = container.getData('startX');
            const startY = container.getData('startY');

        this.add.tween({
            targets: container,
            x: startX,
            y: startY,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                this.updateHandLayout(this.playerHandCards);
            }
        })} else {
            this.updateHandLayout(this.playerHandCards);
        }
    });

    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffff00);
    graphics.strokeRect(this.cpuTargetZone.x - this.cpuTargetZone.input!.hitArea!.width / 2, this.cpuTargetZone.y - this.cpuTargetZone.input!.hitArea!.height / 2, this.cpuTargetZone.input!.hitArea!.width, this.cpuTargetZone.input!.hitArea!.height);
    graphics.strokeRect(this.playerTargetZone.x - this.playerTargetZone.input!.hitArea!.width / 2, this.playerTargetZone.y - this.playerTargetZone.input!.hitArea!.height / 2, this.playerTargetZone.input!.hitArea!.width, this.playerTargetZone.input!.hitArea!.height);

    // Zoneにドラッグしてきたときの処理
    this.input.on('dragenter', (pointer: Phaser.Input.Pointer, gameObject: any, dropZone: Phaser.GameObjects.Zone) => {
        graphics.clear();
        graphics.lineStyle(2, 0x00ff00);
        graphics.strokeRect(this.cpuTargetZone.x - this.cpuTargetZone.input!.hitArea!.width / 2, this.cpuTargetZone.y - this.cpuTargetZone.input!.hitArea!.height / 2, this.cpuTargetZone.input!.hitArea!.width, this.cpuTargetZone.input!.hitArea!.height);
        graphics.strokeRect(this.playerTargetZone.x - this.playerTargetZone.input!.hitArea!.width / 2, this.playerTargetZone.y - this.playerTargetZone.input!.hitArea!.height / 2, this.playerTargetZone.input!.hitArea!.width, this.playerTargetZone.input!.hitArea!.height);
    });

    this.input.on('dragleave', (pointer: Phaser.Input.Pointer, gameObject: any, dropZone: Phaser.GameObjects.Zone) => {
        graphics.clear();
        graphics.lineStyle(2, 0xffff00);
        graphics.strokeRect(this.cpuTargetZone.x - this.cpuTargetZone.input!.hitArea!.width / 2, this.cpuTargetZone.y - this.cpuTargetZone.input!.hitArea!.height / 2, this.cpuTargetZone.input!.hitArea!.width, this.cpuTargetZone.input!.hitArea!.height);
        graphics.strokeRect(this.playerTargetZone.x - this.playerTargetZone.input!.hitArea!.width / 2, this.playerTargetZone.y - this.playerTargetZone.input!.hitArea!.height / 2, this.playerTargetZone.input!.hitArea!.width, this.playerTargetZone.input!.hitArea!.height);
    });

    let depth = 1;

    // Zoneにドロップしたときの効果処理
    this.input.on('drop', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container, dropZone: Phaser.GameObjects.Zone) => {
        const targetStatus = dropZone === this.cpuTargetZone ? this.cpuStatus : this.playerStatus;

        if(!(gameObject.parentContainer as Card).checkPlayable(this.playerStatus, targetStatus)){
            this.updateHandLayout(this.playerHandCards);
            return;
        }
        
        const container = gameObject.parentContainer;
        container.x = dropZone.x;
        container.y = dropZone.y;
        container.setAngle(0);
        container.setDepth(depth);
        depth++;

        // this.actionService.handCardEffect(container.getData('id') as CardData, dropZone); // 手札のカードの効果処理

        const index = this.playerHandCards.indexOf(container);
        if (index > -1){
            this.playerHandCards.splice(index, 1);
        }

        if(dropZone === this.cpuTargetZone){
            this.actionService.handCardEffect(container as Card, this.cpuStatus, this.cpuTargetZone, this.trash);
        } else if(dropZone === this.playerTargetZone){
            this.actionService.handCardEffect(container as Card, this.playerStatus, this.playerTargetZone, this.trash);
        }
        
        this.updateHandLayout(this.playerHandCards);
        this.turnPlayer = (this.turnPlayer + 1) % 2 ;
        this.cpuTurn();
    });
    }

    // 手札のレイアウトを更新
    updateHandLayout(handCards: Phaser.GameObjects.Container[]){
        const centerX = 400;
        const centerY = handCards == this.playerHandCards ? 550 : 250 ;
        const cardSpacing = Math.min(60, 400 / handCards.length);

        handCards.forEach((card, index) => {
            const offset = index - (handCards.length -1) /2;

            const targetX = centerX + offset * cardSpacing;
            const targetY = centerY + (Math.abs(offset) * 10);
            const targetAngle = offset * 5;

            this.add.tween({
                targets: card,
                x: targetX,
                y: targetY,
                angle: targetAngle,
                duration: 200,
                ease: 'Power2',
            });

            card.setDepth(100 + index);
        });
        if(handCards == this.playerHandCards){
            this.playerStatus.updateHandInfo(handCards.length);
        } else {
            this.cpuStatus.updateHandInfo(handCards.length);
        }
    }

    // 環境破壊レベルカード配布
    dealTheEarth(){
        Phaser.Utils.Array.Shuffle(this.earth);
        
        for(const p of this.Players){
            const cardData = this.earth.pop()!;
            const newCard = new Card(this, 500, 400, cardData, false);
            const targetZone = p === 'player' ? this.playerTargetZone : this.cpuTargetZone;
            const targetHP = cardData.value!;
            p === 'player' ? this.playerStatus.updateStatusWindow(targetHP) : this.cpuStatus.updateStatusWindow(targetHP);

            this.add.tween({
                targets: newCard, 
                x: targetZone.x,
                y: targetZone.y,
                duration: 1000,
                ease: 'Power2',
                onComplete:() => {
                    newCard.destroy();
                }
            })
        }
    }

    // デックを初期化（最初の１回）
    initializeDeck(){
        DECK_CARDS.forEach(card => {
            const newCard = CARD_LIST.find(c => c.id === card.id)!;
            for(let i = 0; i < card.count; i++){
                this.deck.push(newCard);
            }
        });
        Phaser.Utils.Array.Shuffle(this.deck);
    }

    // カードを引く
    drawCard(x: number, y: number, isPlayer: boolean){
        if(this.deck.length === 0){
            const emptyDeck = this.add.rectangle(500, 400, 100, 150, 0xeeeeee);
            return;
        }
        const cardData = this.deck.pop()!;
        const newCard = new Card(this, x, y, cardData, isPlayer);
        return newCard;
    }

    // CPUAI
    cpuTurn(){
        const newCard = this.drawCard(500, 400, false);
        if(newCard){
            this.cpuHandCards.push(newCard);
        }
        this.updateHandLayout(this.cpuHandCards);
        const targetCard = this.cpuHandCards[0];
        
        this.add.tween({
            targets: targetCard,
            x: this.playerTargetZone.x,
            y: this.playerTargetZone.y,
            angle: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.actionService.handCardEffect(targetCard as Card, this.playerStatus, this.playerTargetZone, this.trash);
                this.cpuHandCards.splice(0, 1);
                this.updateHandLayout(this.cpuHandCards);
            }
        })
        this.turnPlayer = (this.turnPlayer + 1) % 2 ;
    }
}