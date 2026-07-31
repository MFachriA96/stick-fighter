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
    if (this.state === STATE.WALK) {
      this.anim.walkCycle += dt * 8;
      this.anim.legSwing  = Math.sin(this.anim.walkCycle) * 0.5;
      this.anim.armSwing  = -Math.sin(this.anim.walkCycle) * 0.4;
      this.anim.bodyBob   = Math.abs(Math.sin(this.anim.walkCycle)) * 3;
    } else {
      this.anim.legSwing = Phaser.Math.Linear(this.anim.legSwing, 0, 0.2);
      this.anim.armSwing = Phaser.Math.Linear(this.anim.armSwing, 0, 0.2);
      this.anim.bodyBob  = 0;
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

    // ── Stickman geometry ──────────────────────────────────────
    const HEAD_R = 14;
    const headY  = y - 105;

    // Determine limb angles based on state
    let armL = this.anim.armSwing;
    let armR = -this.anim.armSwing;
    let legL = this.anim.legSwing;
    let legR = -this.anim.legSwing;
    let bodyTilt = 0;

    if (st === STATE.PUNCH) {
      // Extend the leading arm forward
      if (this.facingRight) armR = 0.9;
      else                  armL = -0.9;
    } else if (st === STATE.KICK) {
      // Raise the leading leg
      if (this.facingRight) legR = 1.1;
      else                  legL = -1.1;
      bodyTilt = dir * -0.1;
    } else if (st === STATE.BLOCK) {
      // Arms up in guard
      armL =  0.5 * dir;
      armR = -0.5 * dir;
    } else if (st === STATE.HIT) {
      bodyTilt = dir * 0.15;
    } else if (st === STATE.JUMP) {
      legL =  0.45;
      legR = -0.45;
      armL = -0.5;
      armR =  0.5;
    } else if (st === STATE.KO) {
      bodyTilt = dir * 0.7;
      legL = 0.9; legR = -0.3;
      armL = -1.0; armR = 0.6;
    }

    // Helper to draw a limb as a line from a pivot
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
    const hipY  = y - 45;
    const legLen = 50;
    limb(x, hipY,  dir * legL + Math.PI / 12, legLen, 4, col);
    limb(x, hipY, -dir * legR - Math.PI / 12, legLen, 4, col);

    // ── Body ──
    const shoulderY = hipY - 55;
    gfx.lineStyle(5, col, 1);
    gfx.beginPath();
    gfx.moveTo(x, hipY);
    gfx.lineTo(x + Math.sin(bodyTilt) * 20, shoulderY);
    gfx.strokePath();
    const sX = x + Math.sin(bodyTilt) * 20;

    // ── Arms ──
    const armLen = 40;
    // Leading arm gets power accent color during attack
    const attackArm = st === STATE.PUNCH || st === STATE.KICK;
    const armColorL = (attackArm && !this.facingRight) ? pCol : col;
    const armColorR = (attackArm &&  this.facingRight) ? pCol : col;
    limb(sX, shoulderY,  dir * armL + Math.PI / 8, armLen, 4, armColorL);
    limb(sX, shoulderY, -dir * armR - Math.PI / 8, armLen, 4, armColorR);

    // ── Head ──
    const hc = (st === STATE.KO) ? 0x888888 : col;
    gfx.lineStyle(3, hc, 1);
    gfx.strokeCircle(sX, headY, HEAD_R);

    // Eyes
    const eyeDir = this.facingRight ? 1 : -1;
    const eyeX   = sX + eyeDir * 5;
    if (st === STATE.KO) {
      // X eyes
      gfx.lineStyle(2, 0xffffff, 0.9);
      gfx.beginPath();
      gfx.moveTo(eyeX - 3, headY - 3); gfx.lineTo(eyeX + 3, headY + 3);
      gfx.moveTo(eyeX + 3, headY - 3); gfx.lineTo(eyeX - 3, headY + 3);
      gfx.strokePath();
    } else {
      gfx.fillStyle(0xffffff, 1);
      gfx.fillCircle(eyeX, headY, 2.5);
    }

    // ── Speed Blade lightning lines ──
    if (attackArm && this.power.key === 'speed') {
      gfx.lineStyle(1, 0xffff88, 0.8);
      for (let i = 0; i < 3; i++) {
        const sx = x + Phaser.Math.Between(-15, 15);
        const sy = shoulderY + Phaser.Math.Between(-10, 10);
        gfx.beginPath();
        gfx.moveTo(sx, sy);
        gfx.lineTo(sx + dir * Phaser.Math.Between(20, 50), sy + Phaser.Math.Between(-10, 10));
        gfx.strokePath();
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
