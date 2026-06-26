import { Scene, GameObjects } from "phaser";

export class Rules extends Scene
{
    constructor(){
        super('Rules');
    }

    title: GameObjects.Text;
    text: GameObjects.Text;
    exitText: GameObjects.Text;
    background: GameObjects.Image;
    create(){
        this.background = this.add.image(512, 384, 'rules-bg');
        this.title = this.add.text(512, 200, 'Rules', {
            fontFamily: 'Arial Black', 
            fontSize: 38, 
            color: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.text = this.add.text(512, 350, 
            `1. 対戦人数は2～6人です。
2. 動物保護をした状態で、自分の環境破壊レベルをぴったり0にしたプレイヤーの勝利です。
3. 環境破壊レベルが100以上になった場合、そのプレイヤーの地球は滅亡します。`
            , {
            fontFamily: 'Arial Black', 
            fontSize: 24, 
            color: '#000000',
            // stroke: '#000000', 
            // strokeThickness: 8,
            // align: 'center'
        }).setOrigin(0.5);

        this.exitText = this.add.text(512, 600, 'トップに戻る', {
            fontFamily: 'Arial Black', 
            fontSize: 30, 
            color: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5);

        this.exitText.setInteractive();
        this.exitText.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}