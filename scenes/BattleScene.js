// scenes/BattleScene.js — Main Battle Screen
// ============================================
// Handles the full game loop: input, physics, collision, health,
// round system, combo text, particle effects, stickman drawing.

const ARENA_LEFT  = 60;
const ARENA_RIGHT = 900;
const ROUND_DURATION_S = 60; // seconds per round (time limit)

// Map power keys to portrait image filenames
const PORTRAIT_MAP = {
  fire:  'aset/fire_fist.png',
  ice:   'aset/ice_guard.png',
  speed: 'aset/speed_blade.png',
  heavy: 'aset/heavy_hammer.png',
};

class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  preload() {
    // Assets are loaded via DOM overlays because Phaser's local file loading fails
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this._W = W;
    this._H = H;

    // ── Show battle background image (HTML element behind transparent canvas) ──
    const battleBg = document.getElementById('battle-bg');
    if (battleBg) battleBg.style.display = 'block';

    // Show DOM HUD Portraits
    const p1PortraitDom = document.getElementById('hud-p1-portrait');
    const p2PortraitDom = document.getElementById('hud-p2-portrait');
    if (p1PortraitDom) {
      p1PortraitDom.src = PORTRAIT_MAP[GameState.p1Power.key];
      p1PortraitDom.style.display = 'block';
    }
    if (p2PortraitDom) {
      p2PortraitDom.src = PORTRAIT_MAP[GameState.p2Power.key];
      p2PortraitDom.style.display = 'block';
    }

    // Hide DOM elements when leaving this scene
    this.events.on('shutdown', () => {
      if (battleBg) battleBg.style.display = 'none';
      if (p1PortraitDom) p1PortraitDom.style.display = 'none';
      if (p2PortraitDom) p2PortraitDom.style.display = 'none';
    });

    // ── Graphics layers ───────────────────────────────────────────────────
    this._bgGfx         = this.add.graphics();
    this._shadowGfx     = this.add.graphics();  // player shadows
    this._gfx           = this.add.graphics();  // players + particles
    this._uiGfx         = this.add.graphics().setDepth(49);  // HUD bars (under HUD container)

    // ── Particles ─────────────────────────────────────────────────────────
    this._particles = new ParticleSystem(this);

    // ── Create players ────────────────────────────────────────────────────
    this._p1 = new Player({
      scene:        this,
      x:            280,
      y:            GROUND_Y,
      facingRight:  true,
      power:        GameState.p1Power,
      outlineColor: 0x7ecfff,
      label:        'P1',
    });

    this._p2 = new Player({
      scene:        this,
      x:            680,
      y:            GROUND_Y,
      facingRight:  false,
      power:        GameState.p2Power,
      outlineColor: 0xff8888,
      label:        GameState.mode === '1p' ? 'CPU' : 'P2',
    });

    // ── AI (if 1P mode) ───────────────────────────────────────────────────
    this._ai = (GameState.mode === '1p') ? new AIController() : null;

    // ── Keyboard setup (reads from KeyBindings — supports custom remapping) ─
    const kb = this.input.keyboard;
    const addKey = (code) => kb.addKey(code);

    this._keysP1 = {
      left:  addKey(KeyBindings.p1.left),
      right: addKey(KeyBindings.p1.right),
      jump:  addKey(KeyBindings.p1.jump),
      light: addKey(KeyBindings.p1.light),
      heavy: addKey(KeyBindings.p1.heavy),
      block: addKey(KeyBindings.p1.block),
    };
    this._keysP2 = {
      left:  addKey(KeyBindings.p2.left),
      right: addKey(KeyBindings.p2.right),
      jump:  addKey(KeyBindings.p2.jump),
      light: addKey(KeyBindings.p2.light),
      heavy: addKey(KeyBindings.p2.heavy),
      block: addKey(KeyBindings.p2.block),
    };

    // ── HUD Container (drawn on top of everything) ─────────────────────────
    this._hudContainer = this.add.container(0, 0).setDepth(50);

    // ── Portraits (Background borders only, images are DOM overlays) ───────
    const portraitSize = 52;
    const portraitY = 32;

