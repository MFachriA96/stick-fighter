// player.js — Stickman Player Class
// ===================================
// Handles: procedural stickman drawing, state machine, physics, input,
// power modifiers, health, and attack hitboxes.

// ── Power definitions ──────────────────────────────────────────────────────
const POWERS = {
  fire: {
    key:         'fire',
    name:        'Fire Fist',
    desc:        'Serangan lebih mematikan, beri damage ekstra',
    color:       0xff6a00,
    accentColor: '#ff9900',
    damageMul:   1.3,    // light & heavy attacks × 1.3
    blockMul:    1.0,    // block damage reduction (normal)
    attackCdMul: 1.0,    // cooldown multiplier (1 = default speed)
    heavyMul:    1.0,    // extra multiplier on heavy
    particleKey: 'fire',
  },
  ice: {
    key:         'ice',
    name:        'Ice Guard',
    desc:        'Block lebih kuat, kurangi damage masuk secara drastis',
    color:       0x55aaff,
    accentColor: '#7ecfff',
    damageMul:   1.0,
    blockMul:    0.15,   // only 15% damage gets through when blocking
    attackCdMul: 1.0,
    heavyMul:    1.0,
    particleKey: 'ice',
  },
  speed: {
    key:         'speed',
    name:        'Speed Blade',
    desc:        'Serang lebih sering dengan cooldown minimal',
    color:       0xffff00,
    accentColor: '#ffffff',
    damageMul:   1.0,
    blockMul:    1.0,
    attackCdMul: 0.45,   // cooldowns are 45% of normal
    heavyMul:    1.0,
    particleKey: 'speed',
  },
  heavy: {
    key:         'heavy',
    name:        'Heavy Hammer',
    desc:        'Heavy attack sangat kuat tapi sedikit lebih lambat',
    color:       0xaa44ff,
    accentColor: '#cc99ff',
    damageMul:   1.0,
    blockMul:    1.0,
    attackCdMul: 1.3,    // slightly slower overall
    heavyMul:    2.5,    // heavy attack × 2.5
    particleKey: 'heavy',
  },
};

// ── Base damage values ─────────────────────────────────────────────────────
const BASE_DAMAGE = {
  light:  8,
  heavy:  18,
  combo:  0,   // computed by ComboBuffer's damageMul
};

const BLOCK_DAMAGE_MUL = 0.25; // normal block: 25% damage passes through

// ── Player states ──────────────────────────────────────────────────────────
const STATE = {
  IDLE:    'idle',
  WALK:    'walk',
  JUMP:    'jump',
  PUNCH:   'punch',   // light
  KICK:    'kick',    // heavy
  BLOCK:   'block',
  HIT:     'hit',     // stagger
  KO:      'ko',
};

// ── Constants ──────────────────────────────────────────────────────────────
const GRAVITY        = 900;
const GROUND_Y       = 430;    // y of the floor
const JUMP_VELOCITY  = -560;
const WALK_SPEED     = 210;
const ATTACK_REACH   = 70;     // horizontal range of attack hitbox

// Light attack cooldown (ms) and duration (ms)
const LIGHT_CD  = 380;
const LIGHT_DUR = 180;
// Heavy attack cooldown (ms) and duration (ms)
const HEAVY_CD  = 620;
const HEAVY_DUR = 280;
// Hit stagger duration (ms)
const HIT_DUR   = 300;

class Player {
  /**
   * @param {object} opts
   * @param {Phaser.Scene} opts.scene
   * @param {number}  opts.x          - start X
   * @param {number}  opts.y          - start Y (usually GROUND_Y)
   * @param {boolean} opts.facingRight - initial facing direction
   * @param {object}  opts.power      - power object from POWERS
   * @param {number}  opts.outlineColor - hex color for stickman outline
   * @param {string}  opts.label      - 'P1' or 'P2'
   */
  constructor(opts) {
    this.scene        = opts.scene;
    this.x            = opts.x;
    this.y            = opts.y;
    this.vy           = 0;            // vertical velocity
    this.vx           = 0;            // horizontal velocity (for momentum feel)
    this.facingRight  = opts.facingRight;
    this.power        = opts.power;
    this.outlineColor = opts.outlineColor;
    this.label        = opts.label;

    this.health       = 100;
    this.maxHealth    = 100;
    this.state        = STATE.IDLE;

    // Animation timers (ms remaining in current state)
    this.stateTimer   = 0;
    this.attackCd     = 0;           // cooldown before next attack

    // Combo system
    this.combo        = new ComboBuffer();

    // Whether an attack hitbox is active this frame
    this.attackActive = false;
    this.attackType   = null;        // 'light' | 'heavy'
    this.lastComboResult = null;     // last resolved combo result

    // Stickman limb animation angles (radians)
    this.anim = {
      armSwing:  0,
      legSwing:  0,
      bodyBob:   0,
      walkCycle: 0,
    };
    this.animTime = 0;

    // Animation progress for timed states (0 = start, 1 = end)
    this.stateProgress = 0;
    this.stateDuration = 0;

    // Track if grounded
    this.onGround = true;
  }

