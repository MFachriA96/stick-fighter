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

        #ui-menu {
            position: absolute;
            top: 0; left: 0;
            width: 960px; height: 540px;
            overflow: hidden;
            background: transparent;
        }

        .bg-video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: 1;
        }

        /* Overlay gelap agar UI terbaca jelas */
        .overlay {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.6) 100%);
            z-index: 2;
        }

        /* AURA EFEK */
        .aura-container {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            z-index: 5;
            pointer-events: none;
        }

        .aura {
            position: absolute;
            width: 280px; height: 380px;
            border-radius: 50%;
            animation: breatheAura 2.5s infinite alternate ease-in-out;
            opacity: 0.8;
            mix-blend-mode: screen;
            pointer-events: none;
            /* Remove left/top from base transform so we can position them via left/top properly */
            transform-origin: center center;
        }

        @keyframes breatheAura {
            0% { transform: scale(0.85) translateY(0); filter: blur(35px); opacity: 0.6; }
            100% { transform: scale(1.15) translateY(-20px); filter: blur(55px); opacity: 1; }
        }

        /* Use transform: translateX(-50%) so 'left' targets the center of the character */
        .aura-hammer { left: 16%; top: 25%; margin-left: -140px; background: radial-gradient(circle, var(--c-hammer) 0%, transparent 65%); animation-delay: 0.2s; }
        .aura-fire { left: 40%; top: 35%; margin-left: -140px; background: radial-gradient(circle, var(--c-fire) 0%, transparent 65%); animation-delay: 0.8s; }
        .aura-speed { left: 63%; top: 35%; margin-left: -140px; background: radial-gradient(circle, var(--c-speed) 0%, transparent 65%); animation-delay: 0.1s; }
        .aura-ice { left: 86%; top: 25%; margin-left: -140px; background: radial-gradient(circle, var(--c-ice) 0%, transparent 65%); animation-delay: 1.1s; }

        /* UI MENU UTAMA */
        @font-face {
            font-family: 'Edo';
            src: url('aset/edo_sz/edosz.ttf') format('truetype');
        }

        .main-menu {
            position: absolute;
            bottom: 28px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
        }


        .title-glow {
            font-family: 'Edo', sans-serif;
            font-size: 70px; font-weight: normal; 
            margin-bottom: -10px;
            z-index: 3;
            position: relative;
            
            background: linear-gradient(to bottom, #ffffff 30%, #a0a0a0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            -webkit-text-stroke: 3px #000;
            
            filter: drop-shadow(5px 5px 0 #000) drop-shadow(-3px -3px 0 #000) drop-shadow(4px -4px 0 #000) drop-shadow(-4px 4px 0 #000) drop-shadow(0 15px 25px rgba(0,0,0,1));
        }

        .subtitle-glow {
            font-family: 'Edo', sans-serif;
            font-size: 105px; font-weight: normal; 
            margin-bottom: -5px;
            z-index: 2;
            position: relative;
            line-height: 1;
            
            background: linear-gradient(to bottom, #ffe600 20%, #ff5500 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            -webkit-text-stroke: 4px #000;
            
            filter: drop-shadow(6px 6px 0 #000) drop-shadow(-4px -4px 0 #000) drop-shadow(8px -4px 0 #000) drop-shadow(-8px 4px 0 #000) drop-shadow(0 20px 30px rgba(0,0,0,1));
        }

        .credit-title {
            font-family: 'Edo', sans-serif;
            font-size: 14px; color: #ffffff; font-weight: normal;
            letter-spacing: 4px; margin-bottom: 25px;
            background: #111;
            padding: 5px 30px;
            border-top: 2px solid #ffcc00;
            border-bottom: 2px solid #ffcc00;
            border-radius: 90% 10% 90% 10% / 10% 90% 10% 90%;
            display: inline-block;
            transform: skew(-10deg);
            box-shadow: 0 10px 25px rgba(0,0,0,0.9);
            z-index: 4;
            position: relative;
        }
        .credit-text {
            display: inline-block;
            transform: skew(10deg);
        }

        .lightning-orbit {
            position: absolute;
            width: 45px; height: 45px;
            filter: drop-shadow(0 0 10px #ffee00) drop-shadow(0 0 20px #ffee00);
            animation: zipAround 3.5s ease-in-out infinite;
            z-index: 20;
            pointer-events: none;
        }

        @keyframes zipAround {
            0%   { left: -10%; top: 0%; transform: scale(0.5) rotate(20deg); opacity: 0; }
            10%  { opacity: 1; transform: scale(1.2) rotate(20deg); }
            40%  { left: 105%; top: 20%; transform: scale(1.2) rotate(60deg); opacity: 1; }
            45%  { opacity: 0; transform: scale(0.5) rotate(60deg); }
            50%  { left: 105%; top: 100%; transform: scale(0.5) rotate(-160deg); opacity: 0; }
            60%  { opacity: 1; transform: scale(1.2) rotate(-160deg); }
            90%  { left: -10%; top: 80%; transform: scale(1.2) rotate(-120deg); opacity: 1; }
            95%  { opacity: 0; transform: scale(0.5) rotate(-120deg); }
            100% { left: -10%; top: 0%; transform: scale(0.5) rotate(20deg); opacity: 0; }
        }


        .btn {
            font-family: 'Edo', sans-serif;
            font-size: 38px;
            font-weight: normal;
            color: #ffffff;
            width: 360px;
            padding: 10px 0;
            border-radius: 8px;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 2px;
            transition: all 0.1s ease-out;
            border: 4px solid rgba(0,0,0,0.6);
            box-shadow: 0 8px 20px rgba(0,0,0,0.8), inset 0 3px 12px rgba(255,255,255,0.35);
            -webkit-text-stroke: 2px #000;
            text-shadow: 3px 3px 0 #000, 0 4px 8px rgba(0,0,0,0.9);
        }
        #btn-start  { background: linear-gradient(to bottom, #ffd700 0%, #ff6a00 100%); }
        #btn-start:hover  { transform: scale(1.04); filter: brightness(1.1); box-shadow: 0 0 28px rgba(255,160,0,0.8), inset 0 3px 12px rgba(255,255,255,0.6); }
        #btn-settings { background: linear-gradient(to bottom, #00c6ff 0%, #004e92 100%); font-size: 30px; }
        #btn-settings:hover { transform: scale(1.04); filter: brightness(1.1); box-shadow: 0 0 28px rgba(0,180,255,0.7), inset 0 3px 12px rgba(255,255,255,0.6); }

</style>
<div id="ui-menu">
    
    <div class="overlay"></div>

    <div class="aura-container">
        <div class="aura aura-hammer"></div>
        <div class="aura aura-fire"></div>
        <div class="aura aura-speed"></div>
        <div class="aura aura-ice"></div>
    </div>

    <div class="main-menu">

        <button class="btn" id="btn-start">Start Game</button>
        <button class="btn" id="btn-settings">Settings</button>
        <div style="font-family:'Edo',sans-serif;color:#ffcc00;font-size:18px;margin-top:4px;letter-spacing:4px;text-shadow:2px 2px 5px #000;-webkit-text-stroke:1px #000;">⚡ CHOOSE YOUR POWER TO SURVIVE ⚡</div>
    </div>

</div>

`;;

// scenes/MenuScene.js — Main Menu Screen
// ========================================

class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  init() {
    const vid = document.getElementById('bg-video');
    if (vid) { vid.style.display = 'block'; vid.play(); }
  }

  create() {
    // Reset win counters on fresh menu visit
    GameState.p1Wins     = 0;
    GameState.p2Wins     = 0;
    GameState.roundNumber = 1;

    // Hide video when this scene shuts down
    this.events.on('shutdown', () => {
      const vid = document.getElementById('bg-video');
      if (vid) { vid.style.display = 'none'; vid.pause(); vid.currentTime = 0; }
    });

    // Add HTML UI
    const ui = this.add.dom(0, 0).setOrigin(0, 0).createFromHTML(MENU_HTML);

    ui.addListener('click');
    ui.on('click', (event) => {
      const vid = document.getElementById('bg-video');
      if (event.target.id === 'btn-start') {
        if (vid) { vid.style.display = 'none'; vid.pause(); vid.currentTime = 0; }
        this.cameras.main.fadeOut(100, 0, 0, 0, (cam, pct) => {
          if (pct === 1) this.scene.start('ModeScene');
        });
      } else if (event.target.id === 'btn-settings') {
        if (vid) { vid.style.display = 'none'; vid.pause(); vid.currentTime = 0; }
        this.scene.start('SettingsScene');
      }
    });
  }
}
