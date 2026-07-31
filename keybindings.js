// keybindings.js — Persistent Key Binding Store
// ================================================
// Default keyboard mappings for both players.
// Any scene can read from this, and SettingsScene writes to it.
// Keys are stored as Phaser.Input.Keyboard.KeyCodes integer values.

const KC = Phaser.Input.Keyboard.KeyCodes;

const KeyBindings = {
  p1: {
    left:  KC.A,
    right: KC.D,
    jump:  KC.W,
    light: KC.F,
    heavy: KC.G,
    block: KC.S,
  },
  p2: {
    left:  KC.LEFT,
    right: KC.RIGHT,
    jump:  KC.UP,
    light: KC.NUMPAD_ONE,
    heavy: KC.NUMPAD_TWO,
    block: KC.DOWN,
  },
};

// Human-readable labels for each action
const ACTION_LABELS = {
  left:  'Move Left',
  right: 'Move Right',
  jump:  'Jump',
  light: 'Light Attack',
  heavy: 'Heavy Attack',
  block: 'Block',
};

/**
 * Convert a Phaser KeyCode integer to a short display string.
 * Covers common keys without needing a full lookup table.
 * @param {number} code
 * @returns {string}
 */
function keyName(code) {
  const KC = Phaser.Input.Keyboard.KeyCodes;
  const map = {
    [KC.A]: 'A', [KC.B]: 'B', [KC.C]: 'C', [KC.D]: 'D',
    [KC.E]: 'E', [KC.F]: 'F', [KC.G]: 'G', [KC.H]: 'H',
    [KC.I]: 'I', [KC.J]: 'J', [KC.K]: 'K', [KC.L]: 'L',
    [KC.M]: 'M', [KC.N]: 'N', [KC.O]: 'O', [KC.P]: 'P',
    [KC.Q]: 'Q', [KC.R]: 'R', [KC.S]: 'S', [KC.T]: 'T',
    [KC.U]: 'U', [KC.V]: 'V', [KC.W]: 'W', [KC.X]: 'X',
    [KC.Y]: 'Y', [KC.Z]: 'Z',
    [KC.ZERO]: '0', [KC.ONE]: '1', [KC.TWO]: '2', [KC.THREE]: '3',
    [KC.FOUR]: '4', [KC.FIVE]: '5', [KC.SIX]: '6', [KC.SEVEN]: '7',
    [KC.EIGHT]: '8', [KC.NINE]: '9',
    [KC.UP]: '↑', [KC.DOWN]: '↓', [KC.LEFT]: '←', [KC.RIGHT]: '→',
    [KC.SPACE]: 'Space', [KC.ENTER]: 'Enter', [KC.SHIFT]: 'Shift',
    [KC.CTRL]: 'Ctrl', [KC.ALT]: 'Alt', [KC.TAB]: 'Tab',
    [KC.BACKSPACE]: 'Bksp', [KC.ESC]: 'Esc',
    [KC.NUMPAD_ZERO]: 'Num0', [KC.NUMPAD_ONE]: 'Num1',
    [KC.NUMPAD_TWO]: 'Num2', [KC.NUMPAD_THREE]: 'Num3',
    [KC.NUMPAD_FOUR]: 'Num4', [KC.NUMPAD_FIVE]: 'Num5',
    [KC.NUMPAD_SIX]: 'Num6', [KC.NUMPAD_SEVEN]: 'Num7',
    [KC.NUMPAD_EIGHT]: 'Num8', [KC.NUMPAD_NINE]: 'Num9',
    [KC.NUMPAD_ADD]: 'Num+', [KC.NUMPAD_SUBTRACT]: 'Num-',
    [KC.F1]: 'F1', [KC.F2]: 'F2', [KC.F3]: 'F3', [KC.F4]: 'F4',
    [KC.F5]: 'F5', [KC.F6]: 'F6', [KC.F7]: 'F7', [KC.F8]: 'F8',
    [KC.SEMICOLON]: ';', [KC.COMMA]: ',', [KC.PERIOD]: '.',
    [KC.FORWARD_SLASH]: '/', [KC.BACK_SLASH]: '\\',
    [KC.OPEN_BRACKET]: '[', [KC.CLOSED_BRACKET]: ']',
    [KC.QUOTES]: "'", [KC.BACKTICK]: '`', [KC.MINUS]: '-',
    [KC.PLUS]: '+',
    [KC.HOME]: 'Home', [KC.END]: 'End',
    [KC.PAGE_UP]: 'PgUp', [KC.PAGE_DOWN]: 'PgDn',
    [KC.INSERT]: 'Ins', [KC.DELETE]: 'Del',
  };
  return map[code] || `#${code}`;
}
