import * as Phaser from 'phaser';
import { StatusSelectionDialog } from './StatusSelectionDialog';

export class StatusWindow extends Phaser.GameObjects.Container {
    private nameText: Phaser.GameObjects.Text;
    // private fixedText: Phaser.GameObjects.Text;
    private HPText: Phaser.GameObjects.Text;
    private handInfo: Phaser.GameObjects.Text;
    private pollution10Icon: Phaser.GameObjects.Text;
    private pollution15Icon: Phaser.GameObjects.Text;
    private wasteIcon: Phaser.GameObjects.Text;
    private oceanPollutionIcon: Phaser.GameObjects.Text;
    private deforestationIcon: Phaser.GameObjects.Text;
    private animalProtectionIcon: Phaser.GameObjects.Text;

    public waste: boolean;
    public oceanPollution: boolean;
    public deforestation: boolean;
    public animalProtection: boolean;
    public pollution10: number;
    public pollution15: number;
    public turnCount: number;
    public isDead: boolean;

    constructor(
        scene: Phaser.Scene, 
        x: number, 
        y: number, 
        name: string
    ) {
        
        super(scene, x, y);

        const bg = scene.add.rectangle(0, 10, 200, 120, 0x000000, 0.5);

        this.nameText = scene.add.text(-90, -40, name, { fontSize: '18px' });
        const fixedText = scene.add.text(-90, -20, '環境破壊レベル：', { fontSize: '16px', color: '#000000' });
        const fixedText2 = scene.add.text(-70, 0, '✕', { fontSize: '16px', color: '#000000' });
        
        this.pollution10Icon = scene.add.text(-90, 25, '', { fontSize: '16px' });
        this.pollution15Icon = scene.add.text(-90, 45, '', { fontSize: '16px' });
        this.wasteIcon = scene.add.text(-10, 0, '', { fontSize: '20px' });
        this.oceanPollutionIcon = scene.add.text(15, 0, '', { fontSize: '20px' });
        this.deforestationIcon = scene.add.text(40, 0, '', { fontSize: '20px' });
        this.animalProtectionIcon = scene.add.text(70, -40, '', { fontSize: '20px' });

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
        this.pollution10 = 0;
        this.pollution15 = 0;
        this.turnCount = 0;
        this.isDead = false;
        this.add([
            bg, 
            this.nameText, 
            fixedText, 
            fixedText2, 
            this.HPText, 
            this.handInfo, 
            cardIcon,
            this.pollution10Icon,
            this.pollution15Icon,
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

    addPollution(id: string, target: StatusWindow){
        switch(id){
            case 'pollution-10':
                target.pollution10 += 10;
                target.pollution10Icon.setText("フロンガス　+" + target.pollution10.toString());
                break;
            case 'pollution-15':
                target.pollution15 += 15;
                target.pollution15Icon.setText("放射能　+" + target.pollution15.toString());
                break;
        }
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
    }

    regreenStatus(id: string, target: StatusWindow){
        switch(id){
            case 'waste-treatment':
                target.waste = false;
                target.wasteIcon.setText('');
                break;
            case 'waste':
                target.waste = false;
                target.wasteIcon.setText('');
                break;
            case 'waste-water-treatment':
                target.oceanPollution = false;
                target.oceanPollutionIcon.setText('');
                break;
            case 'ocean-pollution':
                target.oceanPollution = false;
                target.oceanPollutionIcon.setText('');
                break;
            case 'planting':
                target.deforestation = false;
                target.deforestationIcon.setText('');
                break;
            case 'deforestation':
                target.deforestation = false;
                target.deforestationIcon.setText('');
                break;
            case 'pollution10':
                target.pollution10 -= 10;
                if(target.pollution10 <= 0){
                    target.pollution10Icon.setText('');
                } else {
                    target.pollution10Icon.setText("+" + target.pollution10.toString());
                }
                break;
            case 'pollution15':
                target.pollution15 -= 15;
                if(target.pollution15 <= 0){
                    target.pollution15Icon.setText('');
                } else {
                    target.pollution15Icon.setText("+" + target.pollution15.toString());
                }
                break;
        }
    }

    getActiveStatus(): string[] {
        const activeStatus: string[] = [];
        if(this.waste){
            activeStatus.push('waste');
        }
        if(this.oceanPollution){
            activeStatus.push('ocean-pollution');
        }
        if(this.deforestation){
            activeStatus.push('deforestation');
        }
        if(this.pollution10 > 0){
            activeStatus.push('pollution-10');
        }
        if(this.pollution15 > 0){
            activeStatus.push('pollution-15');
        }
        return activeStatus;
    }

    biosphereStatus(
        target: StatusWindow, 
        onComplete: (selected: string) => void
    ) {
        const activeStatus = this.getActiveStatus();

        if(activeStatus.length === 0) return;

        if(activeStatus.length === 1){
            this.regreenStatus(activeStatus[0], target);
            onComplete(activeStatus[0]);
        } else {
            new StatusSelectionDialog(
                this.scene as Phaser.Scene, 
                activeStatus, 
                (selected: string) => {
                this.regreenStatus(selected, target);
                onComplete(selected);
                }
            );
        }
    }

    protectAnimal(target: StatusWindow){
        target.animalProtection = true;
        target.animalProtectionIcon.setText('🐻');
    }

    poachAnimal(target: StatusWindow){
        target.animalProtection = false;
        target.animalProtectionIcon.setText('');
    }
}