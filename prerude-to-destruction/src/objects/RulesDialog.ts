import * as Phaser from 'phaser';

export class RulesDialog extends Phaser.GameObjects.Container {
    private blocker: Phaser.GameObjects.Rectangle;

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

        this.blocker = scene.add.rectangle(centerX, centerY, width, height, 0x000000, 0.6);
        this.blocker.setInteractive();
        this.blocker.setDepth(1000);

        this.setPosition(centerX, centerY);
        this.setDepth(1001);

        const menuBg = scene.add.rectangle(0, 0, 1000, 500, 0x222222)
            .setStrokeStyle(4, 0xffffff)
            .setOrigin(0.5);

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

        const menuItem = { text: 'Exit', y: 200, action: callbacks.onExit };

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

            const rulesText = scene.add.text(
                20, 
                0, 
                `    ・ゲームの概要
    各プレイヤーは配られたカードを使って、自分の地球環境を回復したり、他のプレイヤーの地球環境を破壊することができます。
    自分の地球の「動物保護」を行い、「環境破壊レベル」を0にしたプレイヤーの勝利です。
    
    ・ゲームの流れ
    ①環境破壊レベルカードを配布します。
    ②各プレイヤーにカードを5枚ずつ配布します。
    ③環境破壊レベルが最も高いプレイヤーから時計回りにゲームをスタートします。
    手番が回ってきたら、山札からカードを2枚引き、自分または相手プレイヤーにカードを1枚使い、カードを1枚捨てます。
    使えるカードがなかった場合は、カードを2枚捨てて自分の手番を終了します。
    
    ・カードの種類
    環境回復レベルカード：書かれた数字の分だけ環境破壊レベルを減らします。
    フロンガスカード、放射能漏れ事故カード：書かれた数字の分だけ環境破壊レベルを上げます。
    環境破壊レベルが100を超えたプレイヤーはゲームオーバーとなります。
    妨害カード：廃棄物、海洋汚染、森林伐採の3種類があります。
    使われたプレイヤーは、修復カードを使って環境を回復させるまで他のカードを使用することができません。
    修復カード：廃棄物処理工場→廃棄物、汚水処理→海洋汚染、植樹→森林伐採をそれぞれ回復します。
    バイオスフェアカード：あらゆる妨害の中から一つを選んで回復させることができます。
    フロンガス、放射能漏れ事故を回復することで環境破壊レベルを下げることもできます。
    動物保護カード：環境破壊レベルを0にする前に必ず使います。
    環境破壊レベルが0の状態では使用することができません。
    密猟カード：場に出ている動物保護の効果を無効化します。
    
    ※最初のターンのみ、相手プレイヤーの地球環境を破壊するカードは使えません。`, 
                { 
                    fontSize: '16px', 
                    color: '#ffffff' 
                }
            ).setOrigin(0.5);
            this.add(rulesText);

        scene.add.existing(this);

        this.setScale(0.8);
        scene.tweens.add({
            targets: this,
            scale: 1,
            duration: 150,
            ease: 'Back.out'
        });
    }

    private destroyDialog() {
        this.blocker.destroy();
        this.destroy();
    }
}