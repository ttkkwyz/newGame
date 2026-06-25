import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game, WEBGL } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { Rules } from './scenes/Rules';
import { Credit } from './scenes/Credit';
import { Settings } from './scenes/Settings';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: WEBGL,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#ffffff',
    dom: {
        createContainer: true
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Rules,
        Credit,
        Settings,
        MainGame,
        GameOver
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
