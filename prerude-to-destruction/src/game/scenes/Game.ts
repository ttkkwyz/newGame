import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import { Card } from '../../objects/Card';
import { StatusWindow } from '../../objects/StatusWindow';
import { CARD_LIST, EARTH_CARDS, DECK_CARDS, CardData, CardType } from '../constants/CardConfig';
import { ActionService } from '../managers/ActionService';
import { sleep } from '../utils/TimeUtil';
import { EnemyPlayer } from '../constants/EnemyPlayer';
import { CpuAI } from '../managers/CpuAI';

type TurnPhase = 'draw' | 'play' | 'discard' | 'discard-2' | 'end';

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

    private actionService: ActionService;
    private cpuAI: CpuAI;

    private enemies: EnemyPlayer[] = [];
    private cpuCount: number = 1;

    private playerDropZone: Phaser.GameObjects.Zone;
    private trashZone: Phaser.GameObjects.Zone;
    private enemyDropZones: Phaser.GameObjects.Zone[] = [];
    
    private playerStatus: StatusWindow;
    private enemyStatusWindows: StatusWindow[] = [];

    private Players:{ name: string, type: string }[] = [];
    private gameResult: string[] = [];

    // 手札のカードを管理する配列
    private playerHandCards: Phaser.GameObjects.Container[] = [];
    private enemyHandCards: Phaser.GameObjects.Container[][] = [];
   
    create ()
    {
    this.input.enabled = false;

    this.cpuCount = 2;

    // this.Players = [{ name: 'あなた', type: 'player' }, { name: 'CPU1', type: 'よわい' }, { name: 'CPU2', type: 'よわい' }];
    // const cpus = this.Players.filter(p => p.type !== 'player');

    this.playerStatus =  new StatusWindow(this, 900, 400, 'Player');
    this.playerDropZone = this.add.zone(900, 550, 100, 150).setRectangleDropZone(100, 150);
    
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    const yPos = 150;

    for(let i = 0; i < this.cpuCount; i++){
        const xPos = (screenWidth / this.cpuCount) * (i + 0.5);
        const statusWindow = new StatusWindow(this, xPos, yPos, `CPU${i}`);
        this.add.existing(statusWindow);
        this.enemyStatusWindows.push(statusWindow);

        const enemyDropZone = this.add.zone(xPos, yPos+150, 100, 150).setRectangleDropZone(100, 150);
        this.enemyDropZones.push(enemyDropZone);

        const enemyHandCards: Phaser.GameObjects.Container[] = [];
        this.enemyHandCards.push(enemyHandCards);
    }

    this.trashZone = this.add.zone(300, 400, 100, 150).setRectangleDropZone(100, 150);
    
    this.actionService = new ActionService(this);
    this.cpuAI = new CpuAI();

    this.dealTheEarth();

    this.initializeDeck();

    const deckVisual = this.add.rectangle(500, 400, 100, 150, 0x555555);
    deckVisual.setInteractive();

    this.dealInitialCards(this.playerHandCards);
    for(let i = 0; i < this.cpuCount; i++){
        this.dealInitialCards(this.enemyHandCards[i]);
    }

    this.showStartText();

    deckVisual.on('pointerdown', () => {
        if(this.turnPhase === 'draw'){
            this.drawPhase();
        }
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
    graphics.strokeRect(this.enemyDropZones[0].x - this.enemyDropZones[0].input!.hitArea!.width / 2, this.enemyDropZones[0].y - this.enemyDropZones[0].input!.hitArea!.height / 2, this.enemyDropZones[0].input!.hitArea!.width, this.enemyDropZones[0].input!.hitArea!.height);
    graphics.strokeRect(this.playerDropZone.x - this.playerDropZone.input!.hitArea!.width / 2, this.playerDropZone.y - this.playerDropZone.input!.hitArea!.height / 2, this.playerDropZone.input!.hitArea!.width, this.playerDropZone.input!.hitArea!.height);
    graphics.strokeRect(this.trashZone.x - this.trashZone.input!.hitArea!.width / 2, this.trashZone.y - this.trashZone.input!.hitArea!.height / 2, this.trashZone.input!.hitArea!.width, this.trashZone.input!.hitArea!.height);

    // // Zoneにドラッグしてきたときの処理
    // this.input.on('dragenter', (pointer: Phaser.Input.Pointer, gameObject: any, dropZone: Phaser.GameObjects.Zone) => {
    //     graphics.clear();
    //     graphics.lineStyle(2, 0x00ff00);
    //     graphics.strokeRect(this.enemyDropZones[0].x - this.enemyDropZones[0].input!.hitArea!.width / 2, this.enemyDropZones[0].y - this.enemyDropZones[0].input!.hitArea!.height / 2, this.enemyDropZones[0].input!.hitArea!.width, this.enemyDropZones[0].input!.hitArea!.height);
    //     graphics.strokeRect(this.playerTargetZone.x - this.playerTargetZone.input!.hitArea!.width / 2, this.playerTargetZone.y - this.playerTargetZone.input!.hitArea!.height / 2, this.playerTargetZone.input!.hitArea!.width, this.playerTargetZone.input!.hitArea!.height);
    // });

    // this.input.on('dragleave', (pointer: Phaser.Input.Pointer, gameObject: any, dropZone: Phaser.GameObjects.Zone) => {
    //     graphics.clear();
    //     graphics.lineStyle(2, 0xffff00);
    //     graphics.strokeRect(this.cpuTargetZone.x - this.cpuTargetZone.input!.hitArea!.width / 2, this.cpuTargetZone.y - this.cpuTargetZone.input!.hitArea!.height / 2, this.cpuTargetZone.input!.hitArea!.width, this.cpuTargetZone.input!.hitArea!.height);
    //     graphics.strokeRect(this.playerTargetZone.x - this.playerTargetZone.input!.hitArea!.width / 2, this.playerTargetZone.y - this.playerTargetZone.input!.hitArea!.height / 2, this.playerTargetZone.input!.hitArea!.width, this.playerTargetZone.input!.hitArea!.height);
    // });

    let depth = 1;

    // Zoneにドロップしたときの効果処理
    this.input.on('drop', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container, dropZone: Phaser.GameObjects.Zone) => {
        if(dropZone === this.trashZone) {
            if(this.turnPhase === 'discard' || this.turnPhase === 'discard-2'){
                const index = this.playerHandCards.indexOf(gameObject.parentContainer);
                if (index > -1){
                    this.playerHandCards.splice(index, 1);
                }
                this.actionService.sendCardToTrash(gameObject.parentContainer as Card, this.trash);
                this.updateHandLayout(this.playerHandCards);
                this.turnPlayer = (this.turnPlayer + 1) % (this.cpuCount + 1);
                if(this.turnPhase === 'discard'){
                    this.setPhase('end');
                } else {
                    this.setPhase('discard');
                }
                this.cpuTurn();
                return;
            }
            this.updateHandLayout(this.playerHandCards);
            return;
        }

        const zoneIndex = dropZone === this.playerDropZone ? -1 : this.enemyDropZones.indexOf(dropZone);
        const targetStatus = zoneIndex === -1 ? this.playerStatus: this.enemyStatusWindows[zoneIndex];

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
        const Index = handCards === this.playerHandCards ? -1 : this.enemyHandCards.indexOf(handCards);
        const centerX = handCards === this.playerHandCards ? 500 : (this.cameras.main.width / this.cpuCount) * (Index + 0.5);
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

        const handsIndex = handCards === this.playerHandCards ? -1 : this.enemyHandCards.indexOf(handCards);
        const targetStatus = handsIndex === -1 ? this.playerStatus : this.enemyStatusWindows[handsIndex];
        targetStatus.updateHandInfo(handCards.length);
        
    }

    // 環境破壊レベルカード配布
    dealTheEarth(){
        Phaser.Utils.Array.Shuffle(this.earth);
        
        for(let i = -1; i < this.cpuCount; i++){
            const cardData = this.earth.pop()!;
            const newCard = new Card(this, 500, 400, cardData, false);
            const targetZone = i === -1 ? this.playerDropZone : this.enemyDropZones[i];
            const targetHP = cardData.value!;
            
            this.add.tween({
                targets: newCard, 
                x: targetZone.x,
                y: targetZone.y,
                duration: 1000,
                ease: 'Power2',
                onComplete:() => {
                    newCard.destroy();
                    i === -1 ? this.playerStatus.updateStatusWindow(targetHP) : this.enemyStatusWindows[i].updateStatusWindow(targetHP);

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

    // trashからdeckにカードを移動
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

    async drawPhase() {
        if(this.turnPhase !== 'draw'){
            return;
        }
        const targetHandCards = this.turnPlayer === 0 ? this.playerHandCards : this.enemyHandCards[this.turnPlayer - 1];
        const targetStatus = this.turnPlayer === 0 ? this.playerStatus : this.enemyStatusWindows[this.turnPlayer - 1];
        for(let i = 0; i < 2; i++){
            const newCard = this.drawCard(500, 400, this.turnPlayer === 0);
            if(newCard){
                targetHandCards.push(newCard);
            }
        }
        this.updateHandLayout(targetHandCards);
        if(this.checkPlayableCards(targetHandCards, targetStatus)){
            this.setPhase('play');
        } else {
            this.showText('パス');
            await sleep(1000);
            this.setPhase('discard-2');
        }
    }

    // プレイ可能なカードをチェック
    checkPlayableCards(handCards: Phaser.GameObjects.Container[], playerstatus: StatusWindow): boolean{
        for(const card of handCards){
            for(let i = -1; i < this.cpuCount; i++){
                const targetStatus = i === -1 ? this.playerStatus : this.enemyStatusWindows[i];
                if((card as Card).checkPlayable(playerstatus, targetStatus)){
                    return true;
                }
            }
        }
        return false;
    }

    // フェーズを設定
    setPhase(phase: TurnPhase){
        this.turnPhase = phase;

        switch(phase){
            case 'draw':
                this.trashZone.input!.enabled = false;
                this.playerDropZone.input!.enabled = false;
                this.enemyDropZones.forEach(zone => zone.input!.enabled = false);
                break;
            case 'play':
                this.trashZone.input!.enabled = false;
                this.playerDropZone.input!.enabled = true;
                this.enemyDropZones.forEach(zone => zone.input!.enabled = true);
                break;
            case 'discard':
                this.trashZone.input!.enabled = true;
                this.playerDropZone.input!.enabled = false;
                this.enemyDropZones.forEach(zone => zone.input!.enabled = false);
                break;
            case 'end':
                this.trashZone.input!.enabled = false;
                this.playerDropZone.input!.enabled = false;
                this.enemyDropZones.forEach(zone => zone.input!.enabled = false);
                break;
        }
    }

    // CPUAI
    async cpuTurn(){
        while(this.turnPlayer !== 0){
            await sleep(1000);

            // draw Phase
            const handCards = this.enemyHandCards[this.turnPlayer - 1];
            const targetStatus = this.enemyStatusWindows[this.turnPlayer - 1];
            for(let i = 0; i < 2; i++){
                const newCard = this.drawCard(500, 400, false);
                if(newCard){
                    handCards.push(newCard);
                }
            }
            this.updateHandLayout(handCards);

            await sleep(1000);
            
            // play Phase
            // for(let i = 0; i < handCards.length; i++){
                // const handCard = handCards[i];
                // if(!(handCard as Card).checkPlayable(targetStatus, this.playerStatus)){
                    // continue;
                // }

            const { card, index } = this.cpuAI.choicePlayCardStupidly(handCards, this.playerStatus, targetStatus);
            if(card){
                await new Promise<void>(resolve => {
                    this.add.tween({
                        targets: card,
                        x: this.playerDropZone.x,
                        y: this.playerDropZone.y,
                        angle: 0,
                        duration: 500,
                        ease: 'Power2',
                        onComplete: () => {
                            this.actionService.handCardEffect(card as Card, this.playerStatus, this.playerDropZone, this.trash);
                            handCards.splice(index, 1);
                            this.updateHandLayout(handCards);
                            resolve();
                        }
                    })
                });
            }

            // discard Phase
            while(handCards.length > 5){
                const hand = handCards[0];
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
                            handCards.splice(0, 1);
                            this.updateHandLayout(handCards);
                            resolve();
                        }
                    });
                });
            }
        
            this.turnPlayer = (this.turnPlayer + 1) % (this.cpuCount + 1);
        }

        if(this.turnPlayer === 0){
            this.setPhase('draw');
        }
    }

   public checkGameOver(){
        if(this.playerStatus.getData('HP') === 0 && this.playerStatus.animalProtection){
            this.gameResult.push('player');
        }
        for(let i = 0; i < this.cpuCount; i++){
            if(this.enemyStatusWindows[i].getData('HP') === 0 && this.enemyStatusWindows[i].animalProtection){
                this.gameResult.push(`cpu${i}`);
            }
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

    showText(text: string){
        const textObject = this.add.text(500, 400, text, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.tweens.add({
            targets: textObject,
            scale: 1.2,
            duration: 800,
            ease: 'Back.easeOut',
        });
    }
}