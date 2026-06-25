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

        const menuBg = scene.add.rectangle(0, 0, 300, 400, 0x222222)
            .setStrokeStyle(4, 0xffffff)
            .setOrigin(0.5);

        const titleText = scene.add.text(0, -140, 'Rules', { fontSize: '28px', fontStyle: 'bold' }).setOrigin(0.5);
        this.add([menuBg, titleText]);

        const menuItems = [
            { text: 'Exit', y: -50, action: callbacks.onExit }
        ];

        menuItems.forEach(item => {
            const btnText = scene.add.text(0, item.y, item.text, {
                fontSize: '20px',
                backgroundColor: '#0055aa',
                padding: { x: 30, y: 10 }
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

            btnText.on('pointerover', () => btnText.setBackgroundColor('#0077dd'));
            btnText.on('pointerout', () => btnText.setBackgroundColor('#0055aa'));
            
            btnText.on('pointerdown', () => {
                item.action();
                this.destroyDialog();
            });

            this.add(btnText);
        });

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