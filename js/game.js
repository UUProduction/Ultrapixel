/* ═══════════════════════════════════════
   ULTRAPIXEL — Main Game
   ═══════════════════════════════════════ */

const Game = {
  state:    'title',
  player:   null,
  score:    0,
  camX:     0, camY: 0,
  lastTime: 0,
  levelTimer: 0,

  init() {
    Renderer.init();
    Audio.init();
    Input.init();
    MobileInput.init();
    this.player = Player;

    document.getElementById('btn-start')?.addEventListener('click',    () => this.startGame());
    document.getElementById('btn-how')?.addEventListener('click',      () => { this._screen('howto'); });
    document.getElementById('btn-howto-back')?.addEventListener('click',() => { this._screen('title'); });
    document.getElementById('btn-retry')?.addEventListener('click',    () => { this._screen(null); this.startLevel(Levels.index); });
    document.getElementById('btn-go-menu')?.addEventListener('click',  () => { this._screen('title'); this.state = 'title'; HUD.hide(); });
    document.getElementById('btn-next')?.addEventListener('click',     () => {
      this._screen(null);
      const next = Levels.next();
      if (next) this.startLevel(Levels.index);
      else { this._screen('title'); this.state = 'title'; HUD.hide(); }
    });

    requestAnimationFrame(ts => this._loop(ts));
  },

  _screen(name) {
    ['title','howto','gameover','levelcomplete'].forEach(s => {
      document.getElementById('screen-'+s)?.classList.toggle('hidden', s !== name);
    });
  },

  startGame() {
    this._screen(null);
    this.score = 0;
    StyleMeter.reset();
    this.startLevel(0);
  },

  startLevel(idx) {
    const lvl = Levels.load(idx);
    StyleMeter.reset();
    Particles.clear();
    Weapons.init();
    Enemies.clear();
    Weapons.clear();
    this.levelTimer = 0;

    Player.init(lvl.playerStart.x, lvl.playerStart.y);

    lvl.spawns.forEach(s => Enemies.spawn(s.type, s.x, s.y));

    Renderer.camX = Player.x - Renderer.W * 0.4;
    Renderer.camY = Player.y - Renderer.H * 0.5;

    this.state = 'playing';
    HUD.init();
    HUD.updateBoss(null);

    // Show boss HP if boss level
    if (lvl.isBossLevel) {
      const boss = Enemies.list.find(e => e.isBoss);
      if (boss) HUD.updateBoss(boss.hp, 'BOSS');
    }
  },

  addScore(amount) { this.score += amount; },

  shake(amount) { Renderer.shake(amount); },

  get camX() { return Renderer.getCamX(); },
  get camY() { return Renderer.getCamY(); },

  onPlayerDeath() {
    this.state = 'dead';
    this.shake(14);
    Particles.explode(Player.x + Player.w/2, Player.y + Player.h/2, 2.5);
    Particles.blood(Player.x + Player.w/2, Player.y + Player.h/2, 0, 0, 40);
    HUD.hide();

    setTimeout(() => {
      const stats = document.getElementById('go-stats');
      if (stats) stats.innerHTML =
        'SCORE: <span>'+Math.round(this.score)+'</span><br/>'+
        'KILLS: <span>'+Player.killCount+'</span><br/>'+
        'STYLE: <span>'+StyleMeter.RANKS.find(r=>r.short===StyleMeter.rank)?.name||'D'+'</span><br/>'+
        'TIME:  <span>'+Math.round(Player.timePlayed)+'s</span>';
      this._screen('gameover');
    }, 1400);
  },

  onBossKill() {
    HUD.updateBoss(0);
    setTimeout(() => this._levelComplete(), 2200);
  },

  _levelComplete() {
    if (this.state !== 'playing') return;
    this.state = 'levelcomplete';
    HUD.hide();

    const rankData = StyleMeter.RANKS.find(r => r.short === StyleMeter.rank) || StyleMeter.RANKS[0];
    const rankEl   = document.getElementById('lc-rank');
    if (rankEl) {
      rankEl.textContent  = rankData.name;
      rankEl.style.color  = rankData.color;
      rankEl.style.textShadow = '0 0 40px ' + rankData.color;
    }
    const stats = document.getElementById('lc-stats');
    if (stats) stats.innerHTML =
      'SCORE: <span>'+Math.round(this.score)+'</span><br/>'+
      'KILLS: <span>'+Player.killCount+'</span><br/>'+
      'TIME:  <span>'+Math.round(Player.timePlayed)+'s</span>';
    this._screen('levelcomplete');
  },

  _loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;
    if (this.state === 'playing' || this.state === 'dead') {
      this._update(dt);
      this._draw();
    }
    requestAnimationFrame(ts => this._loop(ts));
  },

  _update(dt) {
    if (this.state !== 'playing') return;
    Input.tick();
    this.levelTimer += dt;

    // Weapon swap
    if (Input.swapPressed || MobileInput.swapPressed) Weapons.swap();

    // Shoot
    const shootInput = Input.mouse.down || MobileInput.shootHeld;
    if (shootInput) {
      const camX = Renderer.getCamX(), camY = Renderer.getCamY();
      const mx = MobileInput.isMobile
        ? Player.x + Player.w/2 + Player.facing * 250
        : Input.mouse.x + camX;
      const my = MobileInput.isMobile
        ? Player.y + Player.h/2 - 10
        : Input.mouse.y + camY;
      Weapons.fire(Player.x + Player.w/2, Player.y + Player.h/2, mx, my, StyleMeter.dmgMultiplier);
    }

    // Mobile button wiring
    if (MobileInput.parryPressed) { Input.keys['KeyE'] = true; setTimeout(()=>{ Input.keys['KeyE']=false; },60); }
    if (MobileInput.dashPressed)  { Input.keys['ShiftLeft'] = true; setTimeout(()=>{ Input.keys['ShiftLeft']=false; },60); }
    if (MobileInput.slamPressed && !Player.onGround) Player._doSlam();

    Player.update(dt);
    Enemies.update(dt);
    Weapons.update(dt);
    Particles.update(dt);
    StyleMeter.update(dt);

    // Update HUD
    HUD.updateHP(Player.hp, Player.maxHp);
    HUD.updateTime(this.levelTimer);
    const boss = Enemies.list.find(e => e.isBoss && e.alive);
    HUD.updateBoss(boss ? boss.hp : null, boss ? 'BOSS HP' : null);

    // Check exit
    if (Player.x + Player.w > Levels.current.exitX && Player.alive) {
      if (Enemies.list.every(e => !e.alive)) this._levelComplete();
    }

    Renderer.updateCamera(Player.x + Player.w/2, Player.y + Player.h/2, dt);
    MobileInput.tick();
  },

  _draw() {
    Renderer.clear();
    const ctx  = Renderer.ctx;
    const camX = Renderer.getCamX();
    const camY = Renderer.getCamY();
    const W    = Renderer.W, H = Renderer.H;

    Levels.draw(ctx, camX, camY, W, H);
    Particles.draw(ctx, camX, camY);
    Enemies.draw(ctx, camX, camY);
    Player.draw(ctx, camX, camY);
    Weapons.draw(ctx, camX, camY);

    // Canvas HUD elements
    StyleMeter.draw(ctx, W, H);
    HUD.drawCanvas(ctx, W, H);
  }
};

window.addEventListener('load', () => Game.init());
