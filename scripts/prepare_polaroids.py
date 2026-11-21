from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILE = ROOT / "src" / "polaroids.js"
text = FILE.read_text(encoding="utf-8")

front_start = "  function createLuxuryPolaroidFront({ img, art, caption, idx }) {"
front_end = "  function createChristmasPostcardBack(caption, wish, idx) {"

front = r'''  function createLuxuryPolaroidFront({ img, art, caption, series, code, idx }) {
    const c = document.createElement('canvas');
    c.width = 660;
    c.height = 804;
    const ctx = c.getContext('2d');

    const paperGrad = ctx.createLinearGradient(0, 0, c.width, c.height);
    paperGrad.addColorStop(0, '#f2ecdf');
    paperGrad.addColorStop(0.5, '#eae2d2');
    paperGrad.addColorStop(1, '#e1d7c2');
    ctx.fillStyle = paperGrad;
    ctx.fillRect(0, 0, c.width, c.height);

    const pat = ctx.createPattern(paperGrainTile, 'repeat');
    if (pat) {
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, c.width, c.height);
    }

    ctx.strokeStyle = 'rgba(196, 152, 68, 0.58)';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, c.width - 20, c.height - 20);
    ctx.strokeStyle = 'rgba(120, 96, 60, 0.16)';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, c.width - 36, c.height - 36);

    // Taller photo well keeps the standing figures in the collection readable.
    const px = 48;
    const py = 46;
    const pw = 564;
    const ph = 642;
    ctx.save();
    ctx.fillStyle = 'rgba(40, 32, 22, 0.24)';
    ctx.fillRect(px - 3, py - 3, pw + 6, ph + 6);
    ctx.beginPath();
    ctx.rect(px, py, pw, ph);
    ctx.clip();

    if (img) {
      const iw = img.naturalWidth || img.width || 1;
      const ih = img.naturalHeight || img.height || 1;
      const scale = Math.max(pw / iw, ph / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.filter = 'brightness(0.97) contrast(1.05) saturate(0.98)';
      ctx.drawImage(img, px + (pw - dw) / 2, py + (ph - dh) / 2, dw, dh);
      ctx.filter = 'none';
    } else if (art) {
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(1, ph / pw);
      drawProceduralHolidayArt(ctx, art, 0, 0, pw, idx);
      ctx.restore();
    } else {
      const grad = ctx.createLinearGradient(px, py, px + pw, py + ph);
      grad.addColorStop(0, '#2b251c');
      grad.addColorStop(1, '#0e0c09');
      ctx.fillStyle = grad;
      ctx.fillRect(px, py, pw, ph);
    }

    const innerShadow = ctx.createLinearGradient(px, py, px, py + 30);
    innerShadow.addColorStop(0, 'rgba(0,0,0,0.28)');
    innerShadow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = innerShadow;
    ctx.fillRect(px, py, pw, 30);
    ctx.restore();

    ctx.strokeStyle = 'rgba(182, 142, 72, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(px, py, pw, ph);

    // Small foil registration marks outside the plate.
    ctx.strokeStyle = 'rgba(185, 137, 50, 0.42)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(30, py + 18);
    ctx.lineTo(30, py - 6);
    ctx.lineTo(54, py - 6);
    ctx.moveTo(c.width - 30, py + ph - 18);
    ctx.lineTo(c.width - 30, py + ph + 6);
    ctx.lineTo(c.width - 54, py + ph + 6);
    ctx.stroke();

    // Caption: Chinese serif, safely truncated to the card width.
    const label = String(caption || '私人藏品');
    let display = label;
    ctx.fillStyle = '#3d342a';
    ctx.font = '500 32px "Songti SC", "Noto Serif SC", Baskerville, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    while (display.length > 1 && ctx.measureText(display).width > 540) {
      display = display.slice(0, -1);
    }
    if (display !== label) display += '…';
    ctx.fillText(display, c.width / 2, 726);

    ctx.strokeStyle = 'rgba(185, 137, 50, 0.42)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(62, 754);
    ctx.lineTo(c.width - 62, 754);
    ctx.stroke();

    const codeLabel = String(code || ('NO.' + String(idx + 1).padStart(2, '0')));
    const seriesLabel = String(series || 'STELLAR ARCHIVE');
    ctx.fillStyle = 'rgba(126, 96, 48, 0.92)';
    ctx.font = '600 15px -apple-system, "PingFang SC", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(codeLabel, 54, 776);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(104, 86, 60, 0.72)';
    let seriesDisplay = seriesLabel;
    while (seriesDisplay.length > 1 && ctx.measureText(seriesDisplay).width > 370) {
      seriesDisplay = seriesDisplay.slice(0, -1);
    }
    if (seriesDisplay !== seriesLabel) seriesDisplay += '…';
    ctx.fillText(seriesDisplay, c.width - 54, 776);

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy() || 4);
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }

'''

