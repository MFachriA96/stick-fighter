const MODE_HTML = `

<style>
#ui-mode * { box-sizing: border-box; }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            user-select: none;
        }

        :root {
            /* Warna Tema Mode */
            --c-p1: #00E5FF; /* Cyan untuk AI/CPU */
            --c-p2: #FF3300; /* Merah/Oranye untuk Duel/Versus */
            
            /* Warna Dasar UI */
            --bg-main: #070710;
            --bg-card: rgba(25, 25, 45, 0.6);
            --bg-card-hover: rgba(35, 35, 60, 0.8);
            --text-main: #ffffff;
            --text-muted: #8b9bb4;
        }

        #ui-mode { width: 960px; height: 540px; margin: 0; padding: 0; position: absolute; top: 0; left: 0; overflow: hidden;
            background-color: var(--bg-main);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            position: relative;
            overflow: hidden;
        }

        /* ENVIRONMENT (Nyambung dengan tema main menu) */
        .ambient-bg {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background-image: 
                radial-gradient(circle at 20% 30%, rgba(0, 229, 255, 0.05) 0%, transparent 40%),
                radial-gradient(circle at 80% 70%, rgba(255, 51, 0, 0.05) 0%, transparent 40%);
            z-index: 1;
        }

        .stars {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background-image: 
                radial-gradient(2px 2px at 30px 40px, rgba(255,255,255,0.4), transparent),
                radial-gradient(2px 2px at 150px 90px, rgba(255,255,255,0.2), transparent),
                radial-gradient(2px 2px at 80px 170px, rgba(255,255,255,0.3), transparent);
            background-repeat: repeat; background-size: 250px 250px;
            z-index: 1; opacity: 0.5;
        }

        /* HEADER */
        .header {
            text-align: center;
            margin-bottom: 60px;
            position: relative;
            z-index: 10;
        }

        .header h1 {
            font-size: 55px;
            font-weight: 900;
            text-transform: uppercase;
            font-style: italic;
            letter-spacing: 3px;
            color: #ffffff;
            text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
            margin-bottom: 10px;
        }

        .header p {
            color: var(--text-muted);
            font-size: 18px;
            letter-spacing: 1px;
        }

        /* MODE CARDS CONTAINER */
        .mode-container {
            display: flex;
            gap: 40px;
            justify-content: center;
            position: relative;
            z-index: 10;
            max-width: 900px;
            width: 100%;
        }

        /* INDIVIDUAL MODE CARD */
        .mode-card {
            background: var(--bg-card);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            width: 350px;
            padding: 40px 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
            position: relative;
            overflow: hidden;
        }

        /* Glow atas */
        .mode-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        /* Hover Effects per Tema */
        .card-p1:hover {
            transform: translateY(-15px) scale(1.02);
            background: var(--bg-card-hover);
            border-color: var(--c-p1);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 229, 255, 0.2);
        }
        .card-p1:hover .icon-svg { filter: drop-shadow(0 0 15px var(--c-p1)); transform: scale(1.1); }
        .card-p1:hover .card-title { color: var(--c-p1); }

        .card-p2:hover {
            transform: translateY(-15px) scale(1.02);
            background: var(--bg-card-hover);
            border-color: var(--c-p2);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 51, 0, 0.2);
        }
        .card-p2:hover .icon-svg { filter: drop-shadow(0 0 15px var(--c-p2)); transform: scale(1.1); }
        .card-p2:hover .card-title { color: var(--c-p2); }

        .mode-card:hover::before { opacity: 1; }

        /* ICON CONTAINER */
        .icon-box {
            height: 100px;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 25px;
            position: relative;
        }

        .icon-svg {
            height: 80px;
            width: 80px;
            transition: all 0.3s ease;
        }

        /* TYPOGRAPHY CARD */
        .card-title {
            font-size: 32px;
            font-weight: 900;
            font-style: italic;
            color: #fff;
            margin-bottom: 5px;
            letter-spacing: 1px;
            transition: color 0.3s ease;
        }

        .card-subtitle {
            font-size: 16px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 20px;
        }

        .card-desc {
            font-size: 14px;
            color: #a0aec0;
            line-height: 1.6;
            padding: 0 10px;
        }

        /* BOTTOM UI (Back Button) */
        .bottom-ui {
            position: relative;
            z-index: 10;
            margin-top: 60px;
        }

        .back-btn {
            color: var(--text-muted);
            background: transparent;
            border: none;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: color 0.2s, transform 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
        }
        .back-btn:hover {
            color: #fff;
            transform: translateX(-5px);
        }

        @media (max-width: 768px) {
            .mode-container { flex-direction: column; align-items: center; }
            .mode-card { width: 100%; max-width: 350px; }
        }
    
</style>
<div id="ui-mode">
  

    <div class="ambient-bg"></div>
    <div class="stars"></div>

    <div class="header">
        <h1>SELECT MODE</h1>
        <p>Pilih mode permainan sebelum bertarung</p>
    </div>

    <div class="mode-container">
        
        <!-- CARD: 1 PLAYER (vs CPU) -->
        <div class="mode-card card-p1" id="mode-1p">
            <div class="icon-box">
                <!-- SVG Robot/AI Head -->
                <svg class="icon-svg" viewBox="0 0 100 100" style="color: var(--c-p1);">
                    <g stroke="currentColor" stroke-width="4" fill="none" stroke-linejoin="round">
                        <!-- Antena -->
                        <path d="M 50 20 L 50 10" />
                        <circle cx="50" cy="8" r="3" fill="currentColor" />
                        <!-- Kuping Robot -->
                        <rect x="15" y="45" width="10" height="20" rx="2" />
                        <rect x="75" y="45" width="10" height="20" rx="2" />
                        <!-- Kepala Utama -->
                        <rect x="25" y="25" width="50" height="50" rx="12" fill="rgba(0, 229, 255, 0.1)" />
                        <!-- Mata Visor Neon -->
                        <rect x="35" y="40" width="30" height="10" rx="4" fill="currentColor" filter="drop-shadow(0 0 5px currentColor)" />
                        <!-- Mulut Grill -->
                        <path d="M 40 65 L 60 65" stroke-width="3" />
                        <path d="M 45 70 L 55 70" stroke-width="3" />
                    </g>
                </svg>
            </div>
            <h2 class="card-title">1 PLAYER</h2>
            <h3 class="card-subtitle">vs CPU</h3>
            <p class="card-desc">Lawan AI bot yang semakin agresif saat HP-nya rendah. Buktikan ketangguhanmu!</p>
        </div>

        <!-- CARD: 2 PLAYERS (Local Versus) -->
        <div class="mode-card card-p2" id="mode-2p">
            <div class="icon-box">
                <!-- SVG Crossed Swords -->
                <svg class="icon-svg" viewBox="0 0 100 100" style="color: var(--c-p2);">
                    <g stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <!-- Pedang 1 (Kiri bawah ke Kanan atas) -->
                        <g transform="translate(10, 10)">
                            <!-- Bilah Pedang -->
                            <path d="M 15 65 L 70 10" stroke-width="5" filter="drop-shadow(0 0 4px currentColor)" />
                            <!-- Pelindung Gagang -->
                            <path d="M 10 50 L 30 70" stroke-width="6" />
                            <!-- Gagang -->
                            <path d="M 20 60 L 5 75" stroke-width="5" />
                            <!-- Pommel -->
                            <circle cx="3" cy="77" r="3" fill="currentColor" />
                        </g>
                        <!-- Pedang 2 (Kanan bawah ke Kiri atas) -->
                        <g transform="translate(-10, 10) scale(-1, 1) translate(-100, 0)">
                            <path d="M 15 65 L 70 10" stroke-width="5" filter="drop-shadow(0 0 4px currentColor)" />
                            <path d="M 10 50 L 30 70" stroke-width="6" />
                            <path d="M 20 60 L 5 75" stroke-width="5" />
                            <circle cx="3" cy="77" r="3" fill="currentColor" />
                        </g>
                        <!-- Percikan Energi di tengah (Opsional untuk detail) -->
                        <path d="M 50 40 L 50 30 M 50 60 L 50 70 M 35 50 L 25 50 M 65 50 L 75 50" stroke-width="2" opacity="0.6" />
                    </g>
                </svg>
            </div>
            <h2 class="card-title">2 PLAYERS</h2>
            <h3 class="card-subtitle">Local Versus</h3>
            <p class="card-desc">Duel bareng teman di satu keyboard yang sama. Buktikan siapa yang terbaik!</p>
        </div>

    </div>

    <div class="bottom-ui">
        <button class="back-btn" id="btn-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Menu
        </button>
    </div>


</div>

`;

// scenes/ModeScene.js — Mode Select (1P vs 2P)
// ==============================================

class ModeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ModeScene' });
  }

  

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    const ui = this.add.dom(0, 0).setOrigin(0, 0).createFromHTML(MODE_HTML);

    ui.addListener('click');
    ui.on('click', (event) => {
      // Traverse up to find if a mode card was clicked (in case they clicked an SVG inside)
      const target = event.target.closest('.mode-card') || event.target;
      
      if (target.id === 'mode-1p') {
        GameState.mode = '1p';
        this.cameras.main.fadeOut(250, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('PowerScene');
        });
      } else if (target.id === 'mode-2p') {
        GameState.mode = '2p';
        this.cameras.main.fadeOut(250, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('PowerScene');
        });
      } else if (target.id === 'btn-back' || target.closest('#btn-back')) {
        this.cameras.main.fadeOut(250, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('MenuScene');
        });
      }
    });

    this.cameras.main.fadeIn(300, 0, 0, 0);
  }
}
