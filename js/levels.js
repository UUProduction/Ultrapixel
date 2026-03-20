/* ═══════════════════════════════════════
   BRUTAL — Level Definitions
   ═══════════════════════════════════════ */

const Levels = {
  current: null,
  index:   0,
  score:   0,

  definitions: [
    // ── LEVEL 1 — The Pit ──
    {
      name:   'THE PIT',
      width:  1800,
      height: 900,
      bg:     '#0a0000',
      skyColor: '#1a0000',
      groundColor: '#2a1010',
      platforms: [
        // Ground
        { x: 0,    y: 800, w: 1800, h: 100, color: '#331111' },
        // Platforms
        { x: 200,  y: 640, w: 180,  h: 18,  color: '#552222' },
        { x: 500,  y: 580, w: 140,  h: 18,  color: '#552222' },
        { x: 750,  y: 680, w: 200,  h: 18,  color: '#552222' },
        { x: 1000, y: 560, w: 160,  h: 18,  color: '#552222' },
        { x: 1300, y: 620, w: 240,  h: 18,  color: '#552222' },
        { x: 1550, y: 500, w: 140,  h: 18,  color: '#552222' },
        // Walls
        { x: 0,    y: 0,   w: 20,   h: 900, color: '#221111' },
        { x: 1780, y: 0,   w: 20,   h: 900, color: '#221111' },
      ],
      spawns: [
        { type: 'grunt',   x: 600,  y: 760 },
        { type: 'grunt',   x: 900,  y: 760 },
        { type: 'grunt',   x: 1200, y: 760 },
        { type: 'shooter', x: 1400, y: 560 },
        { type: 'grunt',   x: 1600, y: 760 },
      ],
      playerStart: { x: 100, y: 720 },
      exitX: 1700,
    },

    // ── LEVEL 2 — Slaughterhouse ──
    {
      name:   'SLAUGHTERHOUSE',
      width:  2200,
      height: 900,
      bg:     '#060010',
      skyColor: '#0a0020',
      groundColor: '#1a1030',
      platforms: [
        { x: 0,    y: 800, w: 2200, h: 100, color: '#221133' },
        { x: 100,  y: 650, w: 200,  h: 18,  color: '#332244' },
        { x: 400,  y: 600, w: 160,  h: 18,  color: '#332244' },
        { x: 650,  y: 530, w: 180,  h: 18,  color: '#332244' },
        { x: 900,  y: 650, w: 220,  h: 18,  color: '#332244' },
        { x: 1200, y: 560, w: 160,  h: 18,  color: '#332244' },
        { x: 1450, y: 480, w: 200,  h: 18,  color: '#332244' },
        { x: 1750, y: 600, w: 180,  h: 18,  color: '#332244' },
        { x: 2000, y: 700, w: 140,  h: 18,  color: '#332244' },
        { x: 0,    y: 0,   w: 20,   h: 900, color: '#1a1030' },
        { x: 2180, y: 0,   w: 20,   h: 900, color: '#1a1030' },
      ],
      spawns: [
        { type: 'grunt',   x: 400,  y: 760 },
        { type: 'shooter', x: 700,  y: 760 },
        { type: 'jumper',  x: 1000, y: 760 },
        { type: 'grunt',   x: 1200, y: 760 },
        { type: 'heavy',   x: 1500, y: 760 },
        { type: 'shooter', x: 1800, y: 760 },
        { type: 'jumper',  x: 2000, y: 760 },
      ],
      playerStart: { x: 100, y: 720 },
      exitX: 2100,
    },

    // ── LEVEL 3 — BOSS ──
    {
      name:   'THE MACHINE',
      width:  2000,
      height: 900,
      bg:     '#100000',
      skyColor: '#200000',
      groundColor: '#330000',
      isBossLevel: true,
      platforms: [
        { x: 0,    y: 800, w: 2000, h: 100, color: '#440000' },
        { x: 200,  y: 620, w: 200,  h: 18,  color: '#660000' },
        { x: 600,  y: 560, w: 160,  h: 18,  color: '#660000' },
        { x: 1000, y: 600, w: 200,  h: 18,  color: '#660000' },
        { x: 1400, y: 560, w: 160,  h: 18,  color: '#660000' },
        { x: 1700, y: 620, w: 200,  h: 18,  color: '#660000' },
        { x: 0,    y: 0,   w: 20,   h: 900, color: '#330000' },
        { x: 1980, y: 0,   w: 20,   h: 900, color: '#330000' },
      ],
      spawns: [
        { type: 'grunt',   x: 400,  y: 760 },
        { type: 'grunt',   x: 600,  y: 760 },
        { type: 'boss',    x: 900,  y: 720 },
        { type: 'shooter', x: 1400, y: 760 },
        { type: 'grunt',   x: 1600, y: 760 },
      ],
      playerStart: { x: 100, y: 720 },
      exitX: 1900,
    },
  ],

  load(idx) {
    this.index   = idx || 0;
    this.score   = 0;
    const def    = this.definitions[this.index];
    this.current = Object.assign({}, def);
    return this.current;
  },

  next() {
    if (this.index + 1 < this.definitions.length) {
      return this.load(this.index + 1);
    }
    return null; // Game complete
  },

  draw(ctx, camX, camY, canvasW, canvasH) {
    const lvl = this.current;

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvasH);
    grad.addColorStop(0, lvl.skyColor   || '#000000');
    grad.addColorStop(1, lvl.groundColor || '#111111');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Platforms
    lvl.platforms.forEach(plat => {
      const sx = plat.x - camX;
      const sy = plat.y - camY;
      if (sx > canvasW + 50 || sx + plat.w < -50) return;

      ctx.fillStyle = plat.color || '#332222';
      ctx.fillRect(sx, sy, plat.w, plat.h);

      // Top edge highlight
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(sx, sy, plat.w, 2);
    });

    // Exit marker
    const ex = lvl.exitX - camX;
    if (ex > -20 && ex < canvasW + 20) {
      ctx.save();
      ctx.strokeStyle = '#44ff44';
      ctx.lineWidth   = 2;
      ctx.shadowColor = '#44ff44';
      ctx.shadowBlur  = 12;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(ex, 0);
      ctx.lineTo(ex, canvasH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle   = '#44ff44';
      ctx.font        = 'bold 10px Courier New';
      ctx.textAlign   = 'center';
      ctx.fillText('EXIT', ex, 40);
      ctx.shadowBlur  = 0;
      ctx.restore();
    }
  }
};
