/* ═══════════════════════════════════════
   ULTRAPIXEL — Style Meter
   Matches ULTRAKILL: Destructive→ULTRAKILL
   ═══════════════════════════════════════ */

const StyleMeter = {
  value:   0,
  rank:    'D',
  timer:   0,
  DRAIN_DELAY: 3.0,
  DRAIN_RATE:  18,
  multiplier:  1,

  RANKS: [
    { name: 'DESTRUCTIVE', short: 'D', color: '#888888', threshold: 0,   dmgMult: 1.0, decayMult: 1.0 },
    { name: 'CHAOTIC',     short: 'C', color: '#44bb44', threshold: 150, dmgMult: 1.2, decayMult: 1.3 },
    { name: 'BRUTAL',      short: 'B', color: '#4488ff', threshold: 300, dmgMult: 1.5, decayMult: 1.6 },
    { name: 'ANARCHIC',    short: 'A', color: '#ffaa00', threshold: 500, dmgMult: 1.8, decayMult: 2.0 },
    { name: 'ULTRAKILL',   short: 'S', color: '#ff2222', threshold: 750, dmgMult: 2.5, decayMult: 2.5 },
  ],

  BONUSES: {
    'KILLED':       30,
    'PARRY':        50,
    'RICOCHET':     40,
    'GROUNDSLAM':   45,
    'AIRTIME':      20,
    'DASH_KILL':    55,
    'MULTI_KILL':   80,
    'NO_DAMAGE':    60,
  },

  add(amount, bonusName) {
    this.value = Utils.clamp(this.value + amount, 0, 1000);
    this.timer = this.DRAIN_DELAY;
    const prev = this.rank;
    this._updateRank();
    if (bonusName && window.HUD) {
      HUD.showStyleBonus(bonusName, Math.round(amount));
    }
    if (this.rank !== prev) {
      Audio.rankUp();
      if (window.HUD) HUD.updateStyleRank(this.rank, this.value);
      if (Game?.player) {
        const rankData = this.RANKS.find(r => r.short === this.rank);
        Particles.rankBurst(
          Game.player.x + Game.player.w/2,
          Game.player.y + Game.player.h/2,
          rankData?.color || '#ff2222'
        );
      }
    }
  },

  subtract(amount) {
    this.value = Utils.clamp(this.value - amount, 0, 1000);
    this._updateRank();
    if (window.HUD) HUD.updateStyleRank(this.rank, this.value);
  },

  _updateRank() {
    let newRank = this.RANKS[0];
    for (const r of this.RANKS) {
      if (this.value >= r.threshold) newRank = r;
      else break;
    }
    this.rank = newRank.short;
    this.multiplier = newRank.dmgMult;
  },

  get dmgMultiplier() { return this.multiplier; },

  update(dt) {
    if (this.timer > 0) {
      this.timer -= dt;
    } else {
      const rankData = this.RANKS.find(r => r.short === this.rank) || this.RANKS[0];
      this.value = Math.max(0, this.value - this.DRAIN_RATE * rankData.decayMult * dt);
      this._updateRank();
    }
  },

  reset() {
    this.value = 0; this.rank = 'D'; this.timer = 0; this.multiplier = 1;
    if (window.HUD) HUD.updateStyleRank('D', 0);
  },

  // Draw on canvas — rank name on left
  draw(ctx, W, H) {
    const rankData = this.RANKS.find(r => r.short === this.rank) || this.RANKS[0];
    ctx.save();

    // Big rank name
    ctx.font = 'bold 14px Oswald, Impact, sans-serif';
    ctx.fillStyle = rankData.color;
    ctx.shadowColor = rankData.color;
    ctx.shadowBlur  = 12;
    ctx.fillText(rankData.name, 8, H - 130);
    ctx.shadowBlur = 0;

    // Style value bar
    const bw = 130, bh = 4;
    const maxVal = 1000;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(8, H - 124, bw, bh);
    ctx.fillStyle = rankData.color;
    ctx.fillRect(8, H - 124, bw * (this.value / maxVal), bh);

    // Rank threshold marks
    this.RANKS.forEach(r => {
      if (r.threshold === 0) return;
      const mx = 8 + bw * (r.threshold / maxVal);
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(mx - 0.5, H - 126, 1, 8);
    });

    ctx.restore();
  }
};
