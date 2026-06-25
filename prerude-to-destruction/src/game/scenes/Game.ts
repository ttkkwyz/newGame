import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import { Card } from '../../objects/Card';
import { StatusWindow } from '../../objects/StatusWindow';
import { CARD_LIST, EARTH_CARDS, DECK_CARDS, CardData, CardType } from '../constants/CardConfig';
import { ActionService } from '../managers/ActionService';
import { sleep } from '../utils/TimeUtil';
import { Layout } from '../constants/LayoutConfig';
import { createBrain } from '../managers/CpuAI';
import { Effect } from '../managers/Effect';
import { PauseDialog } from '../../objects/PauseDialog';
import { RulesDialog } from '../../objects/RulesDialog';

type TurnPhase = 'draw' | 'play' | 'discard' | 'discard-2' | 'end';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    // msg_text : Phaser.GameObjects.Text;

    constructor ()
    {
        super('Game');
    }

    private deck: CardData[] = [];
    public trash: CardData[] = [];
    private earth = EARTH_CARDS;

    private turnPlayer: number = 0;
    private turnPhase: TurnPhase = 'draw';

    private actionService: ActionService;
    private effect: Effect;
   
    public cpuCount: number = 3;
    private cpuPlayers: any[] = [];
    private cpuStrengths: number[] = [2, 2, 2, 2, 2];
    private playerName: string = '';

    private playerDropZone: Phaser.GameObjects.Zone;
    private trashZone: Phaser.GameObjects.Zone;
    private enemyDropZones: Phaser.GameObjects.Zone[] = [];
    
    public playerStatus: StatusWindow;
    private enemyStatusWindows: StatusWindow[] = [];

    private descriptionText: Phaser.GameObjects.Text;

    private activePauseDialog: PauseDialog | null = null;
    private activeRulesDialog: RulesDialog | null = null;

    private gameResult: string[] = [];
    private winner: string[] = [];
    private loser: string[] = [];

    private deckShadeShade: Phaser.GameObjects.Rectangle;
    private deckShade: Phaser.GameObjects.Rectangle;
    // private deckImage: Phaser.GameObjects.Image;
    public trashImage: Phaser.GameObjects.Image | null = null;

    // 手札のカードを管理する配列
    private playerHandCards: Phaser.GameObjects.Container[] = [];
    private enemyHandCards: Phaser.GameObjects.Container[][] = [];

    init(data: { cpuCount: number, cpuStrengths: number[], playerName: string }){
        if(data && data.cpuCount && data.cpuStrengths){
            this.cpuCount = data.cpuCount;
            this.cpuStrengths = data.cpuStrengths;
            this.playerName = data.playerName;
        }
    }
   
    async create ()
    {
    this.background = this.add.image(512, 384, 'game-bg');

    this.input.enabled = false;

    // this.Players = [{ name: 'あなた', type: 'player' }, { name: 'CPU1', type: 'よわい' }, { name: 'CPU2', type: 'よわい' }];
    // const cpus = this.Players.filter(p => p.type !== 'player');

    this.playerStatus =  new StatusWindow(
        this, 
        Layout.playerStatus.x, 
        Layout.playerStatus.y, 
        this.playerName
    );
    this.playerDropZone = this.add.zone(
        Layout.playerDropZone.x, 
        Layout.playerDropZone.y, 
        Layout.playerDropZone.width, 
        Layout.playerDropZone.height
    ).setRectangleDropZone(
        Layout.playerDropZone.width, 
        Layout.playerDropZone.height
    );
    
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    const yPos = Layout.enemyStatusWindow.y;

    for(let i = 0; i < this.cpuCount; i++){
        const xPos = (screenWidth / this.cpuCount) * (i + 0.5);
        this.cpuPlayers.push({
            id: i+1,
            name: `CPU${i+1}`,
            strength: this.cpuStrengths[i],
            brain: createBrain(this.cpuStrengths[i])
        })
        const statusWindow = new StatusWindow(
            this, 
            xPos, 
            yPos, 
            `CPU${i+1}`
        );
        this.add.existing(statusWindow);
        this.enemyStatusWindows.push(statusWindow);

        const enemyDropZone = this.add.zone(
            xPos, 
            yPos, 
            Layout.enemyDropZone.width, 
            Layout.enemyDropZone.height
        ).setRectangleDropZone(
            Layout.enemyDropZone.width, 
            Layout.enemyDropZone.height
        );
        this.enemyDropZones.push(enemyDropZone);

        const enemyHandCards: Phaser.GameObjects.Container[] = [];
        this.enemyHandCards.push(enemyHandCards);
    }

    this.trashZone = this.add.zone(
        Layout.trashZone.x, 
        Layout.trashZone.y, 
        Layout.trashZone.width, 
        Layout.trashZone.height
    ).setRectangleDropZone(
        Layout.trashZone.width, 
        Layout.trashZone.height
    );
        
    this.actionService = new ActionService(this);
    this.effect = new Effect(this);
    
    await this.showCenterText('環境破壊レベルカード配布');

    await this.dealTheEarth();

    await this.chooseFirstPlayer();

    this.initializeDeck();

    this.deckShadeShade = this.add.rectangle(
        Layout.deck.x + 6, 
        Layout.deck.y + 6, 
        Layout.card.width, 
        Layout.card.height, 
        0x999999
    ).setStrokeStyle(1, 0x555555);
    this.deckShade = this.add.rectangle(
        Layout.deck.x + 3, 
        Layout.deck.y + 3, 
        Layout.card.width, 
        Layout.card.height, 
        0xbbbbbb
    ).setStrokeStyle(1, 0x777777);
    const deckImage = this.add.image(
        Layout.deck.x, 
        Layout.deck.y, 
        'back'
    ).setScale(0.16);
    deckImage.setInteractive();
    
    const graphics = this.add.graphics();
    graphics.fillStyle(2, 0xaaaaaa);
    graphics.fillRect(
        this.trashZone.x - this.trashZone.input!.hitArea!.width / 2, 
        this.trashZone.y - this.trashZone.input!.hitArea!.height / 2, 
        this.trashZone.input!.hitArea!.width, 
        this.trashZone.input!.hitArea!.height
    );
    // graphics.strokeRect(
    //     this.playerDropZone.x - this.playerDropZone.input!.hitArea!.width / 2, 
    //     this.playerDropZone.y - this.playerDropZone.input!.hitArea!.height / 2, 
    //     this.playerDropZone.input!.hitArea!.width, 
    //     this.playerDropZone.input!.hitArea!.height
    // );
    // for(let i = 0; i < this.cpuCount; i++){
    //     graphics.strokeRect(
    //         this.enemyDropZones[i].x - this.enemyDropZones[i].input!.hitArea!.width / 2, 
    //         this.enemyDropZones[i].y - this.enemyDropZones[i].input!.hitArea!.height / 2, 
    //         this.enemyDropZones[i].input!.hitArea!.width, 
    //         this.enemyDropZones[i].input!.hitArea!.height
    //     );
    // }

    this.add.text(
        Layout.trashZone.x, 
        Layout.trashZone.y, 
        '廃棄カード', {
            fontSize: '18px',
            color: '#ffffff'
        }
    ).setOrigin(0.5);

    this.descriptionText = this.add.text(40,screenHeight-200, '', {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 10, y: 5 },
        wordWrap: { width: 300 }
    });
    this.descriptionText.setDepth(1000);
    this.descriptionText.setVisible(false);

    const menuButton = this.add.text(screenWidth - 110, screenHeight - 130, 'Menu', {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#00aaff',
        padding: { x: 20, y: 10 }
    });
    menuButton.setInteractive({ useHandCursor: true });
    menuButton.on('pointerdown', () => {
        this.openPauseMenu();
    });

    await this.dealInitialCards(this.playerHandCards);
    for(let i = 0; i < this.cpuCount; i++){
        await this.dealInitialCards(this.enemyHandCards[i]);
    }

    await this.showCenterText('開始！');

    this.setPhase('end');
    this.input.enabled = true;

    if(this.turnPlayer !== 0){
        this.cpuTurn();
    } else {
        await this.showSmallText(`${this.playerName}のターン`);
        this.setPhase('draw');
    }

    deckImage.on('pointerdown', () => {
        if(this.turnPhase === 'draw'){
            this.drawPhase();
        }
    });

    this.setupDragEvents();

    let depth = 1;

    // Zoneにドロップしたときの効果処理
    this.input.on('drop', (
        pointer: Phaser.Input.Pointer, 
        gameObject: Phaser.GameObjects.Container, 
        dropZone: Phaser.GameObjects.Zone
    ) => {
        this.descriptionText.setVisible(false);
        if(dropZone === this.trashZone) {
            if(this.turnPhase === 'discard' || this.turnPhase === 'discard-2'){
                this.effect.stopGuidance();
                const index = this.playerHandCards.indexOf(gameObject.parentContainer);
                if (index > -1){
                    this.playerHandCards.splice(index, 1);
                }
                this.actionService.sendCardToTrash(
                    gameObject.parentContainer as Card, 
                );
                this.updateHandLayout(this.playerHandCards);
                if(this.turnPhase === 'discard'){
                    this.setPhase('end');
                    this.turnPlayer = (this.turnPlayer + 1) % (this.cpuCount + 1);
                    this.cpuTurn();
                    return;
                } else {
                    this.setPhase('discard');
                }
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
            this.effect.stopGuidance();
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

            this.actionService.handCardEffect(
                container as Card, 
                targetStatus,
                true
            );
            
            this.updateHandLayout(this.playerHandCards);
            this.setPhase('discard');
        }
        this.updateHandLayout(this.playerHandCards);
        return;
        });
    }

    setupDragEvents(){
        this.input.on('dragstart', (
            pointer: Phaser.Input.Pointer, 
            gameObject: Phaser.GameObjects.Container
        ) => {
            const container = gameObject.parentContainer;
            const description = container.getData('description');
            if(description){
                this.descriptionText.setText(description);
                this.descriptionText.setVisible(true);
            }
    
            if(container){
                this.tweens.killTweensOf(container);
                container.setDepth(1000);
                container.setScale(1.1);
                container.setAlpha(0.8);
                container.setAngle(0);
                container.setData('startX', container.x);
                container.setData('startY', container.y);
            }
        });
    
        this.input.on('drag', (
            pointer: Phaser.Input.Pointer, 
            gameObject: Phaser.GameObjects.Container, 
            dragX: number, 
            dragY: number
        ) => {
            const container = gameObject.parentContainer;
            if(container){
                container.x = pointer.worldX;
                container.y = pointer.worldY;
            } else {
                gameObject.x = pointer.worldX;
                gameObject.y = pointer.worldY;
            }
        });
            
        this.input.on('dragend', (
            pointer: Phaser.Input.Pointer, 
            gameObject: Phaser.GameObjects.Container, 
            dropped: boolean
        ) => {
            const container = gameObject.parentContainer;
            this.descriptionText.setVisible(false);
            
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
    }

    // 手札のレイアウトを更新
    updateHandLayout(handCards: Phaser.GameObjects.Container[]){
        const Index = handCards === this.playerHandCards ? -1 : this.enemyHandCards.indexOf(handCards);
        const centerX = Index === -1 ? Layout.playerHand.x : (this.cameras.main.width / this.cpuCount) * (Index + 0.5);
        const centerY = Index === -1 ? Layout.playerHand.y : Layout.enemyHand.y ;
        const cardSpacing = Index === -1 ? Math.min(60, 400 / handCards.length) : Math.min(30, 200 / handCards.length);

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
                duration: 500,
                ease: 'Power2',
            });

            card.setDepth(100 + index);
        });

        const targetStatus = Index === -1 ? this.playerStatus : this.enemyStatusWindows[Index];
        targetStatus.updateHandInfo(handCards.length);   
    }

    // 環境破壊レベルカード配布
    dealTheEarth(): Promise<void> {
        return new Promise((resolve) => {
            Phaser.Utils.Array.Shuffle(this.earth);
        
            for(let i = -1; i < this.cpuCount; i++){
                const cardData = this.earth.pop()!;
                const newCard = new Card(
                    this, 
                    Layout.deck.x, 
                    Layout.deck.y, 
                    cardData, 
                    false
                );
                const targetZone = i === -1 ? this.playerDropZone : this.enemyDropZones[i];
                const targetHP = cardData.value!;
            
                this.add.tween({
                    targets: newCard, 
                    x: targetZone.x,
                    y: targetZone.y,
                    duration: 1000,
                    ease: 'Power2',
                    onStart: () => {
                        newCard.showFront();
                        newCard.setScale(1.5);
                    },
                    onComplete:() => {
                        newCard.destroy();
                        i === -1 ? this.playerStatus.updateStatusWindow(targetHP) : this.enemyStatusWindows[i].updateStatusWindow(targetHP);
                        resolve();
                    }
                });
            }
        });
    }

    // 環境破壊レベルが大きい人から
    chooseFirstPlayer(): Promise<void>{
        return new Promise<void>(resolve => {
            const allHP = [
                this.playerStatus.getData('HP'), 
                ...this.enemyStatusWindows.map(status => status.getData('HP'))
            ];
            const maxHP = Math.max(...allHP);
            const maxHPIndex = allHP.indexOf(maxHP);
            this.turnPlayer = maxHPIndex;
            resolve();
        });
    }

    // 初期手札を配布
    dealInitialCards(
        handCards: Phaser.GameObjects.Container[]
    ): Promise<void>{
        return new Promise<void>(resolve => {
            for(let i=0; i<5; i++){
                const newCard = this.drawCard(
                    Layout.deck.x, 
                    Layout.deck.y, 
                    handCards === this.playerHandCards
                );
                if(newCard){
                    handCards.push(newCard);
                }
            }
            this.updateHandLayout(handCards);
            resolve();
        });
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
    async trashToDeck(){
        if(this.trash.length === 0) return;

        if(this.trashImage){
            this.trashImage.destroy();
            this.trashImage = null;
        }

        this.deckShadeShade.setVisible(true);
        this.deckShade.setVisible(true);

        const animationPromises = this.trash.map((card, index) => {
            return new Promise<void>((resolve) => {
                this.time.delayedCall(index * 10, () => {
                    const dummy = this.add.image(Layout.trashZone.x, Layout.trashZone.y, 'back');
                    dummy.setDisplaySize(Layout.card.width, Layout.card.height);
                    dummy.setDepth(200);
    
                    this.tweens.add({
                        targets: dummy,
                        x: Layout.deck.x,
                        y: Layout.deck.y,
                        angle: Phaser.Math.Between(-10, 10),
                        duration: 400,
                        ease: 'Quad.out',
                        onComplete: () => {
                            dummy.destroy();
                            resolve();
                        }
                    });
                });
            });
        });

        await Promise.all(animationPromises);

        Phaser.Utils.Array.Shuffle(this.trash);
        this.trash.forEach(card => {
            this.deck.push(card);
        });
        this.trash = [];
    }
    
    // 中央にテキストを表示
    showCenterText(text: string): Promise<void>{
        return new Promise<void>(resolve => {
            const textObject = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                text,
                {
                    fontSize: '60px',
                    color: '#000000',
                    stroke: '#ffffff',
                    strokeThickness: 6,
                }
            ).setOrigin(0.5).setScale(0).setAlpha(0);
    
            this.tweens.add({
                targets: textObject,
                scale: 1.2,
                alpha: 1,
                duration: 800,
                ease: 'Back.easeInOut',
                hold: 500,
                yoyo: false,
                onComplete: () => {
                    this.tweens.add({
                        targets: textObject,
                        scale: 2,
                        alpha: 0,
                        duration: 500,
                        ease: 'Power2',
                        onComplete: () => {
                            textObject.destroy();
                            resolve();
                        }
                    });
                }
            });
        });
    }

    // テキスト表示
    showSmallText(text: string): Promise<void>{
        return new Promise<void>(resolve => {
            const textObject = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                text,
                {
                    fontSize: '30px',
                    color: '#000000',
                    stroke: '#ffffff',
                    strokeThickness: 6,
                }
            ).setOrigin(0.5).setScale(0).setAlpha(0);
    
            this.tweens.add({
                targets: textObject,
                scale: 1.2,
                alpha: 1,
                duration: 800,
                ease: 'Back.easeInOut',
                hold: 500,
                yoyo: false,
                onComplete: () => {
                    this.tweens.add({
                        targets: textObject,
                        scale: 2,
                        alpha: 0,
                        duration: 500,
                        ease: 'Power2',
                        onComplete: () => {
                            textObject.destroy();
                            resolve();
                        }
                    });
                }
            });
        });
    }

    // カードを引く
    drawCard(x: number, y: number, isPlayer: boolean){
        const cardData = this.deck.pop()!;
        const newCard = new Card(this, x, y, cardData, isPlayer);
        
        return newCard;
    }

    // プレイヤーのドローフェーズ
    async drawPhase() {
        if(this.turnPhase !== 'draw'){
            return;
        }
        for(let i = 0; i < 2; i++){
            const newCard = this.drawCard(
                Layout.deck.x, 
                Layout.deck.y, 
                true
            );
            if(newCard){
                this.playerHandCards.push(newCard);
            }
        }
        if(this.deck.length < 30){
            this.deckShadeShade.setVisible(false);
        }
        if(this.deck.length < 10){
            this.deckShade.setVisible(false);
        }
        if(this.deck.length <= 1){
            // this.deckShadeShade.setVisible(true);
            // this.deckShade.setVisible(true);
            await this.trashToDeck();
        }
        this.effect.stopGuidance();
        this.playerStatus.turnCount++;
        this.updateHandLayout(this.playerHandCards);
        if(this.checkPlayableCards(
            this.playerHandCards, 
            this.playerStatus
        )){
            this.setPhase('play');
        } else {
            this.showCenterText('パス');
            await sleep(1000);
            this.setPhase('discard-2');
        }
    }

    // 手札にプレイ可能なカードがあるかをチェック
    checkPlayableCards(
        handCards: Phaser.GameObjects.Container[], 
        playerstatus: StatusWindow
    ): boolean{
        if(playerstatus.waste || playerstatus.oceanPollution || playerstatus.deforestation) {
            if(handCards.find(card => card.getData('id') === 'biosphere')){
                return true;
            } else if (playerstatus.waste && handCards.find(card => card.getData('id') === 'waste-treatment')) {
                return true;
            } else if (playerstatus.oceanPollution && handCards.find(card => card.getData('id') === 'waste-water-treatment')) {
                return true;
            } else if (playerstatus.deforestation && handCards.find(card => card.getData('id') === 'planting')) {
                return true;
            } else {
                return false;
            }
        } else {
            for(const card of handCards){
                switch(card.getData('type')){
                    case 'recovery':
                        return true;
                    case 'pollution':
                        return true;
                    case 'protect':
                        if(!playerstatus.animalProtection) return true;
                        break;
                    case 'poaching':
                        for(let i=-1; i<this.cpuCount; i++){
                            if(this.turnPlayer === i+1) continue;
                            const targetStatus = i === -1 ? this.playerStatus : this.enemyStatusWindows[i];
                            if(targetStatus.animalProtection) return true;
                        }
                        break;
                    case 'interference':
                        for(let i=-1; i<this.cpuCount; i++){
                            if(this.turnPlayer === i+1) continue;
                            const targetStatus = i === -1 ? this.playerStatus : this.enemyStatusWindows[i];
                            if((card as Card).checkPlayable(playerstatus, targetStatus)) return true;
                        }
                        break;
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
                this.effect.startGuidance(Layout.deck.x, Layout.deck.y, Layout.card.width, Layout.card.height);
                break;
            case 'play':
                this.trashZone.input!.enabled = false;
                this.playerDropZone.input!.enabled = true;
                this.enemyDropZones.forEach(zone => zone.input!.enabled = true);
                // this.effect.startGuidance(Layout.playerDropZone.x, Layout.playerDropZone.y, Layout.playerDropZone.width, Layout.playerDropZone.height);
                // for(let i = 0; i < this.cpuCount; i++){
                //     const xPos = (this.cameras.main.width / this.cpuCount) * (i + 0.5);
                //     this.effect.startGuidance(xPos, Layout.enemyStatusWindow.y, Layout.enemyStatusWindow.width, Layout.enemyStatusWindow.height);
                // }
                break;
            case 'discard':
                this.trashZone.input!.enabled = true;
                this.playerDropZone.input!.enabled = false;
                this.enemyDropZones.forEach(zone => zone.input!.enabled = false);
                this.effect.startGuidance(Layout.trashZone.x, Layout.trashZone.y, Layout.trashZone.width, Layout.trashZone.height);
                break;
            case 'discard-2':
                this.trashZone.input!.enabled = true;
                this.playerDropZone.input!.enabled = false;
                this.enemyDropZones.forEach(zone => zone.input!.enabled = false);
                this.effect.startGuidance(Layout.trashZone.x, Layout.trashZone.y, Layout.trashZone.width, Layout.trashZone.height);
                break;
            case 'end':
                this.trashZone.input!.enabled = false;
                this.playerDropZone.input!.enabled = false;
                this.enemyDropZones.forEach(zone => zone.input!.enabled = false);
                break;
        }
    }

    // CPUのターン
    async cpuTurn(){
        while(this.turnPlayer !== 0){
            if(this.enemyStatusWindows[this.turnPlayer - 1].isDead){
                this.turnPlayer = (this.turnPlayer + 1) % (this.cpuCount + 1);
                continue;
            }
            await this.showSmallText(`CPU${this.turnPlayer}のターン`);
            this.enemyStatusWindows[this.turnPlayer - 1].turnCount++;
            await sleep(1000);

            // draw Phase
            const currentCpu = this.cpuPlayers[this.turnPlayer - 1];
            const handCards = this.enemyHandCards[this.turnPlayer - 1];
            const cpuStatus = this.enemyStatusWindows[this.turnPlayer - 1];
            for(let i = 0; i < 2; i++){
                const newCard = this.drawCard(
                    Layout.deck.x, 
                    Layout.deck.y, 
                    false
                );
                if(newCard){
                    handCards.push(newCard);
                }
            }
            if(this.deck.length <= 1){
                await this.trashToDeck();
            }
            this.updateHandLayout(handCards);

            await sleep(1000);
            
            // play Phase
            if(this.checkPlayableCards(handCards, cpuStatus)){
                const { card, index, target } = currentCpu.brain.choicePlayCard(
                    this.turnPlayer -1,
                    handCards, 
                    this.playerStatus,
                    this.enemyStatusWindows
                );
                const targetStatus = target === -1 ? this.playerStatus : this.enemyStatusWindows[target];
                const targetDropZone = target === -1 ? this.playerDropZone : this.enemyDropZones[target];
                if(card){
                    await new Promise<void>(resolve => {
                        this.add.tween({
                            targets: card,
                            x: targetDropZone.x,
                            y: targetDropZone.y,
                            angle: 0,
                            duration: 500,
                            ease: 'Power2',
                            onStart: () => {
                                card.showFront();
                                card.setScale(1.5);
                            },
                            onComplete: () => {
                                this.actionService.handCardEffect(
                                    card as Card, 
                                    targetStatus,
                                    false
                                );
                                handCards.splice(index, 1);
                                this.updateHandLayout(handCards);
                                resolve();
                            }
                        })
                    });
                }
            } else {
                await this.showCenterText('パス');
            }
            await sleep(1000);

            // discard Phase
            while(handCards.length > 5){
                const { card, index } = currentCpu.brain.choiceDiscardCard(
                    this.turnPlayer -1,
                    handCards, 
                    this.playerStatus,
                    this.enemyStatusWindows
                );
                if(card){
                    await new Promise<void>(resolve => {
                        this.add.tween({
                            targets: card,
                            x: this.trashZone.x,
                            y: this.trashZone.y,
                            angle: 0,
                            duration: 500,
                            ease: 'Power2',
                            onStart: () => {
                                card.showFront();
                                card.setScale(1.5);
                            },
                            onComplete: () => {
                                this.actionService.sendCardToTrash(
                                    card as Card, 
                                );
                                handCards.splice(index, 1);
                                this.updateHandLayout(handCards);
                                resolve();
                             }
                        });
                    });
                }
            }
        
            this.turnPlayer = (this.turnPlayer + 1) % (this.cpuCount + 1);
        }

        if(this.turnPlayer === 0){
            await this.showSmallText(`${this.playerName}のターン`);
            this.setPhase('draw');
        }
    }

    // ゲーム終了判定
   public checkGameOver(){
        if(
            this.playerStatus.getData('HP') === 0 
            && this.playerStatus.animalProtection
        ){
            this.winner.push(this.playerName);
            this.transitionToResult(this.winner, true);
        } else if(this.playerStatus.getData('HP') >= 100){
            this.effect.showExplosionEffect(this.playerStatus);
            this.loser.push(this.playerName);
            this.transitionToResult(this.winner, false);
        }
        for(let i = 0; i < this.cpuCount; i++){
            if(
                this.enemyStatusWindows[i].getData('HP') === 0 
                && this.enemyStatusWindows[i].animalProtection
                && !this.enemyStatusWindows[i].isDead
            ){
                this.enemyStatusWindows[i].isDead = true;
                this.winner.push(`cpu${i+1}`);
                const targetZone = this.enemyDropZones[i];
                if(targetZone){
                    targetZone.disableInteractive();
                    this.enemyStatusWindows[i].setAlpha(0.3);
                }
            } else if(
                this.enemyStatusWindows[i].getData('HP') >= 100
                && !this.enemyStatusWindows[i].isDead
            ){
                this.effect.showExplosionEffect(this.enemyStatusWindows[i]);
                this.enemyStatusWindows[i].isDead = true;
                this.loser.push(`cpu${i+1}`);
                const targetZone = this.enemyDropZones[i];
                if(targetZone){
                    targetZone.disableInteractive();
                    this.enemyStatusWindows[i].setAlpha(0.3);
                }
            }
        }
        if(this.winner.length + this.loser.length === this.cpuCount){
            this.winner.push(this.playerName);
            this.transitionToResult(this.winner, true);
        }
    }

    // ゲーム結果画面に遷移
    private transitionToResult(winner: string[], playerWin: boolean){
        this.input.enabled = false;

        this.cameras.main.fade(1000,0,0,0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameOver', { winner, playerWin });
        });
    }

    openPauseMenu(){
        if(this.activePauseDialog) return;
        
        this.activePauseDialog = new PauseDialog(this, {
            onResume: () => {
                this.closePauseMenu();
            },
            onRules: () => {
                this.closePauseMenu();
                this.openRulesDialog();
            },
            onTop: () => {
                this.scene.start('MainMenu');
            }
        });
    }

    closePauseMenu(){
        if(this.activePauseDialog){
            this.activePauseDialog.destroy();
            this.activePauseDialog = null;
        }
    }

    openRulesDialog(){
        if(this.activeRulesDialog) return;
        
        this.activeRulesDialog = new RulesDialog(this, {
            onExit: () => {
                this.closeRulesDialog();
            }
        });
    }

    closeRulesDialog(){
        if(this.activeRulesDialog){
            this.activeRulesDialog.destroy();
            this.activeRulesDialog = null;
        }
    }

}