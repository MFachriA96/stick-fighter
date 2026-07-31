// scenes/PowerScene.js — Power/Weapon Selection
// ===============================================
// P1 selects first, then P2 (or CPU auto-picks).

const POWER_LIST = [POWERS.fire, POWERS.ice, POWERS.speed, POWERS.heavy];

class PowerScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PowerScene' });
    this._p1Selected = null;
    this._p2Selected = null;
    this._phase      = 'p1'; // 'p1' | 'p2' | 'done'
  }

  create() {
    this._p1Selected = null;
    this._p2Selected = null;
    this._phase      = 'p1';

    const W = this.scale.width;
    const H = this.scale.height;

    // ── Background ───────────────────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x12102a, 0x12102a, 1);
    bg.fillRect(0, 0, W, H);

    // ── Phase indicator text ─────────────────────────────────────────────
    this._phaseText = this.add.text(W / 2, 60, 'PLAYER 1 — PILIH POWER', {
      fontFamily: 'Bangers, sans-serif',
      fontSize:   '42px',
      color:      '#7ecfff',
      stroke:     '#1e3a5f',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this._subText = this.add.text(W / 2, 108, 'Klik kartu power yang ingin kamu gunakan', {
      fontFamily: 'Inter, sans-serif',
      fontSize:   '15px',
      color:      '#94a3b8',
    }).setOrigin(0.5);

    // ── Power cards ──────────────────────────────────────────────────────
    const cW   = 180;
    const cH   = 220;
    const gap  = 26;
    const totalW = POWER_LIST.length * cW + (POWER_LIST.length - 1) * gap;
    const startX = (W - totalW) / 2;
    const cardY  = H / 2 + 30;

    this._cardGfx     = [];
    this._cardObjects = [];

    for (let i = 0; i < POWER_LIST.length; i++) {
      const pw  = POWER_LIST[i];
      const cx  = startX + i * (cW + gap) + cW / 2;

      const gfx = this.add.graphics();
      this._drawPowerCard(gfx, cx, cardY, cW, cH, pw, false, false);
      this._cardGfx.push(gfx);

      // Color swatch
      const swatch = this.add.graphics();
      swatch.fillStyle(pw.color, 1);
      swatch.fillCircle(cx, cardY - 75, 22);
      swatch.lineStyle(3, 0xffffff, 0.3);
      swatch.strokeCircle(cx, cardY - 75, 22);

      // Name
      this.add.text(cx, cardY - 35, pw.name, {
        fontFamily: 'Bangers, sans-serif',
        fontSize:   '22px',
        color:      '#ffffff',
      }).setOrigin(0.5);

      // Desc
      this.add.text(cx, cardY + 10, pw.desc, {
        fontFamily: 'Inter, sans-serif',
        fontSize:   '12px',
        color:      '#94a3b8',
        wordWrap:   { width: cW - 20 },
        align:      'center',
      }).setOrigin(0.5);

      // Stats badge
      this._drawStatsBadge(this.add.graphics(), cx, cardY + 70, pw);

      // Interactive zone
      const zone = this.add.zone(cx, cardY, cW, cH).setInteractive({ cursor: 'pointer' });
      const idx  = i;

      zone.on('pointerover', () => {
        if (this._phase === 'done') return;
        this._drawPowerCard(this._cardGfx[idx], cx, cardY, cW, cH, pw, true, false);
      });
      zone.on('pointerout', () => {
        if (this._phase === 'done') return;
        const p1Chosen = this._p1Selected === pw.key;
        const p2Chosen = this._p2Selected === pw.key;
        this._drawPowerCard(this._cardGfx[idx], cx, cardY, cW, cH, pw, false, p1Chosen || p2Chosen);
      });
      zone.on('pointerdown', () => this._onCardClick(idx, pw, cx, cardY, cW, cH));

      this._cardObjects.push({ zone, gfx, pw, cx, cardY, cW, cH });
    }

    // ── Selection indicators ──────────────────────────────────────────────
    this._p1Badge = this.add.text(W / 2 - 140, H - 60, '', {
      fontFamily: 'Bangers, sans-serif',
      fontSize:   '20px',
      color:      '#7ecfff',
    }).setOrigin(0.5);

    this._p2Badge = this.add.text(W / 2 + 140, H - 60, '', {
      fontFamily: 'Bangers, sans-serif',
      fontSize:   '20px',
      color:      '#ff8888',
    }).setOrigin(0.5);

    this.add.text(W / 2 - 270, H - 60, 'P1:', {
      fontFamily: 'Bangers, sans-serif',
      fontSize:   '20px',
      color:      '#475569',
    }).setOrigin(0.5);

    this.add.text(W / 2 + 30, H - 60, 'P2:', {
      fontFamily: 'Bangers, sans-serif',
      fontSize:   '20px',
      color:      '#475569',
    }).setOrigin(0.5);

    // Back button
    const back = this.add.text(50, H - 30, '← Back', {
      fontFamily: 'Inter, sans-serif',
      fontSize:   '15px',
      color:      '#475569',
    }).setOrigin(0, 0.5).setInteractive({ cursor: 'pointer' });
    back.on('pointerover', () => back.setColor('#94a3b8'));
    back.on('pointerout',  () => back.setColor('#475569'));
    back.on('pointerdown', () => {
      this.cameras.main.fadeOut(250, 10, 10, 26);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('ModeScene');
      });
    });

    this.cameras.main.fadeIn(300, 10, 10, 26);
  }

  _onCardClick(idx, pw, cx, cardY, cW, cH) {
    if (this._phase === 'done') return;

    if (this._phase === 'p1') {
      this._p1Selected = pw.key;
      this._p1Badge.setText(pw.name);
      // Mark card as selected
      this._drawPowerCard(this._cardGfx[idx], cx, cardY, cW, cH, pw, false, true);

      if (GameState.mode === '1p') {
        // CPU picks random (different from P1 if possible)
        const others = POWER_LIST.filter(p => p.key !== pw.key);
        const cpuPw  = Phaser.Utils.Array.GetRandom(others);
        this._p2Selected = cpuPw.key;
        this._p2Badge.setText(cpuPw.name + ' (CPU)');
        this._phase = 'done';
        this._startBattle();
      } else {
        // 2P: switch to P2 pick
        this._phase = 'p2';
        this._phaseText.setText('PLAYER 2 — PILIH POWER');
        this._phaseText.setStyle({ fill: '#ff8888' });
        this._subText.setText('Player 2: pilih power untuk bertarung!');
      }
    } else if (this._phase === 'p2') {
      this._p2Selected = pw.key;
      this._p2Badge.setText(pw.name);
      this._drawPowerCard(this._cardGfx[idx], cx, cardY, cW, cH, pw, false, true);
      this._phase = 'done';
      this._startBattle();
    }
  }

  _startBattle() {
    GameState.p1Power = POWERS[this._p1Selected];
    GameState.p2Power = POWERS[this._p2Selected];
    this.time.delayedCall(400, () => {
      this.cameras.main.fadeOut(350, 10, 10, 26);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('BattleScene');
      });
    });
  }

  _drawPowerCard(gfx, cx, cy, cW, cH, pw, hovered, selected) {
    gfx.clear();
    const x = cx - cW / 2;
    const y = cy - cH / 2;

    if (selected) {
      gfx.fillStyle(pw.color, 0.25);
      gfx.lineStyle(3, pw.color, 1);
    } else if (hovered) {
      gfx.fillStyle(pw.color, 0.15);
      gfx.lineStyle(2, pw.color, 0.8);
    } else {
      gfx.fillStyle(0x1e1b4b, 0.7);
      gfx.lineStyle(1, pw.color, 0.3);
    }
    gfx.fillRoundedRect(x, y, cW, cH, 14);
    gfx.strokeRoundedRect(x, y, cW, cH, 14);

    if (selected) {
      // Glow border
      gfx.lineStyle(10, pw.color, 0.2);
      gfx.strokeRoundedRect(x - 4, y - 4, cW + 8, cH + 8, 18);
    }
  }

  _drawStatsBadge(gfx, cx, cy, pw) {
    // Mini stat bars
    const stats = [
      { label: 'DMG',   val: pw.damageMul   },
      { label: 'DEF',   val: 1 - pw.blockMul + 0.5 }, // invert for display
      { label: 'SPD',   val: 2 - pw.attackCdMul     },
      { label: 'HEAVY', val: pw.heavyMul / 2.5       },
    ];
    const bW = 100;
    const bH = 6;
    const bGap = 14;
    const startY = cy - (stats.length * bGap) / 2;

    for (let i = 0; i < stats.length; i++) {
      const s  = stats[i];
      const by = startY + i * bGap;
      const fill = Math.min(1, Math.max(0, s.val));

      // BG bar
      gfx.fillStyle(0x334155, 0.8);
      gfx.fillRoundedRect(cx - bW / 2, by, bW, bH, 3);
      // Fill
      gfx.fillStyle(pw.color, 0.9);
      gfx.fillRoundedRect(cx - bW / 2, by, bW * fill, bH, 3);
    }
  }
}
