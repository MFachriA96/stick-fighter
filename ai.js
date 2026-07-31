// ai.js — CPU Bot Logic
// ======================
// Simple reactive AI: distance-based attack, random block, aggression
// scales with low HP. Runs every frame, producing an input-like object.

const AI_THINK_MS  = 80;   // how often AI recalculates decision (ms)
const AI_REACT_MS  = 120;  // minimum reaction delay after getting hit

class AIController {
  constructor() {
    this.thinkTimer  = 0;
    this.decision    = this._makeDecision(null, null); // initial
    this._lightWasDown = false;
    this._heavyWasDown = false;
    this._actionQueue  = [];  // queued timed actions
    this._reactDelay   = 0;
  }

  /**
   * Produce a fake "keys" object for the player's processInput.
   * @param {Player} cpu    - the AI-controlled player
   * @param {Player} target - the human player
   * @param {number} dt     - delta time in seconds
   * @param {number} now    - current timestamp ms
   * @returns {object}      - keys-like object
   */
  getKeys(cpu, target, dt, now) {
    const ms = dt * 1000;

    // Tick think timer
    this.thinkTimer -= ms;
    if (this.thinkTimer <= 0) {
      this.thinkTimer  = AI_THINK_MS + Phaser.Math.Between(-20, 30);
      this.decision    = this._makeDecision(cpu, target);
    }

    if (this._reactDelay > 0) this._reactDelay -= ms;

    const d  = this.decision;
    const dx = target.x - cpu.x;

    // Determine move direction
    let moveLeft  = false;
    let moveRight = false;

    if (d.approach) {
      if (dx > 0) moveRight = true;
      else        moveLeft  = true;
    } else if (d.retreat) {
      if (dx > 0) moveLeft  = true;
      else        moveRight = true;
    }

    // Face target
    cpu.facingRight = (dx > 0);

    // Attack decisions
    let light = false;
    let heavy  = false;
    const inRange = Math.abs(dx) < ATTACK_REACH + 20;

    if (inRange && this._reactDelay <= 0) {
      if (d.useLight && !this._lightWasDown) light = true;
      if (d.useHeavy && !this._heavyWasDown) heavy = true;
    }

    // Build pseudo-key object
    const keys = {
      left:  { isDown: moveLeft  },
      right: { isDown: moveRight },
      jump:  { isDown: d.jump && cpu.onGround },
      light: { isDown: light },
      heavy: { isDown: heavy },
      block: { isDown: d.block },
    };

    this._lightWasDown = light;
    this._heavyWasDown = heavy;

    return keys;
  }

  /**
   * Make a new decision based on current game state.
   * @param {Player|null} cpu
   * @param {Player|null} target
   */
  _makeDecision(cpu, target) {
    if (!cpu || !target) {
      return { approach: true, retreat: false, useLight: false,
               useHeavy: false, block: false, jump: false };
    }

    const hp          = cpu.health / cpu.maxHealth;
    const aggression  = hp < 0.3 ? 1.0 : hp < 0.6 ? 0.65 : 0.4;
    const dx          = Math.abs(target.x - cpu.x);
    const targetAtt   = target.state === STATE.PUNCH || target.state === STATE.KICK;
    const inRange     = dx < ATTACK_REACH + 25;

    // Decide to block reactively when target is attacking and close
    const block = targetAtt && inRange && Math.random() < 0.45;

    // Decide attack type
    let useLight = false;
    let useHeavy = false;
    if (!block && inRange) {
      const r = Math.random();
      if (r < aggression * 0.55) useLight = true;
      if (r < aggression * 0.35) useHeavy = true;
    }

    // Jump occasionally if target is very close and aggressive
    const jump = inRange && Math.random() < 0.08;

    return {
      approach: !inRange && !block,
      retreat:  block && Math.random() < 0.3,
      useLight,
      useHeavy,
      block,
      jump,
    };
  }

  /** Call this when the CPU gets hit, to apply a reaction delay. */
  onHit() {
    this._reactDelay = AI_REACT_MS + Phaser.Math.Between(0, 80);
  }
}
