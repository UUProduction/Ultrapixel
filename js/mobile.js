/* ═══════════════════════════════════════
   BRUTAL — Mobile Input
   ═══════════════════════════════════════ */

const MobileInput = {
  joyX: 0, joyY: 0,
  joyActive: false, joyId: null,
  joyBaseX: 0, joyBaseY: 0,
  jumpPressed:  false,
  dashPressed:  false,
  slamPressed:  false,
  shootHeld:    false,
  parryPressed: false,
  swapPressed:  false,
  isMobile: false,

  init() {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      || navigator.maxTouchPoints > 1;

    if (!this.isMobile) return;

    document.getElementById('mobile-controls')?.classList.remove('hidden');
    document.getElementById('mobile-hud')?.classList.remove('hidden');
    document.getElementById('style-meter-mobile').style.display = '';
    document.getElementById('hp-hud').style.display = '';
    document.getElementById('weapon-hud').style.display = '';

    this._bindJoystick();
    this._bindButtons();
  },

  _bindJoystick() {
    const zone  = document.getElementById('joy-zone');
    const base  = document.getElementById('joy-base');
    const stick = document.getElementById('joy-stick');
    if (!zone) return;

    zone.addEventListener('touchstart', e => {
      e.preventDefault(); e.stopPropagation();
      if (this.joyActive) return;
      const t = e.changedTouches[0];
      this.joyId = t.identifier;
      this.joyActive = true;
      this.joyBaseX  = t.clientX;
      this.joyBaseY  = t.clientY;
      base.classList.remove('hidden');
      base.style.left = (t.clientX - 60) + 'px';
      base.style.top  = (t.clientY - 60) + 'px';
    }, { passive: false });

    document.addEventListener('touchmove', e => {
      if (!this.joyActive) return;
      Array.from(e.changedTouches).forEach(t => {
        if (t.identifier !== this.joyId) return;
        const dx = t.clientX - this.joyBaseX;
        const dy = t.clientY - this.joyBaseY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const max  = 55;
        const nx   = dist > max ? dx/dist*max : dx;
        const ny   = dist > max ? dy/dist*max : dy;
        this.joyX  = nx / max;
        this.joyY  = ny / max;
        stick.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
      });
    }, { passive: true });

    document.addEventListener('touchend', e => {
      Array.from(e.changedTouches).forEach(t => {
        if (t.identifier !== this.joyId) return;
        this.joyActive = false; this.joyId = null;
        this.joyX = 0; this.joyY = 0;
        base.classList.add('hidden');
        stick.style.transform = 'translate(-50%, -50%)';
      });
    });
  },

  _bindButtons() {
    const bind = (id, onStart, onEnd) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', e => {
        e.preventDefault(); e.stopPropagation();
        el.classList.add('pressed');
        onStart && onStart();
      }, { passive: false });
      el.addEventListener('touchend', e => {
        e.preventDefault(); el.classList.remove('pressed');
        onEnd && onEnd();
      }, { passive: false });
      // Mouse fallback for desktop testing
      el.addEventListener('mousedown', () => { el.classList.add('pressed'); onStart && onStart(); });
      el.addEventListener('mouseup',   () => { el.classList.remove('pressed'); onEnd && onEnd(); });
    };

    bind('btn-jump',   () => { this.jumpPressed = true; },  null);
    bind('btn-dash',   () => { this.dashPressed = true; },  null);
    bind('btn-slam',   () => { this.slamPressed = true; },  null);
    bind('btn-parry',  () => { this.parryPressed = true; }, null);
    bind('btn-shoot',  () => { this.shootHeld = true; },    () => { this.shootHeld = false; });
    bind('btn-weapon', () => { this.swapPressed = true; },  null);
  },

  tick() {
    // Reset one-shot inputs after consumed
    this.jumpPressed  = false;
    this.dashPressed  = false;
    this.slamPressed  = false;
    this.parryPressed = false;
    this.swapPressed  = false;
  }
};
