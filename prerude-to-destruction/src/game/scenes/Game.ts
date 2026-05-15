import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import { Card } from '../../objects/Card';
import { StatusWindow } from '../../objects/StatusWindow';
import { CARD_LIST, EARTH_CARDS, DECK_CARDS, CardData, CardType } from '../constants/CardConfig';
import { ActionService } from '../managers/ActionService';
import { sleep } from '../utils/TimeUtil';

type TurnPhase = 'draw' | 'play' | 'discard' | 'end';

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
    private turnPhase: TurnPhase = 'draw';

    private actionService: ActionService = new ActionService();

    private playerTargetZone: Phaser.GameObjects.Zone;
    private cpuTargetZone: Phaser.GameObjects.Zone;
    private trashZone: Phaser.GameObjects.Zone;
    
    private playerStatus: StatusWindow;
    private cpuStatus: StatusWindow;

    private Players:string[] = [];
    private gameResult: string[] = [];

    // 手札のカードを管理する配列
    private playerHandCards: Phaser.GameObjects.Container[] = [];
    private cpuHandCards: Phaser.GameObjects.Container[] = [];

    create ()
    {
    this.input.enabled = false;

    this.Players = ['player', 'cpu'];
        
    this.cpuTargetZone = this.add.zone(100, 200, 100, 150).setRectangleDropZone(100, 150);
    this.playerTargetZone = this.add.zone(900, 550, 100, 150).setRectangleDropZone(100, 150);
    this.trashZone = this.add.zone(300, 400, 100, 150).setRectangleDropZone(100, 150);
    
    this.playerStatus =  new StatusWindow(this, 900, 400, 'Player');
    this.cpuStatus = new StatusWindow(this, 100, 300, 'CPU');

    this.dealTheEarth();

    this.initializeDeck();

    const deckVisual = this.add.rectangle(500, 400, 100, 150, 0x555555);
    deckVisual.setInteractive();

    this.dealInitialCards(this.playerHandCards);
    this.dealInitialCards(this.cpuHandCards);

    this.showStartText();

    deckVisual.on('pointerdown', () => {
        if(this.turnPhase === 'draw'){
            this.drawPhase();
        }
        // const newCard = this.drawCard(500, 400, true);
        // if(newCard){
        //     this.playerHandCards.push(newCard);
        // }
        // this.updateHandLayout(this.playerHandCards);
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
    graphics.strokeRect(this.trashZone.x - this.trashZone.input!.hitArea!.width / 2, this.trashZone.y - this.trashZone.input!.hitArea!.height / 2, this.trashZone.input!.hitArea!.width, this.trashZone.input!.hitArea!.height);

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
     
        if(dropZone === this.trashZone) {
            if(this.turnPhase === 'discard'){
                const index = this.playerHandCards.indexOf(gameObject.parentContainer);
                if (index > -1){
                    this.playerHandCards.splice(index, 1);
                }
                this.actionService.sendCardToTrash(gameObject.parentContainer as Card, this.trash);
                this.updateHandLayout(this.playerHandCards);
                this.turnPlayer = (this.turnPlayer + 1) % 2 ;
                this.setPhase('end');
                this.cpuTurn();
                return;
            }
            this.updateHandLayout(this.playerHandCards);
            return;
        }

        if(this.turnPhase === 'play'){
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

            const index = this.playerHandCards.indexOf(container);
            if (index > -1){
                this.playerHandCards.splice(index, 1);
            }

            this.actionService.handCardEffect(container as Card, targetStatus, dropZone, this.trash);

            this.updateHandLayout(this.playerHandCards);
            this.setPhase('discard');
        }
        this.updateHandLayout(this.playerHandCards);
        return;
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
            
            this.add.tween({
                targets: newCard, 
                x: targetZone.x,
                y: targetZone.y,
                duration: 1000,
                ease: 'Power2',
                onComplete:() => {
                    newCard.destroy();
                    p === 'player' ? this.playerStatus.updateStatusWindow(targetHP) : this.cpuStatus.updateStatusWindow(targetHP);

                }
            })
        }
    }

    // 初期手札を配布
    dealInitialCards(handCards: Phaser.GameObjects.Container[]){
        for(let i=0; i<5; i++){
            const newCard = this.drawCard(500, 400, handCards === this.playerHandCards);
            if(newCard){
                handCards.push(newCard);
            }
        }
        this.updateHandLayout(handCards);
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

    trashToDeck(){
        Phaser.Utils.Array.Shuffle(this.trash);
        this.trash.forEach(card => {
            this.deck.push(card);
        });
        this.trash = [];
    }

    // 開始テキストを表示
    showStartText(){
        const startText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            '開始！',
            {
                fontSize: '80px',
                color: '#ffffoo',
                stroke: '#000000',
                strokeThickness: 6,
            }
        ).setOrigin(0.5).setScale(0).setAlpha(0);
    
        this.tweens.add({
            targets: startText,
            scale: 1.2,
            alpha: 1,
            duration: 800,
            ease: 'Back.easeInOut',
            hold: 500,
            yoyo: false,
            onComplete: () => {
                this.tweens.add({
                    targets: startText,
                    scale: 2,
                    alpha: 0,
                    duration: 500,
                    ease: 'Power2',
                    onComplete: () => {
                        startText.destroy();
                        this.input.enabled = true;
                    }
                });
            }
        });
    }

    // カードを引く
    drawCard(x: number, y: number, isPlayer: boolean){
        if(this.deck.length === 0){
            this.trashToDeck();
        }
        const cardData = this.deck.pop()!;
        const newCard = new Card(this, x, y, cardData, isPlayer);
        return newCard;
    }

    drawPhase() {
        if(this.turnPhase !== 'draw'){
            return;
        }
        for(let i = 0; i < 2; i++){
            const newCard = this.drawCard(500, 400, this.turnPlayer === 0);
            if(newCard){
                this.turnPlayer === 0 ? this.playerHandCards.push(newCard) : this.cpuHandCards.push(newCard);
            }
        }
        this.updateHandLayout(this.turnPlayer === 0 ? this.playerHandCards : this.cpuHandCards);
        this.setPhase('play');
    }

    setPhase(phase: TurnPhase){
        this.turnPhase = phase;

        switch(phase){
            case 'draw':
                this.trashZone.input!.enabled = false;
                this.playerTargetZone.input!.enabled = false;
                this.cpuTargetZone.input!.enabled = false;
                break;
            case 'play':
                this.trashZone.input!.enabled = false;
                this.playerTargetZone.input!.enabled = true;
                this.cpuTargetZone.input!.enabled = true;
                break;
            case 'discard':
                this.trashZone.input!.enabled = true;
                this.playerTargetZone.input!.enabled = false;
                this.cpuTargetZone.input!.enabled = false;
                break;
            case 'end':
                this.trashZone.input!.enabled = false;
                this.playerTargetZone.input!.enabled = false;
                this.cpuTargetZone.input!.enabled = false;
                break;
        }
    }

    // CPUAI
    async cpuTurn(){
        await sleep(1000);
        // draw Phase
        for(let i = 0; i < 2; i++){
            const newCard = this.drawCard(500, 400, false);
            if(newCard){
                this.cpuHandCards.push(newCard);
            }
        }
        this.updateHandLayout(this.cpuHandCards);

        await sleep(1000);

        // play Phase
        for(let i = 0; i < this.cpuHandCards.length; i++){
            const handCard = this.cpuHandCards[i];
            if(!(handCard as Card).checkPlayable(this.cpuStatus, this.playerStatus)){
                continue;
            }
            await new Promise<void>(resolve => {
                this.add.tween({
                    targets: handCard,
                    x: this.playerTargetZone.x,
                    y: this.playerTargetZone.y,
                    angle: 0,
                    duration: 500,
                    ease: 'Power2',
                    onComplete: () => {
                        this.actionService.handCardEffect(handCard as Card, this.playerStatus, this.playerTargetZone, this.trash);
                        this.cpuHandCards.splice(i, 1);
                        this.updateHandLayout(this.cpuHandCards);
                        resolve();
                    }
                })
            });
            break;
        }

        // discard Phase
        const hand = this.cpuHandCards[0];
        await new Promise<void>(resolve => {
            this.add.tween({
                targets: hand,
                x: this.trashZone.x,
                y: this.trashZone.y,
                angle: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    this.actionService.sendCardToTrash(hand as Card, this.trash);
                    this.cpuHandCards.splice(0, 1);
                    this.updateHandLayout(this.cpuHandCards);
                    resolve();
                }
            });
        });
        this.turnPlayer = (this.turnPlayer + 1) % 2 ;
        this.setPhase('draw');
    }

    checkGameOver(){
        if(this.playerStatus.getData('HP') <= 0){
            this.gameResult.push('player');
        }
        if(this.cpuStatus.getData('HP') <= 0){
            this.gameResult.push('cpu');
        }
        if(this.gameResult.length > 0){
            this.transitionToResult(this.gameResult);
        }
    }

    private transitionToResult(results: string[]){
        this.input.enabled = false;

        this.cameras.main.fade(1000,0,0,0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameOver', { results });
        });
    }
}