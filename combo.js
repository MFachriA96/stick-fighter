// combo.js — Combo Input Buffer & Detection
// ==========================================
// Tracks recent attack inputs per player within a time window.
// Pattern: light, light, heavy → COMBO x3 (bonus damage + visual feedback).

const COMBO_WINDOW_MS = 600; // max gap between inputs counted as a combo

// Known combo patterns: array of input keys → result
const COMBO_PATTERNS = [
  { sequence: ['light', 'light', 'heavy'], name: 'COMBO x3', damageMul: 2.2 },
  { sequence: ['light', 'heavy'],          name: 'COMBO x2', damageMul: 1.6 },
  { sequence: ['heavy', 'heavy'],          name: 'POWER BREAK', damageMul: 1.9 },
];

class ComboBuffer {
  constructor() {
    this.inputs    = [];  // { key: string, time: number }
    this.lastTime  = 0;
  }

  /**
   * Record an attack input.
   * @param {'light'|'heavy'} key  - type of attack pressed
   * @param {number} now           - current timestamp in ms (e.g. Date.now())
   * @returns {{ combo: object|null, inputs: string[] }}
   *   combo = the matched combo definition, or null if no match yet
   */
  push(key, now) {
    // Flush stale inputs outside the time window
    this.inputs = this.inputs.filter(i => (now - i.time) < COMBO_WINDOW_MS);
    this.inputs.push({ key, time: now });
    this.lastTime = now;

    // Try to match a pattern (longest first)
    const sorted = [...COMBO_PATTERNS].sort((a, b) => b.sequence.length - a.sequence.length);
    for (const pattern of sorted) {
      if (this._matches(pattern.sequence)) {
        this.inputs = []; // clear buffer after a successful combo
        return { combo: pattern, inputs: pattern.sequence };
      }
    }
    return { combo: null, inputs: this.inputs.map(i => i.key) };
  }

  /**
   * Check if the tail of inputs matches the given sequence.
   * @param {string[]} sequence
   */
  _matches(sequence) {
    if (this.inputs.length < sequence.length) return false;
    const tail = this.inputs.slice(-sequence.length).map(i => i.key);
    return sequence.every((s, idx) => s === tail[idx]);
  }

  /** Hard reset (on new round, on KO) */
  reset() {
    this.inputs   = [];
    this.lastTime = 0;
  }
}
