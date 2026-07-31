/* Ocean Feeding Frenzy - Web Audio Synthesizer */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;

    this.isMuted = false;
    this.masterVolVal = 0.7;
    this.sfxVolVal = 0.8;
    this.musicVolVal = 0.5;

    this.musicOsc1 = null;
    this.musicOsc2 = null;
    this.musicTimer = null;
    this.isMusicPlaying = false;

    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.masterVolVal;
      this.masterGain.connect(this.ctx.destination);

      // SFX Gain
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolVal;
      this.sfxGain.connect(this.masterGain);

      // Music Gain
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolVal;
      this.musicGain.connect(this.masterGain);

      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio API not supported in this environment", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(val) {
    this.masterVolVal = val;
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(val, this.ctx.currentTime);
    }
  }

  setSFXVolume(val) {
    this.sfxVolVal = val;
    if (this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(val, this.ctx.currentTime);
    }
  }

  setMusicVolume(val) {
    this.musicVolVal = val;
    if (this.musicGain) {
      this.musicGain.gain.setValueAtTime(val, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolVal, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // --- SOUND EFFECTS ---

  // Eat pop/chomp sound
  playEat() {
    if (!this.initialized || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.08);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Golden Fish eat sound
  playGolden() {
    if (!this.initialized || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.3, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.2);
    });
  }

  // Combo chime sound
  playCombo() {
    if (!this.initialized || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.15); // E6

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Bubble sound effect
  playBubble() {
    if (!this.initialized || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const startFreq = 200 + Math.random() * 200;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 2.2, now + 0.1);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Game over sound effect
  playGameOver() {
    if (!this.initialized || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.6);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  // Victory fanfare
  playVictory() {
    if (!this.initialized || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C, E, G, C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.4, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.4);
    });
  }

  // --- AMBIENT UNDERWATER MUSIC ---
  startAmbientMusic() {
    if (!this.initialized || this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    // Soft ambient chord progression loop (Fmaj7 -> Cmaj7 -> Am7 -> G)
    const chords = [
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [130.81, 164.81, 196.00, 246.94], // Cmaj7
      [110.00, 130.81, 164.81, 196.00], // Am7
      [98.00,  123.47, 146.83, 196.00]  // G
    ];

    let chordIdx = 0;

    const playNextChord = () => {
      if (!this.isMusicPlaying || !this.initialized) return;

      const now = this.ctx.currentTime;
      const currentChord = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      currentChord.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Soft sine + lowpass filter for underwater feel
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 1.5);
        gain.gain.linearRampToValueAtTime(0.001, now + 3.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + 4.0);
      });

      this.musicTimer = setTimeout(playNextChord, 4000);
    };

    playNextChord();
  }

  stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

// Global Audio Instance
const audioManager = new AudioManager();