  // ── Input Processing ──────────────────────────────────────────────────────

  /**
   * Process keyboard input for this player.
   * @param {object} keys - mapped keys from BattleScene
   * @param {number} dt   - delta time in seconds
   * @param {number} now  - current timestamp ms
   */
  processInput(keys, dt, now) {
    if (this.state === STATE.KO) return;

    const blocking = keys.block.isDown && this.onGround;
    if (blocking && this.state !== STATE.HIT && this.attackCd <= 0) {
      if (!this.attackActive) this.state = STATE.BLOCK;
    }

    // Movement (only if not in attack/hit/block or is not attacking)
    const canMove = (this.state !== STATE.HIT &&
                     this.state !== STATE.PUNCH &&
                     this.state !== STATE.KICK);

    if (canMove && !blocking) {
      if (keys.left.isDown) {
        this.vx = -WALK_SPEED;
        if (this.onGround) this.state = STATE.WALK;
      } else if (keys.right.isDown) {
        this.vx = WALK_SPEED;
        if (this.onGround) this.state = STATE.WALK;
      } else {
        this.vx = 0;
        if (this.onGround && this.state === STATE.WALK) this.state = STATE.IDLE;
      }

      // Jump
      if (keys.jump.isDown && this.onGround) {
        this.vy       = JUMP_VELOCITY;
        this.onGround = false;
        this.state    = STATE.JUMP;
      }
    } else if (!canMove || blocking) {
      this.vx = 0;
    }

    // Attack inputs (only if cooldown is done and not in stagger/KO)
    const canAttack = this.attackCd <= 0 &&
                      this.state !== STATE.HIT  &&
                      this.state !== STATE.KO   &&
                      this.state !== STATE.BLOCK;

    if (canAttack) {
      if (keys.light.isDown && !this._lightWasDown) {
        this._startAttack('light', now);
      }
      if (keys.heavy.isDown && !this._heavyWasDown) {
        this._startAttack('heavy', now);
      }
    }

    // Track key-was-down to avoid holding = repeated fire
    this._lightWasDown = keys.light.isDown;
    this._heavyWasDown = keys.heavy.isDown;
  }

  /**
   * Begin an attack action.
   * @param {'light'|'heavy'} type
   * @param {number} now
   */
  _startAttack(type, now) {
    const cdMul   = this.power.attackCdMul;
    const dur     = (type === 'light' ? LIGHT_DUR : HEAVY_DUR);
    const cd      = (type === 'light' ? LIGHT_CD  : HEAVY_CD) * cdMul;

    this.state        = (type === 'light') ? STATE.PUNCH : STATE.KICK;
    this.stateTimer   = dur;
    this.stateDuration = dur;
    this.attackCd     = cd;
    this.attackActive = true;
    this.attackType   = type;

    // Push into combo buffer
    const result      = this.combo.push(type, now);
    this.lastComboResult = result.combo; // null or combo definition
  }

  // ── Physics & State Update ────────────────────────────────────────────────

