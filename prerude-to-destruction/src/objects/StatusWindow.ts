import * as Phaser from 'phaser';

export class StatusWindow extends Phaser.GameObjects.Container {
    private nameText: Phaser.GameObjects.Text;
    private fixedText: Phaser.GameObjects.Text;
    private HPText: Phaser.GameObjects.Text;
    private handInfo: Phaser.GameObjects.Text;
    private handNumber: number;

    constructor(scene: Phaser.Scene, x: number, y: number, name: string) {
        
        super(scene, x, y);

        const bg = scene.add.rectangle(0, 0, 200, 100, 0x000000, 0.5);

        this.nameText = scene.add.text(-90, -40, name, { fontSize: '18px' });
        this.fixedText = scene.add.text(-90, -20, '環境破壊レベル：', { fontSize: '16px', color: '#000000' });
        this.HPText = scene.add.text(40, -22, '', { fontSize: '18px', color: '#000000' });
        this.handInfo = scene.add.text(-90, 0, '5', { fontSize: '18px', color: '#000000' });

        this.setData('HP', 0);
        this.add([bg, this.nameText, this.fixedText, this.HPText, this.handInfo]);

        scene.add.existing(this);
    }

    updateStatusWindow(HP: number){
        this.setData('HP', HP);
        this.HPText.setText(HP.toString());
    }
    
    updateHandInfo(handNumber: number){
        this.setData('handNumber', handNumber);
        this.handInfo.setText(handNumber.toString());
    }
}