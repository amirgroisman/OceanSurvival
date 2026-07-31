/* Ocean Feeding Frenzy - Main Game Orchestrator & Loop */

const GameState = {
  START: 'START',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
  VICTORY: 'VICTORY'
};

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.state = GameState.START;
    this.lastTime = 0;

    // Victory target size in cm
    this.winTargetSize = 10.0;

    // Gameplay Statistics
    this.fishEaten = 0;
    this.timeSurvived = 0;
    this.score = 0;

    // Modules
    this.ui = new UIManager();
    this.particles = new ParticleSystem();
    this.environment = null;
    this.player = null;
    this.spawner = null;

    // Canvas Resize Handling
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Init Entities
    this.environment = new Environment(this.width, this.height);
    this.player = new Player(this.width, this.height);
    this.spawner = new Spawner(this.width, this.height);

    // Event Listeners
    this.initEventListeners();

    // Start Animation Loop
    requestAnimationFrame((time) => this.loop(time));
  }

  resizeCanvas() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    if (this.environment) this.environment.resize(this.width, this.height);
  }

  initEventListeners() {
    // Keyboard inputs
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyP' || e.code === 'Escape') {
        this.togglePause();
      }
      if (this.state === GameState.PLAYING) {
        this.player.handleKeyDown(e.code);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (this.state === GameState.PLAYING) {
        this.player.handleKeyUp(e.code);
      }
    });

    // Touch / Pointer controls for mobile
    let touchStartX = 0;
    let touchStartY = 0;

    this.canvas.addEventListener('pointerdown', (e) => {
      audioManager.init();
      touchStartX = e.clientX;
      touchStartY = e.clientY;
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (this.state !== GameState.PLAYING || !(e.buttons & 1)) return;
      const dx = e.clientX - touchStartX;
      const dy = e.clientY - touchStartY;
      
      this.player.keys.left = dx < -15;
      this.player.keys.right = dx > 15;
      this.player.keys.up = dy < -15;
      this.player.keys.down = dy > 15;
    });

    this.canvas.addEventListener('pointerup', () => {
      this.player.keys.left = false;
      this.player.keys.right = false;
      this.player.keys.up = false;
      this.player.keys.down = false;
    });

    // Start Screen Play Button
    document.getElementById('playBtn').addEventListener('click', () => {
      audioManager.init();
      this.startGame();
    });

    // Quick Mute Button
    document.getElementById('quickMuteBtn').addEventListener('click', (e) => {
      const isMuted = audioManager.toggleMute();
      e.target.textContent = isMuted ? '🔇' : '🔊';
    });

    // Pause Button
    document.getElementById('pauseBtn').addEventListener('click', () => {
      this.togglePause();
    });

    // Resume Button
    document.getElementById('resumeBtn').addEventListener('click', () => {
      this.resumeGame();
    });

    // Restart Pause Button
    document.getElementById('restartPauseBtn').addEventListener('click', () => {
      this.ui.hidePauseScreen();
      this.startGame();
    });

    // Game Over Retry Button
    document.getElementById('restartBtn').addEventListener('click', () => {
      this.startGame();
    });

    // Victory Play Again Button
    document.getElementById('victoryPlayAgainBtn').addEventListener('click', () => {
      this.startGame();
    });

    // Volume Sliders
    document.getElementById('masterVolume').addEventListener('input', (e) => {
      audioManager.setMasterVolume(parseFloat(e.target.value));
    });
    document.getElementById('sfxVolume').addEventListener('input', (e) => {
      audioManager.setSFXVolume(parseFloat(e.target.value));
    });
    document.getElementById('musicVolume').addEventListener('input', (e) => {
      audioManager.setMusicVolume(parseFloat(e.target.value));
    });
  }

  startGame() {
    this.fishEaten = 0;
    this.timeSurvived = 0;
    this.score = 0;

    this.player.reset(this.width, this.height);
    this.spawner.reset(this.width, this.height);
    this.particles.clear();

    this.state = GameState.PLAYING;
    this.ui.showHUD();
    audioManager.startAmbientMusic();
  }

  togglePause() {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
      this.ui.showPauseScreen();
    } else if (this.state === GameState.PAUSED) {
      this.resumeGame();
    }
  }

  resumeGame() {
    if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
      this.ui.hidePauseScreen();
    }
  }

  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = Math.min(0.05, (timestamp - this.lastTime) / 1000); // Clamped delta time
    this.lastTime = timestamp;

    this.update(dt);
    this.draw();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    // Environment always updates (water, light, seaweed sway)
    this.environment.update(dt);
    this.particles.update(dt);

    if (this.state === GameState.PLAYING) {
      this.timeSurvived += dt;

      // Update Player & Spawner
      this.player.update(dt, this.particles);
      this.spawner.update(dt, this.player.size, this.player.baseRadius, this.particles);

      // Update Combo Timer
      this.ui.updateCombo(dt);

      // Check Collisions
      const collision = CollisionDetector.checkCollisions(
        this.player,
        this.spawner,
        this.particles,
        audioManager,
        this.ui
      );

      if (collision) {
        if (collision.type === 'EAT') {
          this.fishEaten++;
          this.ui.registerEatCombo(audioManager);

          // Score calculation
          const comboMult = Math.max(1, this.ui.comboCount);
          const points = Math.round((collision.isGolden ? 500 : 100 * collision.growth) * comboMult);
          this.score += points;

          // Check Victory Condition
          if (this.player.size >= this.winTargetSize) {
            this.state = GameState.VICTORY;
            audioManager.playVictory();
            this.particles.spawnVictoryBurst(this.width, this.height);
            this.ui.showVictory(this.player.size, this.fishEaten, this.timeSurvived, this.score);
          }

        } else if (collision.type === 'GAME_OVER') {
          this.state = GameState.GAME_OVER;
          setTimeout(() => {
            this.ui.showGameOver(this.player.size, this.fishEaten, this.timeSurvived, this.score);
          }, 1000);
        }
      }

      // Update HUD Display
      this.ui.updateHUD(this.player.size, this.winTargetSize, this.fishEaten, this.timeSurvived);
    } else if (this.state === GameState.VICTORY) {
      // Victory celebration particle burst
      if (Math.random() < 0.05) {
        this.particles.spawnVictoryBurst(this.width, this.height);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Ocean Environment
    this.environment.draw(this.ctx);

    // 2. Draw AI Fish
    this.spawner.draw(this.ctx);

    // 3. Draw Player Fish
    this.player.draw(this.ctx);

    // 4. Draw Particle System
    this.particles.draw(this.ctx);
  }
}

// Instantiate game on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.gameInstance = new Game();
});