  /**
   * Update physics and state timers.
   * @param {number} dt   - delta in seconds
   * @param {number} minX - left arena boundary
   * @param {number} maxX - right arena boundary
   */
  update(dt, minX, maxX) {
    const ms = dt * 1000;

    // ── Gravity ──
    if (!this.onGround) {
      this.vy += GRAVITY * dt;
    }

    // ── Position ──
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // ── Ground collision ──
    if (this.y >= GROUND_Y) {
      this.y        = GROUND_Y;
      this.vy       = 0;
      this.onGround = true;
      if (this.state === STATE.JUMP) this.state = STATE.IDLE;
    } else {
      this.onGround = false;
    }

    // ── Arena bounds ──
    this.x = Phaser.Math.Clamp(this.x, minX + 20, maxX - 20);

    // ── State timers ──
    if (this.stateTimer > 0) {
      this.stateTimer -= ms;
      if (this.stateTimer <= 0) {
        this.stateTimer   = 0;
        this.attackActive = false;
        this.attackType   = null;
        // Return to idle only if no movement key held
        if (this.state === STATE.PUNCH || this.state === STATE.KICK ||
            this.state === STATE.HIT) {
          this.state = this.onGround ? STATE.IDLE : STATE.JUMP;
        }
      }
    }

    // ── Attack cooldown ──
    if (this.attackCd > 0) {
      this.attackCd -= ms;
    }

    // ── Animation ──
    this.animTime += dt;

    // Calculate normalized progress for timed states (0 → 1)
    if (this.stateDuration > 0 && this.stateTimer > 0) {
      this.stateProgress = Phaser.Math.Clamp(1 - (this.stateTimer / this.stateDuration), 0, 1);
    } else if (this.state !== STATE.PUNCH && this.state !== STATE.KICK && this.state !== STATE.HIT) {
      this.stateProgress = 0;
    }

    if (this.state === STATE.WALK) {
      this.anim.walkCycle += dt * 8;
      this.anim.legSwing  = Math.sin(this.anim.walkCycle) * 0.5;
      this.anim.armSwing  = -Math.sin(this.anim.walkCycle) * 0.4;
      this.anim.bodyBob   = Math.abs(Math.sin(this.anim.walkCycle)) * 3;
    } else if (this.state === STATE.IDLE) {
      // Breathing animation — subtle alive feel
      this.anim.walkCycle += dt * 2;
      this.anim.legSwing = Phaser.Math.Linear(this.anim.legSwing, 0, 0.15);
      this.anim.armSwing = Math.sin(this.anim.walkCycle * 1.2) * 0.06;
      this.anim.bodyBob  = Math.sin(this.anim.walkCycle) * 1.5;
    } else {
      this.anim.legSwing = Phaser.Math.Linear(this.anim.legSwing, 0, 0.2);
      this.anim.armSwing = Phaser.Math.Linear(this.anim.armSwing, 0, 0.2);
      this.anim.bodyBob  = Phaser.Math.Linear(this.anim.bodyBob, 0, 0.15);
    }
  }

  /**
   * Apply damage to this player from an incoming attack.
   * @param {number} rawDamage
   * @param {boolean} isBlocking - is this player currently blocking?
   * @param {string}  attackerPowerKey - attacker's power (for block calc)
   * @returns {number} actual damage applied
   */
  takeDamage(rawDamage, isBlocking, attackerPowerKey) {
    if (this.state === STATE.KO) return 0;

    let dmg = rawDamage;

    if (isBlocking) {
      const mul = (this.power.key === 'ice')
        ? this.power.blockMul        // Ice Guard bonus
        : BLOCK_DAMAGE_MUL;         // normal block
      dmg = Math.ceil(dmg * mul);
    }

    this.health = Math.max(0, this.health - dmg);

    if (!isBlocking) {
      this.state      = STATE.HIT;
      this.stateTimer = HIT_DUR;
      this.stateDuration = HIT_DUR;
      this.attackActive = false;
    }

    if (this.health <= 0) {
      this.state      = STATE.KO;
      this.stateTimer = 0;
      this.vx         = 0;
      this.combo.reset();
    }

    return dmg;
  }

  /** Returns the current attack hitbox (or null). */
  getAttackHitbox() {
    if (!this.attackActive) return null;
    const dir = this.facingRight ? 1 : -1;
    return {
      x:    this.x + dir * (ATTACK_REACH * 0.5),
      y:    this.y - 60,
      w:    ATTACK_REACH,
      h:    80,
      type: this.attackType,
    };
  }

  /** Returns true if currently blocking. */
  isBlocking() {
    return this.state === STATE.BLOCK;
  }

  // ── Drawing ───────────────────────────────────────────────────────────────

