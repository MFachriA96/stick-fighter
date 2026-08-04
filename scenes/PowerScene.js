const POWER_HTML = `

<style>
#ui-power * { box-sizing: border-box; }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            user-select: none;
        }

        :root {
            /* Warna Elemen Core */
            --c-fire: #ff5500;
            --c-ice: #3399ff;
            --c-speed: #ffee00;
            --c-hammer: #aa00ff;
            
            /* Warna UI */
            --bg-main: #0a0a12;
            --bg-card: #151525;
            --bg-card-hover: #1e1e35;
            --text-main: #ffffff;
            --text-muted: #8b9bb4;
        }

        #ui-power { width: 960px; height: 540px; margin: 0; padding: 20px 15px; position: absolute; top: 0; left: 0; overflow: hidden;
            background-color: var(--bg-main);
            color: var(--text-main);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-evenly;
            background-image: 
                radial-gradient(circle at top, rgba(51, 153, 255, 0.1) 0%, transparent 40%),
                radial-gradient(circle at bottom, rgba(255, 85, 0, 0.05) 0%, transparent 40%);
        }

        /* HEADER SECTION */
        .header {
            text-align: center;
        }

        .header h1 {
            font-size: 32px;
            font-weight: 900;
            text-transform: uppercase;
            font-style: italic;
            letter-spacing: 2px;
            color: #cce0ff;
            text-shadow: 0 0 10px rgba(51, 153, 255, 0.5);
            margin-bottom: 4px;
        }

        .header p {
            color: var(--text-muted);
            font-size: 14px;
            letter-spacing: 1px;
        }

        /* CARD GRID CONTAINER */
        .card-container {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: nowrap;
            max-width: 930px;
            width: 100%;
        }

        /* INDIVIDUAL POWER CARD */
        .card {
            background: var(--bg-card);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 14px;
            width: 215px;
            padding: 15px 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        /* Glow effect at the top of the card based on element color */
        .card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 4px;
            background: var(--c);
            box-shadow: 0 0 15px var(--c);
            transition: height 0.3s ease;
        }

        .card:hover {
            transform: translateY(-6px);
            background: var(--bg-card-hover);
            border-color: var(--c);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(var(--c-rgb), 0.2);
        }

        .card:hover::before {
            height: 100%;
            opacity: 0.05;
        }

        /* AVATAR CONTAINER */
        .avatar-box {
            width: 85px;
            height: 85px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.5);
            border: 2px solid var(--c);
            box-shadow: 0 0 20px rgba(0,0,0,0.8) inset, 0 0 15px var(--c);
            margin-bottom: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            overflow: hidden;
        }

        .avatar-svg {
            width: 100%;
            height: 100%;
            filter: drop-shadow(0 0 5px var(--c));
            transform: translateY(6px); /* Adjust character position in circle */
        }

        /* SVG Character Styling */
        .neon-path { stroke: var(--c); stroke-width: 4; fill: none; stroke-linecap: round; stroke-linejoin: round; }
        .core-path { stroke: #000; stroke-width: 2.5; fill: none; stroke-linecap: round; stroke-linejoin: round; }
        .solid-core { fill: #000; }
        .glow-eye { fill: #fff; filter: drop-shadow(0 0 3px #fff); }
        .energy-hair { fill: var(--c); opacity: 0.8; }

        /* TEXT CONTENT */
        .title {
            font-size: 18px;
            font-weight: 900;
            font-style: italic;
            text-transform: uppercase;
            color: #fff;
            margin-bottom: 6px;
            letter-spacing: 1px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.8);
        }

        .desc {
            font-size: 11px;
            color: var(--text-muted);
            line-height: 1.3;
            margin-bottom: 12px;
            height: 32px; /* Fixed height for alignment */
        }

        /* STAT BARS */
        .stats-container {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .stat-row {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
        }

        .stat-label {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 28px;
        }

        .stat-icon {
            width: 12px;
            height: 12px;
            fill: none;
            stroke: var(--text-muted);
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
            margin-bottom: 2px;
        }

        .stat-label span {
            font-size: 7px;
            font-weight: 800;
            color: var(--text-muted);
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .stat-bar {
            flex-grow: 1;
            height: 4px;
            background: #2a2a40;
            border-radius: 2px;
            overflow: hidden;
        }

        .stat-fill {
            height: 100%;
            background: var(--c);
            border-radius: 2px;
            box-shadow: 0 0 8px var(--c);
        }

        /* BOTTOM UI (P1, P2, Back) */
        .bottom-ui {
            width: 100%;
            max-width: 930px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 10px;
        }

        .back-btn {
            color: var(--text-muted);
            background: transparent;
            border: none;
            font-size: 16px;
            cursor: pointer;
            transition: color 0.2s;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .back-btn:hover { color: #fff; }

        .player-indicators {
            display: flex;
            gap: 100px;
            font-size: 18px;
            font-weight: 800;
            font-style: italic;
            color: #4a5568;
        }
        .p-indicator span { color: #fff; margin-left: 10px; }

    
</style>
<div id="ui-power">
  

    <div class="header">
        <h1>PLAYER 1 &mdash; PILIH POWER</h1>
        <p>Klik kartu power yang ingin kamu gunakan</p>
    </div>

    <div class="card-container">
        
        <!-- 1. FIRE FIST CARD -->
        <div class="card" id="power-fire" style="--c: var(--c-fire);">
            <div class="avatar-box">
                <svg class="avatar-svg" viewBox="0 0 100 100">
                    <!-- Spiky Fire Hair -->
                    <path class="energy-hair" d="M 50 15 Q 40 5 35 15 Q 30 5 25 20 Q 20 15 15 30 Q 20 25 25 35 Q 20 40 30 40 Q 30 30 50 25 Q 70 30 70 40 Q 80 40 75 35 Q 80 25 85 30 Q 80 15 75 20 Q 70 5 65 15 Q 60 5 50 15 Z"/>
                    <!-- Outline & Core -->
                    <g class="neon-path">
                        <circle cx="50" cy="40" r="14" class="solid-core" stroke="var(--c)" stroke-width="3"/>
                        <path d="M 50 54 L 50 95" /> <!-- Body -->
                        <path d="M 50 60 L 25 75 L 35 55" /> <!-- Left Arm Guarding -->
                        <path d="M 50 60 L 75 80 L 85 60" /> <!-- Right Arm Punching -->
                        <circle cx="35" cy="55" r="7" fill="var(--c)"/> <!-- Left Fist -->
                        <circle cx="85" cy="60" r="9" fill="var(--c)"/> <!-- Right Fist Flaming -->
                    </g>
                    <g class="core-path">
                        <path d="M 50 54 L 50 95" />
                        <path d="M 50 60 L 25 75 L 35 55" />
                        <path d="M 50 60 L 75 80 L 85 60" />
                        <circle cx="35" cy="55" r="5" class="solid-core" stroke="none"/>
                        <circle cx="85" cy="60" r="6" class="solid-core" stroke="none"/>
                    </g>
                    <!-- Fierce Eyes -->
                    <path class="glow-eye" d="M 42 35 L 47 38 L 48 35 Z"/>
                    <path class="glow-eye" d="M 58 35 L 53 38 L 52 35 Z"/>
                </svg>
            </div>
            <h3 class="title" style="color: var(--c);">FIRE FIST</h3>
            <p class="desc">Serangan lebih mematikan, beri damage ekstra.</p>
            <div class="stats-container">
                <div class="stat-row">
                    <div class="stat-label"><svg class="stat-icon" viewBox="0 0 24 24"><path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/></svg><span>ATK</span></div>
                    <div class="stat-bar"><div class="stat-fill" style="width: 90%;"></div></div>
                </div>
                <div class="stat-row">
                    <div class="stat-label"><svg class="stat-icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><span>DEF</span></div>
                    <div class="stat-bar"><div class="stat-fill" style="width: 40%;"></div></div>
                </div>
                <div class="stat-row">
                    <div class="stat-label"><svg class="stat-icon" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg><span>SPD</span></div>
                    <div class="stat-bar"><div class="stat-fill" style="width: 90%;"></div></div>
                </div>
                <div class="stat-row">
                    <div class="stat-label"><svg class="stat-icon" viewBox="0 0 24 24"><path d="M2 12h20M7 12V8h10M12 12v10"/></svg><span>HVY</span></div>
                    <div class="stat-bar"><div class="stat-fill" style="width: 60%;"></div></div>
                </div>
            </div>
        </div>

        <!-- 2. ICE GUARD CARD -->
        <div class="card" id="power-ice" style="--c: var(--c-ice);">
            <div class="avatar-box">
                <svg class="avatar-svg" viewBox="0 0 100 100">
                    <!-- Blocky Ice Hair -->
                    <path class="energy-hair" d="M 30 30 L 35 15 L 45 20 L 50 10 L 55 20 L 65 15 L 70 30 Z"/>
                    <!-- Outline & Core -->
                    <g class="neon-path">
                        <circle cx="50" cy="40" r="14" class="solid-core" stroke="var(--c)" stroke-width="3"/>
                        <path d="M 50 54 L 50 95" /> <!-- Body -->
                        <path d="M 50 65 L 20 70 L 35 85" /> <!-- Left Arm holding shield -->
                        <path d="M 50 60 L 80 75" /> <!-- Right Arm down -->
                        <!-- Ice Shield -->
                        <path d="M 15 65 L 45 65 L 50 95 L 30 105 L 10 95 Z" fill="rgba(51, 153, 255, 0.4)" stroke="var(--c)" stroke-width="2"/>
                    </g>
                    <g class="core-path">
                        <path d="M 50 54 L 50 95" />
                        <path d="M 50 65 L 25 70 L 35 85" />
                        <path d="M 50 60 L 80 75" />
                    </g>
                    <!-- Stern Eyes -->
                    <path class="glow-eye" d="M 40 37 L 46 38 L 46 36 Z"/>
                    <path class="glow-eye" d="M 60 37 L 54 38 L 54 36 Z"/>
                </svg>
            </div>
            <h3 class="title" style="color: var(--c);">ICE GUARD</h3>
            <p class="desc">Block lebih kuat, kurangi damage masuk secara drastis.</p>
            <div class="stats-container">
                <div class="stat-row">
                    <div class="stat-label"><svg class="stat-icon" viewBox="0 0 24 24"><path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/></svg><span>ATK</span></div>
                    <div class="stat-bar"><div class="stat-fill" style="width: 100%;"></div></div>
                </div>
                <div class="stat-row">
                    <div class="stat-label"><svg class="stat-icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><span>DEF</span></div>
                    <div class="stat-bar"><div class="stat-fill" style="width: 100%;"></div></div>
                </div>
                <div class="stat-row">
                    <div class="stat-label"><svg class="stat-icon" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg><span>SPD</span></div>
                    <div class="stat-bar"><div class="stat-fill" style="width: 100%;"></div></div>
                </div>
                <div class="stat-row">
                    <div class="stat-label"><svg class="stat-icon" viewBox="0 0 24 24"><path d="M2 12h20M7 12V8h10M12 12v10"/></svg><span>HVY</span></div>
                    <div class="stat-bar"><div class="stat-fill" style="width: 40%;"></div></div>
                </div>
            </div>
        </div>

        <!-- 3. SPEED BLADE CARD -->
        <div class="card" id="power-speed" style="--c: var(--c-speed);">
            <div class="avatar-box">
                <svg class="avatar-svg" viewBox="0 0 100 100">
                    <!-- Swept-back aerodynamic hair -->
                    <path class="energy-hair" d="M 60 30 Q 80 20 90 40 Q 75 35 65 45 Q 85 45 95 60 Q 75 55 60 55 Z"/>
                    <!-- Outline & Core -->
                    <g class="neon-path">
                        <circle cx="45" cy="40" r="14" class="solid-core" stroke="var(--c)" stroke-width="3"/>
                        <path d="M 45 54 L 35 95" /> <!-- Body leaning forward -->
                        <path d="M 45 60 L 15 75 L 10 50" /> <!-- Right Arm with sword -->
                        <path d="M 45 60 L 70 70 L 80 90" /> <!-- Left Arm back -->
                        <!-- Katana Blade -->
                        <path d="M 5 55 Q 15 20 40 5" stroke="var(--c)" stroke-width="3" fill="none"/>
                    </g>
                    <g class="core-path">
                        <path d="M 45 54 L 35 95" />
                        <path d="M 45 60 L 15 75 L 10 50" />
                        <path d="M 45 60 L 70 70 L 80 90" />
                        <path d="M 5 55 Q 15 20 40 5" stroke="#000" stroke-width="1.5" fill="none"/>
                    </g>
                    <!-- Sharp Eyes -->
                    <path class="glow-eye" d="M 32 36 L 40 38 L 40 35 Z"/>
                    <path class="glow-eye" d="M 50 38 L 47 40 L 45 37 Z"/>
                </svg>
            </div>
            <h3 class="title" style="color: var(--c);">SPEED BLADE</h3>
            <p class="desc">Serang lebih sering dengan cooldown minimal.</p>
            <div class="stats-container">
                <div class="stat-row">
                    <div class="stat-label"><svg class="stat-icon" viewBox="0 0 24 24"><path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/></svg><span>ATK</span></div>
                    <div class="stat-bar"><div class="stat-fill" style="width: 80%;"></div></div>
                </div>
                <div class="stat-row">
                    <div class="stat-label"><svg class="stat-icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><span>DEF</span></div>
                    <div class="stat-bar"><div class="stat-fill" style="width: 50%;"></div></div>
                </div>
                <div class="stat-row">
                    <div class="stat-label"><svg class="stat-icon" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg><span>SPD</span></div>
                    <div class="stat-bar"><div class="stat-fill" style="width: 90%;"></div></div>
                </div>
                <div class="stat-row">
                    <div class="stat-label"><svg class="stat-icon" viewBox="0 0 24 24"><path d="M2 12h20M7 12V8h10M12 12v10"/></svg><span>HVY</span></div>
                    <div class="stat-bar"><div class="stat-fill" style="width: 70%;"></div></div>
                </div>
            </div>
        </div>

        <!-- 4. HEAVY HAMMER CARD -->
        <div class="card" id="power-hammer" style="--c: var(--c-hammer);">
            <div class="avatar-box">
                <svg class="avatar-svg" viewBox="0 0 100 100">
                    <!-- Bulky energy aura/hair -->
                    <path class="energy-hair" d="M 35 25 Q 50 10 65 25 Q 75 35 70 50 Q 50 35 30 50 Q 25 35 35 25 Z"/>
                    <!-- Outline & Core -->
                    <g class="neon-path" stroke-width="5">
                        <circle cx="50" cy="40" r="14" class="solid-core" stroke="var(--c)" stroke-width="4"/>
                        <path d="M 50 54 L 50 95" /> <!-- Bulky Body -->
                        <path d="M 50 65 L 20 55 L 25 80" /> <!-- Arms holding hammer -->
                        <path d="M 50 65 L 80 55 L 75 80" /> 
                        <!-- Giant Hammer -->
                        <path d="M 50 105 L 50 50" stroke-width="4"/> <!-- Handle -->
                        <path d="M 25 35 L 75 35 L 85 55 L 15 55 Z" fill="rgba(170, 0, 255, 0.4)" stroke="var(--c)" stroke-width="2"/>
                    </g>
                    <g class="core-path" stroke-width="3">
                        <path d="M 50 54 L 50 95" />
                        <path d="M 50 65 L 20 55 L 25 80" />
                        <path d="M 50 65 L 80 55 L 75 80" />
                        <path d="M 50 105 L 50 50" stroke-width="2"/>
                        <path d="M 30 40 L 70 40 L 75 50 L 25 50 Z" fill="#000" stroke="none"/>
                    </g>
                    <!-- Menacing Eyes -->
                    <path class="glow-eye" d="M 38 38 L 45 42 L 47 38 Z"/>
                    <path class="glow-eye" d="M 62 38 L 55 42 L 53 38 Z"/>
                </svg>
            </div>
            <h3 class="title" style="color: var(--c);">HEAVY HAMMER</h3>
            <p class="desc">Heavy attack sangat kuat tapi sedikit lebih lambat.</p>
            <div class="stats-container">
                <div class="stat-row">
                    <div class="stat-label"><svg class="stat-icon" viewBox="0 0 24 24"><path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/></svg><span>ATK</span></div>
                    <div class="stat-bar"><div class="stat-fill" style="width: 80%;"></div></div>
                </div>
                <div class="stat-row">
                    <div class="stat-label"><svg class="stat-icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><span>DEF</span></div>
                    <div class="stat-bar"><div class="stat-fill" style="width: 90%;"></div></div>
                </div>
                <div class="stat-row">
                    <div class="stat-label"><svg class="stat-icon" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg><span>SPD</span></div>
                    <div class="stat-bar"><div class="stat-fill" style="width: 30%;"></div></div>
                </div>
                <div class="stat-row">
                    <div class="stat-label"><svg class="stat-icon" viewBox="0 0 24 24"><path d="M2 12h20M7 12V8h10M12 12v10"/></svg><span>HVY</span></div>
                    <div class="stat-bar"><div class="stat-fill" style="width: 90%;"></div></div>
                </div>
            </div>
        </div>

    </div>

    <!-- BOTTOM UI NAVIGATION -->
    <div class="bottom-ui">
        <button class="back-btn" id="btn-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back
        </button>
        
        <div class="player-indicators">
            <div class="p-indicator">P1: <span>-</span></div>
            <div class="p-indicator">P2: <span>-</span></div>
        </div>
        
        <!-- Empty div for flexbox alignment -->
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
        this.titleEl.innerText = 'PLAYER 2 — PILIH POWER';
        this.titleEl.style.color = '#ff8888';
        this.titleEl.style.textShadow = '0 0 10px rgba(255, 136, 136, 0.5)';
        this.subEl.innerText = 'Player 2: pilih power untuk bertarung!';
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
