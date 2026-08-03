const MENU_HTML = `

<style>
#ui-menu * { box-sizing: border-box; }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            user-select: none;
        }

        :root {
            /* Warna Power Karakter */
            --c-fire: #ff5500;
            --c-ice: #3399ff;
            --c-speed: #ffee00;
            --c-hammer: #aa00ff;
        }

        #ui-menu { width: 960px; height: 540px; margin: 0; padding: 0; position: absolute; top: 0; left: 0; overflow: hidden;
            background: linear-gradient(180deg, #050514 0%, #11112b 60%, #000000 100%);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            position: relative;
        }

        /* ENVIRONMENT */
        .stars {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background-image: 
                radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
                radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)),
                radial-gradient(2px 2px at 160px 120px, #ddd, rgba(0,0,0,0));
            background-repeat: repeat; background-size: 200px 200px;
            opacity: 0.4; z-index: 1;
        }

        .moon {
            position: absolute;
            top: 15%; left: 50%; transform: translateX(-50%);
            width: 500px; height: 500px;
            background: #2a3a5a; border-radius: 50%;
            box-shadow: 0 0 60px #2a3a5a, 0 0 120px rgba(42, 58, 90, 0.4), inset 0 0 40px rgba(0,0,0,0.8);
            z-index: 2; opacity: 0.7;
        }

        .landscape {
            position: absolute; bottom: 0; left: 0; width: 100%; height: 20%;
            background: #050505; z-index: 3;
            clip-path: polygon(0% 20%, 15% 10%, 35% 25%, 55% 5%, 75% 20%, 100% 10%, 100% 100%, 0% 100%);
            border-top: 2px solid #111;
        }
        
        .mist {
            position: absolute; bottom: 0; left: 0; width: 100%; height: 40%;
            background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0, 170, 255, 0.05), transparent);
            z-index: 6; /* Asap menutupi kaki karakter */
        }

        /* UI MENU UTAMA */
        .main-menu {
            position: relative; z-index: 10;
            text-align: center; display: flex; flex-direction: column; align-items: center;
            gap: 15px; margin-top: -80px;
        }

        .title-glow {
            font-size: 85px; font-weight: 900; color: #ffffff;
            text-transform: uppercase; letter-spacing: 5px;
            text-shadow: 0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(0, 170, 255, 0.6);
            margin-bottom: -15px;
        }

        .subtitle-glow {
            font-size: 35px; font-weight: 800; color: #a0c4ff;
            letter-spacing: 6px; text-shadow: 0 0 15px rgba(160, 196, 255, 0.5);
        }

        .credit-title {
            font-size: 18px; color: #fff; font-weight: 800;
            letter-spacing: 2px; margin-bottom: 25px;
            background: linear-gradient(90deg, var(--c-fire), var(--c-speed), var(--c-ice), var(--c-hammer));
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            text-shadow: 0 0 20px rgba(255,255,255,0.2);
        }

        .btn {
            padding: 16px 60px; font-size: 22px; font-weight: 900;
            color: white; background: rgba(0, 0, 0, 0.6);
            border: 2px solid #fff; border-radius: 12px; cursor: pointer;
            text-transform: uppercase; letter-spacing: 4px; transition: all 0.3s ease;
            backdrop-filter: blur(5px);
        }

        .btn:hover {
            background: #fff; color: #000;
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
            transform: scale(1.05);
        }

        /* KARAKTER STICKMAN (4 POWERS) */
        .fighter-stage {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 5;
        }

        .char {
            position: absolute; bottom: 15%; width: 250px; height: 350px;
            animation: breathe 3s infinite ease-in-out alternate;
        }

        /* 1. Heavy Hammer (Ungu) - Belakang Kiri */
        .char-hammer {
            left: 5%; bottom: 18%; transform: scale(0.85);
            color: var(--c-hammer); filter: drop-shadow(0 0 15px var(--c-hammer));
            animation-delay: 0.2s;
        }

        /* 2. Fire Fist (Oranye) - Depan Kiri */
        .char-fire {
            left: 22%; bottom: 12%; transform: scale(1.05);
            color: var(--c-fire); filter: drop-shadow(0 0 20px var(--c-fire));
            animation-delay: 0.5s;
        }

        /* 3. Speed Blade (Kuning) - Depan Kanan */
        .char-speed {
            right: 22%; bottom: 12%; transform: scale(1.05) scaleX(-1);
            color: var(--c-speed); filter: drop-shadow(0 0 20px var(--c-speed));
            animation-delay: 0.1s;
        }

        /* 4. Ice Guard (Biru) - Belakang Kanan */
        .char-ice {
            right: 5%; bottom: 18%; transform: scale(0.85) scaleX(-1);
            color: var(--c-ice); filter: drop-shadow(0 0 15px var(--c-ice));
            animation-delay: 0.7s;
        }

        @keyframes breathe {
            0% { margin-bottom: 0px; filter: drop-shadow(0 0 15px currentColor); }
            100% { margin-bottom: 10px; filter: drop-shadow(0 0 30px currentColor); }
        }
        
        .glowing-eye { fill: #fff; filter: drop-shadow(0 0 5px #fff); }

        /* Setup SVG Outline/Core */
        .neon-outline { stroke: currentColor; stroke-width: 14; fill: none; stroke-linecap: round; stroke-linejoin: round; }
        .core-#ui-menu { width: 960px; height: 540px; margin: 0; padding: 0; position: absolute; top: 0; left: 0; overflow: hidden; stroke: #000; stroke-width: 8; fill: none; stroke-linecap: round; stroke-linejoin: round; }
    
</style>
<div id="ui-menu">
  

    <div class="stars"></div>
    <div class="moon"></div>
    <div class="landscape"></div>
    
    <div class="fighter-stage">
        
        <!-- 1. HEAVY HAMMER (Ungu) -->
        <svg class="char char-hammer" viewBox="0 0 200 300">
            <!-- Outline -->
            <g class="neon-outline">
                <circle cx="100" cy="60" r="20" fill="currentColor"/>
                <path d="M 100 80 L 100 160" /> <!-- Badan -->
                <path d="M 100 90 L 50 140 L 80 180" /> <!-- Tangan angkat palu -->
                <path d="M 100 90 L 140 130" /> <!-- Tangan 2 -->
                <path d="M 100 160 L 70 260 L 40 260" /> <!-- Kaki -->
                <path d="M 100 160 L 130 260 L 160 260" /> 
                <!-- Palu Besar -->
                <path d="M 110 240 L 40 60" stroke-width="8"/> <!-- Gagang -->
                <path d="M 10 90 L 70 70 L 90 120 L 30 140 Z" fill="currentColor" stroke-width="4"/> <!-- Kepala Palu -->
            </g>
            <!-- Core Hitam -->
            <g class="core-body">
                <circle cx="100" cy="60" r="17" fill="#000" stroke="none"/>
                <path d="M 100 80 L 100 160" />
                <path d="M 100 90 L 50 140 L 80 180" />
                <path d="M 100 90 L 140 130" />
                <path d="M 100 160 L 70 260 L 40 260" />
                <path d="M 100 160 L 130 260 L 160 260" />
                <path d="M 110 240 L 40 60" stroke-width="4"/>
                <path d="M 15 92 L 65 75 L 80 115 L 30 132 Z" fill="#000" stroke-width="2"/>
            </g>
            <path d="M 85 55 L 95 60 L 98 55" class="glowing-eye" stroke="#fff" stroke-width="2" fill="none"/>
        </svg>

        <!-- 2. FIRE FIST (Oranye) -->
        <svg class="char char-fire" viewBox="0 0 200 300">
            <!-- Kuda-kuda meninju -->
            <g class="neon-outline">
                <circle cx="100" cy="65" r="20" fill="currentColor"/>
                <path d="M 100 85 L 110 160" /> 
                <path d="M 100 95 L 40 110 L 70 100" /> <!-- Tinju depan -->
                <path d="M 100 95 L 160 120 L 150 70" /> <!-- Tinju tarik ke belakang -->
                <path d="M 110 160 L 60 250" /> 
                <path d="M 110 160 L 160 260" />
                <!-- Efek Tinju Api Besar -->
                <circle cx="70" cy="100" r="15" fill="currentColor"/>
                <circle cx="150" cy="70" r="18" fill="currentColor"/>
            </g>
            <g class="core-body">
                <circle cx="100" cy="65" r="17" fill="#000" stroke="none"/>
                <path d="M 100 85 L 110 160" /> 
                <path d="M 100 95 L 40 110 L 70 100" />
                <path d="M 100 95 L 160 120 L 150 70" />
                <path d="M 110 160 L 60 250" /> 
                <path d="M 110 160 L 160 260" />
                <circle cx="70" cy="100" r="10" fill="#000"/>
                <circle cx="150" cy="70" r="12" fill="#000"/>
            </g>
            <path d="M 85 60 L 95 65 L 98 60" class="glowing-eye" stroke="#fff" stroke-width="2" fill="none"/>
            <path d="M 115 60 L 105 65 L 102 60" class="glowing-eye" stroke="#fff" stroke-width="2" fill="none"/>
        </svg>

        <!-- 3. SPEED BLADE (Kuning) -->
        <svg class="char char-speed" viewBox="0 0 200 300">
            <!-- Pose Ninja Berlari -->
            <g class="neon-outline">
                <circle cx="120" cy="70" r="20" fill="currentColor"/>
                <path d="M 120 90 L 80 160" /> 
                <path d="M 120 100 L 160 140 L 190 120" /> <!-- Tangan bawa pedang mundur -->
                <path d="M 120 100 L 70 120 L 40 100" />
                <path d="M 80 160 L 40 220 L 60 260" /> 
                <path d="M 80 160 L 140 210 L 100 250" />
                <!-- Katana -->
                <path d="M 190 120 Q 120 60 30 50" stroke-width="6"/> 
            </g>
            <g class="core-body">
                <circle cx="120" cy="70" r="17" fill="#000" stroke="none"/>
                <path d="M 120 90 L 80 160" /> 
                <path d="M 120 100 L 160 140 L 190 120" />
                <path d="M 120 100 L 70 120 L 40 100" />
                <path d="M 80 160 L 40 220 L 60 260" /> 
                <path d="M 80 160 L 140 210 L 100 250" />
                <path d="M 190 120 Q 120 60 30 50" stroke-width="2"/> 
            </g>
            <path d="M 105 65 L 115 70 L 118 65" class="glowing-eye" stroke="#fff" stroke-width="2" fill="none"/>
        </svg>

        <!-- 4. ICE GUARD (Biru) -->
        <svg class="char char-ice" viewBox="0 0 200 300">
            <!-- Bertahan dengan Perisai -->
            <g class="neon-outline">
                <circle cx="90" cy="60" r="20" fill="currentColor"/>
                <path d="M 90 80 L 100 170" /> 
                <path d="M 90 100 L 140 120 L 130 160" /> <!-- Pegang Shield -->
                <path d="M 90 100 L 50 140 L 20 120" /> 
                <path d="M 100 170 L 60 260" /> 
                <path d="M 100 170 L 150 260" />
                <!-- Perisai Es -->
                <path d="M 120 90 L 170 90 L 180 170 L 145 220 L 110 170 Z" fill="currentColor" stroke-width="4"/>
            </g>
            <g class="core-body">
                <circle cx="90" cy="60" r="17" fill="#000" stroke="none"/>
                <path d="M 90 80 L 100 170" /> 
                <path d="M 90 100 L 140 120 L 130 160" />
                <path d="M 90 100 L 50 140 L 20 120" /> 
                <path d="M 100 170 L 60 260" /> 
                <path d="M 100 170 L 150 260" />
                <path d="M 125 100 L 165 100 L 172 165 L 145 210 L 118 165 Z" fill="#000" stroke-width="2"/>
            </g>
            <path d="M 105 55 L 115 60 L 118 55" class="glowing-eye" stroke="#fff" stroke-width="2" fill="none"/>
        </svg>

    </div>

    <div class="mist"></div>

    <div class="main-menu">
        <div>
            <h1 class="title-glow">STICKMAN</h1>
            <h2 class="subtitle-glow">COMBO FIGHTER</h2>
            <div class="credit-title">BY @FACHRI_KIYOTAKA</div>
        </div>

        <button class="btn" id="btn-start">Start Game</button>
      <button class="btn" id="btn-settings" style="margin-top: 20px; font-size: 16px; padding: 12px 40px; background: rgba(0,0,0,0.4); border-color: #8b9bb4; color: #8b9bb4;">⚙ Settings</button>
    
        
        <div style="color: #64748b; font-size: 14px; margin-top: 15px; letter-spacing: 2px;">
            CHOOSE YOUR POWER TO SURVIVE
        </div>
    </div>


</div>

`;

// scenes/MenuScene.js — Main Menu Screen
// ========================================

class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Reset win counters on fresh menu visit
    GameState.p1Wins     = 0;
    GameState.p2Wins     = 0;
    GameState.roundNumber = 1;

    // Add HTML UI (position it at the center of the game viewport)
    const ui = this.add.dom(0, 0).setOrigin(0, 0).createFromHTML(MENU_HTML);

    // Add listeners
    ui.addListener('click');
    ui.on('click', (event) => {
      if (event.target.id === 'btn-start') {
        // Simple fade out transition
        this.cameras.main.fadeOut(300, 0, 0, 0, (cam, pct) => {
          if (pct === 1) this.scene.start('ModeScene');
        });
      } else if (event.target.id === 'btn-settings') {
        this.scene.start('SettingsScene');
      }
    });
  }
}
