import { Scene, GameObjects } from "phaser";

export class Rules extends Scene
{
    constructor(){
        super('Rules');
    }

    title: GameObjects.Text;
    text: GameObjects.Text;
    exitText: GameObjects.Text;

    create(){
        this.title = this.add.text(512, 300, 'ルール', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.text = this.add.text(512, 350, 
            '1. 対戦人数は2～6人です。\n 2. 動物保護をした状態で、自分の環境破壊レベルを0にしたプレイヤーの勝利です。\n 3. 環境破壊レベルが100以上になった場合、そのプレイヤーの地球は滅亡します。'
            , {
            fontFamily: 'Arial Black', fontSize: 20, color: '#000000',
            // stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.exitText = this.add.text(512, 400, 'トップに戻る', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#000000',
            // stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.exitText.setInteractive();
        this.exitText.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}