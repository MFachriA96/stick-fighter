const POWER_HTML = `

<style>
#ui-power * { box-sizing: border-box; }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            user-select: none;
        }

        :root {
            --c-fire: #ff5500;
            --c-ice: #3399ff;
            --c-speed: #ffee00;
            --c-hammer: #aa00ff;
        }

        @font-face {
            font-family: 'Edo';
            src: url('aset/edo_sz/edosz.ttf') format('truetype');
        }

        #ui-power {
            width: 960px; height: 540px;
            margin: 0; padding: 0;
            position: absolute; top: 0; left: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-image: url('aset/bg select mode.png');
            background-size: cover;
            background-position: center;
        }

        /* Dark overlay for readability */
        .power-overlay {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.55);
            z-index: 1;
        }

        /* HEADER */
        .header {
            position: relative;
            z-index: 10;
            text-align: center;
            margin-bottom: 20px;
        }

        .header h1 {
            font-family: 'Edo', sans-serif;
            font-size: 38px;
            font-weight: normal;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #cce0ff;
            text-shadow: 0 0 15px rgba(51, 153, 255, 0.6), 0 3px 6px rgba(0,0,0,0.9);
            -webkit-text-stroke: 1px rgba(0,0,0,0.4);
            margin-bottom: 4px;
        }

        .header p {
            font-family: 'Inter', 'Segoe UI', sans-serif;
            color: #8b9bb4;
            font-size: 13px;
            letter-spacing: 1px;
        }

        /* CARD GRID */
        .card-container {
            position: relative;
            z-index: 10;
            display: flex;
            gap: 18px;
            justify-content: center;
            flex-wrap: nowrap;
        }

        /* INDIVIDUAL CARD */
        .card {
            width: 200px;
            height: 300px;
            border-radius: 14px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease;
            border: 3px solid rgba(255,255,255,0.08);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6);
        }

        /* Character artwork fills the card */
        .card-art {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            object-fit: cover;
            z-index: 1;
            transition: filter 0.3s ease;
        }

        /* Power name label at bottom */
        .card-label {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            z-index: 5;
            padding: 10px 0;
            text-align: center;
            font-family: 'Edo', sans-serif;
            font-size: 28px;
            font-weight: normal;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: var(--c);
            text-shadow: 0 2px 6px rgba(0,0,0,0.95), 0 0 20px var(--c);
            -webkit-text-stroke: 1.5px #000;
            background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%);
            transform: translateY(0);
            transition: opacity 0.3s ease;
        }

        /* Aura glow overlay — hidden by default, visible on hover */
        .card-aura {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            z-index: 2;
            opacity: 0;
            transition: opacity 0.4s ease;
            pointer-events: none;
        }

        /* Animated aura particles */
        .aura-particle {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            opacity: 0;
        }

        /* Stats overlay — hidden by default, visible on hover */
        .card-stats-overlay {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            z-index: 4;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 20px 16px;
            opacity: 0;
            transition: opacity 0.35s ease;
            pointer-events: none;
        }

        .stats-container {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .stat-row {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
        }

        .stat-label {
            font-family: 'Edo', sans-serif;
            font-size: 14px;
            color: #fff;
            width: 36px;
            text-shadow: 0 1px 3px #000;
            letter-spacing: 1px;
        }

        .stat-bar {
            flex-grow: 1;
            height: 6px;
            background: rgba(0,0,0,0.6);
            border-radius: 3px;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
        }

        .stat-fill {
            height: 100%;
            background: var(--c);
            border-radius: 3px;
            box-shadow: 0 0 10px var(--c);
            transition: width 0.5s ease;
        }

        .stat-value {
            font-family: 'Inter', sans-serif;
            font-size: 11px;
            color: rgba(255,255,255,0.8);
            width: 28px;
            text-align: right;
            text-shadow: 0 1px 2px #000;
        }

        .power-desc {
            font-family: 'Inter', 'Segoe UI', sans-serif;
            font-size: 12px;
            color: rgba(255,255,255,0.9);
            text-align: center;
            line-height: 1.4;
            text-shadow: 0 1px 4px #000;
            padding: 6px 8px;
            background: rgba(0,0,0,0.5);
            border-radius: 6px;
            border: 1px solid rgba(255,255,255,0.1);
        }

        /* === HOVER EFFECTS === */
        .card:hover {
            transform: translateY(-10px) scale(1.03);
        }

        .card:hover .card-art {
            filter: brightness(0.35);
        }

        .card:hover .card-aura {
            opacity: 1;
        }

        .card:hover .card-stats-overlay {
            opacity: 1;
        }

        .card:hover .card-label {
            opacity: 0;
        }

        /* Per-element card border glow on hover */
        .card[data-power="fire"]:hover { border-color: var(--c-fire); box-shadow: 0 0 30px rgba(255, 85, 0, 0.5), 0 15px 40px rgba(0,0,0,0.7); }
        .card[data-power="ice"]:hover  { border-color: var(--c-ice); box-shadow: 0 0 30px rgba(51, 153, 255, 0.5), 0 15px 40px rgba(0,0,0,0.7); }
        .card[data-power="speed"]:hover { border-color: var(--c-speed); box-shadow: 0 0 30px rgba(255, 238, 0, 0.5), 0 15px 40px rgba(0,0,0,0.7); }
        .card[data-power="hammer"]:hover { border-color: var(--c-hammer); box-shadow: 0 0 30px rgba(170, 0, 255, 0.5), 0 15px 40px rgba(0,0,0,0.7); }

        /* Fire aura */
        .card[data-power="fire"] .card-aura {
            background: radial-gradient(ellipse at center bottom, rgba(255, 85, 0, 0.25) 0%, transparent 70%);
            box-shadow: inset 0 -60px 60px -20px rgba(255, 60, 0, 0.3);
        }
        /* Ice aura */
        .card[data-power="ice"] .card-aura {
            background: radial-gradient(ellipse at center, rgba(51, 153, 255, 0.2) 0%, transparent 70%);
            box-shadow: inset 0 0 40px rgba(100, 200, 255, 0.2);
        }
        /* Speed aura */
        .card[data-power="speed"] .card-aura {
            background: radial-gradient(ellipse at center, rgba(255, 238, 0, 0.2) 0%, transparent 70%);
            box-shadow: inset 0 0 40px rgba(255, 238, 0, 0.15);
        }
        /* Hammer aura */
        .card[data-power="hammer"] .card-aura {
            background: radial-gradient(ellipse at center bottom, rgba(170, 0, 255, 0.25) 0%, transparent 70%);
            box-shadow: inset 0 -60px 60px -20px rgba(170, 0, 255, 0.25);
        }

        /* Animated aura particles per element */
        @keyframes fireFloat {
            0% { transform: translateY(0) scale(1); opacity: 0.8; }
            100% { transform: translateY(-120px) scale(0.3); opacity: 0; }
        }
        @keyframes iceSparkle {
            0% { transform: scale(0) rotate(0deg); opacity: 0; }
            50% { opacity: 1; transform: scale(1) rotate(180deg); }
            100% { transform: scale(0) rotate(360deg); opacity: 0; }
        }
        @keyframes speedZap {
            0% { opacity: 0; transform: scaleY(0); }
            20% { opacity: 1; transform: scaleY(1); }
            100% { opacity: 0; transform: scaleY(0); }
        }
        @keyframes hammerPulse {
            0% { transform: scale(0.5); opacity: 0; }
            50% { opacity: 0.8; transform: scale(1.2); }
            100% { transform: scale(0.5); opacity: 0; }
        }

        .card[data-power="fire"] .aura-particle { background: #ff5500; animation: fireFloat 1.5s ease-out infinite; }
        .card[data-power="fire"] .aura-particle:nth-child(1) { left: 20%; bottom: 0; width: 8px; height: 8px; animation-delay: 0s; }
        .card[data-power="fire"] .aura-particle:nth-child(2) { left: 45%; bottom: 0; width: 6px; height: 6px; animation-delay: 0.4s; }
        .card[data-power="fire"] .aura-particle:nth-child(3) { left: 70%; bottom: 0; width: 10px; height: 10px; animation-delay: 0.8s; }
        .card[data-power="fire"] .aura-particle:nth-child(4) { left: 35%; bottom: 0; width: 5px; height: 5px; animation-delay: 1.1s; }
        .card[data-power="fire"] .aura-particle:nth-child(5) { left: 80%; bottom: 0; width: 7px; height: 7px; animation-delay: 0.6s; }

        .card[data-power="ice"] .aura-particle { background: #aaddff; animation: iceSparkle 2s ease-in-out infinite; border-radius: 2px; }
        .card[data-power="ice"] .aura-particle:nth-child(1) { left: 15%; top: 20%; width: 6px; height: 6px; animation-delay: 0s; }
        .card[data-power="ice"] .aura-particle:nth-child(2) { left: 70%; top: 40%; width: 4px; height: 4px; animation-delay: 0.6s; }
        .card[data-power="ice"] .aura-particle:nth-child(3) { left: 40%; top: 60%; width: 8px; height: 8px; animation-delay: 1.2s; }
        .card[data-power="ice"] .aura-particle:nth-child(4) { left: 80%; top: 15%; width: 5px; height: 5px; animation-delay: 0.3s; }
        .card[data-power="ice"] .aura-particle:nth-child(5) { left: 25%; top: 75%; width: 3px; height: 3px; animation-delay: 0.9s; }

        .card[data-power="speed"] .aura-particle { background: #ffee00; animation: speedZap 0.8s ease-in-out infinite; width: 2px !important; border-radius: 0; }
        .card[data-power="speed"] .aura-particle:nth-child(1) { left: 20%; top: 10%; height: 30px; animation-delay: 0s; }
        .card[data-power="speed"] .aura-particle:nth-child(2) { left: 55%; top: 30%; height: 25px; animation-delay: 0.2s; }
        .card[data-power="speed"] .aura-particle:nth-child(3) { left: 75%; top: 50%; height: 35px; animation-delay: 0.5s; }
        .card[data-power="speed"] .aura-particle:nth-child(4) { left: 40%; top: 70%; height: 20px; animation-delay: 0.3s; }
        .card[data-power="speed"] .aura-particle:nth-child(5) { left: 85%; top: 20%; height: 28px; animation-delay: 0.7s; }

        .card[data-power="hammer"] .aura-particle { background: #aa00ff; animation: hammerPulse 2s ease-in-out infinite; }
        .card[data-power="hammer"] .aura-particle:nth-child(1) { left: 25%; top: 70%; width: 12px; height: 12px; animation-delay: 0s; }
        .card[data-power="hammer"] .aura-particle:nth-child(2) { left: 60%; top: 80%; width: 8px; height: 8px; animation-delay: 0.5s; }
        .card[data-power="hammer"] .aura-particle:nth-child(3) { left: 45%; top: 60%; width: 10px; height: 10px; animation-delay: 1s; }
        .card[data-power="hammer"] .aura-particle:nth-child(4) { left: 15%; top: 85%; width: 6px; height: 6px; animation-delay: 0.7s; }
        .card[data-power="hammer"] .aura-particle:nth-child(5) { left: 75%; top: 65%; width: 9px; height: 9px; animation-delay: 1.3s; }

        /* BOTTOM UI */
        .bottom-ui {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 870px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 10px;
            margin-top: 18px;
        }

        .back-btn {
            font-family: 'Edo', sans-serif;
            color: #8b9bb4;
            background: rgba(0,0,0,0.4);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 6px;
            font-size: 16px;
            padding: 6px 16px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 5px;
            letter-spacing: 1px;
        }
        .back-btn:hover { color: #fff; background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); }

        .player-indicators {
            display: flex;
            gap: 60px;
            font-family: 'Edo', sans-serif;
            font-size: 18px;
            letter-spacing: 2px;
            color: #4a5568;
        }
        .p-indicator span { color: #fff; margin-left: 10px; }

</style>
<div id="ui-power">

    <div class="power-overlay"></div>

    <div class="header">
        <h1>PLAYER 1 &mdash; SELECT POWER</h1>
        <p>Choose your fighter's power</p>
    </div>

    <div class="card-container">

        <!-- FIRE FIST -->
        <div class="card" id="power-fire" data-power="fire" style="--c: var(--c-fire);">
            <img class="card-art" src="aset/fire_fist.png" alt="Fire Fist" />
            <div class="card-aura">
                <div class="aura-particle"></div><div class="aura-particle"></div><div class="aura-particle"></div><div class="aura-particle"></div><div class="aura-particle"></div>
            </div>
            <div class="card-stats-overlay">
                <div class="power-desc">Attacks deal 30% extra damage. Strike with overwhelming firepower.</div>
                <div class="stats-container">
                    <div class="stat-row"><span class="stat-label">ATK</span><div class="stat-bar"><div class="stat-fill" style="width:90%;"></div></div><span class="stat-value">90</span></div>
                    <div class="stat-row"><span class="stat-label">DEF</span><div class="stat-bar"><div class="stat-fill" style="width:40%;"></div></div><span class="stat-value">40</span></div>
                    <div class="stat-row"><span class="stat-label">SPD</span><div class="stat-bar"><div class="stat-fill" style="width:60%;"></div></div><span class="stat-value">60</span></div>
                    <div class="stat-row"><span class="stat-label">HVY</span><div class="stat-bar"><div class="stat-fill" style="width:60%;"></div></div><span class="stat-value">60</span></div>
                </div>
            </div>
            <div class="card-label">Fire Fist</div>
        </div>

        <!-- ICE GUARD -->
        <div class="card" id="power-ice" data-power="ice" style="--c: var(--c-ice);">
            <img class="card-art" src="aset/ice_guard.png" alt="Ice Guard" />
            <div class="card-aura">
                <div class="aura-particle"></div><div class="aura-particle"></div><div class="aura-particle"></div><div class="aura-particle"></div><div class="aura-particle"></div>
            </div>
            <div class="card-stats-overlay">
                <div class="power-desc">Blocks reduce 85% incoming damage. An impenetrable fortress of ice.</div>
                <div class="stats-container">
                    <div class="stat-row"><span class="stat-label">ATK</span><div class="stat-bar"><div class="stat-fill" style="width:50%;"></div></div><span class="stat-value">50</span></div>
                    <div class="stat-row"><span class="stat-label">DEF</span><div class="stat-bar"><div class="stat-fill" style="width:95%;"></div></div><span class="stat-value">95</span></div>
                    <div class="stat-row"><span class="stat-label">SPD</span><div class="stat-bar"><div class="stat-fill" style="width:50%;"></div></div><span class="stat-value">50</span></div>
                    <div class="stat-row"><span class="stat-label">HVY</span><div class="stat-bar"><div class="stat-fill" style="width:40%;"></div></div><span class="stat-value">40</span></div>
                </div>
            </div>
            <div class="card-label">Ice Guard</div>
        </div>

        <!-- SPEED BLADE -->
        <div class="card" id="power-speed" data-power="speed" style="--c: var(--c-speed);">
            <img class="card-art" src="aset/speed_blade.png" alt="Speed Blade" />
            <div class="card-aura">
                <div class="aura-particle"></div><div class="aura-particle"></div><div class="aura-particle"></div><div class="aura-particle"></div><div class="aura-particle"></div>
            </div>
            <div class="card-stats-overlay">
                <div class="power-desc">Attack cooldowns reduced by 55%. Relentless barrage of lightning-fast strikes.</div>
                <div class="stats-container">
                    <div class="stat-row"><span class="stat-label">ATK</span><div class="stat-bar"><div class="stat-fill" style="width:60%;"></div></div><span class="stat-value">60</span></div>
                    <div class="stat-row"><span class="stat-label">DEF</span><div class="stat-bar"><div class="stat-fill" style="width:40%;"></div></div><span class="stat-value">40</span></div>
                    <div class="stat-row"><span class="stat-label">SPD</span><div class="stat-bar"><div class="stat-fill" style="width:95%;"></div></div><span class="stat-value">95</span></div>
                    <div class="stat-row"><span class="stat-label">HVY</span><div class="stat-bar"><div class="stat-fill" style="width:50%;"></div></div><span class="stat-value">50</span></div>
                </div>
            </div>
            <div class="card-label">Speed Blade</div>
        </div>

        <!-- HEAVY HAMMER -->
        <div class="card" id="power-hammer" data-power="hammer" style="--c: var(--c-hammer);">
            <img class="card-art" src="aset/heavy_hammer.png" alt="Heavy Hammer" />
            <div class="card-aura">
                <div class="aura-particle"></div><div class="aura-particle"></div><div class="aura-particle"></div><div class="aura-particle"></div><div class="aura-particle"></div>
            </div>
            <div class="card-stats-overlay">
                <div class="power-desc">Heavy attacks deal 2.5x damage. Slow but devastating hammer strikes.</div>
                <div class="stats-container">
                    <div class="stat-row"><span class="stat-label">ATK</span><div class="stat-bar"><div class="stat-fill" style="width:70%;"></div></div><span class="stat-value">70</span></div>
                    <div class="stat-row"><span class="stat-label">DEF</span><div class="stat-bar"><div class="stat-fill" style="width:70%;"></div></div><span class="stat-value">70</span></div>
                    <div class="stat-row"><span class="stat-label">SPD</span><div class="stat-bar"><div class="stat-fill" style="width:30%;"></div></div><span class="stat-value">30</span></div>
                    <div class="stat-row"><span class="stat-label">HVY</span><div class="stat-bar"><div class="stat-fill" style="width:95%;"></div></div><span class="stat-value">95</span></div>
                </div>
            </div>
            <div class="card-label">Heavy Hammer</div>
        </div>

    </div>

    <!-- BOTTOM UI -->
    <div class="bottom-ui">
        <button class="back-btn" id="btn-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back
        </button>

        <div class="player-indicators">
            <div class="p-indicator">P1: <span>-</span></div>
            <div class="p-indicator">P2: <span>-</span></div>
        </div>

        <div style="width: 60px;"></div>
    </div>

</div>

`;