back = r'''  function createChristmasPostcardBack(caption, wish, idx, meta = {}) {
    const c = document.createElement('canvas');
    c.width = 660;
    c.height = 804;
    const ctx = c.getContext('2d');

    const bg = ctx.createLinearGradient(0, 0, c.width, c.height);
    bg.addColorStop(0, '#efe8d8');
    bg.addColorStop(1, '#dfd2b8');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, c.width, c.height);

    const pat = ctx.createPattern(paperGrainTile, 'repeat');
    if (pat) {
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, c.width, c.height);
    }

    ctx.strokeStyle = '#b98932';
    ctx.lineWidth = 5;
    ctx.strokeRect(22, 22, c.width - 44, c.height - 44);
    ctx.strokeStyle = 'rgba(185, 137, 50, 0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(34, 34, c.width - 68, c.height - 68);

    // Burgundy postage stamp.
    ctx.fillStyle = '#7f1d2b';
    ctx.fillRect(c.width - 160, 56, 102, 118);
    ctx.strokeStyle = '#e6c98a';
    ctx.lineWidth = 3;
    ctx.strokeRect(c.width - 152, 64, 86, 102);
    ctx.fillStyle = '#f2dca8';
    ctx.font = 'bold 40px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦', c.width - 109, 118);
    ctx.font = '600 15px -apple-system, sans-serif';
    ctx.fillText('DEC 25', c.width - 109, 148);

    ctx.strokeStyle = 'rgba(130, 96, 56, 0.42)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(c.width - 210, 115, 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(120, 88, 48, 0.62)';
    ctx.font = '600 13px -apple-system, sans-serif';
    ctx.fillText('STELLAR', c.width - 210, 110);
    ctx.fillText(String(HOLIDAY_YEAR), c.width - 210, 130);

    ctx.fillStyle = '#7f1d2b';
    ctx.font = '500 38px "Songti SC", "Noto Serif SC", Baskerville, Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('星屿圣诞', 62, 114);

    ctx.fillStyle = '#7c6a52';
    ctx.font = '500 17px -apple-system, "PingFang SC", sans-serif';
    ctx.fillText(`${meta.code || 'NO.' + String(idx + 1).padStart(2, '0')}  ·  ${caption || '私人藏品'}`, 64, 154);

    ctx.fillStyle = 'rgba(124, 106, 82, 0.76)';
    ctx.font = '500 14px -apple-system, "PingFang SC", sans-serif';
    ctx.fillText(`${meta.series || 'STELLAR ARCHIVE'} · ${meta.collection || ''}`, 64, 180);

    ctx.strokeStyle = 'rgba(185, 137, 50, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(62, 212);
    ctx.lineTo(c.width - 62, 212);
    ctx.stroke();

    const text = String(wish || '愿圣诞的星光与温暖，陪伴你度过每一个闪耀的日子。');
    ctx.fillStyle = '#3a3026';
    ctx.font = '500 27px "Songti SC", "Noto Serif SC", "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    const maxPerLine = 17;
    const lines = [];
    for (let i = 0; i < text.length && lines.length < 7; i += maxPerLine) {
      let line = text.slice(i, i + maxPerLine);
      if (lines.length === 6 && i + maxPerLine < text.length) line = line.slice(0, -1) + '…';
      lines.push(line);
    }
    const lineHeight = 48;
    const startY = 292 - (lines.length - 1) * (lineHeight / 2);
    lines.forEach((line, li) => {
      ctx.fillText(line, c.width / 2, startY + li * lineHeight);
    });

    ctx.strokeStyle = 'rgba(140, 116, 86, 0.2)';
    ctx.lineWidth = 1.5;
    for (let l = 0; l < 2; l++) {
      const ly = 596 + l * 44;
      ctx.beginPath();
      ctx.moveTo(90, ly);
      ctx.lineTo(c.width - 90, ly);
      ctx.stroke();
    }

    // Burgundy wax seal.
    const wx = c.width / 2;
    const wy = c.height - 148;
    const waxGrad = ctx.createRadialGradient(wx - 10, wy - 10, 4, wx, wy, 42);
    waxGrad.addColorStop(0, '#a63e4a');
    waxGrad.addColorStop(0.68, '#7f1d2b');
    waxGrad.addColorStop(1, '#4c0d17');
    ctx.fillStyle = waxGrad;
    ctx.beginPath();
    ctx.arc(wx, wy, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(242, 220, 168, 0.72)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(wx, wy, 32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#f2dca8';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', wx, wy + 1);

    ctx.fillStyle = '#9a6f22';
    ctx.font = '500 20px "Songti SC", "Noto Serif SC", Georgia, serif';
    ctx.fillText('晶晶 · JINGJING 的私人收藏', c.width / 2, c.height - 70);

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy() || 4);
    tex.needsUpdate = true;
    return tex;
  }

'''

start = text.index(front_start)
end = text.index("  function clearUploadedBlobUrls() {")
text = text[:start] + front + back + text[end:]
FILE.write_text(text, encoding="utf-8")
print("rewrote polaroid front/back")