    // P1 portrait (left side)
    const p1PortBg = this.add.graphics();
    p1PortBg.fillStyle(0x000000, 0.7);
    p1PortBg.fillRoundedRect(10, portraitY - portraitSize/2, portraitSize + 6, portraitSize + 6, 6);
    p1PortBg.lineStyle(2, GameState.p1Power.color, 0.9);
    p1PortBg.strokeRoundedRect(10, portraitY - portraitSize/2, portraitSize + 6, portraitSize + 6, 6);
    this._hudContainer.add(p1PortBg);

    // P2 portrait (right side)
    const p2PortBg = this.add.graphics();
    p2PortBg.fillStyle(0x000000, 0.7);
    p2PortBg.fillRoundedRect(W - portraitSize - 16, portraitY - portraitSize/2, portraitSize + 6, portraitSize + 6, 6);
    p2PortBg.lineStyle(2, GameState.p2Power.color, 0.9);
    p2PortBg.strokeRoundedRect(W - portraitSize - 16, portraitY - portraitSize/2, portraitSize + 6, portraitSize + 6, 6);
    this._hudContainer.add(p2PortBg);

    // ── Player Name Labels ─────────────────────────────────────────────────
    const p1NameLabel = this.add.text(72, 6, 'P1', {
      fontFamily: 'Edo, sans-serif', fontSize: '16px', color: GameState.p1Power.accentColor,
      stroke: '#000', strokeThickness: 3,
    });
    this._hudContainer.add(p1NameLabel);

