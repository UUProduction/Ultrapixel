/* ═══════════════════════════════════════
   BRUTAL — Player Entity
   ═══════════════════════════════════════ */

const Player = {
  // Physics
  x: 200, y: 300,
  w: 24, h: 36,
  vx: 0, vy: 0,
  speed: 260,
  jumpForce: -520,
  gravity: 1100,
  onGround: false,
  onWall: false,
  wallDir: 0,

  // State
  hp: 100, maxHp: 100,
  alive: true,
  facing: 1, // 1 = right, -1 = left
  invincible: 0,
  hurtFlash: 0,

  // Abilities
  jumpsLeft:    2,
  canDash:      true,
  dashing:      false,
  dashTime:     0,
  dashCooldown: 0,
  dashDir:      1,
  dashInvince:  0,

  canSlam:      false,
  slamming:     false,
  slamCooldown: 0,

  parrying:     false,
  parryCooldown:0,
  parryWindow:  0,

  // Stats
  killCount:   0,
  shotsFired:  0,
  styleGained: 0,
  timePlayed:  0,

  // Visual
  animFrame:    0,
  animTimer:    0,
  walkCycle:    0,

  // Weapons
  shootCooldown: 0,
  shootHeld:     false,

  init(spawnX, spawnY) {
    this.x = spawnX || 200;
    this.y = spawnY || 300;
    this.vx = 0; this.vy = 0;
    this.hp = 100; this.alive = true;
    this.invincible = 0; this.hurtFlash = 0;
    this.jumpsLeft = 2; this.canDash = true;
    this.dashing = false; this.dashTime = 0; this.dashCooldown = 0;
    this.canSlam = false; this.slamming = false;
    this.parrying = false; this.parryCooldown = 0; this.parryWindow = 0;
    this.killCount = 0; this.shotsFired = 0; this.timePlayed = 0;
    this.facing = 1;
    this._updateHUD();
  },

  update(dt) {
    if (!this.alive) return;
    this.timePlayed += dt;

    // ── Timers ──
    if (this.invincible   > 0) this.invincible   -= dt;
    if (this.hurtFlash    > 0) this.hurtFlash    -= dt;
    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.slamCooldown > 0) this.slamCooldown -= dt;
    if (this.parryCooldown> 0) this.parryCooldown-= dt;
    if (this.parryWindow  > 0) this.parryWindow  -= dt;

    // ── Parry input ──
    if (Input.parryPressed && this.parryCooldown <= 0) {
      this._doParry();
    }

    // ── Dash input ──
    if (Input.dashPressed && this.canDash && this.dashCooldown <= 0) {
      this._doDash();
    }

    // ── Dashing ──
    if (this.dashing) {
      this.dashTime -= dt;
      this.dashInvince -= dt;
      Particles.dashTrail(this.x + this.w/2, this.y + this.h/2);
      if (this.dashTime <= 0) {
        this.dashing = false;
        this.vx = this.dashDir * this.speed * 0.5;
      }
      this._applyPhysics(dt);
      this._collideLevel();
      return;
    }

    // ── Slam ──
    if (this.slamming) {
      this.vy = 900;
      this._applyPhysics(dt);
      const hits = this._collideLevel();
      if (hits.bottom) {
        this._landSlam();
      }
      return;
    }

    // ── Normal movement ──
    let moveX = 0;
    if (Input.left)  moveX = -1;
    if (Input.right) moveX =  1;

    // Mobile override
    if (MobileInput.joyX !== 0) moveX = MobileInput.joyX > 0.15 ? 1 : moveX;
    if (MobileInput.joyX !== 0) moveX = MobileInput.joyX < -0.15 ? -1 : moveX;
    if (Math.abs(MobileInput.joyX) > 0.15) moveX = Math.sign(MobileInput.joyX);

    if (moveX !== 0) {
      this.facing = moveX;
      this.vx = Utils.lerp(this.vx, moveX * this.speed, 0.3);
    } else {
      this.vx = Utils.lerp(this.vx, 0, this.onGround ? 0.25 : 0.06);
    }

    // Jump
    const jumpPressed = Input.jumpPressed || MobileInput.jumpPressed;
    MobileInput.jumpPressed = false;
    if (jumpPressed) {
      if (this.jumpsLeft > 0) {
        this._doJump();
      }
    }

    // Air slam
    const slamPressed = Input.slamPressed || MobileInput.slamPressed;
    MobileInput.slamPressed = false;
    if (slamPressed && !this.onGround && this.slamCooldown <= 0 && !this.canSlam === false) {
      if (!this.onGround) this._doSlam();
    }

    // Walk animation
    if (this.onGround && Math.abs(this.vx) > 20) {
      this.walkCycle += dt * Math.abs(this.vx) * 0.015;
    } else {
      this.walkCycle = 0;
    }

    this._applyPhysics(dt);
    this._collideLevel();
  },

  _doJump() {
    this.vy = this.jumpForce;
    this.jumpsLeft--;
    this.canSlam = true;
    Audio.jump();
    Particles.spawn(this.x + this.w/2, this.y + this.h, {
      count: 5, color: '#888888',
      angle: -Math.PI/2, spread: Math.PI * 0.6,
      minSpd: 1, maxSpd: 4, size: 3, life: 0.2, gravity: 200
    });
  },

  _doDash() {
    const dir = (Input.left ? -1 : Input.right ? 1 : this.facing);
    this.dashDir     = dir;
    this.dashing     = true;
    this.dashTime    = 0.14;
    this.dashInvince = 0.14;
    this.canDash     = this.onGround; // Only 1 air dash
    this.dashCooldown = 0.35;
    this.vx = dir * 700;
    this.vy = Math.min(this.vy, 0);
    StyleMeter.add(5);
    Audio.dash();
    Particles.dashTrail(this.x + this.w/2, this.y + this.h/2);
  },

  _doSlam() {
    this.slamming    = true;
    this.slamCooldown = 0.8;
    this.canSlam     = false;
    this.vx          = 0;
    StyleMeter.add(8);
    Audio.slam();
  },

  _landSlam() {
    this.slamming = false;
    this.vy = 0;
    Game.shake(8);
    Particles.slamImpact(this.x + this.w/2, this.y + this.h);

    // Damage nearby enemies
    Enemies.list.forEach(e => {
      const dist = Utils.dist(this.x + this.w/2, this.y, e.x + e.w/2, e.y);
      if (dist < 120) {
        const dmg = 35 * StyleMeter.dmgMultiplier;
        e.hurt(dmg, 0, -300);
        StyleMeter.add(15);
      }
    });
  },

  _doParry() {
    this.parryWindow   = 0.18;
    this.parryCooldown = 0.5;
    this.parrying      = true;
    Audio.parry();
    Particles.parryFlash(this.x + this.w/2, this.y + this.h/2);
    setTimeout(() => { this.parrying = false; }, 180);

    // Check enemy bullets in range
    let parried = false;
    Weapons.enemyBullets.forEach((b, i) => {
      if (!b.parryable) return;
      const dist = Utils.dist(this.x + this.w/2, this.y + this.h/2, b.x, b.y);
      if (dist < 70) {
        // Reverse bullet, make it a player bullet
        Weapons.bullets.push({
          x: b.x, y: b.y,
          vx: -b.vx * 1.5,
          vy: -b.vy * 1.5,
          damage: b.damage * 2 * StyleMeter.dmgMultiplier,
          pierce: false,
          color: '#88aaff',
          size: 8,
          life: 1.5,
          trail: false,
          type: 'parried',
          hit: false
        });
        Weapons.enemyBullets.splice(i, 1);
        StyleMeter.add(20);
        Game.shake(4);
        parried = true;
      }
    });
    if (parried) StyleMeter.add(10);
  },

  _applyPhysics(dt) {
    if (!this.dashing) {
      this.vy += this.gravity * dt;
      this.vy = Utils.clamp(this.vy, -1200, 1000);
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  },

  _collideLevel() {
    const hits = { bottom: false, top: false, left: false, right: false };
    const level = Levels.current;

    level.platforms.forEach(plat => {
      if (!Utils.rectOverlap(this.x, this.y, this.w, this.h, plat.x, plat.y, plat.w, plat.h)) return;

      const overlapX = Math.min(this.x + this.w, plat.x + plat.w) - Math.max(this.x, plat.x);
      const overlapY = Math.min(this.y + this.h, plat.y + plat.h) - Math.max(this.y, plat.y);

      if (overlapX < overlapY) {
        if (this.x < plat.x) { this.x = plat.x - this.w; this.vx = 0; hits.right = true; }
        else                  { this.x = plat.x + plat.w; this.vx = 0; hits.left = true; }
      } else {
        if (this.y < plat.y) {
          this.y = plat.y - this.h; this.vy = Math.min(this.vy, 0);
          hits.bottom = true;
        } else {
          this.y = plat.y + plat.h; this.vy = Math.max(this.vy, 0);
          hits.top = true;
        }
      }
    });

    if (hits.bottom) {
      this.onGround  = true;
      this.jumpsLeft = 2;
      this.canDash   = true;
      this.canSlam   = false;
    } else {
      this.onGround = false;
    }

    // Kill zone
    if (this.y > level.height + 200) {
      this.hurt(999, 0, 0);
    }

    // Horizontal bounds
    this.x = Utils.clamp(this.x, 0, level.width - this.w);

    return hits;
  },

  hurt(amount, vx, vy) {
    if (this.invincible > 0 || this.dashInvince > 0 || !this.alive) return;
    this.hp -= amount;
    this.invincible = 0.6;
    this.hurtFlash  = 0.3;
    this.vx += vx || 0;
    this.vy += vy || -150;
    Game.shake(5);
    Audio.playerHurt();
    StyleMeter.subtract(25);
    Particles.blood(this.x + this.w/2, this.y + this.h/2, vx||0, vy||0, 12);
    this._updateHUD();
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      Game.onPlayerDeath();
    }
  },

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    Audio.healthGain();
    this._updateHUD();
    // Heal particle
    Particles.spawn(this.x + this.w/2, this.y + this.h/2, {
      count: 8, color: '#44ff88',
      minSpd: 1, maxSpd: 4, size: 3, life: 0.3,
      gravity: -80
    });
    Utils.showDmgNumber(this.x + this.w/2, this.y - 10, '+' + Math.round(amount), '#44ff88');
  },

  _updateHUD() {
    const bar = document.getElementById('hp-bar');
    const val = document.getElementById('hp-val');
    const pct = (this.hp / this.maxHp) * 100;
    if (bar) {
      bar.style.width      = pct + '%';
      bar.style.background = pct > 50 ? '#cc2222' : pct > 25 ? '#dd6622' : '#ff0000';
    }
    if (val) val.textContent = Math.round(this.hp);
  },

  draw(ctx, camX, camY) {
    const sx = this.x - camX;
    const sy = this.y - camY;

    // Invincibility flash
    if (this.hurtFlash > 0 && Math.floor(this.hurtFlash * 20) % 2 === 0) return;

    ctx.save();

    // Dash trail ghost
    if (this.dashing) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#ffee44';
      ctx.fillRect(sx, sy, this.w, this.h);
      ctx.globalAlpha = 1;
    }

    // Body
    const bodyColor = this.slamming ? '#ff4400' : (this.parrying ? '#4488ff' : '#cc2222');
    ctx.fillStyle = bodyColor;
    if (this.parrying) { ctx.shadowColor = '#4488ff'; ctx.shadowBlur = 16; }

    // Simple pixel character
    // Legs
    const legOff = Math.sin(this.walkCycle) * 5;
    ctx.fillStyle = '#662222';
    ctx.fillRect(sx + 3,  sy + this.h - 10 + legOff, 7, 10);
    ctx.fillRect(sx + this.w - 10, sy + this.h - 10 - legOff, 7, 10);

    // Body
    ctx.fillStyle = bodyColor;
    ctx.fillRect(sx + 2, sy + 8, this.w - 4, this.h - 18);

    // Arms
    ctx.fillStyle = '#882222';
    if (this.facing === 1) {
      ctx.fillRect(sx + this.w - 2, sy + 12, 8, 5);
    } else {
      ctx.fillRect(sx - 6, sy + 12, 8, 5);
    }

    // Head
    ctx.fillStyle = '#ddaa88';
    ctx.fillRect(sx + 5, sy, this.w - 10, 12);

    // Eyes
    ctx.fillStyle = '#ffffff';
    const eyeX = this.facing === 1 ? sx + this.w - 9 : sx + 3;
    ctx.fillRect(eyeX, sy + 3, 4, 4);
    ctx.fillStyle = '#cc0000';
    ctx.fillRect(eyeX + (this.facing === 1 ? 2 : 0), sy + 4, 2, 3);

    // Parry ring
    if (this.parrying || this.parryWindow > 0) {
      ctx.strokeStyle = '#4488ff';
      ctx.lineWidth   = 2;
      ctx.shadowColor = '#4488ff';
      ctx.shadowBlur  = 20;
      ctx.beginPath();
      ctx.arc(sx + this.w/2, sy + this.h/2, 50 * (this.parryWindow / 0.18 + 0.1), 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  }
};
