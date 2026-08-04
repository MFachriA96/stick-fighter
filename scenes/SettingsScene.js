// scenes/SettingsScene.js — Controls & Key Binding Screen
// =========================================================
// Shows controls for both players in a clear table layout.
// Clicking any key slot enters "listening" mode: the next key pressed
// becomes the new binding. Duplicate bindings within the same player
// are swapped automatically.

class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Who called us? We'll go back there on close.
    this._fromScene = this.scene.settings.data?.from || 'MenuScene';

    // ── Listening state ─────────────────────────────────────────────────
    // null or { player: 'p1'|'p2', action: string }
    this._listening    = null;
    this._keySlots     = [];   // all rendered key-slot objects (for refresh)

    // Consume keyboard events ourselves while listening
    this._captureHandler = null;

    // ── Background overlay ──────────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x06060f, 0x06060f, 0x0f0d22, 0x0f0d22, 1);
    bg.fillRect(0, 0, W, H);

    // Subtle grid
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x6366f1, 0.04);
    for (let x = 0; x <= W; x += 40) grid.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 40) grid.lineBetween(0, y, W, y);

    // ── Title ───────────────────────────────────────────────────────────
    this.add.text(W / 2, 34, 'SETTINGS', {
      fontFamily: 'Edo, sans-serif',
      fontSize:   '50px',
      color:      '#ffffff',
      stroke:     '#ffcc00',
      strokeThickness: 3,
      shadow: { color: '#000', fill: true, offsetX: 2, offsetY: 2, blur: 5 }
    }).setOrigin(0.5);

    this.add.text(W / 2, 70, 'Klik tombol untuk mengganti key binding — lalu tekan tombol baru', {
      fontFamily: 'Inter, sans-serif',
      fontSize:   '14px',
      color:      '#ffcc00',
      shadow: { color: '#000', fill: true, offsetX: 1, offsetY: 1, blur: 2 }
    }).setOrigin(0.5);

    // ── Player columns ──────────────────────────────────────────────────
    const colDefs = [
      { player: 'p1', label: 'PLAYER 1', color: 0x7ecfff, textCol: '#7ecfff', x: W / 2 - 230 },
      { player: 'p2', label: 'PLAYER 2 / CPU', color: 0xff8888, textCol: '#ff8888', x: W / 2 + 230 },
    ];

    const actions   = Object.keys(ACTION_LABELS);
    const rowStartY = 120;
    const rowH      = 46;

    for (const col of colDefs) {
      // Column header
      this.add.text(col.x, rowStartY - 10, col.label, {
        fontFamily: 'Edo, sans-serif',
        fontSize:   '32px',
        color:      col.textCol,
        shadow: { color: '#000', fill: true, offsetX: 2, offsetY: 2, blur: 4 }
      }).setOrigin(0.5);

      // Divider
      const divGfx = this.add.graphics();
      divGfx.lineStyle(2, col.color, 0.3);
      divGfx.lineBetween(col.x - 170, rowStartY + 16, col.x + 170, rowStartY + 16);

      // Action rows
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        const rowY   = rowStartY + 36 + i * rowH;

        // Action label
        this.add.text(col.x - 95, rowY, ACTION_LABELS[action], {
          fontFamily: 'Inter, sans-serif',
          fontSize:   '15px',
          color:      '#94a3b8',
        }).setOrigin(0, 0.5);

        // Key slot (rendered via graphics + text, stored for refresh)
        const slotGfx  = this.add.graphics();
        const slotText = this.add.text(col.x + 85, rowY, '', {
          fontFamily: 'Bangers, sans-serif',
          fontSize:   '20px',
          color:      '#ffffff',
        }).setOrigin(0.5);

        const slotObj = {
          gfx: slotGfx, text: slotText,
          player: col.player, action,
          x: col.x + 85, y: rowY,
          color: col.color,
          active: false,
        };
        this._keySlots.push(slotObj);
        this._drawSlot(slotObj);

        // Click zone
        const zone = this.add.zone(col.x + 85, rowY, 100, 36).setInteractive({ cursor: 'pointer' });
        zone.on('pointerover', () => {
          if (this._listening) return;
          slotObj.hovered = true;
          this._drawSlot(slotObj);
        });
        zone.on('pointerout', () => {
          slotObj.hovered = false;
          this._drawSlot(slotObj);
        });
        zone.on('pointerdown', () => this._startListening(slotObj));
      }
    }

    // ── Reset to Defaults button ─────────────────────────────────────────
    const resetX = W / 2;
    const resetY = H - 90;
    const resetGfx = this.add.graphics();
    this._drawBtn(resetGfx, resetX, resetY, 200, 36, 0xef4444, false);
    const resetTxt = this.add.text(resetX, resetY, 'Reset Defaults', {
      fontFamily: 'Edo, sans-serif',
      fontSize:   '22px',
      color:      '#ffffff',
    }).setOrigin(0.5);

    const resetZone = this.add.zone(resetX, resetY, 200, 40).setInteractive({ cursor: 'pointer' });
    resetZone.on('pointerover', () => this._drawBtn(resetGfx, resetX, resetY, 200, 40, 0xef4444, true));
    resetZone.on('pointerout',  () => this._drawBtn(resetGfx, resetX, resetY, 200, 40, 0xef4444, false));
    resetZone.on('pointerdown', () => {
      if (this._listening) return;
      this._resetDefaults();
    });

    // ── Back button ──────────────────────────────────────────────────────
    const backX = W / 2;
    const backY = H - 40;
    const backGfx = this.add.graphics();
    this._drawBtn(backGfx, backX, backY, 200, 36, 0xffcc00, false);
    this.add.text(backX, backY, 'Back to Menu', {
      fontFamily: 'Edo, sans-serif',
      fontSize:   '22px',
      color:      '#000000',
    }).setOrigin(0.5);

    const backZone = this.add.zone(backX, backY, 200, 36).setInteractive({ cursor: 'pointer' });
    backZone.on('pointerover', () => {
      this._drawBtn(backGfx, backX, backY, 200, 36, 0xffcc00, true);
    });
    backZone.on('pointerout',  () => {
      this._drawBtn(backGfx, backX, backY, 200, 36, 0xffcc00, false);
    });
    backZone.on('pointerdown', () => {
      if (this._listening) this._cancelListening();
      this.cameras.main.fadeOut(250, 6, 6, 15);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(this._fromScene);
      });
    });

    // ── ESC to cancel listening or go back ────────────────────────────────
    this.input.keyboard.on('keydown-ESC', () => {
      if (this._listening) {
        this._cancelListening();
      } else {
        this.cameras.main.fadeOut(250, 6, 6, 15);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(this._fromScene);
        });
      }
    });

    // ── Overlay for listening mode ────────────────────────────────────────
    this._listenOverlay = this.add.graphics().setAlpha(0);
    this._listenText    = this.add.text(W / 2, H / 2, '', {
      fontFamily: 'Bangers, sans-serif',
      fontSize:   '36px',
      color:      '#ffcc00',
      stroke:     '#7a5c00',
      strokeThickness: 5,
      align:      'center',
      shadow: { offsetX: 0, offsetY: 0, color: '#ffaa00', blur: 25, fill: true },
    }).setOrigin(0.5).setAlpha(0).setDepth(10);

    this._cancelHint = this.add.text(W / 2, H / 2 + 55, 'Tekan ESC untuk batal', {
      fontFamily: 'Inter, sans-serif',
      fontSize:   '14px',
      color:      '#64748b',
    }).setOrigin(0.5).setAlpha(0).setDepth(10);

    this.cameras.main.fadeIn(280, 6, 6, 15);
  }

  // ── Key Slot Rendering ────────────────────────────────────────────────────
  _drawSlot(slot) {
    const { gfx, text, x, y, color, active, hovered, player, action } = slot;
    const label = keyName(KeyBindings[player][action]);
    const w = 100, h = 36;

    gfx.clear();
    if (active) {
      gfx.fillStyle(color, 0.35);
      gfx.lineStyle(2, color, 1);
      // Pulsing handled by tween in startListening
    } else if (hovered) {
      gfx.fillStyle(color, 0.2);
      gfx.lineStyle(2, color, 0.8);
    } else {
      gfx.fillStyle(0x1e1b4b, 0.85);
      gfx.lineStyle(1, color, 0.35);
    }
    gfx.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    gfx.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);

    text.setText(active ? '...' : label);
    text.setColor(active ? '#ffcc00' : '#ffffff');
  }

  // ── Start Listening for a New Key ─────────────────────────────────────────
  _startListening(slotObj) {
    if (this._listening) this._cancelListening();

    this._listening = slotObj;
    slotObj.active  = true;
    this._drawSlot(slotObj);

    // Show overlay hint
    const W = this.scale.width;
    const H = this.scale.height;
    this._listenOverlay.clear();
    this._listenOverlay.fillStyle(0x000000, 0.55);
    this._listenOverlay.fillRect(0, 0, W, H);
    this._listenOverlay.setAlpha(1).setDepth(9);

    const label   = ACTION_LABELS[slotObj.action];
    const pLabel  = slotObj.player === 'p1' ? 'Player 1' : 'Player 2';
    this._listenText.setText(`Tekan tombol baru untuk\n${pLabel} — ${label}`);
    this._listenText.setAlpha(1);
    this._cancelHint.setAlpha(1);

    // Capture the NEXT keydown globally
    const handler = (event) => {
      // ESC = cancel (handled by ESC listener above; remove capture here too)
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC) return;

      const newCode = event.keyCode;
      const player  = slotObj.player;
      const action  = slotObj.action;

      // Swap if another action in same player already uses this key
      const conflict = Object.entries(KeyBindings[player])
        .find(([act, code]) => code === newCode && act !== action);
      if (conflict) {
        // Swap: give the conflicting action the old binding
        KeyBindings[player][conflict[0]] = KeyBindings[player][action];
      }
      KeyBindings[player][action] = newCode;

      this._stopListening();
      this._refreshSlots();
    };

    this._captureHandler = handler;
    this.input.keyboard.once('keydown', handler);
  }

  _cancelListening() {
    if (!this._listening) return;
    // Remove the pending capture handler
    if (this._captureHandler) {
      this.input.keyboard.off('keydown', this._captureHandler);
      this._captureHandler = null;
    }
    this._stopListening();
  }

  _stopListening() {
    if (this._listening) {
      this._listening.active  = false;
      this._listening.hovered = false;
      this._drawSlot(this._listening);
      this._listening = null;
    }
    this._listenOverlay.setAlpha(0);
    this._listenText.setAlpha(0);
    this._cancelHint.setAlpha(0);
    this._captureHandler = null;
  }

  _refreshSlots() {
    for (const slot of this._keySlots) this._drawSlot(slot);
  }

  _resetDefaults() {
    const KC = Phaser.Input.Keyboard.KeyCodes;
    KeyBindings.p1 = { left: KC.A, right: KC.D, jump: KC.W, light: KC.F, heavy: KC.G, block: KC.S };
    KeyBindings.p2 = { left: KC.LEFT, right: KC.RIGHT, jump: KC.UP, light: KC.NUMPAD_ONE, heavy: KC.NUMPAD_TWO, block: KC.DOWN };
    this._refreshSlots();

    // Brief flash
    this.tweens.add({
      targets:  this._keySlots.map(s => s.text),
      alpha:    0.3, duration: 120, yoyo: true, repeat: 1,
    });
  }

  _drawBtn(gfx, cx, cy, w, h, color, hovered) {
    gfx.clear();
    gfx.fillStyle(color, hovered ? 0.5 : 0.2);
    gfx.lineStyle(2, color, hovered ? 1 : 0.5);
    gfx.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
    gfx.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
  }
}
