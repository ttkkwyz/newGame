import * as Phaser from 'phaser';

export class RulesDialog extends Phaser.GameObjects.Container {
    private blocker: Phaser.GameObjects.Rectangle;
    private rulesText: Phaser.GameObjects.Text;
    private scrollOffset = 0;
    private maxScroll = 0;

    constructor(
        scene: Phaser.Scene, 
        callbacks: {
            onExit: () => void
        }
    ) {
        super(scene, 0, 0);

        const { width, height } = scene.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2;

        const VIEWPORT_TOP = -150;
        const VIEWPORT_HEIGHT = 320;
        const VIEWPORT_WIDTH = 900;
        const SCROLL_SPEED = 0.5;

        this.blocker = scene.add.rectangle(
            centerX, 
            centerY, 
            width, 
            height, 
            0x000000, 
            0.6
        );
        this.blocker.setInteractive();
        this.blocker.setDepth(1000);

        this.setPosition(centerX, centerY);
        this.setDepth(1001);

        const menuBg = scene.add.rectangle(
            0, 
            0, 
            1000, 
            500, 
            0x222222
        ).setStrokeStyle(4, 0xffffff);

        const titleText = scene.add.text(
            0, 
            -200, 
            '詳細ルール', 
            { 
                fontSize: '28px', 
                fontStyle: 'bold' 
            }
        ).setOrigin(0.5);
        this.add([menuBg, titleText]);

        const menuItem = { text: '閉じる', y: 200, action: callbacks.onExit };

        const btnText = scene.add.text(0, menuItem.y, menuItem.text, {
            fontSize: '20px',
            backgroundColor: '#0055aa',
            padding: { x: 30, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

            btnText.on('pointerover', () => btnText.setBackgroundColor('#0077dd'));
            btnText.on('pointerout', () => btnText.setBackgroundColor('#0055aa'));
            
            btnText.on('pointerdown', () => {
                menuItem.action();
                this.destroyDialog();
            });

        this.add(btnText);

        const textPanel = scene.add.container(0, VIEWPORT_TOP + VIEWPORT_HEIGHT / 2);


        // const maskGraphics = scene.make.graphics({});
        // maskGraphics.fillRect(
        //     -VIEWPORT_WIDTH / 2,
        //     VIEWPORT_TOP,
        //     VIEWPORT_WIDTH,
        //     VIEWPORT_HEIGHT
        // );

        // const mask = maskGraphics.createGeometryMask();
        // this.add(maskGraphics);

        const mainText = `・ゲームの概要
各プレイヤーは配られたカードを使って、自分の地球環境を回復したり、他のプレイヤーの地球環境を破壊することができます。自分の地球の「動物保護」を行い、「環境破壊レベル」をぴったり0にしたプレイヤーの勝利です。

・ゲームの流れ
①環境破壊レベルカードを配布します。
②各プレイヤーにカードを5枚ずつ配布します。
③環境破壊レベルが最も高いプレイヤーから時計回りにゲームをスタートします。
手番が回ってきたら、山札からカードを2枚引き、自分または相手プレイヤーにカードを1枚使い、カードを1枚捨てます。使えるカードがなかった場合は、カードを2枚捨てて自分の手番を終了します。
    
・カードの種類
環境回復レベルカード：書かれた数字の分だけ環境破壊レベルを減らします。
フロンガスカード、放射能漏れ事故カード：書かれた数字の分だけ環境破壊レベルを上げます。環境破壊レベルが100を超えたプレイヤーはゲームオーバーとなります。
妨害カード：廃棄物、海洋汚染、森林伐採の3種類があります。使われたプレイヤーは、修復カードを使って環境を回復させるまで他のカードを使用することができません。
修復カード：廃棄物処理工場→廃棄物、汚水処理→海洋汚染、植樹→森林伐採をそれぞれ回復します。
バイオスフェアカード：あらゆる妨害の中から一つを選んで回復させることができます。フロンガス、放射能漏れ事故を回復することで環境破壊レベルを下げることもできます。
動物保護カード：環境破壊レベルを0にする前に必ず使います。環境破壊レベルが0の状態では使用することができません。
密猟カード：場に出ている動物保護の効果を無効化します。
    
※最初のターンのみ、相手プレイヤーの地球環境を破壊するカードは使えません。`;

        this.rulesText = scene.add.text(
            -VIEWPORT_WIDTH / 2,
            VIEWPORT_TOP,
            mainText, 
            { 
                fontSize: '16px', 
                color: '#ffffff',
                wordWrap: { width: VIEWPORT_WIDTH, useAdvancedWrap: true },
                lineSpacing: 8
            }
        );
        textPanel.add(this.rulesText);

        const maskShape = scene.add.rectangle(
            0, 0,
            VIEWPORT_WIDTH,
            VIEWPORT_HEIGHT,
            0xffffff
        );
        maskShape.setVisible(false);
        textPanel.add(maskShape);

        this.maxScroll = Math.max(0, this.rulesText.height - VIEWPORT_HEIGHT);
        // this.rulesText.setInteractive();
        textPanel.enableFilters();
        textPanel.filters?.internal?.addMask(maskShape);
        // this.rulesText.on('wheel', (
        //     pointer: Phaser.Input.Pointer, 
        //     deltaX: number, 
        //     deltaY: number,
        //     event: Event
        // ) => {
        //     event.stopPropagation();
        //     this.scrollOffset = Phaser.Math.Clamp(
        //         this.scrollOffset + deltaY * SCROLL_SPEED,
        //         0,
        //         this.maxScroll
        //     );
        //     this.rulesText.setY(VIEWPORT_TOP - this.scrollOffset);
        //     console.log('text scroll')
        // });
        this.add(textPanel);

        const scrollZone = scene.add.rectangle(
            -VIEWPORT_WIDTH / 2 + 50,
            VIEWPORT_TOP + VIEWPORT_HEIGHT / 2,
            VIEWPORT_WIDTH * 2,
            VIEWPORT_HEIGHT,
            0x000000,
            0
        ).setInteractive();
        
        scrollZone.on('wheel', (_pointer: any, _dx: any, deltaY: number, _dz: any, event: any) => {
            event.stopPropagation();
            this.scrollOffset = Phaser.Math.Clamp(
                this.scrollOffset + deltaY * SCROLL_SPEED,
                0,
                this.maxScroll
            );
            this.rulesText.setY(-VIEWPORT_HEIGHT / 2 - this.scrollOffset);
        });
        
        this.add(scrollZone);
        // this.add(this.rulesText);

        scene.add.existing(this);

        this.setScale(0.8);
        scene.tweens.add({
            targets: this,
            scale: 1,
            duration: 150,
            ease: 'Back.out'
        });

        // scene.input.on('pointerwheel', (
        //     pointer: Phaser.Input.Pointer, 
        //     deltaX: number, 
        //     deltaY: number
        // ) => {
        //     if(!this.active) return;
        //     let newY = this.textY - deltaY * 0.5;
        //     this.textY = newY;
        //     this.rulesText.setY(this.textY);
        //     console.log(this.textY);
        // });
    }

    private destroyDialog() {
        this.blocker.destroy();
        this.destroy();
    }
}