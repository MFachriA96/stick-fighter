// particles.js — Particle Effect System
// ======================================
// Power-themed particle emitters drawn directly on Phaser Graphics.
// Each hit or combo creates a burst appropriate to the attacker's power.

class ParticleSystem {
  constructor(scene) {
    this.scene  = scene;
    this.particles = []; // array of active particle objects
  }

  /**
   * Spawn a hit-effect burst at (x, y).
   * @param {number} x         - world X position
   * @param {number} y         - world Y position
   * @param {string} powerKey  - 'fire'|'ice'|'speed'|'heavy'
   * @param {boolean} isCombo  - bigger burst on combo landing
   */
  spawnHit(x, y, powerKey, isCombo = false) {
    const cfg      = POWER_PARTICLE_CFG[powerKey] || POWER_PARTICLE_CFG.fire;
    const count    = isCombo ? 20 : 10;
    const speedMul = isCombo ? 1.8 : 1.0;
    const sizeMul  = isCombo ? 1.6 : 1.0;

    for (let i = 0; i < count; i++) {
      const angle  = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed  = Phaser.Math.FloatBetween(60, 160) * speedMul;
      const life   = Phaser.Math.FloatBetween(0.25, 0.55);
      const size   = Phaser.Math.FloatBetween(cfg.minSize, cfg.maxSize) * sizeMul;
      const color  = Phaser.Utils.Array.GetRandom(cfg.colors);

      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        life,
        maxLife: life,
        size,
        color,
        alpha: 1,
      });
    }
  }

  /**
   * Spawn a block-shield flash at (x, y).
   * @param {number} x
   * @param {number} y
   * @param {string} powerKey
   */
  spawnBlock(x, y, powerKey) {
    const cfg = POWER_PARTICLE_CFG[powerKey] || POWER_PARTICLE_CFG.ice;
    for (let i = 0; i < 6; i++) {
      const angle = Phaser.Math.FloatBetween(-Math.PI / 3, Math.PI + Math.PI / 3);
      const speed = Phaser.Math.FloatBetween(30, 80);
      const life  = 0.3;
      const size  = Phaser.Math.FloatBetween(4, 10);
      const color = Phaser.Utils.Array.GetRandom(cfg.colors);
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life, maxLife: life, size, color, alpha: 1,
      });
    }
  }

  /**
   * Update all particles. Call every frame with delta time in seconds.
   * @param {number} dt - delta time in seconds
   */
  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x    += p.vx * dt;
      p.y    += p.vy * dt;
      p.vy   += 200 * dt; // slight gravity
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  /**
   * Draw all particles onto a Phaser Graphics object.
   * @param {Phaser.GameObjects.Graphics} gfx
   */
  draw(gfx) {
    for (const p of this.particles) {
      gfx.fillStyle(p.color, p.alpha);
      gfx.fillCircle(p.x, p.y, p.size);
    }
  }
}

// ── Particle configuration per power ──────────────────────────────────────
const POWER_PARTICLE_CFG = {
  fire: {
    colors:   [0xff6a00, 0xff9900, 0xffcc00, 0xff3300],
    minSize:  3,
    maxSize:  9,
  },
  ice: {
    colors:   [0x7ecfff, 0xb8eeff, 0x55aaff, 0xffffff],
    minSize:  3,
    maxSize:  8,
  },
  speed: {
    colors:   [0xffff55, 0xffffff, 0xddddff, 0xaaffff],
    minSize:  2,
    maxSize:  7,
  },
  heavy: {
    colors:   [0xaa44ff, 0xcc99ff, 0x776688, 0xddaaff],
    minSize:  5,
    maxSize:  14,
  },
};
