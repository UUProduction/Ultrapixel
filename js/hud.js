/* ═══════════════════════════════════════
   ULTRAPIXEL — HUD System
   Weapon icons, style meter, top bar
   ═══════════════════════════════════════ */

const HUD = {

  // ── SVG weapon icon paths — drawn pixel-style ──
  WEAPON_ICONS: {
    revolver: `
      <g stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <!-- Barrel -->
        <rect x="8" y="16" width="28" height="7" rx="1.5" stroke-width="1.8" fill="rgba(0,180,255,0.15)"/>
        <!-- Grip -->
        <rect x="12" y="23" width="8" height="12" rx="1" stroke-width="1.5"/>
        <!-- Cylinder -->
        <circle cx="20" cy="20" r="5" stroke-width="1.8" fill="rgba(0,180,255,0.1)"/>
        <circle cx="20" cy="20" r="2" stroke-width="1" opacity="0.5"/>
        <!-- Hammer -->
        <rect x="32" y="13" width="5" height="8" rx="1" stroke-width="1.5"/>
        <!-- Sight -->
        <rect x="34" y="13" width="2" height="3" rx="0.5" fill="rgba(0,220,255,0.6)" stroke="none"/>
        <!-- Barrel tip -->
        <line x1="36" y1="19" x2="42" y2="19" stroke-width="2"/>
        <!-- Details -->
        <line x1="14" y1="16" x2="14" y2="23" stroke-width="1" opacity="0.4"/>
        <line x1="17" y1="16" x2="17" y2="23" stroke-width="1" opacity="0.4"/>
      </g>`,

    shotgun: `
      <g stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <!-- Main body — long double barrel -->
        <rect x="4" y="17" width="38" height="4" rx="1" stroke-width="1.8" fill="rgba(0,180,255,0.15)"/>
        <rect x="4" y="22" width="38" height="4" rx="1" stroke-width="1.8" fill="rgba(0,180,255,0.1)"/>
        <!-- Grip -->
        <rect x="10" y="26" width="9" height="11" rx="1.5" stroke-width="1.5"/>
        <!-- Foregrip -->
        <rect x="24" y="21" width="8" height="10" rx="1" stroke-width="1.3" opacity="0.7"/>
        <!-- Muzzle -->
        <rect x="38" y="15" width="4" height="10" rx="1" stroke-width="1.5"/>
        <!-- Shells visible -->
        <circle cx="8" cy="19" r="2" fill="rgba(255,120,0,0.5)" stroke="rgba(255,120,0,0.8)" stroke-width="1"/>
        <circle cx="8" cy="23" r="2" fill="rgba(255,120,0,0.5)" stroke="rgba(255,120,0,0.8)" stroke-width="1"/>
        <!-- Pump -->
        <rect x="22" y="16" width="10" height="3" rx="0.5" stroke-width="1" opacity="0.5"/>
      </g>`,

    nailgun: `
      <g stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <!-- Body — boxy industrial look -->
        <rect x="6" y="14" width="30" height="10" rx="1.5" stroke-width="1.8" fill="rgba(0,180,255,0.15)"/>
        <!-- Nail magazine on top -->
        <rect x="10" y="8" width="16" height="7" rx="1" stroke-width="1.5" fill="rgba(0,180,255,0.08)"/>
        <!-- Grip -->
        <rect x="8" y="24" width="9" height="11" rx="1.5" stroke-width="1.5"/>
        <!-- Barrel array — multiple small nozzles -->
        <rect x="34" y="14" width="4" height="3" rx="0.5" stroke-width="1.3"/>
        <rect x="34" y="18" width="4" height="3" rx="0.5" stroke-width="1.3"/>
        <rect x="34" y="22" width="4" height="3" rx="0.5" stroke-width="1.3"/>
        <!-- Nail visible in magazine -->
        <line x1="13" y1="11" x2="13" y2="15" stroke-width="1" opacity="0.5"/>
        <line x1="16" y1="11" x2="16" y2="15" stroke-width="1" opacity="0.5"/>
        <line x1="19" y1="11" x2="19" y2="15" stroke-width="1" opacity="0.5"/>
        <line x1="22" y1="11" x2="22" y2="15" stroke-width="1" opacity="0.5"/>
        <!-- Heat vents -->
        <line x1="28" y1="15" x2="28" y2="23" stroke-width="1" opacity="0.4"/>
        <line x1="31" y1="15" x2="31" y2="23" stroke-width="1" opacity="0.4"/>
      </g>`,

    railcannon: `
      <g stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <!-- Large triangular prong body -->
        <polygon points="6,20 20,11 42,18 42,22 20,29" stroke-width="1.8" fill="rgba(0,180,255,0.12)"/>
        <!-- Center energy core -->
        <circle cx="18" cy="20" r="5" stroke-width="2" fill="rgba(0,220,255,0.2)" stroke="rgba(0,220,255,0.9)"/>
        <circle cx="18" cy="20" r="2" fill="rgba(0,220,255,0.8)" stroke="none"/>
        <!-- Prong lines -->
        <line x1="20" y1="11" x2="42" y2="18" stroke-width="1" opacity="0.5"/>
        <line x1="20" y1="29" x2="42" y2="22" stroke-width="1" opacity="0.5"/>
        <!-- Charge screws on sides -->
        <circle cx="28" cy="16" r="1.5" stroke-width="1.2" fill="rgba(0,200,255,0.3)"/>
        <circle cx="32" cy="15" r="1.5" stroke-width="1.2" fill="rgba(0,200,255,0.3)"/>
        <circle cx="36" cy="16" r="1.5" stroke-width="1.2" fill="rgba(0,200,255,0.3)"/>
        <circle cx="28" cy="24" r="1.5" stroke-width="1.2" fill="rgba(0,200,255,0.3)"/>
        <circle cx="32" cy="25" r="1.5" stroke-width="1.2" fill="rgba(0,200,255,0.3)"/>
        <circle cx="36" cy="24" r="1.5" stroke-width="1.2" fill="rgba(0,200,255,0.3)"/>
        <!-- Energy wire on top prong -->
        <path d="M20 11 Q30 8 42 18" stroke="rgba(0,220,255,0.4)" stroke-width="1" fill="none" stroke-dasharray="2 2"/>
      </g>`,

    rocket: `
      <g stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <!-- Tube body -->
        <rect x="4" y="16" width="34" height="8" rx="2" stroke-width="1.8" fill="rgba(0,180,255,0.12)"/>
        <!-- Rocket visible in tube -->
        <rect x="6" y="17" width="20" height="6" rx="1" fill="rgba(255,80,0,0.3)" stroke="rgba(255,80,0,0.6)" stroke-width="1"/>
        <!-- Rocket tip -->
        <path d="M26 17 L30 20 L26 23" fill="rgba(255,100,0,0.5)" stroke="rgba(255,120,0,0.8)" stroke-width="1"/>
        <!-- Back exhaust -->
        <rect x="2" y="17" width="4" height="6" rx="1" stroke-width="1.5" fill="rgba(0,0,0,0.5)"/>
        <!-- Sight rails on top -->
        <rect x="8" y="13" width="22" height="3" rx="0.5" stroke-width="1.3" opacity="0.6"/>
        <!-- Grip -->
        <rect x="10" y="24" width="8" height="10" rx="1.5" stroke-width="1.5"/>
        <!-- Trigger guard -->
        <path d="M12 24 Q11 30 14 30 Q17 30 16 24" stroke-width="1.2" opacity="0.6"/>
      </g>`
  },

  // Style rank data matching Ultrakill
  RANKS: [
    { name: 'DESTRUCTIVE', short: 'D', color: '#888888', threshold: 0   },
    { name: 'CHAOTIC',     short: 'C', color: '#44bb44', threshold: 150 },
    { name: 'BRUTAL',      short: 'B', color: '#4488ff', threshold: 300 },
    { name: 'ANARCHIC',    short: 'A', color: '#ffaa00', threshold: 500 },
    { name: 'ULTRAKILL',   short: 'S', color: '#ff2222', threshold: 750 },
  ],

  _bonusQueue: [],
  _bonusY: 120,

  init() {
    document.getElementById('hud-top')?.classList.remove('hidden');
    document.getElementById('style-meter')?.classList.remove('hidden');
    document.getElementById('kill-feed')?.classList.remove('hidden');
    this.updateWeaponIcon(Weapons.current);
  },

  hide() {
    document.getElementById('hud-top')?.classList.add('hidden');
    document.getElementById('style-meter')?.classList.add('hidden');
    document.getElementById('kill-feed')?.classList.add('hidden');
  },

  // ── Update weapon SVG icons ──
  updateWeaponIcon(weaponName) {
    const svg = document.getElementById('hud-weapon-icon');
    if (!svg) return;
    const iconPath = this.WEAPON_ICONS[weaponName] || this.WEAPON_ICONS.revolver;
    // Color matches weapon type
    const colors = {
      revolver:   '#00ccff',
      shotgun:    '#00aaff',
      nailgun:    '#00ddff',
      railcannon: '#00eeff',
      rocket:     '#ff8800'
    };
    const col = colors[weaponName] || '#00ccff';
    svg.style.color = col;
    svg.innerHTML = `<style>.weapon-line{color:${col}}</style>${iconPath}`;

    // Update next weapon preview
    const order = ['revolver','shotgun','nailgun','railcannon','rocket'];
    const idx = order.indexOf(weaponName);
    const nextName = order[(idx + 1) % order.length];
    const nextSvg = document.getElementById('next-weapon-icon');
    if (nextSvg) {
      const nextIcon = this.WEAPON_ICONS[nextName] || '';
      nextSvg.style.color = colors[nextName] || '#00ccff';
      nextSvg.innerHTML = `<g transform="scale(0.55) translate(0,0)">${nextIcon}</g>`;
    }
  },

  // ── HP ──
  updateHP(hp, maxHp) {
    const cur = document.getElementById('hud-hp-current');
    const bar = document.getElementById('low-health-vignette');
    if (cur) {
      cur.textContent = Math.ceil(hp);
      cur.style.color = hp > 60 ? '#44ff66' : hp > 30 ? '#ffaa00' : '#ff2222';
      cur.style.textShadow = `0 0 10px ${hp > 60 ? 'rgba(68,255,102,0.6)' : hp > 30 ? 'rgba(255,170,0,0.6)' : 'rgba(255,0,0,0.8)'}`;
    }
    // Low health vignette
    if (bar) {
      const pct = hp / maxHp;
      bar.style.opacity = pct < 0.3 ? (1 - pct / 0.3) * 0.6 : 0;
      bar.style.background = `radial-gradient(ellipse at center, transparent 40%, rgba(180,0,0,${(1-pct)*0.5}) 100%)`;
    }
    // Flash red on hurt
    this._flashScreen('rgba(180,0,0,0.25)');
  },

  // ── Boss HP ──
  updateBoss(hp, label) {
    const val = document.getElementById('hud-boss-val');
    const lbl = document.getElementById('hud-boss-label');
    if (val) {
      val.textContent = hp !== null ? Math.ceil(hp) : '—';
      val.style.color = hp !== null
        ? (hp > 400 ? '#ff2222' : hp > 200 ? '#ff6600' : '#ff8800')
        : '#333';
    }
    if (lbl && label) lbl.textContent = label;
  },

  // ── Time ──
  updateTime(secs) {
    const el = document.getElementById('hud-time-val');
    if (el) el.textContent = Math.floor(secs);
  },

  // ── Style rank (big letters left side) ──
  updateStyleRank(rank, value) {
    const el = document.getElementById('style-rank-display');
    const rankData = this.RANKS.find(r => r.short === rank) || this.RANKS[0];
    if (el) {
      el.textContent = rankData.name;
      el.style.color = rankData.color;
      el.style.textShadow = `0 0 20px ${rankData.color}`;
      // Scale animation on rank change
      el.style.transform = 'scale(1.3)';
      setTimeout(() => { el.style.transform = 'scale(1)'; el.style.transition = 'transform 0.2s'; }, 100);
    }
  },

  // ── Style bonus popup ──
  showStyleBonus(text, points) {
    const el = document.createElement('div');
    el.className = 'style-popup';
    el.style.top = this._bonusY + 'px';
    el.textContent = `[+${text.toUpperCase()}] +${points}`;
    document.body.appendChild(el);
    this._bonusY += 16;
    if (this._bonusY > 300) this._bonusY = 120;
    setTimeout(() => { el.remove(); this._bonusY = Math.max(120, this._bonusY - 16); }, 1400);
  },

  // ── Kill feed ──
  addKillFeed(enemyName) {
    const feed = document.getElementById('kill-feed');
    if (!feed) return;
    const item = document.createElement('div');
    item.className = 'kill-item';
    item.textContent = '✕ ' + enemyName.toUpperCase();
    feed.appendChild(item);
    setTimeout(() => item.remove(), 2500);
  },

  // ── Screen flash ──
  _flashScreen(color) {
    const el = document.getElementById('screen-flash');
    if (!el) return;
    el.style.background = color;
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 60);
  },

  // ── Damage number ──
  showDamage(x, y, amount, camX, camY, isHeal) {
    const el = document.createElement('div');
    el.className = 'dmg-number';
    el.textContent = (isHeal ? '+' : '') + Math.round(amount);
    el.style.color = isHeal ? '#44ff88' : (amount > 40 ? '#ff8800' : '#ff4444');
    el.style.left = (x - camX - 14) + 'px';
    el.style.top  = (y - camY - 20) + 'px';
    if (amount > 50) { el.style.fontSize = '26px'; }
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 650);
  },

  // ── Canvas HUD elements drawn by renderer ──
  drawCanvas(ctx, W, H) {
    ctx.save();

    // Railcannon charge bar (bottom left above HP)
    if (Weapons.current === 'railcannon') {
      const charge = 1 - (Weapons.cooldown / 16);
      const bw = 120, bh = 6;
      const bx = 10, by = H - 110;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = charge >= 1 ? '#00eeff' : '#004466';
      ctx.fillRect(bx, by, bw * Utils.clamp(charge, 0, 1), bh);
      ctx.strokeStyle = 'rgba(0,200,255,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, bw, bh);

      if (charge >= 1) {
        ctx.fillStyle = '#00eeff';
        ctx.shadowColor = '#00eeff';
        ctx.shadowBlur  = 8;
        ctx.font = '8px Share Tech Mono';
        ctx.fillText('RAILCANNON READY', bx, by - 3);
        ctx.shadowBlur = 0;
      }
    }

    // Dash cooldown arc
    if (Weapons && Game.player) {
      const p = Game.player;
      if (!p.canDash && p.dashCooldown > 0) {
        const prog = 1 - (p.dashCooldown / 0.35);
        ctx.strokeStyle = 'rgba(0,200,255,0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(W/2, H - 30, 12, -Math.PI/2, -Math.PI/2 + Math.PI*2*prog);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
};
