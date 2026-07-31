// scenes/ModeScene.js — Mode Select (1P vs 2P)
// ==============================================

class ModeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ModeScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // ── Background ──────────────────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x12102a, 0x12102a, 1);
    bg.fillRect(0, 0, W, H);

    // ── Title ───────────────────────────────────────────────────────────
    this.add.text(W / 2, 70, 'SELECT MODE', {
      fontFamily: 'Bangers, sans-serif',
      fontSize:   '54px',
      color:      '#ffffff',
      stroke:     '#6366f1',
      strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(W / 2, 125, 'Pilih mode permainan sebelum bertarung', {
      fontFamily: 'Inter, sans-serif',
      fontSize:   '16px',
      color:      '#94a3b8',
    }).setOrigin(0.5);

    // ── Mode cards ───────────────────────────────────────────────────────
    const cards = [
      {
        mode:  '1p',
        title: '1 PLAYER',
        sub:   'vs CPU',
        desc:  'Lawan AI bot yang semakin\nagressif saat HP-nya rendah',
        icon:  '🤖',
        x:     W / 2 - 200,
        color: 0x6366f1,
      },
      {
        mode:  '2p',
        title: '2 PLAYERS',
        sub:   'Local Versus',
        desc:  'Duel bareng teman di\nsatu keyboard yang sama',
        icon:  '⚔️',
        x:     W / 2 + 200,
        color: 0xf59e0b,
      },
    ];

    const cardY = H / 2 + 20;
    const cW    = 260;
    const cH    = 240;

    for (const card of cards) {
      const gfx = this.add.graphics();
      this._drawCard(gfx, card.x - cW / 2, cardY - cH / 2, cW, cH, card.color, false);

      // Icon
      this.add.text(card.x, cardY - 80, card.icon, { fontSize: '48px' }).setOrigin(0.5);

      // Title
      this.add.text(card.x, cardY - 15, card.title, {
        fontFamily: 'Bangers, sans-serif',
        fontSize:   '34px',
        color:      '#ffffff',
      }).setOrigin(0.5);

      // Sub
      this.add.text(card.x, cardY + 25, card.sub, {
        fontFamily: 'Inter, sans-serif',
        fontSize:   '13px',
        color:      '#94a3b8',
      }).setOrigin(0.5);

      // Desc
      this.add.text(card.x, cardY + 65, card.desc, {
        fontFamily: 'Inter, sans-serif',
        fontSize:   '12px',
        color:      '#64748b',
        align:      'center',
      }).setOrigin(0.5);

      // Invisible button
      const zone = this.add.zone(card.x, cardY, cW, cH).setInteractive({ cursor: 'pointer' });
      zone.on('pointerover', () => {
        this._drawCard(gfx, card.x - cW / 2, cardY - cH / 2, cW, cH, card.color, true);
      });
      zone.on('pointerout', () => {
        this._drawCard(gfx, card.x - cW / 2, cardY - cH / 2, cW, cH, card.color, false);
      });
      zone.on('pointerdown', () => {
        GameState.mode = card.mode;
        this.cameras.main.fadeOut(250, 10, 10, 26);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('PowerScene');
        });
      });
    }

    // Back button
    const back = this.add.text(W / 2, H - 40, '← Back to Menu', {
      fontFamily: 'Inter, sans-serif',
      fontSize:   '15px',
      color:      '#475569',
    }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
    back.on('pointerover', () => back.setColor('#94a3b8'));
    back.on('pointerout',  () => back.setColor('#475569'));
    back.on('pointerdown', () => {
      this.cameras.main.fadeOut(250, 10, 10, 26);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });

    this.cameras.main.fadeIn(300, 10, 10, 26);
  }

  _drawCard(gfx, x, y, w, h, color, hovered) {
    gfx.clear();
    if (hovered) {
      gfx.fillStyle(color, 0.25);
      gfx.lineStyle(2, color, 1);
    } else {
      gfx.fillStyle(0x1e1b4b, 0.8);
      gfx.lineStyle(2, color, 0.4);
    }
    gfx.fillRoundedRect(x, y, w, h, 16);
    gfx.strokeRoundedRect(x, y, w, h, 16);
    if (hovered) {
      gfx.lineStyle(10, color, 0.15);
      gfx.strokeRoundedRect(x - 5, y - 5, w + 10, h + 10, 20);
    }
  }
}
