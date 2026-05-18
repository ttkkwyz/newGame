import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
{
    // background: GameObjects.Image;
    logo: GameObjects.Image;
    // title: GameObjects.Text;
    startText: GameObjects.Text;
    rulesText: GameObjects.Text;
    creditText: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        // this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo');

        // this.title = this.add.text(512, 460, 'Main Menu', {
        //     fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
        //     stroke: '#000000', strokeThickness: 8,
        //     align: 'center'
        // }).setOrigin(0.5);

        // this.input.once('pointerdown', () => {

        //     this.scene.start('Game');

        // });
        this.startText = this.add.text(512, 460, 'Start Game', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.startText.setInteractive();
            this.startText.on('pointerdown', () => {
                this.scene.start('Game');
            });

        this.rulesText = this.add.text(512, 500, 'Rules', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.rulesText.setInteractive();
        this.rulesText.on('pointerdown', () => {
            this.scene.start('Rules');
        });

        this.creditText = this.add.text(512, 550, 'Credit', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.creditText.setInteractive();
        this.creditText.on('pointerdown', () => {
            this.scene.start('Credit');
        });
    }
}
