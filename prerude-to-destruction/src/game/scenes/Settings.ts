import { Scene } from "phaser";

export class Settings extends Scene {
    private selectedCpuCount: number = 3; 
    private radioButtons: { 
        count: number, 
        bg: Phaser.GameObjects.Rectangle, 
        dot: Phaser.GameObjects.Rectangle 
    }[] = [];
    private playerNameInput: Phaser.GameObjects.DOMElement;

    constructor() {
        super('Settings');
    }

    create() {
        const { width, height } = this.cameras.main;

        this.add.text(width / 2, 100, 'GAME SETTING', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);

        this.add.text(width / 2, 140, 'プレイヤーの名前を入力してください', { fontSize: '20px', color: '#ccc' }).setOrigin(0.5);
        this.playerNameInput = this.add.dom(width / 2, 180, 'input').setOrigin(0.5);

        const inputElement = this.playerNameInput.node as HTMLInputElement;
        inputElement.placeholder = 'プレイヤーの名前';
        inputElement.type = 'text';
        
        inputElement.style.width = '250px';
        inputElement.style.height = '40px';
        inputElement.style.border = '1px solid #ccc';
        inputElement.style.borderRadius = '5px';
        inputElement.style.padding = '5px';
        inputElement.style.fontSize = '20px';
        inputElement.style.color = '#ccc';
        inputElement.style.backgroundColor = '#fff';
        inputElement.style.textAlign = 'center';

        this.add.text(width / 2, height / 2-50, 'CPUの人数を選択してください', { fontSize: '20px', color: '#ccc' }).setOrigin(0.5);

        const options = [
            { count: 1, x: width / 2 - 300 },
            { count: 2, x: width / 2 - 150},
            { count: 3, x: width / 2 },
            { count: 4, x: width / 2 + 150 },
            { count: 5, x: width / 2 + 300 }
        ];

        options.forEach(opt => {
            const btnContainer = this.add.container(opt.x, height / 2);
            const bgCircle = this.add.rectangle(0, 0, 100, 50, 0x333333).setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true });
            const dot = this.add.rectangle(0, 0, 100, 50, 0xcccccc).setVisible(opt.count === this.selectedCpuCount);
            const text = this.add.text(0, 0, `${opt.count}人`, { fontSize: '18px' }).setOrigin(0.5);

            btnContainer.add([bgCircle, dot, text]);

            this.radioButtons.push({ count: opt.count, bg: bgCircle, dot: dot });

            bgCircle.on('pointerdown', () => {
                this.updateRadioButtons(opt.count);
            });
        });

        const startBtn = this.add.text(width / 2, height * 0.75, 'ゲーム開始', {
            fontSize: '28px',
            backgroundColor: '#00aa00',
            padding: { x: 40, y: 15 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        startBtn.on('pointerdown', () => {
            let name = inputElement.value.trim();

            if(name === ''){
                name = 'あなた';
            }

            this.scene.start('Game', { 
                cpuCount: this.selectedCpuCount,
                playerName: name 
            });
        });
    }

    private updateRadioButtons(chosenCount: number) {
        this.selectedCpuCount = chosenCount;

        this.radioButtons.forEach(btn => {
            btn.dot.setVisible(btn.count === chosenCount);
        });
    }
}