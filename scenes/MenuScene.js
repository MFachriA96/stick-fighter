// scenes/MenuScene.js — Main Menu Screen
// ========================================

class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Reset win counters on fresh menu visit
    GameState.p1Wins     = 0;
    GameState.p2Wins     = 0;
    GameState.roundNumber = 1;

    // ── Background ────────────────────────────────────────────────────────
    // Deep dark gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x12102a, 0x12102a, 1);
    bg.fillRect(0, 0, W, H);

    // Grid lines for a "arena floor" feel
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x6366f1, 0.06);
    for (let x = 0; x <= W; x += 40) { grid.lineBetween(x, 0, x, H); }
    for (let y = 0; y <= H; y += 40) { grid.lineBetween(0, y, W, y); }

    // ── Title ──────────────────────────────────────────────────────────────
    // Glow shadow layers
    const titleStyle = {
      fontFamily: 'Bangers, sans-serif',
      fontSize:   '80px',
      color:      '#ffffff',
      stroke:     '#6366f1',
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 0, color: '#818cf8', blur: 30, fill: true },
    };
    this.add.text(W / 2, 130, 'STICKMAN', { ...titleStyle, fontSize: '72px' })
      .setOrigin(0.5);
    this.add.text(W / 2, 205, 'COMBO FIGHTER', {
      ...titleStyle,
      fontSize:   '52px',
      color:      '#818cf8',
      stroke:     '#312e81',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Author credit
    this.add.text(W / 2, 245, 'by @fachri_kiyotaka', {
      ...titleStyle,
      fontSize:   '24px',
      color:      '#a5b4fc',
      stroke:     '#312e81',
      strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 0, color: '#6366f1', blur: 15, fill: true },
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(W / 2, 285, 'Best of 3 Rounds • 4 Powers • Combo System', {
      fontFamily: 'Inter, sans-serif',
      fontSize:   '16px',
      color:      '#94a3b8',
    }).setOrigin(0.5);

    // ── Background silhouette stickmen ────────────────────────────────────
    this._bgGfx = this.add.graphics();
    this._bgStickmen = [
      { x: 180, phase: 0,   speed: 0.9,  alpha: 0.06 },
      { x: 780, phase: 1.5, speed: 0.7,  alpha: 0.06 },
      { x: 480, phase: 3.0, speed: 1.1,  alpha: 0.04 },
    ];

    // ── START button ──────────────────────────────────────────────────────
    const btnW  = 220;
    const btnH  = 60;
    const btnX  = W / 2;
    const btnY  = H / 2 + 70;

    const btnGfx = this.add.graphics();
    this._drawBtn(btnGfx, btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, false);

    const btnText = this.add.text(btnX, btnY, 'START GAME', {
      fontFamily: 'Bangers, sans-serif',
      fontSize:   '32px',
      color:      '#ffffff',
      shadow: { offsetX: 0, offsetY: 0, color: '#818cf8', blur: 15, fill: true },
    }).setOrigin(0.5);

    // Invisible hit area
    const hitZone = this.add.zone(btnX, btnY, btnW, btnH).setInteractive({ cursor: 'pointer' });
    hitZone.on('pointerover', () => {
      this._drawBtn(btnGfx, btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, true);
      this.tweens.add({ targets: btnText, scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });
    hitZone.on('pointerout', () => {
      this._drawBtn(btnGfx, btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, false);
      this.tweens.add({ targets: btnText, scaleX: 1, scaleY: 1, duration: 100 });
    });
    hitZone.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 10, 10, 26);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('ModeScene');
      });
    });

    // ── Settings button ───────────────────────────────────────────────────
    const sgW  = 180;
    const sgH  = 44;
    const sgX  = W / 2;
    const sgY  = H / 2 + 148;

    const sgGfx = this.add.graphics();
    this._drawSettingsBtn(sgGfx, sgX - sgW / 2, sgY - sgH / 2, sgW, sgH, false);

    const sgText = this.add.text(sgX, sgY, '⚙  Settings', {
      fontFamily: 'Inter, sans-serif',
      fontSize:   '18px',
      fontStyle:  '600',
      color:      '#94a3b8',
    }).setOrigin(0.5);

    const sgZone = this.add.zone(sgX, sgY, sgW, sgH).setInteractive({ cursor: 'pointer' });
    sgZone.on('pointerover', () => {
      this._drawSettingsBtn(sgGfx, sgX - sgW / 2, sgY - sgH / 2, sgW, sgH, true);
      sgText.setColor('#ffffff');
    });
    sgZone.on('pointerout', () => {
      this._drawSettingsBtn(sgGfx, sgX - sgW / 2, sgY - sgH / 2, sgW, sgH, false);
      sgText.setColor('#94a3b8');
    });
    sgZone.on('pointerdown', () => {
      this.cameras.main.fadeOut(250, 10, 10, 26);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('SettingsScene', { from: 'MenuScene' });
      });
    });

    // ── Controls legend (live from KeyBindings) ───────────────────────────
    this._legendTexts = [];
    this._legendY     = H - 46;
    this._updateLegend();

    // Fade in
    this.cameras.main.fadeIn(400, 10, 10, 26);
  }

  _updateLegend() {
    // Destroy previous legend texts
    for (const t of this._legendTexts) t.destroy();
    this._legendTexts = [];

    const W    = this.scale.width;
    const H    = this.scale.height;
    const p1kb = KeyBindings.p1;
    const p2kb = KeyBindings.p2;
    const lines = [
      `P1: ${keyName(p1kb.left)}/${keyName(p1kb.right)} move  ${keyName(p1kb.jump)} jump  ${keyName(p1kb.light)} light  ${keyName(p1kb.heavy)} heavy  ${keyName(p1kb.block)} block`,
      `P2: ${keyName(p2kb.left)}/${keyName(p2kb.right)} move  ${keyName(p2kb.jump)} jump  ${keyName(p2kb.light)} light  ${keyName(p2kb.heavy)} heavy  ${keyName(p2kb.block)} block`,
    ];
    lines.forEach((line, i) => {
      const t = this.add.text(W / 2, H - 42 + i * 20, line, {
        fontFamily: 'Inter, sans-serif',
        fontSize:   '12px',
        color:      '#334155',
      }).setOrigin(0.5);
      this._legendTexts.push(t);
    });
  }

  _drawSettingsBtn(gfx, x, y, w, h, hovered) {
    gfx.clear();
    gfx.fillStyle(hovered ? 0x1e293b : 0x0f172a, 0.9);
    gfx.lineStyle(1, hovered ? 0x6366f1 : 0x334155, 1);
    gfx.fillRoundedRect(x, y, w, h, 8);
    gfx.strokeRoundedRect(x, y, w, h, 8);
  }

  _drawBtn(gfx, x, y, w, h, hovered) {
    gfx.clear();
    if (hovered) {
      gfx.fillStyle(0x6366f1, 0.9);
      gfx.lineStyle(2, 0xa5b4fc, 1);
    } else {
      gfx.fillStyle(0x312e81, 0.8);
      gfx.lineStyle(2, 0x6366f1, 1);
    }
    gfx.fillRoundedRect(x, y, w, h, 12);
    gfx.strokeRoundedRect(x, y, w, h, 12);
    // Glow
    if (hovered) {
      gfx.lineStyle(8, 0x818cf8, 0.2);
      gfx.strokeRoundedRect(x - 4, y - 4, w + 8, h + 8, 16);
    }
  }

  update(time, delta) {
    const dt = delta / 1000;
    this._bgGfx.clear();
    for (const s of this._bgStickmen) {
      s.phase += dt * s.speed;
      this._drawSilhouette(s.x, 360, s.phase, s.alpha);
    }
  }

  _drawSilhouette(x, y, phase, alpha) {
    const g = this._bgGfx;
    const bob = Math.sin(phase) * 5;
    const swing = Math.sin(phase) * 0.4;

    g.lineStyle(4, 0x6366f1, alpha);
    // Head
    g.strokeCircle(x, y - 105 + bob, 14);
    // Body
    g.beginPath(); g.moveTo(x, y - 45); g.lineTo(x, y - 91 + bob); g.strokePath();
    // Arms
    const ex1 = x + Math.sin(swing + 0.3) * 40;
    const ey1 = y - 70 + bob + Math.cos(swing + 0.3) * 30;
    g.beginPath(); g.moveTo(x, y - 80 + bob); g.lineTo(ex1, ey1); g.strokePath();
    const ex2 = x + Math.sin(-swing - 0.3) * 40;
    const ey2 = y - 70 + bob + Math.cos(-swing - 0.3) * 30;
    g.beginPath(); g.moveTo(x, y - 80 + bob); g.lineTo(ex2, ey2); g.strokePath();
    // Legs
    g.beginPath(); g.moveTo(x, y - 45); g.lineTo(x + Math.sin(swing) * 25, y); g.strokePath();
    g.beginPath(); g.moveTo(x, y - 45); g.lineTo(x - Math.sin(swing) * 25, y); g.strokePath();
  }
}
