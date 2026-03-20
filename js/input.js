/* ═══════════════════════════════════════
   BRUTAL — Input System
   ═══════════════════════════════════════ */

const Input = {
  keys: {},
  prevKeys: {},
  mouse: { x: 0, y: 0, down: false, prevDown: false },

  init() {
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      this.keys[e.key.toLowerCase()] = true;
      e.preventDefault();
    });
    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
      this.keys[e.key.toLowerCase()] = false;
    });
    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
      this.mouse.y = (e.clientY - rect.top)  * (canvas.height / rect.height);
    });
    canvas.addEventListener('mousedown', e => { if (e.button === 0) this.mouse.down = true; });
    canvas.addEventListener('mouseup',   e => { if (e.button === 0) this.mouse.down = false; });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  },

  tick() {
    Object.keys(this.keys).forEach(k => this.prevKeys[k] = this.keys[k]);
    this.mouse.prevDown = this.mouse.down;
  },

  held(code)    { return !!(this.keys[code] || this.keys[code?.toLowerCase?.()]); },
  pressed(code) { return !!(this.keys[code] && !this.prevKeys[code]); },
  released(code){ return !!(!this.keys[code] && this.prevKeys[code]); },

  get left()  { return this.held('ArrowLeft')  || this.held('KeyA'); },
  get right() { return this.held('ArrowRight') || this.held('KeyD'); },
  get up()    { return this.held('ArrowUp')    || this.held('KeyW'); },
  get down()  { return this.held('ArrowDown')  || this.held('KeyS'); },

  get jumpPressed()  { return this.pressed('Space') || this.pressed('ArrowUp') || this.pressed('KeyW'); },
  get dashPressed()  { return this.pressed('ShiftLeft') || this.pressed('ShiftRight'); },
  get slamPressed()  { return (this.pressed('ArrowDown') || this.pressed('KeyS')); },
  get parryPressed() { return this.pressed('KeyE'); },
  get shootDown()    { return this.mouse.down && !this.mouse.prevDown; },
  get swapPressed()  { return this.pressed('KeyQ'); },
};
