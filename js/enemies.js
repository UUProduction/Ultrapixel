/* ═══════════════════════════════════════
   BRUTAL — Enemy System
   ═══════════════════════════════════════ */

const Enemies = {
  list: [],

  // ── Base enemy ──
  _base: {
    x: 0, y: 0, w: 28, h: 36,
    vx: 0, vy: 0,
    hp: 0, maxHp: 100,
    alive: true,
    onGround: false,
    facing: -1,
    type: 'grunt',
    state: 'patrol', // patrol, chase, attack, hurt, dead
    stateTimer: 0,
    attackCooldown: 0,
    walkDir: 1,
    walkTimer: 0,
    isBoss: false,
    hitFlash: 0,
    bloodColor: '#cc1111',
    color: '#cc3322',
    xpValue: 20,
    walkSpeed: 90,
    gravity: 900,
  },

  // ── Spawn helper ──
  spawn(type, x, y) {
    const base = Object.assign({}, this._base);
    const enemy = Object.assign(base, {
      x, y, alive: true, onGround: false,
      state: 'patrol', stateTimer: 0, attackCooldown: 0,
      walkDir: Math.random() > 0.5 ? 1 : -1,
      walkTimer: Utils.rnd(0.5, 2),
      vy: 0, vx: 0, hitFlash: 0
    });

    switch(type) {
      case 'grunt':
        Object.assign(enemy, {
          type: 'grunt', hp: 60, maxHp: 60, w: 26, h: 34,
          color: '#884422', walkSpeed: 80,
          xpValue: 20, attackCooldown: 0
        });
        break;

      case 'shooter':
        Object.assign(enemy, {
          type: 'shooter', hp: 45, maxHp: 45, w: 24, h: 32,
          color: '#224488', walkSpeed: 50,
          xpValue: 30, attackCooldown: 0,
          shootTimer: Utils.rnd(1, 2)
        });
        break;

      case 'heavy':
        Object.assign(enemy, {
          type: 'heavy', hp: 180, maxHp: 180, w: 38, h: 48,
          color: '#664422', walkSpeed: 55,
          xpValue: 60, attackCooldown: 0,
          chargeTimer: 3, charging: false
        });
        break;

      case 'jumper':
        Object.assign(enemy, {
          type: 'jumper', hp: 40, maxHp: 40, w: 22, h: 28,
          color: '#226644', walkSpeed: 120,
          xpValue: 25, jumpCooldown: 0, jumpForce: -500
        });
        break;

      case 'boss':
        Object.assign(enemy, {
          type: 'boss', hp: 800, maxHp: 800, w: 64, h: 80,
          color: '#882222', walkSpeed: 70,
          xpValue: 400, isBoss: true,
          phase: 1, phaseTimer: 0,
          shootTimer: 1, burstCount: 0, burstTimer: 0,
          chargeTimer: 4, rageMode: false
        });
        break;
    }

    this.list.push(enemy);
    return enemy;
  },

  update(dt) {
    const player = Game.player;

    this.list.forEach((e, idx) => {
      if (!e.alive) return;

      if (e.hitFlash > 0) e.hitFlash -= dt;
      if (e.attackCooldown > 0) e.attackCooldown -= dt;
      if (e.stateTimer > 0) e.stateTimer -= dt;

      // Distance to player
      const dx   = (player.x + player.w/2) - (e.x + e.w/2);
      const dy   = (player.y + player.h/2) - (e.y + e.h/2);
      const dist = Math.sqrt(dx*dx + dy*dy);

      e.facing = dx > 0 ? 1 : -1;

      // Per-type AI
      switch(e.type) {
        case 'grunt':   this._aiGrunt(e, dx, dy, dist, dt); break;
        case 'shooter': this._aiShooter(e, dx, dy, dist, dt); break;
        case 'heavy':   this._aiHeavy(e, dx, dy, dist, dt); break;
        case 'jumper':  this._aiJumper(e, dx, dy, dist, dt); break;
        case 'boss':    this._aiBoss(e, dx, dy, dist, dt); break;
      }

      // Physics
      e.vy += e.gravity * dt;
      e.vy  = Utils.clamp(e.vy, -1200, 900);
      e.x  += e.vx * dt;
      e.y  += e.vy * dt;

      // Platform collision
      this._collidePlatforms(e);

      // Bounds
      e.x = Utils.clamp(e.x, 0, Levels.current.width - e.w);

      // Bullet collision
      Weapons.bullets.forEach(b => {
        if (b.hit) return;
        if (Utils.rectOverlap(b.x - b.size/2, b.y - b.size/2, b.size, b.size, e.x, e.y, e.w, e.h)) {
          b.hit = !b.pierce;
          this._hitEnemy(e, b.damage, b.vx, b.vy);
          Particles.blood(b.x, b.y, b.vx * 0.1, b.vy * 0.1, 8);
          Utils.showDmgNumber(b.x, b.y - 10, Math.round(b.damage), '#ff8844', { x: Game.camX, y: Game.camY });
        }
      });

      // Melee collision with player
      if (Utils.rectOverlap(e.x, e.y, e.w, e.h, player.x, player.y, player.w, player.h)) {
        if (e.type === 'heavy' && e.charging) {
          player.hurt(25, e.facing * 400, -200);
        } else if (e.type !== 'shooter') {
          player.hurt(8, e.facing * 200, -150);
        }
      }

      // Enemy bullet collision with player
      Weapons.enemyBullets.forEach((b, bi) => {
        if (Utils.dist(player.x + player.w/2, player.y + player.h/2, b.x, b.y) < 14) {
          player.hurt(b.damage, b.vx * 0.2, -100);
          Weapons.enemyBullets.splice(bi, 1);
        }
      });
    });

    // Remove dead
    for (let i = this.list.length - 1; i >= 0; i--) {
      if (!this.list[i].alive) this.list.splice(i, 1);
    }
  },

  _hitEnemy(e, damage, bulletVx, bulletVy) {
    e.hp      -= damage;
    e.hitFlash = 0.12;
    e.vx      += (bulletVx || 0) * 0.04;
    e.vy      += (bulletVy || 0) * 0.04 - 80;
    Audio.enemyHit();
    StyleMeter.add(8);

    if (e.hp <= 0) {
      e.alive = false;
      Audio.enemyDie();
      Game.shake(3);
      StyleMeter.add(e.isBoss ? 40 : 15);
      Particles.explode(e.x + e.w/2, e.y + e.h/2, e.isBoss ? 2 : 1);
      Particles.blood(e.x + e.w/2, e.y + e.h/2, bulletVx||0, bulletVy||0, e.isBoss ? 30 : 16);
      // Health drop — Ultrakill mechanic
      const healAmt = e.isBoss ? 40 : Math.round(e.maxHp * 0.3);
      Game.player.heal(healAmt);
      Game.player.killCount++;
      Game.addScore(e.xpValue * StyleMeter.dmgMultiplier);
      if (e.isBoss) Game.onBossKill();
    }
  },

  _aiGrunt(e, dx, dy, dist, dt) {
    if (dist < 300) {
      e.vx = Utils.lerp(e.vx, e.facing * e.walkSpeed * 1.4, 0.1);
    } else {
      // Patrol
      e.walkTimer -= dt;
      if (e.walkTimer <= 0) { e.walkDir *= -1; e.walkTimer = Utils.rnd(1, 3); }
      e.vx = Utils.lerp(e.vx, e.walkDir * e.walkSpeed, 0.08);
    }
  },

  _aiShooter(e, dx, dy, dist, dt) {
    // Keep distance
    if (dist < 180) {
      e.vx = Utils.lerp(e.vx, -e.facing * e.walkSpeed, 0.1);
    } else if (dist > 350) {
      e.vx = Utils.lerp(e.vx, e.facing * e.walkSpeed, 0.08);
    } else {
      e.vx = Utils.lerp(e.vx, 0, 0.15);
    }

    // Shoot
    if (e.shootTimer !== undefined) e.shootTimer -= dt;
    if (e.shootTimer <= 0 && dist < 450) {
      e.shootTimer = Utils.rnd(1.5, 3.0);
      const angle  = Math.atan2(dy, dx);
      const spd    = 280;
      Weapons.spawnEnemyBullet(e.x + e.w/2, e.y + e.h/2, Math.cos(angle)*spd, Math.sin(angle)*spd, 12, true);
    }
  },

  _aiHeavy(e, dx, dy, dist, dt) {
    if (e.chargeTimer !== undefined) e.chargeTimer -= dt;

    if (e.chargeTimer <= 0 && dist < 400 && !e.charging) {
      e.charging    = true;
      e.chargeTimer = 4;
      e.vx = e.facing * 450;
      Audio.bossRoar();
      Particles.explode(e.x + e.w/2, e.y + e.h/2, 0.5);
      setTimeout(() => { if (e.alive) { e.charging = false; e.vx *= 0.1; } }, 600);
    } else if (!e.charging) {
      if (dist < 350) {
        e.vx = Utils.lerp(e.vx, e.facing * e.walkSpeed, 0.06);
      } else {
        e.vx = Utils.lerp(e.vx, 0, 0.1);
      }
    }
    // Slow down after charge
    if (e.charging) e.vx *= 0.96;
  },

  _aiJumper(e, dx, dy, dist, dt) {
    e.vx = Utils.lerp(e.vx, e.facing * e.walkSpeed * 1.2, 0.12);
    if (e.jumpCooldown !== undefined) e.jumpCooldown -= dt;
    if (e.onGround && e.jumpCooldown <= 0 && dist < 300) {
      e.vy = e.jumpForce;
      e.jumpCooldown = Utils.rnd(0.8, 1.8);
    }
  },

  _aiBoss(e, dx, dy, dist, dt) {
    // Phase 2 at 50% hp
    if (e.hp < e.maxHp * 0.5 && e.phase === 1) {
      e.phase = 2;
      e.rageMode = true;
      e.walkSpeed = 120;
      Game.shake(10);
      Audio.bossRoar();
      Particles.explode(e.x + e.w/2, e.y + e.h/2, 3);
    }

    const spd = e.rageMode ? e.walkSpeed * 1.6 : e.walkSpeed;
    e.vx = Utils.lerp(e.vx, e.facing * spd, 0.07);

    // Shoot pattern
    if (e.shootTimer !== undefined) e.shootTimer -= dt;
    if (e.shootTimer <= 0) {
      const burst = e.rageMode ? 6 : 4;
      e.shootTimer = e.rageMode ? 0.08 : 0.12;
      e.burstCount = (e.burstCount || 0) + 1;
      if (e.burstCount > burst) {
        e.burstCount = 0;
        e.shootTimer = e.rageMode ? 0.8 : 1.5;
      } else {
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * (e.rageMode ? 0.8 : 0.4);
        const spd2  = e.rageMode ? 340 : 260;
        Weapons.spawnEnemyBullet(e.x + e.w/2, e.y + e.h/2, Math.cos(angle)*spd2, Math.sin(angle)*spd2, e.rageMode ? 18 : 14, true, e.rageMode ? '#ff4400' : '#ff4422');
      }
    }

    // Charge attack
    if (e.chargeTimer !== undefined) e.chargeTimer -= dt;
    if (e.chargeTimer <= 0) {
      e.chargeTimer = e.rageMode ? 2.5 : 4;
      e.vx = e.facing * 600;
      Game.shake(6);
      setTimeout(() => { if (e.alive) e.vx *= 0.05; }, 500);
    }
  },

  _collidePlatforms(e) {
    e.onGround = false;
    Levels.current.platforms.forEach(plat => {
      if (!Utils.rectOverlap(e.x, e.y, e.w, e.h, plat.x, plat.y, plat.w, plat.h)) return;
      const overlapX = Math.min(e.x + e.w, plat.x + plat.w) - Math.max(e.x, plat.x);
      const overlapY = Math.min(e.y + e.h, plat.y + plat.h) - Math.max(e.y, plat.y);
      if (overlapX < overlapY) {
        if (e.x < plat.x) { e.x = plat.x - e.w; e.vx = 0; }
        else               { e.x = plat.x + plat.w; e.vx = 0; }
      } else {
        if (e.y < plat.y) { e.y = plat.y - e.h; e.vy = 0; e.onGround = true; }
        else               { e.y = plat.y + plat.h; e.vy = 0; }
      }
    });
  },

  draw(ctx, camX, camY) {
    this.list.forEach(e => {
      if (!e.alive) return;
      const sx = e.x - camX;
      const sy = e.y - camY;

      ctx.save();

      // Hit flash
      if (e.hitFlash > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.7;
        ctx.fillRect(sx, sy, e.w, e.h);
        ctx.globalAlpha = 1;
      }

      const col = e.color;
      ctx.fillStyle = col;
      if (e.isBoss) { ctx.shadowColor = col; ctx.shadowBlur = 20; }

      // Body
      ctx.fillRect(sx + 3, sy + e.h * 0.3, e.w - 6, e.h * 0.6);

      // Head
      ctx.fillStyle = e.isBoss ? '#aa1111' : '#884422';
      ctx.fillRect(sx + e.w * 0.2, sy, e.w * 0.6, e.h * 0.35);

      // Eyes (glow red)
      ctx.fillStyle   = '#ff2222';
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur  = 8;
      const eyeX = e.facing === 1 ? sx + e.w - 10 : sx + 4;
      ctx.fillRect(eyeX, sy + 5, 5, 5);
      ctx.shadowBlur  = 0;

      // Legs
      const legOff = e.onGround ? Math.sin(Date.now() * 0.008 * (e.walkSpeed / 80)) * 4 : 0;
      ctx.fillStyle = '#662222';
      ctx.fillRect(sx + 3,     sy + e.h - 8 + legOff, e.w * 0.3, 8);
      ctx.fillRect(sx + e.w * 0.55, sy + e.h - 8 - legOff, e.w * 0.3, 8);

      // Boss health bar
      if (e.isBoss) {
        const bw = e.w + 20;
        const bx = sx - 10;
        const by = sy - 14;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(bx, by, bw, 8);
        const pct = e.hp / e.maxHp;
        ctx.fillStyle = pct > 0.5 ? '#cc2222' : '#ff4400';
        ctx.fillRect(bx, by, bw * pct, 8);
        ctx.strokeStyle = '#444';
        ctx.lineWidth   = 1;
        ctx.strokeRect(bx, by, bw, 8);
        ctx.fillStyle   = '#fff';
        ctx.font        = '9px Courier New';
        ctx.textAlign   = 'center';
        ctx.fillText('BOSS', sx + e.w/2, by - 3);
      } else {
        // HP pip
        const pct = e.hp / e.maxHp;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(sx, sy - 5, e.w, 3);
        ctx.fillStyle = '#cc2222';
        ctx.fillRect(sx, sy - 5, e.w * pct, 3);
      }

      ctx.restore();
    });
  },

  clear() { this.list = []; }
};