  /**
   * Draw the stickman onto a Phaser Graphics object.
   * @param {Phaser.GameObjects.Graphics} gfx
   */
  draw(gfx) {
    const x    = Math.round(this.x);
    const y    = Math.round(this.y) + this.anim.bodyBob;
    const dir  = this.facingRight ? 1 : -1;
    const col  = this.outlineColor;
    const pCol = this.power.color;
    const st   = this.state;

    // Shadow
    gfx.fillStyle(0x000000, 0.3);
    gfx.fillEllipse(x, GROUND_Y + 5, 50, 12);

    // ── Element Aura Effect ────────────────────────────────────
    // Persistent ambient effect around the character
    if (st !== STATE.KO) {
      const time = Date.now() * 0.003;
      const pk = this.power.key;

      if (pk === 'fire') {
        // Fire: flickering flame particles rising upward
        for (let i = 0; i < 6; i++) {
          const seed = i * 1.7 + time;
          const fx = x + Math.sin(seed * 2.3) * 20;
          const fy = y - 30 - ((seed * 40) % 90);
          const fSize = 3 + Math.sin(seed * 3) * 2;
          const alpha = 0.3 - ((seed * 40) % 90) / 300;
          if (alpha > 0.02) {
            gfx.fillStyle(i % 2 === 0 ? 0xff6a00 : 0xff3300, alpha);
            gfx.fillCircle(fx, fy, fSize);
          }
        }
        // Subtle glow at feet
        gfx.fillStyle(0xff6a00, 0.06 + Math.sin(time * 2) * 0.03);
        gfx.fillCircle(x, y - 50, 40);

      } else if (pk === 'ice') {
        // Ice: sparkle crystals floating around
        for (let i = 0; i < 5; i++) {
          const seed = i * 2.1 + time;
          const ix = x + Math.sin(seed * 1.5) * 25;
          const iy = y - 40 - Math.cos(seed * 0.8) * 40;
          const alpha = 0.2 + Math.sin(seed * 3) * 0.15;
          const sz = 2 + Math.sin(seed * 2) * 1.5;
          gfx.fillStyle(0x88ddff, Math.max(0, alpha));
          gfx.fillRect(ix - sz/2, iy - sz/2, sz, sz);
        }
        // Frosty glow
        gfx.fillStyle(0x55aaff, 0.05 + Math.sin(time * 1.5) * 0.02);
        gfx.fillCircle(x, y - 50, 38);

      } else if (pk === 'speed') {
        // Lightning: crackling bolts around the body
        for (let i = 0; i < 4; i++) {
          const seed = i * 1.3 + time;
          if (Math.sin(seed * 5) > 0.3) {
            const sx = x + Math.sin(seed * 3) * 20 * dir;
            const sy = y - 30 - Math.abs(Math.sin(seed * 2)) * 70;
            const ex = sx + (Math.sin(seed * 7) * 15);
            const ey = sy + 10 + Math.sin(seed * 4) * 8;
            const mx = (sx + ex) / 2 + Math.sin(seed * 11) * 6;
            const my = (sy + ey) / 2;
            gfx.lineStyle(1.5, 0xffff44, 0.5);
            gfx.beginPath();
            gfx.moveTo(sx, sy);
            gfx.lineTo(mx, my);
            gfx.lineTo(ex, ey);
            gfx.strokePath();
          }
        }
        // Electric glow
        gfx.fillStyle(0xffff00, 0.04 + Math.sin(time * 4) * 0.03);
        gfx.fillCircle(x, y - 50, 35);

      } else if (pk === 'heavy') {
        // Hammer: pulsing purple energy circles
        const pulseR = 30 + Math.sin(time * 2) * 8;
        gfx.lineStyle(1.5, 0xaa44ff, 0.15 + Math.sin(time * 2.5) * 0.1);
        gfx.strokeCircle(x, y - 55, pulseR);
        gfx.lineStyle(1, 0xcc66ff, 0.1 + Math.sin(time * 3) * 0.05);
        gfx.strokeCircle(x, y - 55, pulseR * 1.3);
        // Ground cracks (small lines at feet)
        for (let i = 0; i < 3; i++) {
          const seed = i * 2.5 + time * 0.5;
          const cx = x + Math.sin(seed) * 18;
          const alpha = 0.2 + Math.sin(seed * 2) * 0.1;
          gfx.lineStyle(1.5, 0x8833cc, Math.max(0, alpha));
          gfx.beginPath();
          gfx.moveTo(cx, GROUND_Y + 3);
          gfx.lineTo(cx + Math.sin(seed * 3) * 8, GROUND_Y + 8);
          gfx.strokePath();
        }
      }
    }

    // ── Stickman geometry ──────────────────────────────────────
    const HEAD_R = 14;
    const lerp = Phaser.Math.Linear;
    const easeOut = (v) => 1 - (1 - v) * (1 - v);
    const easeIn  = (v) => v * v;
    const t = this.stateProgress;

    // Determine limb angles with smooth multi-phase animation
    let armL = this.anim.armSwing;
    let armR = -this.anim.armSwing;
    let legL = this.anim.legSwing;
    let legR = -this.anim.legSwing;
    let bodyTilt = 0;

    if (st === STATE.PUNCH) {
      // ── Multi-phase Punch: wind-up → strike → follow-through ──
      let leadA, rearA, leadLg, rearLg;
      if (t < 0.3) {
        const p = easeOut(t / 0.3);
        leadA  = -0.5 * p;       // pull arm back
        rearA  =  0.25 * p;     // balance arm forward
        bodyTilt = dir * -0.1 * p;  // lean back
        leadLg = -0.12 * p;
        rearLg =  0.18 * p;
      } else if (t < 0.6) {
        const p = easeOut((t - 0.3) / 0.3);
        leadA  = lerp(-0.5, 1.35, p);   // arm shoots forward
        rearA  = lerp(0.25, -0.4, p);   // rear arm pulls back
        bodyTilt = dir * lerp(-0.1, 0.2, p);  // lunge forward
        leadLg = lerp(-0.12, 0.3, p);   // step forward
        rearLg = lerp(0.18, -0.25, p);  // push off
      } else {
        const p = easeIn((t - 0.6) / 0.4);
        leadA  = lerp(1.35, 0.6, p);    // decelerate
        rearA  = lerp(-0.4, -0.1, p);
        bodyTilt = dir * lerp(0.2, 0.05, p);
        leadLg = lerp(0.3, 0.05, p);
        rearLg = lerp(-0.25, -0.05, p);
      }
      if (this.facingRight) { armR = leadA; armL = rearA; legR = leadLg; legL = rearLg; }
      else { armL = -leadA; armR = -rearA; legL = -leadLg; legR = -rearLg; }

    } else if (st === STATE.KICK) {
      // ── Multi-phase Kick: crouch → swing → extend ──
      let leadA, rearA, leadLg, rearLg;
      if (t < 0.25) {
        const p = easeOut(t / 0.25);
        leadA  = -0.3 * p;
        rearA  =  0.2 * p;
        bodyTilt = dir * -0.12 * p;   // crouch back
        leadLg = -0.55 * p;           // pull leg back
        rearLg =  0.2 * p;
      } else if (t < 0.55) {
        const p = easeOut((t - 0.25) / 0.3);
        leadA  = lerp(-0.3, 0.45, p);
        rearA  = lerp(0.2, -0.45, p);
        bodyTilt = dir * lerp(-0.12, 0.22, p);   // rotate into kick
        leadLg = lerp(-0.55, 1.5, p);             // big leg swing
        rearLg = lerp(0.2, -0.18, p);
      } else {
        const p = easeIn((t - 0.55) / 0.45);
        leadA  = lerp(0.45, 0.15, p);
        rearA  = lerp(-0.45, -0.1, p);
        bodyTilt = dir * lerp(0.22, 0.08, p);
        leadLg = lerp(1.5, 0.85, p);
        rearLg = lerp(-0.18, -0.05, p);
      }
      if (this.facingRight) { armR = leadA; armL = rearA; legR = leadLg; legL = rearLg; }
      else { armL = -leadA; armR = -rearA; legL = -leadLg; legR = -rearLg; }

    } else if (st === STATE.BLOCK) {
      // Defensive stance: arms crossed in front, slight crouch
      armL = dir * 0.6;
      armR = dir * -0.6;
      bodyTilt = dir * -0.05;
      legL =  0.15;
      legR = -0.15;

    } else if (st === STATE.HIT) {
      // Impact → recovery
      if (t < 0.4) {
        const p = easeOut(t / 0.4);
        bodyTilt = dir * 0.28 * p;   // snap backward
        armL = -0.8 * p;             // arms flung out
        armR =  0.6 * p;
        legL =  0.35 * p;
        legR = -0.2 * p;
      } else {
        const p = easeOut((t - 0.4) / 0.6);
        bodyTilt = dir * lerp(0.28, 0, p);
        armL = lerp(-0.8, 0, p);
        armR = lerp(0.6, 0, p);
        legL = lerp(0.35, 0, p);
        legR = lerp(-0.2, 0, p);
      }

    } else if (st === STATE.JUMP) {
      const vyNorm = Phaser.Math.Clamp(this.vy / 500, -1, 1);
      if (vyNorm < 0) {
        // Rising: tuck legs, arms up
        const p = Math.abs(vyNorm);
        legL =  0.55 * p;   legR = -0.55 * p;
        armL = -0.6 * p;    armR =  0.6 * p;
      } else {
        // Falling: extend legs, arms down
        const p = vyNorm;
        legL = -0.3 * p;    legR =  0.3 * p;
        armL =  0.4 * p;    armR = -0.4 * p;
      }

    } else if (st === STATE.KO) {
      bodyTilt = dir * 0.7;
      legL = 0.9;  legR = -0.3;
      armL = -1.0; armR = 0.6;
    }

    // Helper to draw a limb as a line from a pivot (returns end point)
    const limb = (px, py, angle, length, thick, color) => {
      const ex = px + Math.sin(angle) * length;
      const ey = py + Math.cos(angle) * length;
      gfx.lineStyle(thick, color, 1);
      gfx.beginPath();
      gfx.moveTo(px, py);
      gfx.lineTo(ex, ey);
      gfx.strokePath();
      return { x: ex, y: ey };
    };

    // ── Legs ──
    const hipY   = y - 45;
    const legLen = 50;
    const legEndL = limb(x, hipY,  dir * legL + Math.PI / 12, legLen, 4, col);
    const legEndR = limb(x, hipY, -dir * legR - Math.PI / 12, legLen, 4, col);

    // ── Body ──
    const shoulderY = hipY - 55;
    gfx.lineStyle(5, col, 1);
    gfx.beginPath();
    gfx.moveTo(x, hipY);
    gfx.lineTo(x + Math.sin(bodyTilt) * 20, shoulderY);
    gfx.strokePath();
    const sX = x + Math.sin(bodyTilt) * 20;

    // ── Arms ──
    const armLen    = 40;
    const attackArm = st === STATE.PUNCH || st === STATE.KICK;
    const armColorL = (attackArm && !this.facingRight) ? pCol : col;
    const armColorR = (attackArm &&  this.facingRight) ? pCol : col;
    const handL = limb(sX, shoulderY,  dir * armL + Math.PI / 8, armLen, 4, armColorL);
    const handR = limb(sX, shoulderY, -dir * armR - Math.PI / 8, armLen, 4, armColorR);

    // ── Head ──
    const headY  = y - 105;
    const hc = (st === STATE.KO) ? 0x888888 : col;
    gfx.lineStyle(3, hc, 1);
    gfx.strokeCircle(sX, headY, HEAD_R);

    // Eyes
    const eyeDir = this.facingRight ? 1 : -1;
    const eyeX   = sX + eyeDir * 5;
    if (st === STATE.KO) {
      gfx.lineStyle(2, 0xffffff, 0.9);
      gfx.beginPath();
      gfx.moveTo(eyeX - 3, headY - 3); gfx.lineTo(eyeX + 3, headY + 3);
      gfx.moveTo(eyeX + 3, headY - 3); gfx.lineTo(eyeX - 3, headY + 3);
      gfx.strokePath();
    } else {
      gfx.fillStyle(0xffffff, 1);
      gfx.fillCircle(eyeX, headY, 2.5);
    }

    // ── Character Weapons & Attack VFX ─────────────────────────
    const pk = this.power.key;
    const leadHand = this.facingRight ? handR : handL;
    const rearHand = this.facingRight ? handL : handR;
    const kickFoot = this.facingRight ? legEndR : legEndL;

    // Weapon direction (shoulder → lead hand, normalized)
    const wdx = leadHand.x - sX;
    const wdy = leadHand.y - shoulderY;
    const wdl = Math.sqrt(wdx * wdx + wdy * wdy) || 1;
    const wnx = wdx / wdl;
    const wny = wdy / wdl;

    if (pk === 'fire') {
      // ── FIRE FIST: Flame gauntlets ──
      const gSize = attackArm ? 9 : 6;
      // Lead gauntlet (outer glow + core)
      gfx.fillStyle(0xff3300, 0.5);
      gfx.fillCircle(leadHand.x, leadHand.y, gSize + 4);
      gfx.fillStyle(0xff6a00, 0.9);
      gfx.fillCircle(leadHand.x, leadHand.y, gSize);
      gfx.fillStyle(0xffcc44, 0.7);
      gfx.fillCircle(leadHand.x, leadHand.y, gSize * 0.5);
      // Rear gauntlet
      gfx.fillStyle(0xff6a00, 0.6);
      gfx.fillCircle(rearHand.x, rearHand.y, gSize - 2);

      // Punch fire trail
      if (st === STATE.PUNCH && t > 0.25) {
        for (let i = 0; i < 5; i++) {
          const a = (1 - i * 0.2) * 0.55;
          const sz = gSize - i * 1.2;
          gfx.fillStyle(i % 2 === 0 ? 0xff6a00 : 0xffaa00, Math.max(0, a));
          gfx.fillCircle(leadHand.x - dir * i * 7, leadHand.y - i * 2, Math.max(2, sz));
        }
      }
      // Kick fire burst at foot
      if (st === STATE.KICK && t > 0.2 && t < 0.8) {
        const ba = 0.6 * (1 - Math.abs(t - 0.5) / 0.3);
        gfx.fillStyle(0xff6a00, Math.max(0, ba));
        gfx.fillCircle(kickFoot.x, kickFoot.y, 10);
        gfx.fillStyle(0xffcc00, Math.max(0, ba * 0.6));
        gfx.fillCircle(kickFoot.x + dir * 4, kickFoot.y - 3, 6);
      }

    } else if (pk === 'ice') {
      // ── ICE GUARD: Frost blade + hexagonal shield ──
      const bladeLen = attackArm ? 32 : 24;
      const bex = leadHand.x + wnx * bladeLen;
      const bey = leadHand.y + wny * bladeLen;
      // Blade with glow
      gfx.lineStyle(2, 0xaaeeff, 0.4);
      gfx.beginPath(); gfx.moveTo(leadHand.x, leadHand.y); gfx.lineTo(bex, bey); gfx.strokePath();
      gfx.lineStyle(3, 0x88ddff, 0.9);
      gfx.beginPath(); gfx.moveTo(leadHand.x, leadHand.y); gfx.lineTo(bex, bey); gfx.strokePath();
      gfx.fillStyle(0xccffff, 0.85);
      gfx.fillCircle(bex, bey, 2.5);

      // Hexagonal ice shield on rear hand
      const shR = st === STATE.BLOCK ? 18 : 13;
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        pts.push({ x: rearHand.x + Math.cos(a) * shR, y: rearHand.y + Math.sin(a) * shR });
      }
      gfx.fillStyle(0x2266aa, 0.35);
      gfx.fillPoints(pts, true);
      gfx.lineStyle(2, 0x55aaff, 0.8);
      gfx.strokePoints(pts, true);

      // Frost trail during punch
      if (st === STATE.PUNCH && t > 0.25) {
        for (let i = 0; i < 4; i++) {
          const a = (1 - i * 0.25) * 0.4;
          const ox = -dir * i * 5;
          gfx.fillStyle(0xaaddff, Math.max(0, a));
          gfx.fillRect(bex + ox - 1.5, bey - 1.5, 3, 3);
        }
      }
      // Frost kick
      if (st === STATE.KICK && t > 0.2 && t < 0.8) {
        const ba = 0.5 * (1 - Math.abs(t - 0.5) / 0.3);
        for (let i = 0; i < 3; i++) {
          gfx.fillStyle(0xaaddff, Math.max(0, ba - i * 0.12));
          gfx.fillRect(kickFoot.x + dir * i * 4 - 2, kickFoot.y - 2 - i * 3, 4, 4);
        }
      }

    } else if (pk === 'speed') {
      // ── SPEED BLADE: Katana ──
      const katanaLen = attackArm ? 52 : 40;
      const kex = leadHand.x + wnx * katanaLen;
      const key2 = leadHand.y + wny * katanaLen;
      // Blade body
      gfx.lineStyle(2.5, 0xdddddd, 0.95);
      gfx.beginPath(); gfx.moveTo(leadHand.x, leadHand.y); gfx.lineTo(kex, key2); gfx.strokePath();
      // Bright edge
      gfx.lineStyle(1, 0xffffff, 0.7);
      gfx.beginPath(); gfx.moveTo(leadHand.x, leadHand.y); gfx.lineTo(kex, key2); gfx.strokePath();
      // Handle guard
      gfx.fillStyle(0xffff44, 0.9);
      gfx.fillCircle(leadHand.x, leadHand.y, 3.5);

      // Slash arc trail during punch
      if (st === STATE.PUNCH && t > 0.2 && t < 0.85) {
        const trailA = 0.45 * (1 - Math.abs(t - 0.5) / 0.35);
        const arcCx = sX + dir * 22;
        const arcCy = shoulderY + 15;
        const arcR  = 58;
        const sa = this.facingRight ? -Math.PI * 0.65 : -Math.PI * 0.35;
        const ea = this.facingRight ?  Math.PI * 0.35 :  Math.PI * 0.65;
        gfx.lineStyle(3, 0xffff88, Math.max(0, trailA));
        gfx.beginPath(); gfx.arc(arcCx, arcCy, arcR, sa, ea, false); gfx.strokePath();
        gfx.lineStyle(1.5, 0xffffcc, Math.max(0, trailA * 0.5));
        gfx.beginPath(); gfx.arc(arcCx, arcCy, arcR + 8, sa + 0.12, ea - 0.12, false); gfx.strokePath();
      }
      // Speed kick afterimage
      if (st === STATE.KICK && t > 0.2 && t < 0.8) {
        const ba = 0.4 * (1 - Math.abs(t - 0.5) / 0.3);
        gfx.lineStyle(3, 0xffff88, Math.max(0, ba));
        gfx.beginPath();
        gfx.moveTo(kickFoot.x - dir * 15, kickFoot.y + 5);
        gfx.lineTo(kickFoot.x + dir * 20, kickFoot.y - 3);
        gfx.strokePath();
        gfx.lineStyle(1.5, 0xffffcc, Math.max(0, ba * 0.5));
        gfx.beginPath();
        gfx.moveTo(kickFoot.x - dir * 10, kickFoot.y + 8);
        gfx.lineTo(kickFoot.x + dir * 25, kickFoot.y);
        gfx.strokePath();
      }

    } else if (pk === 'heavy') {
      // ── HEAVY HAMMER: War hammer ──
      const handleLen = attackArm ? 38 : 30;
      const hex2 = leadHand.x + wnx * handleLen;
      const hey2 = leadHand.y + wny * handleLen;
      // Handle
      gfx.lineStyle(4, 0x664422, 1);
      gfx.beginPath(); gfx.moveTo(leadHand.x, leadHand.y); gfx.lineTo(hex2, hey2); gfx.strokePath();

      // Hammer head (rectangle perpendicular to handle)
      const headW = attackArm ? 20 : 15;
      const headH = attackArm ? 11 : 8;
      const pnx = -wny;  // perpendicular
      const pny =  wnx;
      const corners = [
        { x: hex2 + wnx * headH/2 + pnx * headW/2, y: hey2 + wny * headH/2 + pny * headW/2 },
        { x: hex2 + wnx * headH/2 - pnx * headW/2, y: hey2 + wny * headH/2 - pny * headW/2 },
        { x: hex2 - wnx * headH/2 - pnx * headW/2, y: hey2 - wny * headH/2 - pny * headW/2 },
        { x: hex2 - wnx * headH/2 + pnx * headW/2, y: hey2 - wny * headH/2 + pny * headW/2 },
      ];
      gfx.fillStyle(0x7744bb, 0.9);
      gfx.fillPoints(corners, true);
      gfx.lineStyle(1.5, 0xcc99ff, 0.85);
      gfx.strokePoints(corners, true);
      // Metallic highlight
      gfx.fillStyle(0xddaaff, 0.4);
      gfx.fillPoints([corners[0], corners[1], {
        x: (corners[1].x + corners[2].x) / 2, y: (corners[1].y + corners[2].y) / 2
      }, {
        x: (corners[0].x + corners[3].x) / 2, y: (corners[0].y + corners[3].y) / 2
      }], true);

      // Impact shockwave during punch
      if (st === STATE.PUNCH && t > 0.35 && t < 0.75) {
        const sa = 0.55 * (1 - Math.abs(t - 0.55) / 0.2);
        const sr = 15 + (t - 0.35) * 90;
        gfx.lineStyle(3, 0xaa44ff, Math.max(0, sa));
        gfx.strokeCircle(hex2, hey2, sr);
        gfx.lineStyle(1.5, 0xcc88ff, Math.max(0, sa * 0.5));
        gfx.strokeCircle(hex2, hey2, sr * 0.6);
      }
      // Ground impact during kick
      if (st === STATE.KICK && t > 0.3 && t < 0.7) {
        const ba = 0.5 * (1 - Math.abs(t - 0.5) / 0.2);
        const br = 12 + (t - 0.3) * 50;
        gfx.lineStyle(2.5, 0xaa44ff, Math.max(0, ba));
        gfx.strokeCircle(kickFoot.x, kickFoot.y, br);
      }
    }

    // ── Block shield ──
    if (st === STATE.BLOCK) {
      gfx.lineStyle(2, pCol, 0.5);
      gfx.strokeCircle(x, y - 60, 45);
      gfx.lineStyle(2, pCol, 0.2);
      gfx.strokeCircle(x, y - 60, 55);
    }
  }
}
