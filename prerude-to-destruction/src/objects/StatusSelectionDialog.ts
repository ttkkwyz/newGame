import * as Phaser from 'phaser';

export class StatusSelectionDialog extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, options: string[], onSelect: (selected: string) => void) {
        super(scene, scene.cameras.main.centerX, scene.cameras.main.centerY);

        scene.tweens.pauseAll();
        scene.time.paused = true;

        // 半透明の背景（画面全体を覆って他を触らせない「モーダル」効果）
        const blocker = scene.add.rectangle(0, 0, scene.cameras.main.width, scene.cameras.main.height, 0x000000, 0.5);
        blocker.setInteractive(); // 下の要素をクリックさせない

        // ダイアログの枠
        const bg = scene.add.rectangle(0, 0, 300, 200, 0x333333).setStrokeStyle(2, 0xffffff);
        const title = scene.add.text(0, -70, 'バイオスフェア', { fontSize: '18px' }).setOrigin(0.5);

        this.add([blocker, bg, title]);

        // 選択肢ボタンを動的に作成
        options.forEach((stateName, index) => {
            const btn = scene.add.container(0, -20 + (index * 50));
            const btnBg = scene.add.rectangle(0, 0, 200, 40, 0x666666).setInteractive();
            const btnText = scene.add.text(0, 0, stateName.toUpperCase(), { fontSize: '16px' }).setOrigin(0.5);
            
            btn.add([btnBg, btnText]);

            // ボタンクリック時の処理
            btnBg.on('pointerdown', () => {
                scene.tweens.resumeAll();
                scene.time.paused = false;
                
                onSelect(stateName); // 選択された値を返す
                this.destroy();      // ダイアログを消す
            });

            this.add(btn);
        });

        scene.add.existing(this);
    }
}