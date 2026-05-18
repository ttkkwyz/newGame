import { Scene, GameObjects } from "phaser";

export class Credit extends Scene
{

    constructor(){
        super('Credit');
    }

    title: GameObjects.Text;
    text: GameObjects.Text;
    exitText: GameObjects.Text;

    create(){
        this.title = this.add.text(512, 300, 'クレジット', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.text = this.add.text(512, 350, 
            'ゲーム製作：わたなべ\nプログラミング：わたなべ'
            , {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.exitText = this.add.text(512, 400, 'トップに戻る', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.exitText.setInteractive();
        this.exitText.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}