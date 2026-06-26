import { Scene, GameObjects, Cameras } from 'phaser';

export class GameOver extends Scene
{
    camera: Cameras.Scene2D.Camera;
    background: GameObjects.Image;
    gameover_text : GameObjects.Text;

    toTopText: GameObjects.Text;
    retryText: GameObjects.Text;

    private resultText: string[] = [];

    constructor ()
    {
        super('GameOver');
    }

    init(data: { winner: string[], playerWin: boolean }){
        console.log(data);
        if(!data.playerWin){
            this.resultText.push('敗北');
        } else {
            for (let i = 0; i < data.winner.length; i++){
                this.resultText.push(`${i + 1}位: ${data.winner[i]}`);
            }
        }
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'result-bg');
        const { width, height } = this.cameras.main;

        // this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

        for(let i = 0; i < this.resultText.length; i++){
            const rankText = this.add.text(
                width / 2, 
                height / 2 + i * 60 - 100, 
                this.resultText[i], {
                fontSize: '40px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 5,

            }).setOrigin(0.5);
            this.tweens.add({
                targets: rankText,
                scale: { from: 0.5, to: 1.0 },
                duration: 800,
                ease: 'Back.easeOut',
                onComplete: () => {
                    console.log('rank text complete');
                }
            });
        }

        // this.camera = this.cameras.main
        // this.camera.setBackgroundColor(0xff0000);

        // this.background = this.add.image(512, 384, 'background');
        // this.background.setAlpha(0.5);

        // this.gameover_text = this.add.text(512, 384, 'Game Over', {
        //     fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
        //     stroke: '#000000', strokeThickness: 8,
        //     align: 'center'
        // });
        // this.gameover_text.setOrigin(0.5);

        this.toTopText = this.add.text(
            width / 2, 
            height * 0.8, 
            'トップに戻る', {
            fontFamily: 'Arial Black', 
            fontSize: 38, 
            color: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5);

        this.toTopText.setInteractive();
        this.toTopText.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });

        // this.retryText = this.add.text(512, 500, 'もう一度遊ぶ', {
        //     fontFamily: 'Arial Black', fontSize: 38, color: '#000000',
        //     stroke: '#000000', strokeThickness: 8,
        //     align: 'center'
        // }).setOrigin(0.5);

        // this.retryText.setInteractive();
        // this.retryText.on('pointerdown', () => {
        //     this.scene.start('Settings');
        // });

        // this.input.once('pointerdown', () => {

            // this.scene.start('MainMenu');

        // });
    }
}
