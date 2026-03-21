/* ═══════════════════════════════════════
   ULTRAPIXEL — Game.js
   ═══════════════════════════════════════ */

const Game = {
  state:      'title',
  player:     null,
  score:      0,
  levelTimer: 0,
  lastTime:   0,
  _raf:       null,

  init() {
    Renderer.init();
    Audio.init();
    Input.init();
    MobileInput.init();
    this.player = Player;

    document.getElementById('btn-start')?.addEventListener('click', () => this.startGame());
    document.getElementById('btn-how')?.addEventListener('click', () => this._screen('howto'));
    document.getElementById('btn-howto-back')?.addEventListener('click', () => this._screen('title'));
    document.getElementById('btn-retry')?.addEventListener('click', () => {
      this._screen(null);
      this.startLevel(Levels.index);
    });
    document.getElementById('btn-go-menu')?.addEventListener('click', () => {
      this._screen('title');
      this.state = 'title';
      this._hideHUD();
    });
    document.getElementById('btn-next')?.addEventListener('click', () => {
      this._screen(null);
      const hasNext = Levels.index + 1 < Levels.definitions.length;
      if (hasNext) {
        this.startLevel(Levels.index + 1);
      } else {
        this._screen('title');
        this.state = 'title';
        this._hideHUD();
      }
    });

    this._screen('title');
    this._raf = requestAnimationFrame(ts => this._loop(ts));
  },

  /* ── Screen management ── */
  _screen(name) {
    ['title', 'howto', 'gameover', 'levelcomplete'].forEach(s => {
      const el = document.getElementById('screen-' + s);
      if (el) el.classList.toggle('hidden', s !== name);
    });
  },

  _showHUD() {
    document.getElementById('hud-top')?.classList.remove('hidden');
    document.getElementById('style-meter')?.classList.remove('hidden');
    document.getElementById('kill-feed')?.classList.remove('hidden');
    if (window.HUD && window.Weapons) HUD.updateWeaponIcon(Weapons.current);
  },

  _hideHUD() {
    document.getElementById('hud-top')?.classList.add('hidden');
    document.getElementById('style-meter')?.classList.add('hidden');
    document.getElementById('kill-feed')?.classList.add('hidden');
  },

  /* ── Start game ── */
  startGame() {
    this._screen(null);
    this.score = 0;
    StyleMeter.reset();
    this.startLevel(0);
  },

  /* ── Load and start a level ── */
  startLevel(idx) {
    /* Safety — clear old state */
    Particles.clear();
    Weapons.clear();
    Enemies.clear();

    const lvl = Levels.load(idx);
    this.levelTimer = 0;
    this.score      = 0;

    /* Reinit systems */
    StyleMeter.reset();
    Weapons.init();

    /* Spawn player */
    Player.init(lvl.playerStart.x, lvl.playerStart.y);

    /* Spawn enemies */
    lvl.spawns.forEach(s => {
      try { Enemies.spawn(s.type, s.x, s.y); } catch(e) { console.warn('Enemy spawn failed:', s.type, e); }
    });

    /* Snap camera */
    Renderer.camX = Player.x - Renderer.W * 0.4;
    Renderer.camY = Player.y - Renderer.H * 0.5;

    this.state = 'playing';
    this._showHUD();

    /* Boss bar */
    const boss = Enemies.list.find(e => e.isBoss);
    this._updateBossBar(boss ? boss.hp : null);
  },

  /* ── Helpers called by other systems ── */
  addScore(amount) {
    this.score = (this.score || 0) + (amount || 0);
  },

  shake(amount) {
    if (window.Renderer) Renderer.shake(amount);
  },

  get camX() { return Renderer ? Renderer.getCamX() : 0; },
  get camY() { return Renderer ? Renderer.getCamY() : 0; },

  /* ── HUD helpers ── */
  _updateHP(hp, maxHp) {
    const cur = document.getElementById('hud-hp-current');
    const vig = document.getElementById('low-health-vignette');
    if (cur) {
      cur.textContent  = Math.max(0, Math.ceil(hp));
      const pct        = hp / maxHp;
      cur.style.color  = pct > 0.5 ? '#44ff66' : pct > 0.25 ? '#ffaa00' : '#ff2222';
      cur.style.textShadow = pct > 0.5
        ? '0 0 10px rgba(68,255,102,0.6)'
        : pct > 0.25
          ? '0 0 10px rgba(255,170,0,0.6)'
          : '0 0 14px rgba(255,0,0,0.9)';
    }
    if (vig) {
      const pct = hp / maxHp;
      vig.style.opacity   = pct < 0.3 ? ((1 - pct / 0.3) * 0.6).toFixed(2) : '0';
      vig.style.background = `radial-gradient(ellipse at center, transparent 40%, rgba(180,0,0,${((1 - hp/maxHp)*0.5).toFixed(2)}) 100%)`;
    }
  },

  _updateBossBar(hp, label) {
    const val = document.getElementById('hud-boss-val');
    const lbl = document.getElementById('hud-boss-label');
    if (val) {
      val.textContent = hp !== null && hp !== undefined ? Math.max(0, Math.ceil(hp)) : '—';
      val.style.color = (hp && hp > 400) ? '#ff2222' : (hp && hp > 200) ? '#ff6600' : '#ff8800';
    }
    if (lbl && label) lbl.textContent = label;
  },

  _updateStyleRank() {
    const el = document.getElementById('style-rank-display');
    if (!el || !window.StyleMeter) return;
    const rankData = StyleMeter.RANKS.find(r => r.short === StyleMeter.rank) || StyleMeter.RANKS[0];
    el.textContent      = rankData.name;
    el.style.color      = rankData.color;
    el.style.textShadow = `0 0 16px ${rankData.color}`;
  },

  _updateTimeBar() {
    const el = document.getElementById('hud-time-val');
    if (el) el.textContent = Math.floor(this.levelTimer);
  },

  /* ── Death ── */
  onPlayerDeath() {
    this.state = 'dead';
    this.shake(14);
    this._hideHUD();

    try { Particles.explode(Player.x + Player.w/2, Player.y + Player.h/2, 2.5); } catch(e) {}
    try { Particles.blood(Player.x + Player.w/2, Player.y + Player.h/2, 0, 0, 40); } catch(e) {}

    setTimeout(() => {
      const rankName = (StyleMeter.RANKS.find(r => r.short === StyleMeter.rank) || StyleMeter.RANKS[0]).name;
      const stats = document.getElementById('go-stats');
      if (stats) {
        stats.innerHTML =
          'SCORE: <span>' + Math.round(this.score)       + '</span><br/>' +
          'KILLS: <span>' + (Player.killCount || 0)       + '</span><br/>' +
          'STYLE: <span>' + rankName                       + '</span><br/>' +
          'TIME:  <span>' + Math.round(Player.timePlayed || 0) + 's</span>';
      }
      this._screen('gameover');
    }, 1400);
  },

  /* ── Boss killed ── */
  onBossKill() {
    this._updateBossBar(0);
    setTimeout(() => this._levelComplete(), 2200);
  },

  /* ── Level complete ── */
  _levelComplete() {
    if (this.state !== 'playing') return;
    this.state = 'levelcomplete';
    this._hideHUD();

    const rankData = StyleMeter.RANKS.find(r => r.short === StyleMeter.rank) || StyleMeter.RANKS[0];
    const rankEl   = document.getElementById('lc-rank');
    if (rankEl) {
      rankEl.textContent      = rankData.name;
      rankEl.style.color      = rankData.color;
      rankEl.style.textShadow = '0 0 40px ' + rankData.color;
    }
    const stats = document.getElementById('lc-stats');
    if (stats) {
      stats.innerHTML =
        'SCORE: <span>' + Math.round(this.score)            + '</span><br/>' +
        'KILLS: <span>' + (Player.killCount || 0)            + '</span><br/>' +
        'TIME:  <span>' + Math.round(Player.timePlayed || 0) + 's</span>';
    }
    this._screen('levelcomplete');
  },

  /* ══════════════════════════════════════
     MAIN LOOP
  ══════════════════════════════════════ */
  _loop(timestamp) {
    const dt = Math.min((timestamp - (this.lastTime || timestamp)) / 1000, 0.05);
    this.lastTime = timestamp;

    if (this.state === 'playing') {
      this._update(dt);
    }

    /* Always render so particles / death animation keep playing */
    if (this.state === 'playing' || this.state === 'dead') {
      this._draw();
    }

    requestAnimationFrame(ts => this._loop(ts));
  },

  /* ══════════════════════════════════════
     UPDATE
  ══════════════════════════════════════ */
  _update(dt) {
    this.levelTimer += dt;

    /* Input tick */
    Input.tick();

    /* Weapon swap */
    if (Input.swapPressed || MobileInput.swapPressed) {
      Weapons.swap();
    }

    /* Shooting */
    const shootInput = Input.mouse.down || MobileInput.shootHeld;
    if (shootInput) {
      const camX = Renderer.getCamX();
      const camY = Renderer.getCamY();
      let mx, my;
      if (MobileInput.isMobile) {
        mx = Player.x + Player.w / 2 + Player.facing * 250;
        my = Player.y + Player.h / 2 - 10;
      } else {
        mx = Input.mouse.x + camX;
        my = Input.mouse.y + camY;
      }
      Weapons.fire(
        Player.x + Player.w / 2,
        Player.y + Player.h / 2,
        mx, my,
        StyleMeter.dmgMultiplier
      );
    }

    /* Wire mobile buttons → input keys */
    if (MobileInput.parryPressed) {
      Input.keys['KeyE'] = true;
      setTimeout(() => { Input.keys['KeyE'] = false; }, 60);
    }
    if (MobileInput.dashPressed) {
      Input.keys['ShiftLeft'] = true;
      setTimeout(() => { Input.keys['ShiftLeft'] = false; }, 60);
    }
    if (MobileInput.slamPressed && !Player.onGround) {
      Player._doSlam();
    }

    /* Update systems */
    try { Player.update(dt); }    catch(e) { console.error('Player update:', e); }
    try { Enemies.update(dt); }   catch(e) { console.error('Enemies update:', e); }
    try { Weapons.update(dt); }   catch(e) { console.error('Weapons update:', e); }
    try { Particles.update(dt); } catch(e) { console.error('Particles update:', e); }
    try { StyleMeter.update(dt); }catch(e) { console.error('StyleMeter update:', e); }

    /* HUD updates */
    this._updateHP(Player.hp, Player.maxHp);
    this._updateTimeBar();
    this._updateStyleRank();

    const boss = Enemies.list.find(e => e.isBoss && e.alive);
    this._updateBossBar(boss ? boss.hp : null, boss ? 'BOSS HP' : 'ENEMY BOSSBAR');

    /* Check level exit */
    if (
      Player.alive &&
      Player.x + Player.w > Levels.current.exitX &&
      Enemies.list.every(e => !e.alive)
    ) {
      this._levelComplete();
    }

    /* Camera */
    Renderer.updateCamera(Player.x + Player.w / 2, Player.y + Player.h / 2, dt);

    /* Mobile tick */
    MobileInput.tick();
  },

  /* ══════════════════════════════════════
     DRAW
  ══════════════════════════════════════ */
  _draw() {
    Renderer.clear();

    const ctx  = Renderer.ctx;
    const camX = Renderer.getCamX();
    const camY = Renderer.getCamY();
    const W    = Renderer.W;
    const H    = Renderer.H;

    try { Levels.draw(ctx, camX, camY, W, H); }    catch(e) {}
    try { Particles.draw(ctx, camX, camY); }        catch(e) {}
    try { Enemies.draw(ctx, camX, camY); }          catch(e) {}
    try { Player.draw(ctx, camX, camY); }           catch(e) {}
    try { Weapons.draw(ctx, camX, camY); }          catch(e) {}
    try { StyleMeter.draw(ctx, W, H); }             catch(e) {}
    try { if (window.HUD) HUD.drawCanvas(ctx,W,H);} catch(e) {}
  }
};

window.addEventListener('load', () => {
  try {
    Game.init();
  } catch(e) {
    console.error('Game init failed:', e);
  }
});
