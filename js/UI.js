/* Ocean Feeding Frenzy - UI & HUD Manager */

class UIManager {
  constructor() {
    // DOM Elements
    this.hud = document.getElementById('hud');
    this.playerSizeVal = document.getElementById('playerSizeVal');
    this.sizeBarFill = document.getElementById('sizeBarFill');
    this.timeSurvivedVal = document.getElementById('timeSurvivedVal');
    this.fishEatenVal = document.getElementById('fishEatenVal');
    this.comboBadge = document.getElementById('comboBadge');
    this.popupContainer = document.getElementById('popupContainer');

    // Screens
    this.startScreen = document.getElementById('startScreen');
    this.pauseScreen = document.getElementById('pauseScreen');
    this.gameOverScreen = document.getElementById('gameOverScreen');
    this.victoryScreen = document.getElementById('victoryScreen');

    // High Score Elements
    this.bestSizeVal = document.getElementById('bestSizeVal');
    this.highScoreVal = document.getElementById('highScoreVal');

    // Stats Elements
    this.finalSizeVal = document.getElementById('finalSizeVal');
    this.finalFishEatenVal = document.getElementById('finalFishEatenVal');
    this.finalTimeVal = document.getElementById('finalTimeVal');
    this.finalScoreVal = document.getElementById('finalScoreVal');
    this.newHighScoreNotice = document.getElementById('newHighScoreNotice');

    // Victory Elements
    this.victorySizeVal = document.getElementById('victorySizeVal');
    this.victoryFishEatenVal = document.getElementById('victoryFishEatenVal');
    this.victoryTimeVal = document.getElementById('victoryTimeVal');
    this.victoryScoreVal = document.getElementById('victoryScoreVal');

    // Joystick Overlay Element
    this.joystickContainer = document.getElementById('joystickContainer');

    // Combo system state
    this.comboCount = 0;
    this.comboTimer = 0;

    // Touch Control Mode
    this.touchControlMode = 'drag';

    // Load High Scores & Settings
    this.loadHighScores();
  }

  updateJoystickVisibility(isPlaying = false) {
    if (this.joystickContainer) {
      this.joystickContainer.classList.add('hidden');
    }
  }

  loadHighScores() {
    this.bestSize = parseFloat(localStorage.getItem('off_best_size') || '1.0');
    this.highScore = parseInt(localStorage.getItem('off_high_score') || '0', 10);

    if (this.bestSizeVal) this.bestSizeVal.textContent = this.bestSize.toFixed(1);
    if (this.highScoreVal) this.highScoreVal.textContent = this.highScore.toLocaleString();
  }

  saveHighScore(size, score) {
    let newRecord = false;
    if (size > this.bestSize) {
      this.bestSize = size;
      localStorage.setItem('off_best_size', this.bestSize.toFixed(1));
      newRecord = true;
    }
    if (score > this.highScore) {
      this.highScore = score;
      localStorage.setItem('off_high_score', this.highScore);
      newRecord = true;
    }
    this.loadHighScores();
    return newRecord;
  }

  updateHUD(playerSize, winTargetSize, fishEaten, timeSurvived) {
    if (this.playerSizeVal) {
      this.playerSizeVal.textContent = playerSize.toFixed(1);
    }

    if (this.sizeBarFill) {
      // Progress towards victory size (e.g., 10.0 cm)
      const pct = Math.min(100, Math.max(0, ((playerSize - 1.0) / (winTargetSize - 1.0)) * 100));
      this.sizeBarFill.style.width = `${pct}%`;
    }

    if (this.fishEatenVal) {
      this.fishEatenVal.textContent = fishEaten;
    }

    if (this.timeSurvivedVal) {
      this.timeSurvivedVal.textContent = Utils.formatTime(timeSurvived);
    }
  }

  registerEatCombo(audioManager) {
    this.comboCount++;
    this.comboTimer = 2.2; // 2.2 seconds to maintain combo

    if (this.comboCount >= 2) {
      if (this.comboBadge) {
        this.comboBadge.textContent = `${this.comboCount}x COMBO!`;
        this.comboBadge.classList.remove('hidden');
      }
      if (audioManager) audioManager.playCombo();
    }
  }

  updateCombo(dt) {
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
        if (this.comboBadge) this.comboBadge.classList.add('hidden');
      }
    }
  }

  showFloatingPopup(x, y, text, color = '#00d2ff') {
    if (!this.popupContainer) return;

    const popup = document.createElement('div');
    popup.className = 'float-popup';
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    popup.style.color = color;
    popup.textContent = text;

    this.popupContainer.appendChild(popup);

    setTimeout(() => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    }, 1200);
  }

  showStartScreen() {
    this.startScreen.classList.add('active');
    this.startScreen.classList.remove('hidden');
    this.hud.classList.add('hidden');
    this.pauseScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.updateJoystickVisibility(false);
  }

  showHUD() {
    this.hud.classList.remove('hidden');
    this.startScreen.classList.remove('active');
    this.startScreen.classList.add('hidden');
    this.pauseScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.updateJoystickVisibility(true);
  }

  showPauseScreen() {
    this.pauseScreen.classList.add('active');
    this.pauseScreen.classList.remove('hidden');
    this.updateJoystickVisibility(false);
  }

  hidePauseScreen() {
    this.pauseScreen.classList.remove('active');
    this.pauseScreen.classList.add('hidden');
    this.updateJoystickVisibility(true);
  }

  showGameOver(size, fishEaten, timeSurvived, score) {
    const isNewRecord = this.saveHighScore(size, score);

    if (this.finalSizeVal) this.finalSizeVal.textContent = `${size.toFixed(1)} cm`;
    if (this.finalFishEatenVal) this.finalFishEatenVal.textContent = fishEaten;
    if (this.finalTimeVal) this.finalTimeVal.textContent = Utils.formatTime(timeSurvived);
    if (this.finalScoreVal) this.finalScoreVal.textContent = score.toLocaleString();

    if (this.newHighScoreNotice) {
      if (isNewRecord) {
        this.newHighScoreNotice.classList.remove('hidden');
      } else {
        this.newHighScoreNotice.classList.add('hidden');
      }
    }

    this.gameOverScreen.classList.add('active');
    this.gameOverScreen.classList.remove('hidden');
    this.updateJoystickVisibility(false);
  }

  showVictory(size, fishEaten, timeSurvived, score) {
    this.saveHighScore(size, score);

    if (this.victorySizeVal) this.victorySizeVal.textContent = `${size.toFixed(1)} cm`;
    if (this.victoryFishEatenVal) this.victoryFishEatenVal.textContent = fishEaten;
    if (this.victoryTimeVal) this.victoryTimeVal.textContent = Utils.formatTime(timeSurvived);
    if (this.victoryScoreVal) this.victoryScoreVal.textContent = score.toLocaleString();

    this.victoryScreen.classList.add('active');
    this.victoryScreen.classList.remove('hidden');
    this.updateJoystickVisibility(false);
  }
}
