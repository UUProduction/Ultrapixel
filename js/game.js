/* ═══════════════════════════════════════
   BRUTAL — Main Game Loop
   ═══════════════════════════════════════ */

const Game = {
  state:  'title', // title, playing, gameover, levelcomplete
  player: null,
  score:  0,
  camX:   0, camY: 0,
  lastTime: 0,
  animFrame: null,

  init() {
    Renderer.init();
    Audio.init();
    Input.init();
    MobileInput.init();

    this.player = Player;

    // Screen buttons
    document.getElementById('btn-start')?.addEventListener('click', () => this.startGame());
    document.getElementById('btn-how')?.addEventListener('click', () => {
      document.getElementById('screen-title').classList.add('hidden');
      document.getElementById('screen-howto').classList.remove('hidden');
    });
    document.getElementById('btn-howto-back')?.addEventListener('click', () => {
      document.getElementById('screen-howto').classList.add('hidden');
      document.getElementById('screen-title').classList.remove('hidden');
    });
    document.getElementById('btn-retry')?.addEventListener('click', () => {
      document.getElementById('screen-gameover').classList.add('hidden');
      this.startLevel(Levels.index);
    });
    document.getElementById('btn-go-menu')?.addEventListener('click', () => {
      document.getElementById('screen-gameover').classList.add('hidden');
      document.getElementById('screen-title').classList.remove('hidden');
      this.state = 'title';
    });
    document.getElementById('btn-next')?.addEventListener('click', () => {
      document.getElementById('screen-levelcomplete').classList.add('hidden');
      const next = Levels.next();
      if (next) {
        this.startLevel(Levels.index);
      } else {
        // Game complete — go to title
        document.getElementById('screen-title').classList.remove('hidden');
        this.state = 'title';
      }
    });

    this.loop(0);
  },

  startGame() {
    document.getElementById('screen-title').classList.add('hidden');
    StyleMeter.reset();
    this.score = 0;
    this.startLevel(0);
  },

  startLevel(idx) {
    const lvl = Levels.load(idx);
    StyleMeter.reset();
    Particles.clear();
    Weapons.init();
    Enemies.clear();
    Weapons.clear();

    // Spawn player
    Player.init(lvl.playerStart.x, lvl.playerStart.y);

    // Spawn enemies
    lvl.spawns.forEach(s => Enemies.spawn(s.type, s.x, s.y));

    // Camera
    Renderer.camX = Player.x - Renderer.W * 0.4;
    Renderer.camY = Player.y - Renderer.H * 0.5;

    this.state = 'playing';
  },

  addScore(amount) {
    this.score += amount;
  },

  shake(amount) {
    Renderer.shake(amount);
  },

  get camX() { return Renderer.getCamX(); },
  get camY() { return Renderer.getCamY(); },

  onPlayerDeath() {
    this.state = 'gameover';
    Game.shake(12);
    Particles.explode(Player.x + Player.w/2, Player.y + Player.h/2, 2);
    Particles.blood(Player.x + Player.w/2, Player.y + Player.h/2, 0, 0, 30);

    setTimeout(() => {
      const stats = document.getElementById('go-stats');
      if (stats) {
        stats.innerHTML =
          'SCORE: <span>' + Math.round(Game.score) + '</span><br/>' +
          'KILLS: <span>' + Player.killCount + '</span><br/>' +
          'STYLE: <span>' + StyleMeter.rank + '</span><br/>' +
          'TIME:  <span>' + Math.round(Player.timePlayed) + 's</span>';
      }
      document.getElementById('screen-gameover').classList.remove('hidden');
    }, 1200);
  },

  onBossKill() {
    setTimeout(() => {
      this._showLevelComplete();
    }, 2000);
  },

  _showLevelComplete() {
    // Check if all enemies dead
    if (Enemies.list.filter(e => e.alive).length > 0 && !Levels.current.isBossLevel) return;

    this.state = 'levelcomplete';
    const rankColors = { D: '#888', C: '#44aa44', B: '#4488cc', A: '#cc9922', S: '#cc2222' };
    const rankEl = document.getElementById('lc-rank');
    if (rankEl) {
      rankEl.textContent = StyleMeter.rank;
      rankEl.style.color = rankColors[StyleMeter.rank] || '#888';
      rankEl.style.textShadow = '0 0 30px ' + (rankColors[StyleMeter.rank] || '#888');
    }
    const stats = document.getElementById('lc-stats');
    if (stats) {
      stats.innerHTML =
        'SCORE: <span>' + Math.round(Game.score) + '</span><br/>' +
        'KILLS: <span>' + Player.killCount + '</span><br/>' +
        'TIME:  <span>' + Math.round(Player.timePlayed) + 's</span>';
    }
    document.getElementById('screen-levelcomplete').classList.remove('hidden');
  },

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    if (this.state === 'playing') {
      this._update(dt);
      this._draw();
    }

    this.animFrame = requestAnimationFrame(ts => this.loop(ts));
  },

  _update(dt) {
    Input.tick();

    // Weapon swap
    if (Input.swapPressed || MobileInput.swapPressed) Weapons.swap();

    // Shoot
    const shootInput = Input.mouse.down || MobileInput.shootHeld;
    if (shootInput) {
      const camX = Renderer.getCamX();
      const camY = Renderer.getCamY();
      const mx   = MobileInput.isMobile
        ? Player.x + Player.w/2 + Player.facing * 200
        : Input.mouse.x + camX;
      const my   = MobileInput.isMobile
        ? Player.y + Player.h/2
        : Input.mouse.y + camY;
      Weapons.fire(
        Player.x + Player.w/2, Player.y + Player.h/2,
        mx, my,
        StyleMeter.dmgMultiplier
      );
    }

    // Mobile parry/dash via button
    if (MobileInput.parryPressed) {
      Input.keys['KeyE'] = true;
      setTimeout(() => { Input.keys['KeyE'] = false; }, 50);
    }
    if (MobileInput.dashPressed) {
      Input.keys['ShiftLeft'] = true;
      setTimeout(() => { Input.keys['ShiftLeft'] = false; }, 50);
    }
    if (MobileInput.slamPressed && !Player.onGround) {
      Player._doSlam();
    }

    Player.update(dt);
    Enemies.update(dt);
    Weapons.update(dt);
    Particles.update(dt);
    StyleMeter.update(dt);

    // Check exit
    if (Player.x + Player.w > Levels.current.exitX && Player.alive) {
      const allDead = Enemies.list.every(e => !e.alive);
      if (allDead) this._showLevelComplete();
    }

    // Camera
    Renderer.updateCamera(Player.x + Player.w/2, Player.y + Player.h/2, dt);

    MobileInput.tick();
  },

  _draw() {
    Renderer.clear();
    const camX = Renderer.getCamX();
    const camY = Renderer.getCamY();
    const ctx  = Renderer.ctx;

    // Level background + platforms
    Levels.draw(ctx, camX, camY, Renderer.W, Renderer.H);

    // Particles (behind entities)
    Particles.draw(ctx, camX, camY);

    // Enemies
    Enemies.draw(ctx, camX, camY);

    // Player
    Player.draw(ctx, camX, camY);

    // Bullets
    Weapons.draw(ctx, camX, camY);

    // HUD
    Renderer.drawHUD(Player);
  }
};

// Start when page loads
window.addEventListener('load', () => Game.init());
