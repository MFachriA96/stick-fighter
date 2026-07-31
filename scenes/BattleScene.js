// scenes/BattleScene.js — Main Battle Screen
// ============================================
// Handles the full game loop: input, physics, collision, health,
// round system, combo text, particle effects, stickman drawing.

const ARENA_LEFT  = 60;
const ARENA_RIGHT = 900;
const ROUND_DURATION_S = 60; // seconds per round (time limit)

class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this._W = W;
    this._H = H;

    // ── Graphics layers ───────────────────────────────────────────────────
    this._bgGfx         = this.add.graphics();  // background / arena
    this._shadowGfx     = this.add.graphics();  // player shadows
    this._gfx           = this.add.graphics();  // players + particles
    this._uiGfx         = this.add.graphics();  // HUD (health bars etc.)

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

    // ── UI Text objects ───────────────────────────────────────────────────
    this._p1Label = this.add.text(80, 20, 'P1', {
      fontFamily: 'Bangers, sans-serif', fontSize: '18px', color: '#7ecfff',
    });
    this._p2Label = this.add.text(W - 80, 20, GameState.mode === '1p' ? 'CPU' : 'P2', {
      fontFamily: 'Bangers, sans-serif', fontSize: '18px', color: '#ff8888',
    }).setOrigin(1, 0);

    // Round indicators (dots)
    this._roundDots = this.add.graphics();

    // Round / timer text
    this._roundText = this.add.text(W / 2, 15, `ROUND ${GameState.roundNumber}`, {
      fontFamily: 'Bangers, sans-serif', fontSize: '28px', color: '#ffffff',
      stroke: '#6366f1', strokeThickness: 3,
    }).setOrigin(0.5, 0);

    this._timerText = this.add.text(W / 2, 46, '60', {
      fontFamily: 'Bangers, sans-serif', fontSize: '22px', color: '#94a3b8',
    }).setOrigin(0.5, 0);

    // Combo popup text
    this._comboText = this.add.text(W / 2, H / 2 - 80, '', {
      fontFamily: 'Bangers, sans-serif', fontSize: '42px', color: '#ffcc00',
      stroke: '#7a5c00', strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 0, color: '#ffaa00', blur: 20, fill: true },
    }).setOrigin(0.5).setAlpha(0);
    this._comboTimer = 0;

    // Power labels under health bars
    this.add.text(80, 58, GameState.p1Power.name, {
      fontFamily: 'Inter, sans-serif', fontSize: '11px',
      color:      GameState.p1Power.accentColor,
    });
    this.add.text(W - 80, 58, GameState.p2Power.name, {
      fontFamily: 'Inter, sans-serif', fontSize: '11px',
      color:      GameState.p2Power.accentColor,
    }).setOrigin(1, 0);

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
      fontFamily: 'Bangers, sans-serif', fontSize: '72px', color: '#ffffff',
      stroke: '#6366f1', strokeThickness: 6,
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

    // ── Draw static background ────────────────────────────────────────────
    this._drawArena();

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
      fontFamily: 'Bangers, sans-serif', fontSize: '26px', color: '#ffffff',
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

  // ── Arena Background ──────────────────────────────────────────────────────
  _drawArena() {
    const W = this._W;
    const H = this._H;
    const g = this._bgGfx;

    // Sky gradient
    g.fillGradientStyle(0x0d0d1f, 0x0d0d1f, 0x1a1035, 0x1a1035, 1);
    g.fillRect(0, 0, W, H);

    // Stars
    for (let i = 0; i < 60; i++) {
      const sx = Phaser.Math.Between(0, W);
      const sy = Phaser.Math.Between(0, GROUND_Y - 80);
      const sr = Math.random() * 1.5 + 0.3;
      g.fillStyle(0xffffff, Math.random() * 0.5 + 0.1);
      g.fillCircle(sx, sy, sr);
    }

    // Arena platform
    g.fillStyle(0x1e1b3a, 1);
    g.fillRect(ARENA_LEFT, GROUND_Y + 5, ARENA_RIGHT - ARENA_LEFT, 80);

    // Floor glowing edge
    g.lineStyle(3, 0x6366f1, 0.8);
    g.lineBetween(ARENA_LEFT, GROUND_Y + 5, ARENA_RIGHT, GROUND_Y + 5);
    g.lineStyle(1, 0x818cf8, 0.3);
    g.lineBetween(ARENA_LEFT, GROUND_Y + 9, ARENA_RIGHT, GROUND_Y + 9);

    // Corner columns
    for (const cx of [ARENA_LEFT, ARENA_RIGHT]) {
      g.fillStyle(0x2d2b55, 1);
      g.fillRect(cx - 10, GROUND_Y + 5, 20, 75);
      g.lineStyle(2, 0x6366f1, 0.5);
      g.strokeRect(cx - 10, GROUND_Y + 5, 20, 75);
    }

    // Center line
    g.lineStyle(1, 0x6366f1, 0.15);
    g.lineBetween(W / 2, GROUND_Y + 5, W / 2, GROUND_Y + 80);

    // Background glow beneath stage
    g.fillStyle(0x4f46e5, 0.05);
    g.fillRect(ARENA_LEFT, GROUND_Y + 5, ARENA_RIGHT - ARENA_LEFT, 10);
  }

  // ── Round Win Indicator Dots ──────────────────────────────────────────────
  _drawRoundDots() {
    const g = this._roundDots;
    g.clear();
    const W = this._W;
    const r = 7;
    const gap = 20;

    // P1 win dots (left side)
    for (let i = 0; i < GameState.p1Wins; i++) {
      g.fillStyle(0x7ecfff, 1);
      g.fillCircle(80 + i * (r * 2 + 4), 50, r);
    }
    // Remaining round dots (empty)
    const maxWins = Math.ceil(GameState.maxRounds / 2);
    for (let i = GameState.p1Wins; i < maxWins; i++) {
      g.lineStyle(2, 0x7ecfff, 0.3);
      g.strokeCircle(80 + i * (r * 2 + 4), 50, r);
    }

    // P2 win dots (right side, mirrored)
    for (let i = 0; i < GameState.p2Wins; i++) {
      g.fillStyle(0xff8888, 1);
      g.fillCircle(W - 80 - i * (r * 2 + 4), 50, r);
    }
    for (let i = GameState.p2Wins; i < maxWins; i++) {
      g.lineStyle(2, 0xff8888, 0.3);
      g.strokeCircle(W - 80 - i * (r * 2 + 4), 50, r);
    }
  }

  // ── Health Bar Drawing ────────────────────────────────────────────────────
  _drawHealthBars() {
    const g   = this._uiGfx;
    const W   = this._W;
    const bW  = 300;
    const bH  = 18;
    const bY  = 28;
    g.clear();

    // P1 health bar (left, fills right)
    const p1Pct = this._p1.health / this._p1.maxHealth;
    const p1Col = p1Pct > 0.5 ? 0x22c55e : p1Pct > 0.25 ? 0xf59e0b : 0xef4444;
    g.fillStyle(0x1e1b4b, 0.9);
    g.fillRoundedRect(80, bY, bW, bH, 6);
    g.fillStyle(p1Col, 1);
    g.fillRoundedRect(80, bY, bW * p1Pct, bH, 6);
    g.lineStyle(1, 0x6366f1, 0.5);
    g.strokeRoundedRect(80, bY, bW, bH, 6);

    // P2 health bar (right, fills left)
    const p2Pct = this._p2.health / this._p2.maxHealth;
    const p2Col = p2Pct > 0.5 ? 0x22c55e : p2Pct > 0.25 ? 0xf59e0b : 0xef4444;
    g.fillStyle(0x1e1b4b, 0.9);
    g.fillRoundedRect(W - 80 - bW, bY, bW, bH, 6);
    g.fillStyle(p2Col, 1);
    g.fillRoundedRect(W - 80 - bW * p2Pct, bY, bW * p2Pct, bH, 6);
    g.lineStyle(1, 0x6366f1, 0.5);
    g.strokeRoundedRect(W - 80 - bW, bY, bW, bH, 6);
  }

  // ── Countdown ────────────────────────────────────────────────────────────
  _showCountdown(count, onDone) {
    const W = this._W;
    const H = this._H;

    const txt = this.add.text(W / 2, H / 2, count.toString(), {
      fontFamily: 'Bangers, sans-serif',
      fontSize:   '160px',
      color:      '#ffffff',
      stroke:     '#6366f1',
      strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 0, color: '#818cf8', blur: 40, fill: true },
    }).setOrigin(0.5).setAlpha(1);

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
            fontFamily: 'Bangers, sans-serif',
            fontSize:   '100px',
            color:      '#ffcc00',
            stroke:     '#7a5c00',
            strokeThickness: 6,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff8800', blur: 30, fill: true },
          }).setOrigin(0.5);
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
      fontFamily: 'Bangers, sans-serif',
      fontSize:   '90px',
      color:      col,
      stroke:     '#000000',
      strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 0, color: col, blur: 40, fill: true },
    }).setOrigin(0.5).setAlpha(0);

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
