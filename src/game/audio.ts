class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private isMuted = false;
  private rollOsc: OscillatorNode | null = null;
  private rollGain: GainNode | null = null;
  private rollFilter: BiquadFilterNode | null = null;
  private bgmInterval: number | null = null;
  private isInitialized = false;

  private init() {
    if (this.isInitialized && this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();

      this.masterGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);

      this.sfxGain.gain.value = 0.8;
      this.musicGain.gain.value = 0.45;

      this.setupRollSynth();
      this.isInitialized = true;
    } catch {
      // AudioContext not supported
    }
  }

  public resumeContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private setupRollSynth() {
    if (!this.ctx || !this.sfxGain) return;
    try {
      this.rollOsc = this.ctx.createOscillator();
      this.rollOsc.type = 'triangle';
      this.rollOsc.frequency.value = 45;

      this.rollFilter = this.ctx.createBiquadFilter();
      this.rollFilter.type = 'lowpass';
      this.rollFilter.frequency.value = 120;

      this.rollGain = this.ctx.createGain();
      this.rollGain.gain.value = 0.0001;

      this.rollOsc.connect(this.rollFilter);
      this.rollFilter.connect(this.rollGain);
      this.rollGain.connect(this.sfxGain);

      this.rollOsc.start();
    } catch {
      // ignore
    }
  }

  public updateRollSound(speed: number, isGrounded: boolean) {
    if (!this.ctx || !this.rollGain || !this.rollFilter || !this.rollOsc) return;
    if (this.isMuted || !isGrounded || speed < 0.2) {
      this.rollGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
      return;
    }

    const normSpeed = Math.min(speed / 18, 1.0);
    const targetGain = Math.min(0.2, normSpeed * 0.18);
    const targetFreq = 40 + normSpeed * 80;
    const filterFreq = 100 + normSpeed * 300;

    this.rollGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.04);
    this.rollOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
    this.rollFilter.frequency.setTargetAtTime(filterFreq, this.ctx.currentTime, 0.05);
  }

  public playJump() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.15);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playLand(intensity = 1.0) {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

    const vol = Math.min(0.4, 0.2 + intensity * 0.15);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playCoin() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const freqs = [987.77, 1318.51]; // B5 -> E6
    freqs.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  public playStar() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    freqs.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.07;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  public playCheckpoint() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A major
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  public playBoost() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.28);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  public playCrash() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playClick() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playVictory() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const fanfares = [
      { f: 523.25, t: 0, d: 0.15 },
      { f: 659.25, t: 0.15, d: 0.15 },
      { f: 783.99, t: 0.3, d: 0.2 },
      { f: 1046.5, t: 0.5, d: 0.6 },
    ];

    fanfares.forEach(({ f, t, d }) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = now + t;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, st);

      gain.gain.setValueAtTime(0.3, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(st);
      osc.stop(st + d + 0.05);
    });
  }

  public startBGM(worldTheme: string) {
    this.stopBGM();
    this.resumeContext();
    if (!this.ctx || !this.musicGain || this.isMuted) return;

    // Procedural rhythmic/melodic chords loop
    const chordsByTheme: Record<string, number[][]> = {
      green_valley: [
        [261.63, 329.63, 392.0], // C
        [349.23, 440.0, 523.25], // F
        [293.66, 349.23, 440.0], // Dm
        [392.0, 493.88, 587.33], // G
      ],
      sky_platforms: [
        [220.0, 329.63, 440.0],
        [261.63, 392.0, 523.25],
        [329.63, 493.88, 659.25],
        [293.66, 440.0, 587.33],
      ],
      ice_world: [
        [329.63, 493.88, 659.25],
        [349.23, 523.25, 698.46],
        [293.66, 440.0, 587.33],
        [261.63, 392.0, 523.25],
      ],
      neon_city: [
        [146.83, 220.0, 329.63],
        [174.61, 261.63, 392.0],
        [196.0, 293.66, 440.0],
        [130.81, 196.0, 293.66],
      ],
      lava_challenge: [
        [110.0, 164.81, 220.0],
        [123.47, 185.0, 246.94],
        [98.0, 146.83, 196.0],
        [87.31, 130.81, 174.61],
      ],
    };

    const chords = chordsByTheme[worldTheme] || chordsByTheme.green_valley;
    let step = 0;

    const playStep = () => {
      if (!this.ctx || !this.musicGain || this.isMuted) return;
      const chord = chords[step % chords.length];
      step++;
      const now = this.ctx.currentTime;

      chord.forEach((freq, idx) => {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.linearRampToValueAtTime(0.07, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + 1.9);
      });
    };

    playStep();
    this.bgmInterval = window.setInterval(playStep, 2000);
  }

  public stopBGM() {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  public setSoundVolume(val: number) {
    if (this.sfxGain) {
      this.sfxGain.gain.value = Math.max(0, Math.min(1, val));
    }
  }

  public setMusicVolume(val: number) {
    if (this.musicGain) {
      this.musicGain.gain.value = Math.max(0, Math.min(1, val * 0.6));
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 1;
    }
  }
}

export const soundManager = new SoundManager();
