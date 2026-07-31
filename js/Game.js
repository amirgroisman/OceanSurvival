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
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5); // High DPI scaling for crisp mobile displays
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Set canvas internal resolution to high-DPI buffer
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);

    // Set CSS display size to logical screen dimensions
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    if (this.environment) this.environment.resize(this.width, this.height);
  }

  initEventListeners() {
    this.joystickVector = { x: 0, y: 0 };
    this.isCanvasTouching = false;
    this.touchPosition = { x: 0, y: 0 };

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

    // --- VIRTUAL JOYSTICK (Option 1) ---
    const joystickContainer = document.getElementById('joystickContainer');
    const joystickStick = document.getElementById('joystickStick');
    let joystickActive = false;
    let baseCenterX = 0;
    let baseCenterY = 0;

    const handleJoystickStart = (e) => {
      e.stopPropagation();
      audioManager.init();
      joystickActive = true;
      const rect = joystickContainer.getBoundingClientRect();
      baseCenterX = rect.left + rect.width / 2;
      baseCenterY = rect.top + rect.height / 2;
      handleJoystickMove(e);
    };

    const handleJoystickMove = (e) => {
      if (!joystickActive) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const dx = clientX - baseCenterX;
      const dy = clientY - baseCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxR = 45;

      const clampedR = Math.min(dist, maxR);
      const angle = Math.atan2(dy, dx);

      const stickX = Math.cos(angle) * clampedR;
      const stickY = Math.sin(angle) * clampedR;

      joystickStick.style.transform = `translate(calc(-50% + ${stickX}px), calc(-50% + ${stickY}px))`;

      this.joystickVector = {
        x: stickX / maxR,
        y: stickY / maxR
      };
    };

    const handleJoystickEnd = () => {
      joystickActive = false;
      joystickStick.style.transform = 'translate(-50%, -50%)';
      this.joystickVector = { x: 0, y: 0 };
    };

    joystickContainer.addEventListener('pointerdown', handleJoystickStart);
    window.addEventListener('pointermove', handleJoystickMove);
    window.addEventListener('pointerup', handleJoystickEnd);
    window.addEventListener('pointercancel', handleJoystickEnd);

    // --- CANVAS TOUCH INPUT (Option 2: Touch Anywhere & Option 3: Drag Fish) ---
    this.canvas.addEventListener('pointerdown', (e) => {
      audioManager.init();
      this.isCanvasTouching = true;
      this.touchPosition = { x: e.clientX, y: e.clientY };
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (this.isCanvasTouching) {
        this.touchPosition = { x: e.clientX, y: e.clientY };
      }
    });

    this.canvas.addEventListener('pointerup', () => {
      this.isCanvasTouching = false;
    });

    this.canvas.addEventListener('pointercancel', () => {
      this.isCanvasTouching = false;
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

      // Handle active touch control scheme inputs
      const mode = this.ui.touchControlMode;
      if (mode === 'joystick') {
        if (this.joystickVector.x !== 0 || this.joystickVector.y !== 0) {
          this.player.setJoystickInput(this.joystickVector.x, this.joystickVector.y);
        }
      } else if (mode === 'touchAnywhere') {
        if (this.isCanvasTouching) {
          this.player.swimTowards(this.touchPosition.x, this.touchPosition.y);
        }
      } else if (mode === 'drag') {
        if (this.isCanvasTouching) {
          this.player.dragTo(this.touchPosition.x, this.touchPosition.y);
        }
      }

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
    this.ctx.save();
    if (this.dpr) {
      this.ctx.scale(this.dpr, this.dpr);
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Ocean Environment
    this.environment.draw(this.ctx);

    // 2. Draw AI Fish
    this.spawner.draw(this.ctx);

    // 3. Draw Player Fish
    this.player.draw(this.ctx);

    // 4. Draw Particle System
    this.particles.draw(this.ctx);

    this.ctx.restore();
  }
}

// Instantiate game on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.gameInstance = new Game();
});
