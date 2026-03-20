/* ═══════════════════════════════════════
   BRUTAL — Style Meter
   ═══════════════════════════════════════ */

const StyleMeter = {
  value:   0,      // 0–100
  rank:    'D',
  timer:   0,      // drain delay
  DRAIN_DELAY: 3.5,
  DRAIN_RATE:  12,
  multiplier:  1,

  RANKS: [
    { name: 'D', min: 0,  max: 20,  color: '#888888', dmgMult: 1.0 },
    { name: 'C', min: 20, max: 40,  color: '#44aa44', dmgMult: 1.2 },
    { name: 'B', min: 40, max: 60,  color: '#4488cc', dmgMult: 1.5 },
    { name: 'A', min: 60, max: 80,  color: '#cc9922', dmgMult: 1.8 },
    { name: 'S', min: 80, max: 100, color: '#cc2222', dmgMult: 2.2 },
  ],

  add(amount) {
    this.value = Utils.clamp(this.value + amount, 0, 100);
    this.timer = this.DRAIN_DELAY;
    const prev = this.rank;
    this._updateRank();
    if (this.rank !== prev) {
      Audio.rankUp();
      const rankData = this.RANKS.find(r => r.name === this.rank);
      if (rankData) {
        Particles.rankBurst(
          Game.player ? Game.player.x + Game.player.w / 2 : 400,
          Game.player ? Game.player.y : 300,
          rankData.color
        );
      }
    }
    this._updateDOM();
  },

  subtract(amount) {
    this.value = Utils.clamp(this.value - amount, 0, 100);
    this._updateRank();
    this._updateDOM();
  },

  _updateRank() {
    const prev = this.rank;
    for (const r of this.RANKS) {
      if (this.value >= r.min && this.value < r.max) {
        this.rank = r.name;
        this.multiplier = r.dmgMult;
        break;
      }
    }
    if (this.value >= 100) {
      this.rank = 'S';
      this.multiplier = this.RANKS[4].dmgMult;
    }
  },

  _updateDOM() {
    const rankEl = document.getElementById('style-rank-mobile');
    const barEl  = document.getElementById('style-bar');
    const rankData = this.RANKS.find(r => r.name === this.rank) || this.RANKS[0];
    if (rankEl) {
      rankEl.textContent = this.rank;
      rankEl.style.color = rankData.color;
    }
    if (barEl) {
      barEl.style.width      = this.value + '%';
      barEl.style.background = rankData.color;
    }
  },

  get dmgMultiplier() { return this.multiplier; },

  update(dt) {
    if (this.timer > 0) {
      this.timer -= dt;
    } else {
      this.value = Math.max(0, this.value - this.DRAIN_RATE * dt);
      this._updateRank();
      this._updateDOM();
    }
  },

  reset() {
    this.value = 0; this.rank = 'D'; this.timer = 0; this.multiplier = 1;
    this._updateDOM();
  },

  // Draw rank on canvas (desktop HUD)
  draw(ctx, canvasW) {
    const rankData = this.RANKS.find(r => r.name === this.rank) || this.RANKS[0];
    ctx.save();
    ctx.font = 'bold 36px Courier New';
    ctx.fillStyle = rankData.color;
    ctx.shadowColor = rankData.color;
    ctx.shadowBlur  = 12;
    ctx.fillText(this.rank, 14, 46);
    ctx.shadowBlur = 0;
    // Bar background
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(52, 26, 100, 8);
    // Bar fill
    ctx.fillStyle = rankData.color;
    ctx.fillRect(52, 26, this.value, 8);
    ctx.restore();
  }
};
