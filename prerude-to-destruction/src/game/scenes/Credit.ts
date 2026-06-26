import { Scene, GameObjects } from "phaser";

export class Credit extends Scene
{

    constructor(){
        super('Credit');
    }

    title: GameObjects.Text;
    text: GameObjects.Text;
    exitText: GameObjects.Text;
    background: GameObjects.Image;

    create(){
        this.background = this.add.image(512, 384, 'credit-bg');
        this.title = this.add.text(512, 200, 'Credit', {
            fontFamily: 'Arial Black', 
            fontSize: 38, 
            color: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.text = this.add.text(512, 350, 
            '本アプリは、ボードゲーム「地球崩壊への序曲」をもとにして作成したものです。\nなお、本アプリ制作にあたり、原作「地球崩壊への序曲」関係者の許諾は得ておりません。\n関係者の皆様には深くお詫びを申し上げます。\n 加えまして、「地球崩壊への序曲」を生み出してくださったことに対し、深い感謝の意を表したいと存じます。\n原作「地球崩壊への序曲」に関しての情報をお持ちの方は、是非私にご一報ください。'
            , {
            fontFamily: 'Arial Black', 
            fontSize: 20, 
            color: '#000000',
            stroke: '#ffffff', 
            strokeThickness: 3,
            align: 'center'
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