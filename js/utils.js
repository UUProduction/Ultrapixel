/* ═══════════════════════════════════════
   BRUTAL — Utils
   ═══════════════════════════════════════ */

const Utils = {
  clamp: (v, min, max) => Math.max(min, Math.min(max, v)),
  lerp:  (a, b, t) => a + (b - a) * t,
  dist:  (ax, ay, bx, by) => Math.sqrt((ax-bx)**2 + (ay-by)**2),
  rnd:   (min, max) => min + Math.random() * (max - min),
  rndInt:(min, max) => Math.floor(min + Math.random() * (max - min + 1)),
  sign:  (v) => v < 0 ? -1 : v > 0 ? 1 : 0,
  norm:  (v, min, max) => (v - min) / (max - min),

  // Overlap check for two rects
  rectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx &&
           ay < by + bh && ay + ah > by;
  },

  // Show DOM damage number
  showDmgNumber(x, y, amount, color, camera) {
    const el = document.createElement('div');
    el.className = 'dmg-number';
    el.textContent = Math.round(amount);
    el.style.color = color || '#ff4444';
    // Convert world coords to screen
    const sx = x - (camera ? camera.x : 0);
    const sy = y - (camera ? camera.y : 0);
    el.style.left = (sx - 12) + 'px';
    el.style.top  = (sy - 20) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700);
  }
};
