import { StatusWindow } from "../../objects/StatusWindow";
import { Card } from "../../objects/Card";
import { CardType } from "../constants/CardConfig";

export class Effect {
    private scene: Phaser.Scene;
    private glowEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
    private glowBg: Phaser.GameObjects.Rectangle | null = null;
    private glowTween: Phaser.Tweens.Tween | null = null;

    constructor(scene: Phaser.Scene){
        this.scene = scene;
    }

    showEffect(target: StatusWindow, card: Card){
        const type = card.getData('type') as CardType;
        const value = card.getData('value') as number;
        let color = '#000000';
    
        switch(type){
            case 'recovery':
                color = '#00ff00';
                break;
            case 'pollution':
                color = '#ff0000';
                break;
        }
    
        const text = target.scene.add.text(
            target.x, 
            target.y - 20, 
            `${value.toString()}`, 
            {
                fontSize: '30px',
                color: color,
                stroke: '#ffffff',
                strokeThickness: 2,
            }
        ).setOrigin(0.5);
    
        text.setDepth(500);
    
        target.scene.tweens.add({
            targets: text,
            y: target.y - 40,
            alpha: 0,
            duration: 800,
            ease: 'Cubic.out',
            onComplete: () => {
                text.destroy();
            }
        });
    }

    showExplosionEffect(target: StatusWindow) {
        const explosion = target.scene.add.image(target.x, target.y, 'explosion');
        explosion.setScale(0.15);
        explosion.setDepth(600);
        explosion.setTint(0xffaa00);
        explosion.setBlendMode('ADD');
        explosion.setDepth(600);
        explosion.setAlpha(0);
        
        target.scene.tweens.add({
            targets: explosion,
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                explosion.destroy();
            }
        });
    }

    showHealSparkleEffect(target: StatusWindow) {
        const sparkles = target.scene.add.particles(target.x, target.y, '__white', {
            x: { min: -60, max: 60 },
            y: { min: -10, max: 10 },
    
            lifespan: { min: 600, max: 1000 },
            speedY: { min: -80, max: -40 },
            speedX: { min: -20, max: 20 },
            scale: { start: 1, end: 0 },
            tint: [0x00ff00, 0x77ff00, 0xaaffaa],
            
            blendMode: 'ADD',
            emitting: false
        });
    
        sparkles.setDepth(600);
    
        sparkles.explode(30);
    
        target.scene.time.delayedCall(1000, () => {
            sparkles.destroy();
        });
    }

    showRifleEffect(target: StatusWindow) {
        const rifle = target.scene.add.image(target.x, target.y, 'rifle');
        rifle.setDepth(600);
        rifle.setBlendMode('ADD');
        rifle.setDepth(600);
        rifle.setAlpha(0);
        
        target.scene.tweens.add({
            targets: rifle,
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                rifle.destroy();
            }
        });
    }

    // startGuidance(x: number, y: number, width: number, height: number) {
    //     this.stopGuidance();
  
    //     this.glowBg = this.scene.add.rectangle(x, y, width, height, 0xffffff);
    //     this.glowBg.setDepth(90); 
    //     const glowEffect = (this.glowBg as any).postFX.addGlow(0xffffff, 0, 0);
    //     this.glowTween = this.scene.tweens.add({
    //         targets: glowEffect,
    //         distance: 12,
    //         duration: 1200,
    //         yoyo: true,
    //         loop: -1,
    //         ease: 'Sine.easeInOut'
    //     });
    // }

    // stopGuidance() {
    //     if (this.glowTween) {
    //         this.glowTween.remove();
    //         this.glowTween = null;
    //     }

    //     if (this.glowBg) {
    //         this.glowBg.destroy();
    //         this.glowBg = null;
    //     }
    // }

    
}