    const p2NameLabel = this.add.text(W - 72, 6, GameState.mode === '1p' ? 'CPU' : 'P2', {
      fontFamily: 'Edo, sans-serif', fontSize: '16px', color: GameState.p2Power.accentColor,
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(1, 0);
    this._hudContainer.add(p2NameLabel);

    // ── Power Name Labels ──────────────────────────────────────────────────
    const p1PowerLabel = this.add.text(72, 56, GameState.p1Power.name, {
      fontFamily: 'Edo, sans-serif', fontSize: '12px',
      color: GameState.p1Power.accentColor,
      stroke: '#000', strokeThickness: 2,
    });
    this._hudContainer.add(p1PowerLabel);

    const p2PowerLabel = this.add.text(W - 72, 56, GameState.p2Power.name, {
      fontFamily: 'Edo, sans-serif', fontSize: '12px',
      color: GameState.p2Power.accentColor,
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(1, 0);
    this._hudContainer.add(p2PowerLabel);

    // ── Round indicators (diamonds) ────────────────────────────────────────
    this._roundDots = this.add.graphics();
    this._hudContainer.add(this._roundDots);

    // ── Center Timer Panel ─────────────────────────────────────────────────
    const timerPanelGfx = this.add.graphics();
    timerPanelGfx.fillStyle(0x0a0a12, 0.85);
    timerPanelGfx.fillRoundedRect(W/2 - 40, 4, 80, 62, 8);
    timerPanelGfx.lineStyle(2, 0x444466, 0.6);
    timerPanelGfx.strokeRoundedRect(W/2 - 40, 4, 80, 62, 8);
    this._hudContainer.add(timerPanelGfx);

    this._roundText = this.add.text(W / 2, 10, `ROUND ${GameState.roundNumber}`, {
      fontFamily: 'Edo, sans-serif', fontSize: '16px', color: '#cce0ff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 0);
    this._hudContainer.add(this._roundText);

    this._timerText = this.add.text(W / 2, 30, '60', {
      fontFamily: 'Edo, sans-serif', fontSize: '36px', color: '#ffffff',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5, 0);
    this._hudContainer.add(this._timerText);

    // ── Combo popup text ───────────────────────────────────────────────────
    this._comboText = this.add.text(W / 2, H / 2 - 80, '', {
      fontFamily: 'Edo, sans-serif', fontSize: '48px', color: '#ffcc00',
      stroke: '#7a5c00', strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 0, color: '#ffaa00', blur: 20, fill: true },
    }).setOrigin(0.5).setAlpha(0).setDepth(51);
    this._comboTimer = 0;

    // ── Countdown before round starts ─────────────────────────────────────
    this._roundTimer  = ROUND_DURATION_S;
    this._paused      = true;  // paused during countdown
    this._roundOver   = false;

    this._showCountdown(3, () => {
      this._paused = false;
    });

    // ── Pause Menu UI ─────────────────────────────────────────────────────
    this._isGamePaused = false;
    this._pauseContainer = this.add.container(0, 0).setDepth(100).setVisible(false);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, W, H);
    this._pauseContainer.add(overlay);

    const pTitle = this.add.text(W / 2, H / 2 - 80, 'PAUSED', {
      fontFamily: 'Edo, sans-serif', fontSize: '72px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 0, color: '#818cf8', blur: 20, fill: true },
    }).setOrigin(0.5);
    this._pauseContainer.add(pTitle);

    this._createPauseBtn(W / 2, H / 2 + 20, 'Continue', () => this._togglePause());
    this._createPauseBtn(W / 2, H / 2 + 85, 'Main Menu', () => {
      this.cameras.main.fadeOut(250, 10, 10, 26);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
    });

    this.input.keyboard.on('keydown-ESC', () => {
      // Block pausing if round is over or still in initial countdown
      if (this._roundOver || (this._paused && !this._isGamePaused)) return;
      this._togglePause();
    });

    this.cameras.main.fadeIn(300, 10, 10, 26);
  }

  _createPauseBtn(x, y, label, onClick) {
    const w = 220, h = 50;
    const gfx = this.add.graphics();
    const draw = (hovered) => {
      gfx.clear();
      gfx.fillStyle(hovered ? 0x6366f1 : 0x312e81, 0.9);
      gfx.lineStyle(2, hovered ? 0xa5b4fc : 0x6366f1, 1);
      gfx.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
      gfx.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    };
    draw(false);

    const txt = this.add.text(x, y, label, {
      fontFamily: 'Edo, sans-serif', fontSize: '26px', color: '#ffffff',
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, w, h).setInteractive({ cursor: 'pointer' });
    zone.on('pointerover', () => { draw(true); txt.setScale(1.05); });
    zone.on('pointerout', () => { draw(false); txt.setScale(1); });
    zone.on('pointerdown', onClick);

    this._pauseContainer.add([gfx, txt, zone]);
  }

  _togglePause() {
    this._isGamePaused = !this._isGamePaused;
    this._pauseContainer.setVisible(this._isGamePaused);
  }


  // ── Round Win Indicator Diamonds ────────────────────────────────────────────
  _drawRoundDots() {
    const g = this._roundDots;
    g.clear();
    const W = this._W;
    const maxWins = Math.ceil(GameState.maxRounds / 2);
    const dSize = 6; // diamond half-size
    const dGap = 16;
    const dY = 72;

    // Helper to draw a diamond
    const drawDiamond = (cx, cy, size, fillColor, fillAlpha, strokeColor, strokeAlpha) => {
      if (fillColor !== null) {
        g.fillStyle(fillColor, fillAlpha);
        g.fillPoints([{x: cx, y: cy - size}, {x: cx + size, y: cy}, {x: cx, y: cy + size}, {x: cx - size, y: cy}], true);
      }
      if (strokeColor !== null) {
        g.lineStyle(1.5, strokeColor, strokeAlpha);
        g.strokePoints([{x: cx, y: cy - size}, {x: cx + size, y: cy}, {x: cx, y: cy + size}, {x: cx - size, y: cy}], true);
      }
    };

    // P1 diamonds (left, after portrait)
    for (let i = 0; i < maxWins; i++) {
      const dx = 76 + i * dGap;
      if (i < GameState.p1Wins) {
        drawDiamond(dx, dY, dSize, GameState.p1Power.color, 1, 0xffffff, 0.5);
      } else {
        drawDiamond(dx, dY, dSize, null, 0, 0x666688, 0.5);
      }
    }

    // P2 diamonds (right, before portrait, mirrored)
    for (let i = 0; i < maxWins; i++) {
      const dx = W - 76 - i * dGap;
      if (i < GameState.p2Wins) {
        drawDiamond(dx, dY, dSize, GameState.p2Power.color, 1, 0xffffff, 0.5);
      } else {
        drawDiamond(dx, dY, dSize, null, 0, 0x666688, 0.5);
      }
    }
  }

  // ── Health Bar Drawing (Angled / Fighting Game Style) ──────────────────────
  _drawHealthBars() {
    const g   = this._uiGfx;
    const W   = this._W;
    g.clear();

    // Bar dimensions
    const barW     = 340;  // total bar width
    const barH     = 22;   // bar height
    const barY     = 22;   // top of bar
    const slant    = 12;   // how much the bar is angled
    const p1Left   = 72;   // left edge of P1 bar
    const p2Right  = W - 72; // right edge of P2 bar

    // ── P1 Health Bar (left side, fills from left to right) ──
    const p1Pct = Math.max(0, this._p1.health / this._p1.maxHealth);
    const p1Color = GameState.p1Power.color;

    // Background shape (dark)
    g.fillStyle(0x0a0a18, 0.85);
    g.beginPath();
    g.moveTo(p1Left,              barY);
    g.lineTo(p1Left + barW,       barY);
    g.lineTo(p1Left + barW - slant, barY + barH);
    g.lineTo(p1Left,              barY + barH);
    g.closePath();
    g.fillPath();

    // Fill shape (element color)
    if (p1Pct > 0) {
      const fillW = barW * p1Pct;
      g.fillStyle(p1Color, 0.9);
      g.beginPath();
      g.moveTo(p1Left,                            barY);
      g.lineTo(p1Left + fillW,                    barY);
      g.lineTo(p1Left + fillW - slant * p1Pct,    barY + barH);
      g.lineTo(p1Left,                            barY + barH);
      g.closePath();
      g.fillPath();

      // Inner bright highlight (top edge glow)
      g.fillStyle(0xffffff, 0.15);
      g.beginPath();
      g.moveTo(p1Left,           barY);
      g.lineTo(p1Left + fillW,   barY);
      g.lineTo(p1Left + fillW,   barY + 4);
      g.lineTo(p1Left,           barY + 4);
      g.closePath();
      g.fillPath();
    }

    // Border stroke
    g.lineStyle(2, 0x555577, 0.8);
    g.beginPath();
    g.moveTo(p1Left,              barY);
    g.lineTo(p1Left + barW,       barY);
    g.lineTo(p1Left + barW - slant, barY + barH);
    g.lineTo(p1Left,              barY + barH);
    g.closePath();
    g.strokePath();

    // Element-colored top edge
    g.lineStyle(1, p1Color, 0.6);
    g.beginPath();
    g.moveTo(p1Left, barY);
    g.lineTo(p1Left + barW, barY);
    g.strokePath();

    // ── P2 Health Bar (right side, fills from right to left) ──
    const p2Pct = Math.max(0, this._p2.health / this._p2.maxHealth);
    const p2Color = GameState.p2Power.color;

    // Background shape (dark)
    g.fillStyle(0x0a0a18, 0.85);
    g.beginPath();
    g.moveTo(p2Right - barW,         barY);
    g.lineTo(p2Right,                barY);
    g.lineTo(p2Right,                barY + barH);
    g.lineTo(p2Right - barW + slant, barY + barH);
    g.closePath();
    g.fillPath();

    // Fill shape (element color)
    if (p2Pct > 0) {
      const fillW = barW * p2Pct;
      g.fillStyle(p2Color, 0.9);
      g.beginPath();
      g.moveTo(p2Right - fillW,                     barY);
      g.lineTo(p2Right,                             barY);
      g.lineTo(p2Right,                             barY + barH);
      g.lineTo(p2Right - fillW + slant * p2Pct,     barY + barH);
      g.closePath();
      g.fillPath();

      // Inner bright highlight
      g.fillStyle(0xffffff, 0.15);
      g.beginPath();
      g.moveTo(p2Right - fillW, barY);
      g.lineTo(p2Right,         barY);
      g.lineTo(p2Right,         barY + 4);
      g.lineTo(p2Right - fillW, barY + 4);
      g.closePath();
      g.fillPath();
    }

    // Border stroke
    g.lineStyle(2, 0x555577, 0.8);
    g.beginPath();
    g.moveTo(p2Right - barW,         barY);
    g.lineTo(p2Right,                barY);
    g.lineTo(p2Right,                barY + barH);
    g.lineTo(p2Right - barW + slant, barY + barH);
    g.closePath();
    g.strokePath();

    // Element-colored top edge
    g.lineStyle(1, p2Color, 0.6);
    g.beginPath();
    g.moveTo(p2Right - barW, barY);
    g.lineTo(p2Right, barY);
    g.strokePath();
  }

  // ── Countdown ────────────────────────────────────────────────────────────
  _showCountdown(count, onDone) {
    const W = this._W;
    const H = this._H;

    const txt = this.add.text(W / 2, H / 2, count.toString(), {
      fontFamily: 'Edo, sans-serif',
      fontSize:   '160px',
      color:      '#ffffff',
      stroke:     '#000000',
      strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 0, color: '#818cf8', blur: 40, fill: true },
    }).setOrigin(0.5).setAlpha(1).setDepth(60);

    this.tweens.add({
      targets:  txt,
      alpha:    0,
      scaleX:   2,
      scaleY:   2,
      duration: 800,
      ease:     'Cubic.easeIn',
      onComplete: () => {
        txt.destroy();
        if (count > 1) {
          this._showCountdown(count - 1, onDone);
        } else {
          // FIGHT!
          const fight = this.add.text(W / 2, H / 2, 'FIGHT!', {
            fontFamily: 'Edo, sans-serif',
            fontSize:   '100px',
            color:      '#ffcc00',
            stroke:     '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff8800', blur: 30, fill: true },
          }).setOrigin(0.5).setDepth(60);
          this.tweens.add({
            targets:  fight,
            alpha:    0,
            scaleX:   1.5,
            scaleY:   1.5,
            duration: 700,
            delay:    300,
            ease:     'Cubic.easeIn',
            onComplete: () => { fight.destroy(); onDone(); }
          });
        }
      }
    });
  }

  // ── Combo Text Popup ──────────────────────────────────────────────────────
  _showComboText(comboName) {
    this._comboText.setText(comboName);
    this._comboText.setAlpha(1).setScale(1);
    this._comboTimer = 1.2;
    this.tweens.add({
      targets:  this._comboText,
      scaleX:   1.3,
      scaleY:   1.3,
      duration: 120,
      yoyo:     true,
    });
  }

  // ── Hitbox Collision ──────────────────────────────────────────────────────
  _checkHit(attacker, defender, ai) {
    const hb = attacker.getAttackHitbox();
    if (!hb) return;

    const dx = Math.abs(defender.x - attacker.x);
    const dy = Math.abs((defender.y - 60) - hb.y);
    if (dx > hb.w || dy > hb.h) return;

    // Determine raw damage
    const type      = hb.type;
    const comboRes  = attacker.lastComboResult;
    let rawDmg      = BASE_DAMAGE[type] * attacker.power.damageMul;

    if (type === 'heavy') rawDmg *= attacker.power.heavyMul;
    if (comboRes) rawDmg = Math.ceil(rawDmg * comboRes.damageMul);

    const isBlocking = defender.isBlocking();
    const dmg        = defender.takeDamage(rawDmg, isBlocking, attacker.power.key);

    // Spawn particles
    const hitX = (attacker.x + defender.x) / 2;
    const hitY = defender.y - 60;
    const isComboHit = !!comboRes;
    this._particles.spawnHit(hitX, hitY, attacker.power.particleKey, isComboHit);

    if (isBlocking) {
      this._particles.spawnBlock(hitX, hitY, defender.power.particleKey);
    }

    // Combo popup
    if (comboRes && !isBlocking) {
      this._showComboText(comboRes.name);
    }

    // Notify AI it got hit
    if (ai && defender === this._p2) ai.onHit();

    // Clear the attacker's attack-active so we don't double-hit
    attacker.attackActive = false;
    attacker.lastComboResult = null;
  }

  // ── Round Over ────────────────────────────────────────────────────────────
  _endRound(winner) {
    if (this._roundOver) return;
    this._roundOver = true;
    this._paused    = true;

    if (winner === 'p1') GameState.p1Wins++;
    else if (winner === 'p2') GameState.p2Wins++;
    // 'draw' → no wins added

    const maxWins = Math.ceil(GameState.maxRounds / 2);
    const matchOver = GameState.p1Wins >= maxWins || GameState.p2Wins >= maxWins;

    // Show winner banner
    const W     = this._W;
    const H     = this._H;
    const label = winner === 'p1' ? 'P1 WINS!' :
                  winner === 'p2' ? (GameState.mode === '1p' ? 'CPU WINS!' : 'P2 WINS!') :
                  'DRAW!';
    const col   = winner === 'p1' ? '#7ecfff' : winner === 'p2' ? '#ff8888' : '#ffcc00';

    const banner = this.add.text(W / 2, H / 2, label, {
      fontFamily: 'Edo, sans-serif',
      fontSize:   '90px',
      color:      col,
      stroke:     '#000000',
      strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 0, color: col, blur: 40, fill: true },
    }).setOrigin(0.5).setAlpha(0).setDepth(60);

    this.tweens.add({
      targets:  banner,
      alpha:    1,
      scaleX:   1,
      scaleY:   1,
      duration: 400,
      ease:     'Back.easeOut',
    });

    this.time.delayedCall(1800, () => {
      GameState.roundNumber++;
      this.cameras.main.fadeOut(400, 10, 10, 26);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        if (matchOver) {
          this.scene.start('ResultScene');
        } else {
          // Next round: reset players, re-run BattleScene
          this._p1.health       = 100;
          this._p2.health       = 100;
          this._p1.x            = 280;
          this._p2.x            = 680;
          this._p1.state        = STATE.IDLE;
          this._p2.state        = STATE.IDLE;
          this._p1.vy           = 0;
          this._p2.vy           = 0;
          this._p1.combo.reset();
          this._p2.combo.reset();
          this.scene.restart();
        }
      });
    });
  }

