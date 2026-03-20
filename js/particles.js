/* ═══════════════════════════════════════
   BRUTAL — Particle System
   ═══════════════════════════════════════ */

const Particles = {
  list: [],

  spawn(x, y, opts) {
    opts = opts || {};
    const count = opts.count || 6;
    for (let i = 0; i < count; i++) {
      const angle  = (opts.angle  !== undefined ? opts.angle  : Math.random() * Math.PI * 2);
      const spread = (opts.spread !== undefined ? opts.spread : Math.PI * 2);
      const a = angle - spread/2 + Math.random() * spread;
      const spd = Utils.rnd(opts.minSpd || 1, opts.maxSpd || 5);
      this.list.push({
        x, y,
        vx: Math.cos(a) * spd + (opts.vx || 0),
        vy: Math.sin(a) * spd + (opts.vy || 0),
        life:     opts.life     || Utils.rnd(0.2, 0.5),
        maxLife:  opts.life     || Utils.rnd(0.2, 0.5),
        size:     opts.size     || Utils.rnd(2, 5),
        color:    opts.color    || '#cc2222',
        gravity:  opts.gravity  !== undefined ? opts.gravity : 200,
        fade:     opts.fade     !== undefined ? opts.fade    : true,
        shrink:   opts.shrink   !== undefined ? opts.shrink  : true,
        shape:    opts.shape    || 'circle',
      });
    }
  },

  // Blood splatter
  blood(x, y, vx, vy, amount) {
    this.spawn(x, y, {
      count:  amount || 10,
      color:  '#cc1111',
      minSpd: 2, maxSpd: 8,
      vx: (vx || 0) * 0.3,
      vy: (vy || 0) * 0.3,
      life:   Utils.rnd(0.3, 0.6),
      size:   Utils.rnd(2, 5),
      gravity: 300,
      shape: 'circle'
    });
    // Blood droplets that slide
    this.spawn(x, y, {
      count: 4,
      color: '#880000',
      minSpd: 1, maxSpd: 3,
      vx: (vx || 0) * 0.1,
      vy: 1,
      size: Utils.rnd(3, 7),
      life: Utils.rnd(0.5, 1.0),
      gravity: 400,
      shape: 'rect'
    });
  },

  // Muzzle flash
  muzzle(x, y, dir) {
    this.spawn(x, y, {
      count: 6,
      color: '#ffee88',
      angle: dir,
      spread: 0.5,
      minSpd: 3, maxSpd: 8,
      size: Utils.rnd(2, 4),
      life: 0.06,
      gravity: 0,
      shape: 'circle'
    });
    this.spawn(x, y, {
      count: 3,
      color: '#ff8844',
      angle: dir,
      spread: 0.8,
      minSpd: 1, maxSpd: 4,
      size: Utils.rnd(3, 6),
      life: 0.1,
      gravity: 0,
      shape: 'circle'
    });
  },

  // Explosion
  explode(x, y, size) {
    const s = size || 1;
    this.spawn(x, y, {
      count: Math.round(20 * s),
      color: '#ff6600',
      minSpd: 3 * s, maxSpd: 12 * s,
      size: Utils.rnd(3, 8) * s,
      life: Utils.rnd(0.4, 0.8),
      gravity: 150
    });
    this.spawn(x, y, {
      count: Math.round(12 * s),
      color: '#ffcc00',
      minSpd: 1 * s, maxSpd: 6 * s,
      size: Utils.rnd(2, 5) * s,
      life: Utils.rnd(0.2, 0.5),
      gravity: 80
    });
    this.spawn(x, y, {
      count: 8,
      color: '#ffffff',
      minSpd: 5, maxSpd: 15,
      size: Utils.rnd(1, 3),
      life: 0.15,
      gravity: 0
    });
  },

  // Parry flash
  parryFlash(x, y) {
    this.spawn(x, y, {
      count: 12,
      color: '#4488ff',
      minSpd: 4, maxSpd: 10,
      size: Utils.rnd(3, 6),
      life: 0.3,
      gravity: 0
    });
    this.spawn(x, y, {
      count: 6,
      color: '#ffffff',
      minSpd: 8, maxSpd: 16,
      size: Utils.rnd(2, 4),
      life: 0.15,
      gravity: 0
    });
  },

  // Slam impact
  slamImpact(x, y) {
    this.spawn(x, y, {
      count: 16,
      color: '#886644',
      angle: -Math.PI / 2,
      spread: Math.PI,
      minSpd: 3, maxSpd: 10,
      size: Utils.rnd(3, 8),
      life: Utils.rnd(0.3, 0.6),
      gravity: 100,
      vx: 0, vy: -2
    });
    this.explode(x, y, 0.6);
  },

  // Dash trail
  dashTrail(x, y, color) {
    this.spawn(x, y, {
      count: 3,
      color: color || '#ffee44',
      minSpd: 0, maxSpd: 1,
      size: Utils.rnd(4, 8),
      life: 0.12,
      gravity: 0,
      fade: true
    });
  },

  // Rank up burst
  rankBurst(x, y, color) {
    this.spawn(x, y, {
      count: 16,
      color: color || '#ffcc00',
      minSpd: 4, maxSpd: 12,
      size: Utils.rnd(2, 5),
      life: 0.4,
      gravity: 50
    });
  },

  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.x  += p.vx * dt;
      p.y  += p.vy * dt;
      p.vy += p.gravity * dt;
      p.vx *= 0.97;
      p.life -= dt;
      if (p.life <= 0) { this.list.splice(i, 1); }
    }
  },

  draw(ctx, camX, camY) {
    this.list.forEach(p => {
      const alpha = p.fade ? Utils.clamp(p.life / p.maxLife, 0, 1) : 1;
      const size  = p.shrink ? p.size * alpha : p.size;
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = p.color;
      const sx = p.x - camX;
      const sy = p.y - camY;
      if (p.shape === 'rect') {
        ctx.fillRect(sx - size/2, sy - size/2, size, size * 0.4);
      } else {
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(0.1, size / 2), 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
  },

  clear() { this.list = []; }
};
