/* ═══════════════════════════════════════
   BRUTAL — Renderer / Camera
   ═══════════════════════════════════════ */

const Renderer = {
  canvas: null,
  ctx:    null,
  W: 0, H: 0,
  camX: 0, camY: 0,
  targetCamX: 0, targetCamY: 0,
  shakeX: 0, shakeY: 0,
  shakeTime: 0,

  init() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx    = this.canvas.getContext('2d');
    this._resize();
    window.addEventListener('resize', () => this._resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this._resize(), 300));
  },

  _resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.W = this.canvas.width;
    this.H = this.canvas.height;
  },

  shake(amount) {
    this.shakeTime = 0.18;
    this._shakeAmt = amount;
  },

  updateCamera(playerX, playerY, dt) {
    this.targetCamX = playerX - this.W * 0.4;
    this.targetCamY = playerY - this.H * 0.5;

    const lvl = Levels.current;
    this.targetCamX = Utils.clamp(this.targetCamX, 0, lvl.width  - this.W);
    this.targetCamY = Utils.clamp(this.targetCamY, 0, lvl.height - this.H);

    this.camX = Utils.lerp(this.camX, this.targetCamX, 0.12);
    this.camY = Utils.lerp(this.camY, this.targetCamY, 0.10);

    // Shake
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      const s = (this._shakeAmt || 4) * (this.shakeTime / 0.18);
      this.shakeX = (Math.random() - 0.5) * s * 2;
      this.shakeY = (Math.random() - 0.5) * s * 2;
    } else {
      this.shakeX = Utils.lerp(this.shakeX, 0, 0.4);
      this.shakeY = Utils.lerp(this.shakeY, 0, 0.4);
    }
  },

  getCamX() { return Math.round(this.camX + this.shakeX); },
  getCamY() { return Math.round(this.camY + this.shakeY); },

  clear() {
    this.ctx.clearRect(0, 0, this.W, this.H);
  },

  drawHUD(player) {
    const ctx = this.ctx;
    ctx.save();

    // Style meter (desktop)
    StyleMeter.draw(ctx, this.W);

    // Reload indicator
    if (Weapons.reloading) {
      ctx.fillStyle = '#ffcc44';
      ctx.font      = 'bold 11px Courier New';
      ctx.textAlign = 'left';
      ctx.fillText('RELOADING...', 14, 68);
    }

    // Score
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(this.W/2 - 60, 8, 120, 22);
    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 12px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(String(Math.round(Game.score)).padStart(8, '0'), this.W / 2, 23);

    // Level name
    ctx.fillStyle = '#444';
    ctx.font      = '9px Courier New';
    ctx.fillText(Levels.current.name, this.W / 2, 38);

    // Boss health bar (if boss alive)
    const boss = Enemies.list.find(e => e.isBoss && e.alive);
    if (boss) {
      const bw = this.W * 0.5;
      const bx = this.W / 2 - bw / 2;
      const by = this.H - 50;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(bx - 4, by - 4, bw + 8, 24);
      const pct = boss.hp / boss.maxHp;
      const col = pct > 0.5 ? '#cc2222' : '#ff4400';
      ctx.fillStyle = col;
      ctx.shadowColor = col; ctx.shadowBlur = 10;
      ctx.fillRect(bx, by, bw * pct, 16);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#666';
      ctx.lineWidth   = 1;
      ctx.strokeRect(bx, by, bw, 16);
      ctx.fillStyle   = '#fff';
      ctx.font        = 'bold 9px Courier New';
      ctx.textAlign   = 'center';
      ctx.fillText('FINAL MACHINE  ' + Math.round(pct * 100) + '%', this.W/2, by + 11);
    }

    ctx.restore();
  }
};