  // ── Main Update Loop ──────────────────────────────────────────────────────
  update(time, delta) {
    const dt  = Math.min(delta / 1000, 0.05); // cap at 50ms
    const now = Date.now();

    // ── Clear drawable layers ──
    this._gfx.clear();

    if (!this._isGamePaused) {
      // ── Round timer ──
      if (!this._paused && !this._roundOver) {
        this._roundTimer -= dt;
        this._timerText.setText(Math.max(0, Math.ceil(this._roundTimer)).toString());
        if (this._roundTimer <= 0) {
          // Time up → who has more HP?
          if (this._p1.health > this._p2.health) this._endRound('p1');
          else if (this._p2.health > this._p1.health) this._endRound('p2');
          else this._endRound('draw');
        }
      }

      // ── Player input & update ──
      if (!this._paused && !this._roundOver) {
        // Face each other
        if (this._p1.state !== STATE.KO) this._p1.facingRight = this._p2.x > this._p1.x;
        if (this._p2.state !== STATE.KO) this._p2.facingRight = this._p1.x > this._p2.x;

        // P1 input
        this._p1.processInput(this._keysP1, dt, now);

        // P2: human or AI
        if (this._ai) {
          const aiKeys = this._ai.getKeys(this._p2, this._p1, dt, now);
          this._p2.processInput(aiKeys, dt, now);
        } else {
          this._p2.processInput(this._keysP2, dt, now);
        }

        // Physics update
        this._p1.update(dt, ARENA_LEFT, ARENA_RIGHT);
        this._p2.update(dt, ARENA_LEFT, ARENA_RIGHT);

        // Collision checks (both directions)
        this._checkHit(this._p1, this._p2, this._ai);
        this._checkHit(this._p2, this._p1, null);

        // Push players apart if overlapping
        const overlap = 40;
        if (Math.abs(this._p1.x - this._p2.x) < overlap) {
          const dir = this._p1.x < this._p2.x ? -1 : 1;
          this._p1.x += dir * 2;
          this._p2.x -= dir * 2;
        }

        // Check KO
        if (this._p1.state === STATE.KO) {
          this.time.delayedCall(400, () => this._endRound('p2'));
        }
        if (this._p2.state === STATE.KO) {
          this.time.delayedCall(400, () => this._endRound('p1'));
        }
      }

      // ── Particles ──
      this._particles.update(dt);
      
      // ── Combo text fade ──
      if (this._comboTimer > 0) {
        this._comboTimer -= dt;
        this._comboText.setAlpha(Math.min(1, this._comboTimer / 0.4));
        if (this._comboTimer <= 0) this._comboText.setAlpha(0);
      }
    }

    // ── DRAWING (always runs so screen doesn't clear when paused) ──
    this._particles.draw(this._gfx);
    this._p1.draw(this._gfx);
    this._p2.draw(this._gfx);
    this._drawHealthBars();
    this._drawRoundDots();
  }
}
