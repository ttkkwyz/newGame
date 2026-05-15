import { Scene } from 'phaser';

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameover_text : Phaser.GameObjects.Text;

    private results: string[] = [];
    private resultText: string[] = [];

    constructor ()
    {
        super('GameOver');
    }

    init(data: { results: string[] }){
        for (let i = 0; i < data.results.length; i++){
            this.results.push(data.results[i]);
            this.resultText.push(`${i + 1}位: ${this.results[i]}`);
        }
    }

    create ()
    {
        const { width, height } = this.cameras.main;

        this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

        this.add.text(width / 2, height / 3, 'Game Over', {
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);

        for(let i = 0; i < this.results.length; i++){
            const rankText = this.add.text(width / 2, height / 2 + i * 50, this.results[i], {
                fontSize: '32px',
                color: '#ffffff'
            }).setOrigin(0.5);
        }

        this.tweens.add({
            targets: this.resultText,
            scale: { from: 0.5, to: 1.0 },
            duration: 800,
            ease: 'Back.easeOut',
        });
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

        // this.input.once('pointerdown', () => {

        //     this.scene.start('MainMenu');

        // });
    }
}