// scenes/PowerScene.js — Power/Weapon Selection
// ===============================================

const POWER_LIST = [POWERS.fire, POWERS.ice, POWERS.speed, POWERS.heavy];

class PowerScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PowerScene' });
  }

  

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this._phase = 'p1';
    this._p1Selected = null;
    this._p2Selected = null;

    this.ui = this.add.dom(0, 0).setOrigin(0, 0).createFromHTML(POWER_HTML);

    // DOM Elements we need to update
    this.titleEl = this.ui.node.querySelector('.header h1');
    this.subEl = this.ui.node.querySelector('.header p');
    this.p1Indicator = this.ui.node.querySelector('.p-indicator:nth-child(1) span');
    this.p2Indicator = this.ui.node.querySelector('.p-indicator:nth-child(2) span');

    this.ui.addListener('click');
    this.ui.on('click', (event) => {
      const target = event.target.closest('.card') || event.target;
      
      if (target.id === 'btn-back' || target.closest('#btn-back')) {
        this.cameras.main.fadeOut(100, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('ModeScene');
        });
        return;
      }

      let chosenKey = null;
      if (target.id === 'power-fire') chosenKey = 'fire';
      else if (target.id === 'power-ice') chosenKey = 'ice';
      else if (target.id === 'power-speed') chosenKey = 'speed';
      else if (target.id === 'power-hammer') chosenKey = 'heavy';

      if (chosenKey) {
        this._onCardClick(chosenKey, target);
      }
    });

    this.cameras.main.fadeIn(120, 0, 0, 0);
  }

  _onCardClick(chosenKey, targetEl) {
    if (this._phase === 'done') return;
    
    const pw = POWERS[chosenKey];

    if (this._phase === 'p1') {
      this._p1Selected = chosenKey;
      this.p1Indicator.innerText = pw.name;
      this.p1Indicator.style.color = pw.accentColor || '#ffffff';

      if (GameState.mode === '1p') {
        const others = POWER_LIST.filter(p => p.key !== chosenKey);
        const cpuPw = Phaser.Utils.Array.GetRandom(others);
        this._p2Selected = cpuPw.key;
        this.p2Indicator.innerText = cpuPw.name + ' (CPU)';
        this.p2Indicator.style.color = cpuPw.accentColor || '#ffffff';
        this._phase = 'done';
        this._startBattle();
      } else {
        this._phase = 'p2';
        this.titleEl.innerText = 'PLAYER 2 — SELECT POWER';
        this.titleEl.style.color = '#ff8888';
        this.titleEl.style.textShadow = '0 0 15px rgba(255, 136, 136, 0.6), 0 3px 6px rgba(0,0,0,0.9)';
        this.subEl.innerText = 'Player 2: choose your power!';
      }
    } else if (this._phase === 'p2') {
      this._p2Selected = chosenKey;
      this.p2Indicator.innerText = pw.name;
      this.p2Indicator.style.color = pw.accentColor || '#ffffff';
      this._phase = 'done';
      this._startBattle();
    }
  }

  _startBattle() {
    GameState.p1Power = POWERS[this._p1Selected];
    GameState.p2Power = POWERS[this._p2Selected];
    this.time.delayedCall(100, () => {
      this.cameras.main.fadeOut(150, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('BattleScene');
      });
    });
  }
}
