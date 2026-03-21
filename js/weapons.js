/* ═══════════════════════════════════════
   ULTRAPIXEL — Weapons
   Revolver, Shotgun, Nailgun,
   Railcannon, Rocket Launcher
   ═══════════════════════════════════════ */

const Weapons = {
  bullets: [],
  enemyBullets: [],

  TYPES: {
    revolver: {
      name: 'REVOLVER', label: 'PIERCER REV',
      damage: 28, speed: 950, maxAmmo: 6,
      fireRate: 0.22, spread: 0.02, pierce: false,
      color: '#00ccff', size: 5, reloadTime: 1.0
    },
    shotgun: {
      name: 'SHOTGUN', label: 'CORE EJECT SG',
      damage: 10, speed: 650, maxAmmo: 4,
      fireRate: 0.55, spread: 0.28, pellets: 8, pierce: false,
      color: '#ff8800', size: 4, reloadTime: 1.4
    },
    nailgun: {
      name: 'NAILGUN', label: 'ATTRACTOR NG',
      damage: 5, speed: 700, maxAmmo: 40,
      fireRate: 0.07, spread: 0.06, pierce: false,
      color: '#44ffaa', size: 3, reloadTime: 1.8,
      isNail: true
    },
    railcannon: {
      name: 'RAILCANNON', label: 'ELECTRIC RC',
      damage: 80, speed: 2000, maxAmmo: 1,
      fireRate: 16, spread: 0, pierce: true,
      color: '#00eeff', size: 4, reloadTime: 0,
      isRail: true, trail: true
    },
    rocket: {
      name: 'ROCKET', label: 'S.R.S CANNON',
      damage: 50, speed: 380, maxAmmo: 4,
      fireRate: 0.7, spread: 0, pierce: false,
      color: '#ff4400', size: 7, reloadTime: 2.0,
      isRocket: true, gravity: 60
    }
  },

  ORDER: ['revolver','shotgun','nailgun','railcannon','rocket'],
  current: 'revolver',
  ammo: {},
  cooldown: 0,
  reloading: false,
  reloadTime: 0,

  init() {
    this.ammo = {};
    this.ORDER.forEach(w => { this.ammo[w] = this.TYPES[w].maxAmmo; });
    this.cooldown  = 0;
    this.reloading = false;
    this.bullets = [];
    this.enemyBullets = [];
    this.current = 'revolver';
    HUD.updateWeaponIcon('revolver');
  },

  swap() {
    const idx = this.ORDER.indexOf(this.current);
    this.current = this.ORDER[(idx + 1) % this.ORDER.length];
    Audio.dash();
    HUD.updateWeaponIcon(this.current);
    StyleMeter.add(5, null);
    // Flash icon
    const icon = document.getElementById('hud-weapon-icon');
    if (icon) {
      icon.style.filter = 'brightness(3)';
      setTimeout(() => { icon.style.filter = ''; }, 80);
    }
  },

  fire(px, py, targetX, targetY, styleMult) {
    if (this.cooldown > 0 || this.reloading) return;
    const type = this.TYPES[this.current];

    if (this.ammo[this.current] <= 0) { this._reload(); return; }

    const dx = targetX - px, dy = targetY - py;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const baseDirX = dx / len, baseDirY = dy / len;

    const pellets = type.pellets || 1;
    for (let i = 0; i < pellets; i++) {
      const angle   = Math.atan2(baseDirY, baseDirX) + (Math.random()-0.5) * type.spread * 2;
      const dmg     = type.damage * (styleMult || 1);
      const bullet  = {
        x: px, y: py,
        vx: Math.cos(angle) * type.speed,
        vy: Math.sin(angle) * type.speed,
        damage:  dmg,
        pierce:  type.pierce,
        color:   type.color,
        size:    type.size,
        life:    type.isRocket ? 4 : 0.9,
        trail:   type.trail || type.isRocket || false,
        type:    this.current,
        hit:     false,
        gravity: type.gravity || 0,
        isNail:  type.isNail  || false,
        isRocket:type.isRocket|| false,
      };
      this.bullets.push(bullet);
    }

    this.ammo[this.current]--;
    this.cooldown = type.fireRate;

    Particles.muzzle(px, py, Math.atan2(baseDirY, baseDirX));
    if (this.current === 'revolver')    Audio.shoot();
    else if (this.current === 'shotgun')Audio.shotgun();
    else if (this.current === 'railcannon') Audio.railgun();
    else if (this.current === 'nailgun') this._nailSound();
    else Audio.shoot();

    Game.shake(this.current === 'railcannon' ? 7 : this.current === 'rocket' ? 4 : 1.5);
  },

  _nailSound() {
    Audio._play('square', 600 + Math.random()*200, 0.04, 0.15);
  },

  _reload() {
    if (this.reloading) return;
    this.reloading  = true;
    const type      = this.TYPES[this.current];
    this.reloadTime = type.reloadTime;
    setTimeout(() => {
      this.ammo[this.current] = type.maxAmmo;
      this.reloading  = false;
      Audio._play('sine', 880, 0.1, 0.2);
    }, type.reloadTime * 1000);
  },

  spawnEnemyBullet(x, y, vx, vy, damage, parryable, color) {
    this.enemyBullets.push({ x, y, vx, vy, damage: damage||10, parryable: parryable!==false, color: color||'#ff4422', size: parryable?8:5, life:3 });
  },

  update(dt) {
    if (this.cooldown > 0) this.cooldown -= dt;

    for (let i = this.bullets.length-1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.vy += (b.gravity || 0) * dt;
      b.life -= dt;

      // Rocket homing — slight tracking
      if (b.isRocket) {
        Particles.spawn(b.x, b.y, {
          count:1, color:'#ff6600', minSpd:0, maxSpd:1, size:4, life:0.15, gravity:0
        });
        Particles.spawn(b.x, b.y, {
          count:1, color:'#ffaa00', minSpd:0, maxSpd:0.5, size:2.5, life:0.1, gravity:0
        });
      }

      if (b.trail && !b.isRocket) {
        Particles.spawn(b.x, b.y, {
          count:2, color:b.color, minSpd:0, maxSpd:0.5, size:b.size*0.6, life:0.05, gravity:0
        });
      }

      if (b.life <= 0 || b.hit) {
        if (b.isRocket) {
          Particles.explode(b.x, b.y, 1.5);
          Game.shake(6);
          // Splash
          Enemies.list.forEach(e => {
            const d = Utils.dist(b.x,b.y, e.x+e.w/2, e.y+e.h/2);
            if (d < 130) {
              const dmg = b.damage * (1 - d/130);
              Enemies._hitEnemy(e, dmg, b.vx*0.1, b.vy*0.1);
            }
          });
        }
        this.bullets.splice(i, 1);
        continue;
      }

      const lvl = Levels.current;
      if (b.x < 0 || b.x > lvl.width || b.y < -300 || b.y > lvl.height+300) {
        this.bullets.splice(i, 1);
      }
    }

    for (let i = this.enemyBullets.length-1; i >= 0; i--) {
      const b = this.enemyBullets[i];
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.life <= 0) this.enemyBullets.splice(i, 1);
    }
  },

  draw(ctx, camX, camY) {
    this.bullets.forEach(b => {
      ctx.save();
      ctx.fillStyle   = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur  = b.trail ? 16 : (b.isNail ? 4 : 8);
      if (b.isNail) {
        ctx.fillRect(b.x - camX - 3, b.y - camY - 1, 6, 2);
      } else if (b.isRocket) {
        ctx.save();
        const angle = Math.atan2(b.vy, b.vx);
        ctx.translate(b.x - camX, b.y - camY);
        ctx.rotate(angle);
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(-8, -3, 16, 6);
        ctx.fillStyle = '#ff2200';
        ctx.beginPath(); ctx.moveTo(8,-3); ctx.lineTo(12,0); ctx.lineTo(8,3); ctx.fill();
        ctx.restore();
        ctx.shadowBlur = 0;
      } else {
        ctx.beginPath();
        ctx.arc(b.x - camX, b.y - camY, b.size/2, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    });

    this.enemyBullets.forEach(b => {
      ctx.save();
      if (b.parryable) {
        ctx.fillStyle = '#4488ff';
        ctx.shadowColor = '#4488ff'; ctx.shadowBlur = 18;
        ctx.beginPath(); ctx.arc(b.x - camX, b.y - camY, b.size/2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.arc(b.x - camX, b.y - camY, b.size/4, 0, Math.PI*2); ctx.fill();
      } else {
        ctx.fillStyle = b.color; ctx.shadowColor = b.color; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(b.x - camX, b.y - camY, b.size/2, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.restore();
    });
  },

  clear() { this.bullets = []; this.enemyBullets = []; }
};
