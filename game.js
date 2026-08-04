// game.js — Phaser Game Configuration & Boot
// =============================================
// Entry point for the Phaser engine. Registers all scenes
// and starts the game with the MenuScene.

const GAME_WIDTH  = 960;
const GAME_HEIGHT = 540;

// Global shared game state (passed between scenes via registry)
const GameState = {
  mode:        null,  // '1p' or '2p'
  p1Power:     null,  // power object chosen by P1
  p2Power:     null,  // power object chosen by P2/CPU
  p1Wins:      0,
  p2Wins:      0,
  roundNumber: 1,
  maxRounds:   3,     // best of 3
};

const config = {
  type: Phaser.AUTO,
  width:  GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  transparent: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  dom: {
    createContainer: true
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [
    MenuScene,
    ModeScene,
    PowerScene,
    BattleScene,
    ResultScene,
    SettingsScene,
  ]
};

const game = new Phaser.Game(config);
