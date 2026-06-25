import * as Phaser from 'phaser';
import { StatusSelectionDialog } from './StatusSelectionDialog';
import { Card } from './Card';

export class StatusWindow extends Phaser.GameObjects.Container {
    private nameText: Phaser.GameObjects.Text;
    private HPText: Phaser.GameObjects.Text;
    private handInfo: Phaser.GameObjects.Text;
    private pollution10Icon: Phaser.GameObjects.Image;
    private pollution10Text: Phaser.GameObjects.Text;
    private pollution15Icon: Phaser.GameObjects.Image;
    private pollution15Text: Phaser.GameObjects.Text;
    private wasteIcon: Phaser.GameObjects.Image;
    private oceanPollutionIcon: Phaser.GameObjects.Image;
    private deforestationIcon: Phaser.GameObjects.Image;
    private animalProtectionIcon: Phaser.GameObjects.Image;

    public waste: boolean;
    public oceanPollution: boolean;
    public deforestation: boolean;
    public animalProtection: boolean;
    public pollution10: number;
    public pollution15: number;
    public turnCount: number;
    public isDead: boolean;
    public animalImage: '0' | '1' | '2';

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
        
        this.pollution10Icon = scene.add.image(-80, 45, 'pollution-10');
        this.pollution10Icon.setScale(0.03);
        this.pollution10Icon.setVisible(false);
        this.pollution10Text = scene.add.text(-55, 40, '', { fontSize: '20px', color: '#000000' });

        this.pollution15Icon = scene.add.image(0, 45, 'pollution-15');
        this.pollution15Icon.setScale(0.03);
        this.pollution15Icon.setVisible(false);
        this.pollution15Text = scene.add.text(25, 40, '', { fontSize: '20px', color: '#000000' });
        
        this.wasteIcon = scene.add.image(-10, 10, 'waste');
        this.wasteIcon.setScale(0.03);
        this.wasteIcon.setVisible(false);
        
        this.oceanPollutionIcon = scene.add.image(15, 10, 'ocean-pollution');
        this.oceanPollutionIcon.setScale(0.03);
        this.oceanPollutionIcon.setVisible(false);
        
        this.deforestationIcon = scene.add.image(40, 10, 'deforestation');
        this.deforestationIcon.setScale(0.03);
        this.deforestationIcon.setVisible(false);
        
        this.animalProtectionIcon = scene.add.image(80, -30, 'animal-protection-1');
        this.animalProtectionIcon.setScale(0.03);
        this.animalProtectionIcon.setVisible(false);

        this.HPText = scene.add.text(40, -22, '', { fontSize: '18px', color: '#000000' });
        this.handInfo = scene.add.text(-55, -1, '5', { fontSize: '18px', color: '#000000' });
  
        // const cardIcon = scene.add.graphics();
        // cardIcon.setPosition(-80, 6);
        // cardIcon.fillStyle(0xffffff, 1);
        // cardIcon.fillRoundedRect(-10, -10, 16, 22, 3);
        // cardIcon.lineStyle(1, 0x000000, 1);
        // cardIcon.strokeRoundedRect(-10, -10, 16, 22, 3);

        const cardIcon = scene.add.image(-80, 6, 'back');
        cardIcon.setScale(0.025);

        this.setData('HP', 0);
        this.waste = false;
        this.oceanPollution = false;
        this.deforestation = false;
        this.animalProtection = false;
        this.pollution10 = 0;
        this.pollution15 = 0;
        this.turnCount = 0;
        this.isDead = false;
        this.animalImage = '0';
        this.add([
            bg, 
            this.nameText, 
            fixedText, 
            fixedText2, 
            this.HPText, 
            this.handInfo, 
            cardIcon,
            this.pollution10Icon,
            this.pollution10Text,
            this.pollution15Icon,
            this.pollution15Text,
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
                target.pollution10Icon.setVisible(true);
                target.pollution10Text.setText("+" + target.pollution10.toString());
                break;
            case 'pollution-15':
                target.pollution15 += 15;
                target.pollution15Icon.setVisible(true);
                target.pollution15Text.setText("+" + target.pollution15.toString());
                break;
        }
    }

    addInterference(id: string, target: StatusWindow){
        switch(id){
            case 'waste':
                target.waste = true;
                target.wasteIcon.setVisible(true);
                break;
            case 'ocean-pollution':
                target.oceanPollution = true;
                target.oceanPollutionIcon.setVisible(true);
                break;
            case 'deforestation':
                target.deforestation = true;
                target.deforestationIcon.setVisible(true);
                break;
    }
    }

    regreenStatus(id: string, target: StatusWindow){
        switch(id){
            case 'waste-treatment':
                target.waste = false;
                target.wasteIcon.setVisible(false);
                break;
            case 'waste':
                target.waste = false;
                target.wasteIcon.setVisible(false);
                break;
            case 'waste-water-treatment':
                target.oceanPollution = false;
                target.oceanPollutionIcon.setVisible(false);
                break;
            case 'ocean-pollution':
                target.oceanPollution = false;
                target.oceanPollutionIcon.setVisible(false);
                break;
            case 'planting':
                target.deforestation = false;
                target.deforestationIcon.setVisible(false);
                break;
            case 'deforestation':
                target.deforestation = false;
                target.deforestationIcon.setVisible(false);
                break;
            case 'pollution10':
                target.pollution10 -= 10;
                if(target.pollution10 <= 0){
                    target.pollution10Icon.setVisible(false);
                } else {
                    target.pollution10Text.setText("+" + target.pollution10.toString());
                }
                break;
            case 'pollution15':
                target.pollution15 -= 15;
                if(target.pollution15 <= 0){
                    target.pollution15Icon.setVisible(false);
                } else {
                    target.pollution15Text.setText("+" + target.pollution15.toString());
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
        player: boolean,
        onComplete: (selected: string) => void
    ) {
        const activeStatus = this.getActiveStatus();

        if(activeStatus.length === 0) return;

        if(activeStatus.length === 1){
            this.regreenStatus(activeStatus[0], target);
            onComplete(activeStatus[0]);
        } else {
            if(player){
                new StatusSelectionDialog(
                    this.scene as Phaser.Scene, 
                    activeStatus, 
                    (selected: string) => {
                        this.regreenStatus(selected, target);
                        onComplete(selected);
                    }
                );
            } else {
                if(target.waste){
                    this.regreenStatus('waste', target);
                    onComplete('waste');
                    return;
                } else if(target.oceanPollution){
                    this.regreenStatus('ocean-pollution', target);
                    onComplete('ocean-pollution');
                } else if(target.deforestation){
                    this.regreenStatus('deforestation', target);
                    onComplete('deforestation');
                } else if(target.pollution15 > 0){
                    this.regreenStatus('pollution-15', target);
                    onComplete('pollution-15');
                } else if(target.pollution10 > 0){
                    this.regreenStatus('pollution-10', target);
                    onComplete('pollution-10');
                }
            }
        }
    }

    protectAnimal(target: StatusWindow, card: Card){
        target.animalProtection = true;
        if(card.getData('id') === 'animal-protection-1'){
            target.animalImage = '1';
            target.animalProtectionIcon.setTexture('animal-protection-1');
            target.animalProtectionIcon.setVisible(true);
        } else if(card.getData('id') === 'animal-protection-2'){
            target.animalImage = '2';
            target.animalProtectionIcon.setTexture('animal-protection-2');
            target.animalProtectionIcon.setVisible(true);
        }
    }

    poachAnimal(target: StatusWindow){
        target.animalProtection = false;
        target.animalImage = '0';
        target.animalProtectionIcon.setVisible(false);
    }
}