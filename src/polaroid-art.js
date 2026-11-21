/**
 * Deterministic procedural winter artwork renderer for Polaroid frames.
 * Renders 12 distinct festive illustrations directly onto Canvas 2D, ensuring
 * zero personal-photo leakage and zero external asset dependencies.
 */

function seededRng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function drawSky(ctx, x, y, size, stops) {
  const g = ctx.createLinearGradient(x, y, x, y + size);
  stops.forEach(([pos, col]) => g.addColorStop(pos, col));
  ctx.fillStyle = g;
  ctx.fillRect(x, y, size, size);
}

function drawStars(ctx, x, y, size, count, rng, color = '#fff7d6') {
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const sx = x + rng() * size;
    const sy = y + rng() * size * 0.65;
    const r = 0.8 + rng() * 2.2;
    ctx.globalAlpha = 0.35 + rng() * 0.65;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawSnowflakes(ctx, x, y, size, count, rng) {
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < count; i++) {
    const sx = x + rng() * size;
    const sy = y + rng() * size;
    const r = 1.2 + rng() * 3.4;
    ctx.globalAlpha = 0.25 + rng() * 0.55;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawPine(ctx, cx, baseY, h, w, color) {
  ctx.fillStyle = color;
  for (let t = 0; t < 3; t++) {
    const ty = baseY - h * (0.28 + t * 0.26);
    const tw = w * (1 - t * 0.24);
    const th = h * 0.42;
    ctx.beginPath();
    ctx.moveTo(cx, ty - th);
    ctx.lineTo(cx - tw * 0.5, ty);
    ctx.lineTo(cx + tw * 0.5, ty);
    ctx.closePath();
    ctx.fill();
  }
}

function drawMoon(ctx, cx, cy, r, color = '#fef3c7') {
  const halo = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 2.8);
  halo.addColorStop(0, 'rgba(254, 243, 199, 0.55)');
  halo.addColorStop(0.5, 'rgba(254, 243, 199, 0.14)');
  halo.addColorStop(1, 'rgba(254, 243, 199, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 2.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawSnowHills(ctx, x, y, size, backColor, frontColor) {
  ctx.fillStyle = backColor;
  ctx.beginPath();
  ctx.moveTo(x, y + size);
  ctx.lineTo(x, y + size * 0.72);
  ctx.quadraticCurveTo(x + size * 0.3, y + size * 0.6, x + size * 0.62, y + size * 0.71);
  ctx.quadraticCurveTo(x + size * 0.84, y + size * 0.78, x + size, y + size * 0.68);
  ctx.lineTo(x + size, y + size);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = frontColor;
  ctx.beginPath();
  ctx.moveTo(x, y + size);
  ctx.lineTo(x, y + size * 0.8);
  ctx.quadraticCurveTo(x + size * 0.28, y + size * 0.88, x + size * 0.58, y + size * 0.77);
  ctx.quadraticCurveTo(x + size * 0.82, y + size * 0.68, x + size, y + size * 0.82);
  ctx.lineTo(x + size, y + size);
  ctx.closePath();
  ctx.fill();
}

export function drawProceduralHolidayArt(ctx, artKey, x, y, size, idx = 0) {
  const rng = seededRng((idx + 1) * 7919);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.clip();

  switch (artKey) {
    case 'cabin': {
      drawSky(ctx, x, y, size, [
        [0, '#0a1830'],
        [0.55, '#19375a'],
        [1, '#2b4d6d'],
      ]);
      drawStars(ctx, x, y, size, 55, rng);
      drawMoon(ctx, x + size * 0.76, y + size * 0.22, size * 0.075);
      drawSnowHills(ctx, x, y, size, '#bfd6ea', '#e8f1f8');

      // Pine silhouettes
      drawPine(ctx, x + size * 0.16, y + size * 0.78, size * 0.34, size * 0.17, '#0f2d2c');
      drawPine(ctx, x + size * 0.28, y + size * 0.75, size * 0.26, size * 0.13, '#16403c');
      drawPine(ctx, x + size * 0.84, y + size * 0.79, size * 0.32, size * 0.16, '#0f2d2c');

      // Warm wooden cabin
      const cx = x + size * 0.54;
      const cy = y + size * 0.77;
      ctx.fillStyle = '#5c331c';
      ctx.fillRect(cx - 88, cy - 92, 176, 98);
      // Chimney & smoke
      ctx.fillStyle = '#472515';
      ctx.fillRect(cx + 38, cy - 155, 26, 62);
      ctx.fillStyle = 'rgba(235, 244, 255, 0.32)';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(cx + 52 + i * 14, cy - 168 - i * 24, 12 + i * 5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Snow roof
      ctx.fillStyle = '#8b2e26';
      ctx.beginPath();
      ctx.moveTo(cx - 110, cy - 86);
      ctx.lineTo(cx, cy - 162);
      ctx.lineTo(cx + 110, cy - 86);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 106, cy - 88);
      ctx.lineTo(cx, cy - 160);
      ctx.lineTo(cx + 106, cy - 88);
      ctx.stroke();

      // Glowing golden windows
      const winGlow = ctx.createRadialGradient(cx, cy - 42, 8, cx, cy - 42, 125);
      winGlow.addColorStop(0, 'rgba(255, 214, 102, 0.55)');
      winGlow.addColorStop(1, 'rgba(255, 214, 102, 0)');
      ctx.fillStyle = winGlow;
      ctx.beginPath();
      ctx.arc(cx, cy - 42, 125, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fde08d';
      ctx.fillRect(cx - 60, cy - 66, 38, 38);
      ctx.fillRect(cx + 22, cy - 66, 38, 38);
      ctx.fillStyle = '#3d1f11';
      ctx.fillRect(cx - 14, cy - 52, 28, 56);
      drawSnowflakes(ctx, x, y, size, 45, rng);
      break;
    }

    case 'aurora': {
      drawSky(ctx, x, y, size, [
        [0, '#040a1a'],
        [0.5, '#0b223d'],
        [1, '#103554'],
      ]);
      drawStars(ctx, x, y, size, 75, rng, '#e0f2fe');

      // Sweeping northern lights ribbons
      const ribbons = [
        ['rgba(52, 211, 153, 0.55)', 0.22, 0.42],
        ['rgba(56, 189, 248, 0.46)', 0.16, 0.34],
        ['rgba(167, 139, 250, 0.38)', 0.28, 0.48],
      ];
      ribbons.forEach(([col, y1, y2], ri) => {
        const g = ctx.createLinearGradient(x, y + size * y1, x, y + size * (y2 + 0.16));
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(0.5, col);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x, y + size * y2);
        ctx.bezierCurveTo(
          x + size * 0.3,
          y + size * (y1 - 0.08 + ri * 0.04),
          x + size * 0.65,
          y + size * (y2 + 0.1),
          x + size,
          y + size * (y1 + 0.04)
        );
        ctx.lineTo(x + size, y + size * (y2 + 0.2));
        ctx.bezierCurveTo(
          x + size * 0.65,
          y + size * (y2 + 0.28),
          x + size * 0.3,
          y + size * (y1 + 0.12),
          x,
          y + size * (y2 + 0.18)
        );
        ctx.closePath();
        ctx.fill();
      });

      // Jagged snowy peaks
      ctx.fillStyle = '#0c1f35';
      ctx.beginPath();
      ctx.moveTo(x, y + size);
      ctx.lineTo(x, y + size * 0.72);
      ctx.lineTo(x + size * 0.22, y + size * 0.52);
      ctx.lineTo(x + size * 0.44, y + size * 0.68);
      ctx.lineTo(x + size * 0.72, y + size * 0.48);
      ctx.lineTo(x + size, y + size * 0.7);
      ctx.lineTo(x + size, y + size);
      ctx.closePath();
      ctx.fill();

      // Mirror frozen lake
      const lake = ctx.createLinearGradient(x, y + size * 0.74, x, y + size);
      lake.addColorStop(0, '#0f344c');
      lake.addColorStop(0.5, '#19506b');
      lake.addColorStop(1, '#081b2e');
      ctx.fillStyle = lake;
      ctx.fillRect(x, y + size * 0.74, size, size * 0.26);
      drawSnowflakes(ctx, x, y, size, 32, rng);
      break;
    }

    case 'cocoa': {
      drawSky(ctx, x, y, size, [
        [0, '#2a1215'],
        [0.55, '#59231f'],
        [1, '#1e0e0f'],
      ]);
      // Soft festive bokeh dots
      for (let i = 0; i < 18; i++) {
        const bx = x + rng() * size;
        const by = y + rng() * size * 0.62;
        const br = 12 + rng() * 26;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(253, 224, 130, 0.22)' : 'rgba(248, 113, 113, 0.18)';
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }
      // Wooden tabletop
      ctx.fillStyle = '#3d1e14';
      ctx.fillRect(x, y + size * 0.74, size, size * 0.26);

      // Steaming ceramic mug
      const cx = x + size * 0.5;
      const cy = y + size * 0.66;
      // Steam curls
      ctx.strokeStyle = 'rgba(255, 245, 230, 0.45)';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      [-46, 0, 46].forEach((dx, si) => {
        ctx.beginPath();
        ctx.moveTo(cx + dx, cy - 115);
        ctx.bezierCurveTo(cx + dx - 22, cy - 165, cx + dx + 26, cy - 205, cx + dx - 6, cy - 250 - si * 10);
        ctx.stroke();
      });

      // Handle
      ctx.strokeStyle = '#c83e37';
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.arc(cx + 98, cy - 22, 42, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();

      // Mug body
      const mugGrad = ctx.createLinearGradient(cx - 96, cy, cx + 96, cy);
      mugGrad.addColorStop(0, '#991b1b');
      mugGrad.addColorStop(0.45, '#dc2626');
      mugGrad.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = mugGrad;
      ctx.beginPath();
      ctx.roundRect(cx - 98, cy - 104, 196, 174, [16, 16, 44, 44]);
      ctx.fill();

      // Gold snowflake emblem on mug
      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 64px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('❄', cx, cy - 12);

      // Whipped cream & marshmallows rim
      ctx.fillStyle = '#fffbeb';
      [-56, -24, 12, 48].forEach((dx, mi) => {
        ctx.beginPath();
        ctx.arc(cx + dx, cy - 102 - (mi % 2) * 8, 28, 0, Math.PI * 2);
        ctx.fill();
      });
      // Cinnamon stick
      ctx.save();
      ctx.translate(cx + 42, cy - 118);
      ctx.rotate(0.42);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(-10, -48, 20, 62);
      ctx.restore();
      break;
    }

    case 'reindeer': {
      drawSky(ctx, x, y, size, [
        [0, '#071426'],
        [0.6, '#153759'],
        [1, '#265475'],
      ]);
      drawStars(ctx, x, y, size, 65, rng);
      drawMoon(ctx, x + size * 0.5, y + size * 0.34, size * 0.16, '#fff8dc');
      drawSnowHills(ctx, x, y, size, '#b8d1e6', '#e6f0f9');
      drawPine(ctx, x + size * 0.15, y + size * 0.78, size * 0.3, size * 0.14, '#0c2334');
      drawPine(ctx, x + size * 0.85, y + size * 0.8, size * 0.33, size * 0.16, '#0c2334');

      // Silhouette of proud stag/reindeer on hilltop
      const rx = x + size * 0.5;
      const ry = y + size * 0.74;
      ctx.fillStyle = '#0a1929';
      ctx.strokeStyle = '#0a1929';
      ctx.lineCap = 'round';
      // Body
      ctx.beginPath();
      ctx.ellipse(rx - 6, ry - 48, 48, 24, -0.06, 0, Math.PI * 2);
      ctx.fill();
      // Neck & head
      ctx.beginPath();
      ctx.moveTo(rx + 24, ry - 54);
      ctx.lineTo(rx + 46, ry - 118);
      ctx.lineTo(rx + 66, ry - 116);
      ctx.lineTo(rx + 48, ry - 48);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(rx + 64, ry - 118, 24, 13, 0.12, 0, Math.PI * 2);
      ctx.fill();
      // Legs
      ctx.lineWidth = 9;
      [
        [rx - 36, ry - 38, rx - 46, ry + 14],
        [rx - 20, ry - 36, rx - 14, ry + 16],
        [rx + 22, ry - 38, rx + 18, ry + 14],
        [rx + 34, ry - 38, rx + 46, ry + 12],
      ].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
      // Antlers
      ctx.lineWidth = 5;
      [
        [rx + 54, ry - 128, rx + 36, ry - 178],
        [rx + 45, ry - 154, rx + 22, ry - 166],
        [rx + 41, ry - 165, rx + 52, ry - 186],
        [rx + 62, ry - 128, rx + 76, ry - 176],
        [rx + 70, ry - 152, rx + 92, ry - 162],
      ].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
      // Glowing nose star
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(rx + 86, ry - 117, 5, 0, Math.PI * 2);
      ctx.fill();
      drawSnowflakes(ctx, x, y, size, 40, rng);
      break;
    }

    case 'snowglobe': {
      drawSky(ctx, x, y, size, [
        [0, '#0f172a'],
        [0.6, '#1e293b'],
        [1, '#090d16'],
      ]);
      drawStars(ctx, x, y, size, 40, rng);
      const cx = x + size * 0.5;
      const cy = y + size * 0.45;
      const R = size * 0.33;

      // Glass sphere background
      const globeGrad = ctx.createRadialGradient(cx - 40, cy - 50, 18, cx, cy, R);
      globeGrad.addColorStop(0, '#38bdf8');
      globeGrad.addColorStop(0.55, '#1d4ed8');
      globeGrad.addColorStop(1, '#0b1736');
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = globeGrad;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      // Snow mound inside globe
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.ellipse(cx, cy + R * 0.72, R * 0.98, R * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mini golden-lit Christmas tree inside globe
      drawPine(ctx, cx, cy + R * 0.52, R * 1.05, R * 0.7, '#0f766e');
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 34px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('★', cx, cy - R * 0.52);
      for (let i = 0; i < 45; i++) {
        ctx.fillStyle = i % 5 === 0 ? '#fde68a' : '#ffffff';
        ctx.globalAlpha = 0.45 + rng() * 0.55;
        ctx.beginPath();
        ctx.arc(cx + (rng() - 0.5) * R * 1.8, cy + (rng() - 0.5) * R * 1.6, 2 + rng() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // Glass rim & specular crescent
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.72)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.48)';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, R - 16, Math.PI * 1.12, Math.PI * 1.42);
      ctx.stroke();

      // Walnut & brass pedestal
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(cx - R * 0.72, cy + R * 0.78, R * 1.44, 74, [14, 14, 22, 22]);
      ctx.fill();
      ctx.fillStyle = '#f5ce70';
      ctx.fillRect(cx - R * 0.42, cy + R * 0.96, R * 0.84, 24);
      break;
    }

    case 'wreath': {
      drawSky(ctx, x, y, size, [
        [0, '#102620'],
        [0.5, '#193d33'],
        [1, '#091815'],
      ]);
      const cx = x + size * 0.5;
      const cy = y + size * 0.5;
      const R = size * 0.28;

      // Evergreen foliage ring
      for (let i = 0; i < 42; i++) {
        const a = (i / 42) * Math.PI * 2;
        const lx = cx + Math.cos(a) * R;
        const ly = cy + Math.sin(a) * R;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(a + (i % 2 === 0 ? 0.5 : -0.5));
        ctx.fillStyle = i % 3 === 0 ? '#15803d' : i % 3 === 1 ? '#166534' : '#059669';
        ctx.beginPath();
        ctx.ellipse(0, 0, 38, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      // Golden fairy dots & red berries
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const bx = cx + Math.cos(a) * (R + (i % 2 ? 12 : -10));
        const by = cy + Math.sin(a) * (R + (i % 2 ? 12 : -10));
        ctx.fillStyle = i % 2 === 0 ? '#dc2626' : '#fde047';
        ctx.beginPath();
        ctx.arc(bx, by, i % 2 === 0 ? 11 : 7, 0, Math.PI * 2);
        ctx.fill();
      }
      // Velvet crimson bow at top
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.ellipse(cx - 44, cy - R - 10, 44, 24, -0.35, 0, Math.PI * 2);
      ctx.ellipse(cx + 44, cy - R - 10, 44, 24, 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx, cy - R - 6, 18, 0, Math.PI * 2);
      ctx.fill();
      drawSnowflakes(ctx, x, y, size, 28, rng);
      break;
    }

    case 'lantern': {
      drawSky(ctx, x, y, size, [
        [0, '#07111f'],
        [0.55, '#132840'],
        [1, '#1d364d'],
      ]);
      drawStars(ctx, x, y, size, 50, rng);
      const cx = x + size * 0.5;
      const cy = y + size * 0.56;

      // Warm radial lantern light
      const glow = ctx.createRadialGradient(cx, cy, 12, cx, cy, size * 0.46);
      glow.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      glow.addColorStop(0.32, 'rgba(245, 158, 11, 0.45)');
      glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.46, 0, Math.PI * 2);
      ctx.fill();

      // Snow base
      ctx.fillStyle = '#dbeafe';
      ctx.fillRect(x, y + size * 0.82, size, size * 0.18);

      // Lantern handle, roof, glass chamber, candle
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(cx, cy - 122, 42, Math.PI, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.moveTo(cx - 86, cy - 84);
      ctx.lineTo(cx, cy - 134);
      ctx.lineTo(cx + 86, cy - 84);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 244, 196, 0.85)';
      ctx.fillRect(cx - 64, cy - 84, 128, 168);
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 12;
      ctx.strokeRect(cx - 64, cy - 84, 128, 168);
      ctx.beginPath();
      ctx.moveTo(cx, cy - 84);
      ctx.lineTo(cx, cy + 84);
      ctx.stroke();

      // Candle flame
      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(cx - 18, cy + 12, 36, 66);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 6, 13, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#111827';
      ctx.fillRect(cx - 82, cy + 84, 164, 24);
      drawSnowflakes(ctx, x, y, size, 45, rng);
      break;
    }

    case 'sleigh': {
      drawSky(ctx, x, y, size, [
        [0, '#091026'],
        [0.5, '#1d2d59'],
        [1, '#31477a'],
      ]);
      drawStars(ctx, x, y, size, 70, rng);
      drawMoon(ctx, x + size * 0.5, y + size * 0.42, size * 0.24, '#fef9c3');

      // Silvery sleigh silhouette crossing moon
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#0f172a';
      const sx = x + size * 0.42;
      const sy = y + size * 0.46;
      ctx.beginPath();
      ctx.moveTo(sx - 78, sy - 20);
      ctx.quadraticCurveTo(sx - 56, sy + 20, sx + 12, sy + 14);
      ctx.lineTo(sx + 28, sy - 16);
      ctx.lineTo(sx - 38, sy - 8);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(sx - 86, sy + 28);
      ctx.lineTo(sx + 34, sy + 28);
      ctx.quadraticCurveTo(sx + 54, sy + 26, sx + 56, sy + 8);
      ctx.stroke();
      // Sparkle trail behind sleigh
      for (let i = 0; i < 24; i++) {
        ctx.fillStyle = '#fde68a';
        ctx.globalAlpha = 0.25 + rng() * 0.7;
        ctx.beginPath();
        ctx.arc(sx - 92 - i * 9, sy + (rng() - 0.5) * 44, 2 + rng() * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Forest treeline at bottom
      for (let i = 0; i < 9; i++) {
        drawPine(ctx, x + i * (size / 8), y + size + 10, size * (0.24 + (i % 3) * 0.06), size * 0.16, '#091120');
      }
      break;
    }

    case 'fireplace': {
      drawSky(ctx, x, y, size, [
        [0, '#2b120e'],
        [0.6, '#431a12'],
        [1, '#1b0b08'],
      ]);
      const cx = x + size * 0.5;
      // Mantelpiece
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(x + 42, y + size * 0.34, size - 84, 34);
      ctx.fillStyle = '#5c2110';
      ctx.fillRect(x + 68, y + size * 0.4, size - 136, size * 0.55);

      // Firebox
      ctx.fillStyle = '#120806';
      ctx.beginPath();
      ctx.roundRect(cx - 118, y + size * 0.52, 236, size * 0.42, [28, 28, 0, 0]);
      ctx.fill();

      // Warm flames
      const fg = ctx.createRadialGradient(cx, y + size * 0.82, 16, cx, y + size * 0.76, 150);
      fg.addColorStop(0, '#fef08a');
      fg.addColorStop(0.45, '#f97316');
      fg.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(cx, y + size * 0.78, 150, 0, Math.PI * 2);
      ctx.fill();

      // 3 Hanging Christmas stockings
      const stockColors = ['#dc2626', '#15803d', '#b91c1c'];
      [-118, 0, 118].forEach((dx, si) => {
        const sx = cx + dx;
        const sy = y + size * 0.4;
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(sx - 24, sy, 48, 18);
        ctx.fillStyle = stockColors[si];
        ctx.fillRect(sx - 20, sy + 16, 40, 62);
        ctx.beginPath();
        ctx.ellipse(sx + 10, sy + 78, 28, 18, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Glowing candles on mantel
      [-140, 140].forEach((dx) => {
        ctx.fillStyle = '#fffbeb';
        ctx.fillRect(cx + dx - 12, y + size * 0.21, 24, 72);
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.ellipse(cx + dx, y + size * 0.19, 8, 15, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    case 'ornament': {
      drawSky(ctx, x, y, size, [
        [0, '#07241c'],
        [0.55, '#0f3d2e'],
        [1, '#041410'],
      ]);
      drawStars(ctx, x, y, size, 45, rng, '#fde68a');
      const cx = x + size * 0.5;
      const cy = y + size * 0.54;
      const R = size * 0.27;

      // Hanging gold thread & crown
      ctx.strokeStyle = '#f5ce70';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx, y);
      ctx.lineTo(cx, cy - R - 28);
      ctx.stroke();
      ctx.fillStyle = '#d97706';
      ctx.fillRect(cx - 26, cy - R - 30, 52, 34);

      // Crimson & gold bauble sphere
      const bg = ctx.createRadialGradient(cx - 48, cy - 52, 16, cx, cy, R);
      bg.addColorStop(0, '#fca5a5');
      bg.addColorStop(0.35, '#dc2626');
      bg.addColorStop(0.85, '#7f1d1d');
      bg.addColorStop(1, '#450a0a');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // Filigree gold band across bauble
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();
      ctx.strokeStyle = '#fde08d';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(cx - R, cy - 20);
      ctx.lineTo(cx + R, cy - 20);
      ctx.moveTo(cx - R, cy + 28);
      ctx.lineTo(cx + R, cy + 28);
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(cx + i * 44, cy + 4, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      break;
    }

    case 'forest': {
      drawSky(ctx, x, y, size, [
        [0, '#0c1b2e'],
        [0.45, '#1e3a5f'],
        [0.85, '#6488a8'],
        [1, '#cbd5e1'],
      ]);
      drawStars(ctx, x, y, size, 45, rng);
      drawMoon(ctx, x + size * 0.26, y + size * 0.24, size * 0.085, '#f8fafc');
      drawSnowHills(ctx, x, y, size, '#cbd5e1', '#f1f5f9');

      // Layered frosted pine forest
      [
        [0.14, 0.78, 0.36, 0.18, '#1e3a4c'],
        [0.32, 0.82, 0.42, 0.20, '#0f293a'],
        [0.54, 0.76, 0.34, 0.17, '#1d3c4e'],
        [0.72, 0.84, 0.44, 0.21, '#0b2232'],
        [0.88, 0.79, 0.32, 0.16, '#1a384a'],
      ].forEach(([px, py, ph, pw, col]) => {
        drawPine(ctx, x + size * px, y + size * py, size * ph, size * pw, col);
      });
      drawSnowflakes(ctx, x, y, size, 65, rng);
      break;
    }

    case 'fireworks':
    default: {
      drawSky(ctx, x, y, size, [
        [0, '#050816'],
        [0.55, '#131b3a'],
        [1, '#1e1b4b'],
      ]);
      drawStars(ctx, x, y, size, 55, rng);

      const bursts = [
        [x + size * 0.35, y + size * 0.32, 118, '#fde047'],
        [x + size * 0.68, y + size * 0.28, 96, '#f472b6'],
        [x + size * 0.54, y + size * 0.52, 84, '#38bdf8'],
      ];
      bursts.forEach(([bx, by, br, col]) => {
        const bg = ctx.createRadialGradient(bx, by, 4, bx, by, br);
        bg.addColorStop(0, col);
        bg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bg;
        ctx.globalAlpha = 0.28;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.strokeStyle = col;
        ctx.lineWidth = 3;
        for (let k = 0; k < 22; k++) {
          const a = (k / 22) * Math.PI * 2;
          const len = br * (0.55 + (k % 3) * 0.18);
          ctx.beginPath();
          ctx.moveTo(bx + Math.cos(a) * 14, by + Math.sin(a) * 14);
          ctx.lineTo(bx + Math.cos(a) * len, by + Math.sin(a) * len);
          ctx.stroke();
        }
      });

      // Winter town skyline silhouette
      ctx.fillStyle = '#090d1c';
      ctx.fillRect(x, y + size * 0.84, size, size * 0.16);
      for (let i = 0; i < 8; i++) {
        const bx = x + 20 + i * 68;
        const bh = 48 + (i % 3) * 26;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(bx, y + size * 0.86 - bh, 54, bh);
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(bx + 12, y + size * 0.86 - bh + 16, 12, 14);
        ctx.fillRect(bx + 30, y + size * 0.86 - bh + 16, 12, 14);
      }
      break;
    }
  }

  ctx.restore();
}
