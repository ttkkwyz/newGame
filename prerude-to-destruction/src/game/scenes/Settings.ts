import { Scene, GameObjects } from "phaser";

export class Settings extends Scene {
    private selectedCpuCount: number = 3; 
    private cpuStrengths: number[] = [2, 2, 2, 2, 2];
    
    private radioButtons: { 
        count: number, 
        bg: Phaser.GameObjects.Rectangle, 
        dot: Phaser.GameObjects.Rectangle 
    }[] = [];
    private playerNameInput: Phaser.GameObjects.DOMElement;
    private strengthContainers: Phaser.GameObjects.Container[] = [];
    private background: GameObjects.Image;
    constructor() {
        super('Settings');
    }

    create() {
        this.background = this.add.image(512, 384, 'settings-bg');
        const { width, height } = this.cameras.main;

        this.add.text(width / 2, 120, 'GAME SETTING', {
            fontSize: '32px', 
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(
            width / 2, 
            160, 
            'プレイヤーの名前を入力してください', 
            { fontSize: '20px', color: '#000000' }
        ).setOrigin(0.5);
        this.playerNameInput = this.add.dom(width / 2 - 50, 200, 'input').setOrigin(0.5);

        const inputElement = this.playerNameInput.node as HTMLInputElement;
        inputElement.placeholder = 'あなた';
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

        this.add.text(
            width / 2, 
            height / 2 - 100, 
            'CPUの人数を選択してください', 
            { fontSize: '20px', color: '#000000' }
        ).setOrigin(0.5);

        const options = [
            { count: 1, x: width / 2 - 300 },
            { count: 2, x: width / 2 - 150},
            { count: 3, x: width / 2 },
            { count: 4, x: width / 2 + 150 },
            { count: 5, x: width / 2 + 300 }
        ];

        options.forEach(opt => {
            const btnContainer = this.add.container(opt.x, height / 2);
            const bgCircle = this.add.rectangle(0, -50, 100, 50, 0x333333)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive({ useHandCursor: true });
            const dot = this.add.rectangle(0, -50, 100, 50, 0x0055aa)
            .setVisible(opt.count === this.selectedCpuCount);
            const text = this.add.text(
                0, 
                -50, 
                `${opt.count}人`, 
                { fontSize: '18px' }
            ).setOrigin(0.5);

            btnContainer.add([bgCircle, dot, text]);

            this.radioButtons.push({ count: opt.count, bg: bgCircle, dot: dot });

            bgCircle.on('pointerdown', () => {
                this.selectedCpuCount = opt.count;
                this.updateRadioButtons(opt.count);
                this.createStrengthSettings();
            });
        });

        this.createStrengthSettings();

        const startBtn = this.add.text(width / 2, height * 0.8, 'ゲーム開始', {
            fontSize: '28px',
            backgroundColor: '#0055aa',
            padding: { x: 40, y: 15 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        startBtn.on('pointerdown', () => {
            let name = inputElement.value.trim();

            if(name === ''){
                name = 'あなた';
            }

            const strengthsToSend = this.cpuStrengths.slice(0, this.selectedCpuCount);

            this.scene.start('Game', { 
                cpuCount: this.selectedCpuCount,
                cpuStrengths: strengthsToSend,
                playerName: name 
            });
        });
    }

    private createStrengthSettings() {
        const { width, height } = this.cameras.main;

        this.strengthContainers.forEach(container => {
            container.destroy();
        });
        this.strengthContainers = [];

        for(let i = 0; i < this.selectedCpuCount; i++){
            const yPos = height / 2 + (i * 45);
            const container = this.add.container(width / 2, yPos);

            const label = this.add.text(
                -120, 
                0, 
                `CPU${i+1}`, 
                { fontSize: '18px', color: '#000000' }
            ).setOrigin(0.5);
            container.add(label);

            [1, 2, 3].forEach(level => {
                const btnX = 50 + (level * 60);
                const btnBg = this.add.rectangle(btnX, 0, 50, 30, 0x333333)
                .setStrokeStyle(1, 0xffffff)
                .setInteractive({ useHandCursor: true });
                const btnText = this.add.text(
                    btnX, 
                    0, 
                    `Lv.${level}`, 
                    { fontSize: '14px', color: '#ccc' }
                ).setOrigin(0.5);

                if(this.cpuStrengths[i] === level){
                    btnBg.setFillStyle(0x0055aa);
                }

                container.add([btnBg, btnText]);

                btnBg.on('pointerdown', () => {
                    this.cpuStrengths[i] = level;
                    this.createStrengthSettings();
                });
            });

            this.strengthContainers.push(container);
        }
    }

    private updateRadioButtons(chosenCount: number) {
        this.selectedCpuCount = chosenCount;

        this.radioButtons.forEach(btn => {
            btn.dot.setVisible(btn.count === chosenCount);
        });
    }
}