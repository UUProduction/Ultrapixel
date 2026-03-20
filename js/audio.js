/* ═══════════════════════════════════════
   BRUTAL — Audio (Web Audio synth)
   ═══════════════════════════════════════ */

const Audio = {
  ctx: null, master: null, enabled: false,

  init() {
    document.addEventListener('click', () => {
      if (this.enabled) return;
      this.enabled = true;
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.4;
      this.master.connect(this.ctx.destination);
    }, { once: true });
    document.addEventListener('touchstart', () => {
      if (this.enabled) return;
      this.enabled = true;
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.4;
      this.master.connect(this.ctx.destination);
    }, { once: true });
  },

  _play(type, freq, dur, vol, opts) {
    if (!this.ctx || !this.master) return;
    opts = opts || {};
    try {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type || 'square';
      o.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (opts.slide) o.frequency.exponentialRampToValueAtTime(opts.slide, this.ctx.currentTime + dur);
      g.gain.setValueAtTime(vol || 0.3, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      o.connect(g); g.connect(this.master);
      o.start(); o.stop(this.ctx.currentTime + dur);
    } catch(e) {}
  },

  _noise(dur, vol, freq) {
    if (!this.ctx || !this.master) return;
    try {
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = freq || 400;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol || 0.3, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      src.connect(filter); filter.connect(g); g.connect(this.master);
      src.start(); src.stop(this.ctx.currentTime + dur);
    } catch(e) {}
  },

  shoot()      { this._play('square', 880, 0.06, 0.4, { slide: 220 }); },
  shotgun()    { this._noise(0.12, 0.5, 800); this._play('sawtooth', 150, 0.1, 0.3); },
  railgun()    { this._play('sawtooth', 1200, 0.25, 0.5, { slide: 80 }); },
  jump()       { this._play('sine', 200, 0.12, 0.2, { slide: 400 }); },
  dash()       { this._play('square', 440, 0.06, 0.3, { slide: 880 }); },
  slam()       { this._noise(0.2, 0.6, 200); this._play('square', 60, 0.2, 0.5); },
  parry()      { this._play('sine', 1200, 0.15, 0.5, { slide: 2400 }); },
  enemyHit()   { this._play('square', 300, 0.05, 0.2, { slide: 150 }); },
  enemyDie()   { this._noise(0.18, 0.4, 600); this._play('sawtooth', 200, 0.15, 0.3); },
  playerHurt() { this._play('sawtooth', 80, 0.2, 0.5); },
  rankUp()     { this._play('sine', 880, 0.08, 0.3); setTimeout(() => this._play('sine', 1320, 0.08, 0.3), 80); },
  bossRoar()   { this._noise(0.5, 0.7, 100); this._play('sawtooth', 40, 0.5, 0.6); },
  healthGain() { this._play('sine', 660, 0.1, 0.3, { slide: 880 }); },
};
