// scenes/ResultScene.js — Match Result Screen
// =============================================
// Shows the overall match winner after best-of-3 rounds.
// Buttons: "Main Lagi" → ModeScene, "Ganti Power" → PowerScene.

class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // ── Background ──────────────────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x12102a, 0x12102a, 1);
    bg.fillRect(0, 0, W, H);

    // Confetti particles (decorative)
    this._confetti = [];
    for (let i = 0; i < 60; i++) {
      this._confetti.push({
        x:     Phaser.Math.FloatBetween(0, W),
        y:     Phaser.Math.FloatBetween(-H, 0),
        vy:    Phaser.Math.FloatBetween(60, 160),
        vx:    Phaser.Math.FloatBetween(-30, 30),
        size:  Phaser.Math.FloatBetween(4, 10),
        color: Phaser.Utils.Array.GetRandom([0xffcc00, 0x7ecfff, 0xff8888, 0xaa44ff, 0x22c55e]),
        rot:   Math.random() * Math.PI * 2,
        rotV:  Phaser.Math.FloatBetween(-3, 3),
      });
    }
    this._confettiGfx = this.add.graphics();

    // ── Determine winner ─────────────────────────────────────────────────
    const maxWins = Math.ceil(GameState.maxRounds / 2);
    let winner  = 'draw';
    let winText = 'IT\'S A DRAW!';
    let winCol  = '#ffcc00';
    let winSub  = 'Luar biasa — kalian setara!';

    if (GameState.p1Wins >= maxWins) {
      winner  = 'p1';
      winText = 'PLAYER 1\nWINS!';
      winCol  = '#7ecfff';
      winSub  = `Dominasi total! ${GameState.p1Wins} – ${GameState.p2Wins}`;
    } else if (GameState.p2Wins >= maxWins) {
      winner  = 'p2';
      winText = GameState.mode === '1p' ? 'CPU\nWINS!' : 'PLAYER 2\nWINS!';
      winCol  = '#ff8888';
      winSub  = `Mengesankan! ${GameState.p2Wins} – ${GameState.p1Wins}`;
    }

    // ── Trophy icon ──────────────────────────────────────────────────────
    this.add.text(W / 2, 110, winner === 'draw' ? '🤝' : '🏆', {
      fontSize: '80px',
    }).setOrigin(0.5).setAlpha(0);
    // Animate in
    const trophy = this.add.text(W / 2, 110, winner === 'draw' ? '🤝' : '🏆', {
      fontSize: '80px',
    }).setOrigin(0.5).setScale(0);
    this.tweens.add({
      targets:  trophy,
      scaleX:   1, scaleY: 1,
      duration: 600,
      delay:    200,
      ease:     'Back.easeOut',
    });

    // ── Winner text ───────────────────────────────────────────────────────
    const wt = this.add.text(W / 2, 235, winText, {
      fontFamily: 'Bangers, sans-serif',
      fontSize:   '72px',
      color:      winCol,
      stroke:     '#000000',
      strokeThickness: 6,
      align:      'center',
      shadow: { offsetX: 0, offsetY: 0, color: winCol, blur: 40, fill: true },
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: wt, alpha: 1, duration: 500, delay: 400 });

    // Sub-text
    const sub = this.add.text(W / 2, 320, winSub, {
      fontFamily: 'Inter, sans-serif',
      fontSize:   '20px',
      color:      '#94a3b8',
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: sub, alpha: 1, duration: 400, delay: 700 });

    // ── Round score dots ──────────────────────────────────────────────────
    const dotGfx = this.add.graphics();
    const dotY   = 360;
    const dotR   = 9;
    const maxW   = Math.ceil(GameState.maxRounds / 2);

    for (let i = 0; i < maxW; i++) {
      if (i < GameState.p1Wins) {
        dotGfx.fillStyle(0x7ecfff, 1);
        dotGfx.fillCircle(W / 2 - 80 - i * 24, dotY, dotR);
      } else {
        dotGfx.lineStyle(2, 0x7ecfff, 0.3);
        dotGfx.strokeCircle(W / 2 - 80 - i * 24, dotY, dotR);
      }
    }
    this.add.text(W / 2, dotY, 'vs', {
      fontFamily: 'Bangers, sans-serif', fontSize: '22px', color: '#475569',
    }).setOrigin(0.5);
    for (let i = 0; i < maxW; i++) {
      if (i < GameState.p2Wins) {
        dotGfx.fillStyle(0xff8888, 1);
        dotGfx.fillCircle(W / 2 + 80 + i * 24, dotY, dotR);
      } else {
        dotGfx.lineStyle(2, 0xff8888, 0.3);
        dotGfx.strokeCircle(W / 2 + 80 + i * 24, dotY, dotR);
      }
    }

    // ── Buttons ───────────────────────────────────────────────────────────
    const btns = [
      { label: '🔁  Main Lagi',    scene: 'ModeScene',  x: W / 2 - 140, col: 0x6366f1 },
      { label: '⚡  Ganti Power',  scene: 'PowerScene', x: W / 2 + 140, col: 0xf59e0b },
    ];

    for (const btn of btns) {
      const bW  = 230;
      const bH  = 56;
      const bY  = H - 110;
      const gfx = this.add.graphics();

      gfx.fillStyle(btn.col, 0.25);
      gfx.lineStyle(2, btn.col, 0.7);
      gfx.fillRoundedRect(btn.x - bW / 2, bY - bH / 2, bW, bH, 10);
      gfx.strokeRoundedRect(btn.x - bW / 2, bY - bH / 2, bW, bH, 10);

      const t = this.add.text(btn.x, bY, btn.label, {
        fontFamily: 'Bangers, sans-serif',
        fontSize:   '26px',
        color:      '#ffffff',
      }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 400, delay: 900 });

      const zone = this.add.zone(btn.x, bY, bW, bH).setInteractive({ cursor: 'pointer' });
      zone.on('pointerover', () => {
        gfx.clear();
        gfx.fillStyle(btn.col, 0.5);
        gfx.lineStyle(2, btn.col, 1);
        gfx.fillRoundedRect(btn.x - bW / 2, bY - bH / 2, bW, bH, 10);
        gfx.strokeRoundedRect(btn.x - bW / 2, bY - bH / 2, bW, bH, 10);
      });
      zone.on('pointerout', () => {
        gfx.clear();
        gfx.fillStyle(btn.col, 0.25);
        gfx.lineStyle(2, btn.col, 0.7);
        gfx.fillRoundedRect(btn.x - bW / 2, bY - bH / 2, bW, bH, 10);
        gfx.strokeRoundedRect(btn.x - bW / 2, bY - bH / 2, bW, bH, 10);
      });

      const targetScene = btn.scene;
      zone.on('pointerdown', () => {
        // Reset wins for a new match
        GameState.p1Wins     = 0;
        GameState.p2Wins     = 0;
        GameState.roundNumber = 1;
        this.cameras.main.fadeOut(300, 10, 10, 26);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(targetScene);
        });
      });
    }

    this.cameras.main.fadeIn(400, 10, 10, 26);
  }

  update(time, delta) {
    const dt = delta / 1000;
    const H  = this._H || this.scale.height;
    this._confettiGfx.clear();
    for (const c of this._confetti) {
      c.x   += c.vx * dt;
      c.y   += c.vy * dt;
      c.rot += c.rotV * dt;
      if (c.y > this.scale.height + 20) {
        c.y = -20;
        c.x = Phaser.Math.FloatBetween(0, this.scale.width);
      }
      this._confettiGfx.fillStyle(c.color, 0.85);
      this._confettiGfx.fillRect(
        c.x - c.size / 2,
        c.y - c.size / 2,
        c.size, c.size
      );
    }
  }
}
