import * as Phaser from 'phaser';

export class StatusWindow extends Phaser.GameObjects.Container {
    private nameText: Phaser.GameObjects.Text;
    // private fixedText: Phaser.GameObjects.Text;
    private HPText: Phaser.GameObjects.Text;
    private handInfo: Phaser.GameObjects.Text;
    private wasteIcon: Phaser.GameObjects.Text;
    private oceanPollutionIcon: Phaser.GameObjects.Text;
    private deforestationIcon: Phaser.GameObjects.Text;
    private animalProtectionIcon: Phaser.GameObjects.Text;

    public waste: boolean;
    public oceanPollution: boolean;
    public deforestation: boolean;
    public animalProtection: boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, name: string) {
        
        super(scene, x, y);

        const bg = scene.add.rectangle(0, 0, 200, 100, 0x000000, 0.5);

        this.nameText = scene.add.text(-90, -40, name, { fontSize: '18px' });
        const fixedText = scene.add.text(-90, -20, '環境破壊レベル：', { fontSize: '16px', color: '#000000' });
        const fixedText2 = scene.add.text(-70, 0, '✕', { fontSize: '16px', color: '#000000' });
        
        this.wasteIcon = scene.add.text(-90, 25, '', { fontSize: '20px' });
        this.oceanPollutionIcon = scene.add.text(-70, 25, '', { fontSize: '20px' });
        this.deforestationIcon = scene.add.text(-50, 25, '', { fontSize: '20px' });
        this.animalProtectionIcon = scene.add.text(-90, 20, '', { fontSize: '20px' });

        this.HPText = scene.add.text(40, -22, '', { fontSize: '18px', color: '#000000' });
        this.handInfo = scene.add.text(-55, -1, '5', { fontSize: '18px', color: '#000000' });
  
        const cardIcon = scene.add.graphics();
        cardIcon.setPosition(-80, 6);
        cardIcon.fillStyle(0xffffff, 1);
        cardIcon.fillRoundedRect(-10, -10, 16, 22, 3);
        cardIcon.lineStyle(1, 0x000000, 1);
        cardIcon.strokeRoundedRect(-10, -10, 16, 22, 3);

        this.setData('HP', 0);
        this.waste = false;
        this.oceanPollution = false;
        this.deforestation = false;
        this.animalProtection = false;
        this.add([
            bg, 
            this.nameText, 
            fixedText, 
            fixedText2, 
            this.HPText, 
            this.handInfo, 
            cardIcon,
            this.wasteIcon,
            this.oceanPollutionIcon,
            this.deforestationIcon,
            this.animalProtectionIcon
        ]);

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

    addInterference(id: string, target: StatusWindow){
        switch(id){
            case 'waste':
                target.waste = true;
                target.wasteIcon.setText('🚮');
                break;
            case 'ocean-pollution':
                target.oceanPollution = true;
                target.oceanPollutionIcon.setText('🌊');
                break;
            case 'deforestation':
                target.deforestation = true;
                target.deforestationIcon.setText('🌳');
                break;
    }
    console.log(target.waste, target.oceanPollution, target.deforestation, target.animalProtection);
    }
}