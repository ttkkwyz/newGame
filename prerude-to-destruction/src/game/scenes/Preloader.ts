import { Scene } from 'phaser';
import { CARD_LIST, EARTH_CARDS } from '../constants/CardConfig';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');
        // this.add.image(512, 384, 'logo');


        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        this.add.text(400, 300, 'Loading...', { 
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets/jokyokuCards/4x');

        this.load.image('background', 'title-bg.jpg');
        
        this.load.image('back', 'back-4x.png');
        CARD_LIST.forEach(card => {
            this.load.image(card.imageKey, `${card.imageKey}-4x.png`);
        });
        EARTH_CARDS.forEach(card => {
            this.load.image(card.imageKey, `${card.imageKey}-4x.png`);
        });
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
