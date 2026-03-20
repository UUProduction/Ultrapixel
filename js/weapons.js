/* ═══════════════════════════════════════
   BRUTAL — Weapons & Projectiles
   ═══════════════════════════════════════ */

const Weapons = {
  // Bullet list
  bullets: [],
  enemyBullets: [],

  TYPES: {
    revolver: {
      name:     'REVOLVER',
      damage:   25,
      speed:    900,
      maxAmmo:  6,
      fireRate: 0.22,
      spread:   0.03,
      pierce:   false,
      color:    '#ffcc44',
      size:     5,
    },
    shotgun: {
      name:     'SHOTGUN',
      damage:   12,
      speed:    700,
      maxAmmo:  4,
      fireRate: 0.55,
      spread:   0.25,
      pellets:  6,
      pierce:   false,
      color:    '#ff8844',
      size:     4,
    },
    railgun: {
      name:     'RAILGUN',
      damage:   60,
      speed:    1400,
      maxAmmo:  2,
      fireRate: 0.9,
      spread:   0,
      pierce:   true,
      color:    '#44ffcc',
      size:     3,
      trail:    true,
    }
  },

  current:    'revolver',
  ammo:       { revolver: 6, shotgun: 4, railgun: 2 },
  cooldown:   0,
  reloading:  false,
  reloadTime: 0,

  init() {
    this.ammo = { revolver: 6, shotgun: 4, railgun: 2 };
    this.cooldown = 0;
    this.bullets = [];
    this.enemyBullets = [];
    this.current = 'revolver';
  },

  swap() {
    const order = ['revolver', 'shotgun', 'railgun'];
    const idx = order.indexOf(this.current);
    this.current = order[(idx + 1) % order.length];
    Audio.dash();
    this._updateHUD();
  },

  _updateHUD() {
    const wn = document.getElementById('weapon-name');
    const av = document.getElementById('ammo-val');
    const type = this.TYPES[this.current];
    if (wn) wn.textContent = type.name;
    if (av) av.textContent = this.ammo[this.current] + '/' + type.maxAmmo;
  },

  fire(px, py, targetX, targetY, styleMultiplier) {
    if (this.cooldown > 0) return;
    const type = this.TYPES[this.current];
    if (this.ammo[this.current] <= 0) {
      // Auto reload
      this._reload();
      return;
    }

    const dx = targetX - px;
    const dy = targetY - py;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const dirX = dx / len;
    const dirY = dy / len;

    const pellets = type.pellets || 1;
    for (let i = 0; i < pellets; i++) {
      const spread = (Math.random() - 0.5) * type.spread * 2;
      const angle  = Math.atan2(dirY, dirX) + spread;
      const dmg    = type.damage * (styleMultiplier || 1);
      this.bullets.push({
        x:       px,
        y:       py,
        vx:      Math.cos(angle) * type.speed,
        vy:      Math.sin(angle) * type.speed,
        damage:  dmg,
        pierce:  type.pierce,
        color:   type.color,
        size:    type.size,
        life:    0.8,
        trail:   type.trail || false,
        type:    this.current,
        hit:     false
      });
    }

    this.ammo[this.current]--;
    this.cooldown = type.fireRate;

    // Particles + sound
    Particles.muzzle(px, py, Math.atan2(dirY, dirX));
    if (this.current === 'revolver')  Audio.shoot();
    else if (this.current === 'shotgun') Audio.shotgun();
    else Audio.railgun();

    // Camera shake
    Game.shake(this.current === 'railgun' ? 6 : 2);
    this._updateHUD();
  },

  _reload() {
    const type = this.TYPES[this.current];
    this.reloading = true;
    this.reloadTime = 1.2;
    setTimeout(() => {
      this.ammo[this.current] = type.maxAmmo;
      this.reloading = false;
      this._updateHUD();
    }, 1200);
  },

  // Enemy fires a bullet
  spawnEnemyBullet(x, y, vx, vy, damage, parryable, color) {
    this.enemyBullets.push({
      x, y, vx, vy,
      damage:    damage  || 10,
      parryable: parryable !== false,
      color:     color   || '#ff4422',
      size:      parryable ? 7 : 5,
      life:      3,
      parried:   false
    });
  },

  update(dt) {
    if (this.cooldown > 0) this.cooldown -= dt;
    if (this.reloadTime > 0) this.reloadTime -= dt;

    // Player bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;

      // Trail
      if (b.trail) {
        Particles.spawn(b.x, b.y, {
          count: 2, color: b.color,
          minSpd: 0, maxSpd: 1,
          size: b.size * 0.7,
          life: 0.06, gravity: 0
        });
      }

      // Off-screen or dead
      if (b.life <= 0 || b.hit) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Level bounds
      if (b.x < 0 || b.x > Levels.current.width ||
          b.y < -200 || b.y > Levels.current.height + 200) {
        this.bullets.splice(i, 1);
      }
    }

    // Enemy bullets
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const b = this.enemyBullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.life <= 0) { this.enemyBullets.splice(i, 1); }
    }
  },

  draw(ctx, camX, camY) {
    // Player bullets
    this.bullets.forEach(b => {
      ctx.save();
      ctx.fillStyle   = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur  = b.trail ? 12 : 6;
      ctx.beginPath();
      ctx.arc(b.x - camX, b.y - camY, b.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    });

    // Enemy bullets
    this.enemyBullets.forEach(b => {
      ctx.save();
      if (b.parryable) {
        // Parryable bullets glow blue
        ctx.fillStyle   = '#4488ff';
        ctx.shadowColor = '#4488ff';
        ctx.shadowBlur  = 14;
        ctx.beginPath();
        ctx.arc(b.x - camX, b.y - camY, b.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(b.x - camX, b.y - camY, b.size / 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle   = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur  = 8;
        ctx.beginPath();
        ctx.arc(b.x - camX, b.y - camY, b.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    });
  },

  clear() {
    this.bullets = [];
    this.enemyBullets = [];
  }
};
