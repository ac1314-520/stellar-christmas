import { THEMES } from './config.js';
import { state } from './state.js';

export function createStardustOverlay(canvas) {
  const ctx = canvas.getContext('2d');
  const particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();

  function spawn(x, y, count) {
    const cols = THEMES[state.theme].dustColors;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 1.4,
        vy: (Math.random() - 0.5) * 1.2 + 0.35,
        size: 1.4 + Math.random() * 2.6,
        life: 1.0,
        decay: 0.022 + Math.random() * 0.02,
        color: cols[Math.floor(Math.random() * cols.length)],
      });
    }
    if (particles.length > 130) {
      particles.splice(0, particles.length - 130);
    }
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = p.life * 0.85;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      const r = p.size * p.life;
      ctx.moveTo(p.x, p.y - r * 1.6);
      ctx.lineTo(p.x + r * 0.45, p.y - r * 0.45);
      ctx.lineTo(p.x + r * 1.6, p.y);
      ctx.lineTo(p.x + r * 0.45, p.y + r * 0.45);
      ctx.lineTo(p.x, p.y + r * 1.6);
      ctx.lineTo(p.x - r * 0.45, p.y + r * 0.45);
      ctx.lineTo(p.x - r * 1.6, p.y);
      ctx.lineTo(p.x - r * 0.45, p.y - r * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  return { resize, spawn, render };
}
