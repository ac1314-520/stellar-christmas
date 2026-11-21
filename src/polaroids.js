import { HOLIDAY_YEAR } from './config.js';
import { state } from './state.js';
import { drawProceduralHolidayArt } from './polaroid-art.js';

const THREE = window.THREE;

export function createPolaroidManager({ photoGroup, renderer, TREE_HEIGHT, TREE_BASE_RADIUS, SPIRAL_TURNS, galleryCounter }) {
  const polaroids = [];
  let uploadedBlobUrls = [];

  // Shared immutable geometries & base materials
  const cardGeo = new THREE.BoxGeometry(1.78, 2.16, 0.058);
  const sheenGeo = new THREE.PlaneGeometry(1.74, 2.12);
  const auraGeo = new THREE.PlaneGeometry(1.94, 2.34);
  const clipGeo = new THREE.BoxGeometry(0.22, 0.16, 0.06);

  const cardEdgeMat = new THREE.MeshStandardMaterial({
    color: 0xf4d27a,
    metalness: 0.92,
    roughness: 0.16,
    emissive: 0xb45309,
    emissiveIntensity: 0.28,
  });

  const clipMat = new THREE.MeshStandardMaterial({
    color: 0xf5d073,
    metalness: 0.9,
    roughness: 0.18,
    emissive: 0xb45309,
    emissiveIntensity: 0.2,
  });

  function createSheenTexture() {
    const sc = document.createElement('canvas');
    sc.width = 256;
    sc.height = 256;
    const sctx = sc.getContext('2d');
    const g = sctx.createLinearGradient(0, 0, 256, 256);
    g.addColorStop(0.0, 'rgba(255,255,255,0)');
    g.addColorStop(0.38, 'rgba(255,250,235,0)');
    g.addColorStop(0.49, 'rgba(255,248,225,0.42)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.16)');
    g.addColorStop(0.65, 'rgba(255,255,255,0)');
    g.addColorStop(1.0, 'rgba(255,255,255,0)');
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(sc);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  function createPaperGrainCanvas() {
    const g = document.createElement('canvas');
    g.width = 128;
    g.height = 128;
    const gctx = g.getContext('2d');
    const imgData = gctx.createImageData(128, 128);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const v = 232 + Math.floor((Math.random() - 0.5) * 26);
      imgData.data[i] = v;
      imgData.data[i + 1] = v - 4;
      imgData.data[i + 2] = v - 11;
      imgData.data[i + 3] = 28;
    }
    gctx.putImageData(imgData, 0, 0);
    return g;
  }

  const sheenTex = createSheenTexture();
  const paperGrainTile = createPaperGrainCanvas();

  function createLuxuryPolaroidFront({ img, art, caption, series, code, idx }) {
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

  function createChristmasPostcardBack(caption, wish, idx, meta = {}) {
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

  function clearUploadedBlobUrls() {
    uploadedBlobUrls.forEach((u) => URL.revokeObjectURL(u));
    uploadedBlobUrls = [];
  }

  function disposeCurrentCards() {
    while (polaroids.length) {
      const p = polaroids.pop();
      photoGroup.remove(p.holder);
      if (p.frontMat.map) p.frontMat.map.dispose();
      if (p.backMat.map) p.backMat.map.dispose();
      if (p.sheenMat.map) p.sheenMat.map.dispose();
      p.frontMat.dispose();
      p.backMat.dispose();
      p.sheenMat.dispose();
      p.auraMat.dispose();
    }
  }

  function updateGalleryCounter() {
    const n = polaroids.length;
    if (!n) return;
    const idx = ((Math.round(state.carouselIndex) % n) + n) % n;
    const card = polaroids[idx];
    galleryCounter.textContent = `${idx + 1} / ${n} · ${card.code ? card.code + ' ' : ''}${card.caption}`;
  }

  function buildPolaroidCards(photoList, blobUrlsToTrack = []) {
    disposeCurrentCards();
    clearUploadedBlobUrls();
    uploadedBlobUrls = blobUrlsToTrack;

    const count = photoList.length;
    for (let i = 0; i < count; i++) {
      const item = photoList[i];
      const holder = new THREE.Group();

      const frontMat = new THREE.MeshBasicMaterial({
        map: createLuxuryPolaroidFront({
          img: null,
          art: item.art,
          caption: item.caption,
          series: item.series,
          code: item.code,
          idx: i,
        }),
        toneMapped: false,
      });
      const backMat = new THREE.MeshBasicMaterial({
        map: createChristmasPostcardBack(item.caption, item.wish, i, item),
        toneMapped: false,
      });

      const cardMaterials = [cardEdgeMat, cardEdgeMat, cardEdgeMat, cardEdgeMat, frontMat, backMat];
      const frontMesh = new THREE.Mesh(cardGeo, cardMaterials);
      frontMesh.userData.polaroidIndex = i;

      const clonedSheen = sheenTex.clone();
      clonedSheen.needsUpdate = true;
      const sheenMat = new THREE.MeshBasicMaterial({
        map: clonedSheen,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sheenMesh = new THREE.Mesh(sheenGeo, sheenMat);
      sheenMesh.position.z = 0.032;

      const auraMat = new THREE.MeshBasicMaterial({
        color: 0xfde68a,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const auraMesh = new THREE.Mesh(auraGeo, auraMat);
      auraMesh.position.z = -0.04;

      const clipMesh = new THREE.Mesh(clipGeo, clipMat);
      clipMesh.position.set(0, 1.1, 0.0);

      holder.add(frontMesh, sheenMesh, auraMesh, clipMesh);

      if (item.src) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (!polaroids.some((entry) => entry.frontMat === frontMat)) return;
          const oldMap = frontMat.map;
          frontMat.map = createLuxuryPolaroidFront({
            img,
            art: item.art,
            caption: item.caption,
            series: item.series,
            code: item.code,
            idx: i,
          });
          frontMat.needsUpdate = true;
          if (oldMap) oldMap.dispose();
        };
        img.src = item.src;
      }

      const t = 0.13 + (i / Math.max(count - 1, 1)) * 0.77;
      const treeY = (0.48 - t * 0.96) * TREE_HEIGHT - 0.7;
      const treeR = t * TREE_BASE_RADIUS + 0.84;
      const treeAngle = t * Math.PI * 2 * SPIRAL_TURNS + 0.45;
      const tiltZ = (i % 2 === 0 ? 1 : -1) * (0.06 + (i % 3) * 0.025);

      photoGroup.add(holder);
      polaroids.push({
        index: i,
        caption: item.caption || 'Memory #' + (i + 1),
        code: item.code || '',
        series: item.series || '',
        holder,
        frontMesh,
        frontMat,
        backMat,
        auraMat,
        clipMesh,
        treeY,
        treeR,
        treeAngle,
        tiltZ,
        swayPhase: Math.random() * Math.PI * 2,
        sheenMat,
        hoverLerp: 0,
        tiltX: 0,
        tiltY: 0,
        flipAngle: 0,
        flipVel: 0,
        focusPop: 0,
        waveDelay: (i / Math.max(count, 1)) * 0.24,
      });
    }

    state.carouselIndex = 0;
    state.currentCarousel = 0;
    state.flippedCardIndex = -1;
    updateGalleryCounter();
  }

  function updateSingleCard(idx, item) {
    const p = polaroids[idx];
    if (!p) return;

    p.caption = item.caption || 'Memory #' + (idx + 1);
    p.code = item.code || '';
    p.series = item.series || '';

    // Update postcard back immediately
    const oldBack = p.backMat.map;
    p.backMat.map = createChristmasPostcardBack(item.caption, item.wish, idx, item);
    p.backMat.needsUpdate = true;
    if (oldBack) oldBack.dispose();

    // Update front (load image if src provided, otherwise procedural fallback)
    if (item.src) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (polaroids[idx] !== p) return;
        const oldFront = p.frontMat.map;
        p.frontMat.map = createLuxuryPolaroidFront({
          img,
          art: item.art,
          caption: item.caption,
          series: item.series,
          code: item.code,
          idx,
        });
        p.frontMat.needsUpdate = true;
        if (oldFront) oldFront.dispose();
      };
      img.src = item.src;
    } else {
      const oldFront = p.frontMat.map;
      p.frontMat.map = createLuxuryPolaroidFront({ img: null, art: item.art, caption: item.caption, idx });
      p.frontMat.needsUpdate = true;
      if (oldFront) oldFront.dispose();
    }

    updateGalleryCounter();
  }

  function updatePolaroids(dt, elapsed, ef) {
    const cForce = (state.carouselIndex - state.currentCarousel) * 28.0;
    state.carouselVel = (state.carouselVel + cForce * dt) * Math.pow(0.04, dt);
    state.currentCarousel += state.carouselVel * dt;

    const n = polaroids.length;
    for (let i = 0; i < n; i++) {
      const p = polaroids[i];
      const isHovered = state.hoverCardIndex === i;
      p.hoverLerp += ((isHovered ? 1 : 0) - p.hoverLerp) * 0.14;

      const targetFlip = state.mode === 'exploded' && state.flippedCardIndex === i ? Math.PI : 0;
      const flipForce = (targetFlip - p.flipAngle) * 34.0;
      p.flipVel = (p.flipVel + flipForce * dt) * Math.exp(-6.2 * dt);
      p.flipAngle += p.flipVel * dt;
      p.focusPop *= Math.exp(-7.5 * dt);

      const rawCardEf = Math.max(0, Math.min(1, (ef - p.waveDelay * 0.65) / (1 - p.waveDelay * 0.65)));
      const cef = rawCardEf * rawCardEf * (3 - 2 * rawCardEf);

      const ang = p.treeAngle + state.treeRotY;
      const treeX = Math.cos(ang) * (p.treeR + p.hoverLerp * 0.48);
      const treeZ = Math.sin(ang) * (p.treeR + p.hoverLerp * 0.48);
      const treeY = p.treeY + Math.sin(elapsed * 1.8 + p.swayPhase) * 0.07;

      let rel = i - state.currentCarousel;
      while (rel > n / 2) rel -= n;
      while (rel < -n / 2) rel += n;

      const galX = rel * 2.95;
      const absRel = Math.abs(rel);
      const centerFocus = Math.max(0, 1 - absRel * 0.46);
      const flipArcLift = Math.sin(Math.min(Math.PI, Math.max(0, p.flipAngle))) * 1.45;
      const galZ =
        9.95 - Math.min(absRel, 4.5) * 1.72 - absRel * absRel * 0.15 + p.hoverLerp * 0.6 + flipArcLift;
      const galY = -0.12 + Math.sin(elapsed * 1.5 + p.swayPhase) * 0.08 + p.hoverLerp * 0.2 + flipArcLift * 0.12;

      const arcBoost = Math.sin(cef * Math.PI) * 1.1;
      p.holder.position.set(
        treeX + (galX - treeX) * cef,
        treeY + (galY - treeY) * cef + arcBoost * 0.35,
        treeZ + (galZ - treeZ) * cef + arcBoost * 0.6
      );

      const treeScale = 0.54 + p.hoverLerp * 0.14;
      const galScale = 1.02 + centerFocus * 0.86 + p.hoverLerp * 0.09 + p.focusPop;
      p.holder.scale.setScalar(treeScale + (galScale - treeScale) * cef);

      const treeRotYCard = -ang + Math.PI / 2;
      const galRotYCard = -rel * 0.21;
      let diffY = ((galRotYCard - treeRotYCard + Math.PI) % (Math.PI * 2)) - Math.PI;
      if (diffY < -Math.PI) diffY += Math.PI * 2;

      const targetTiltY = isHovered ? state.hoverNormX * 0.26 : 0;
      const targetTiltX = isHovered ? -state.hoverNormY * 0.18 : 0;
      p.tiltY += (targetTiltY - p.tiltY) * 0.12;
      p.tiltX += (targetTiltX - p.tiltX) * 0.12;

      const flipPitch = Math.sin(p.flipAngle) * 0.12 + p.flipVel * 0.025;

      p.holder.rotation.y = treeRotYCard + diffY * cef + p.flipAngle + p.tiltY;
      p.holder.rotation.x = p.tiltX + flipPitch;
      p.holder.rotation.z = p.tiltZ * (1 - cef) - p.flipVel * 0.018;

      const autoShimmer = cef > 0.8 && centerFocus > 0.7 ? (elapsed * 0.35 + i * 0.2) % 2.4 : 0;
      const sheenOffset = isHovered ? state.hoverNormX * 0.45 : autoShimmer - 0.6;
      p.sheenMat.map.offset.set(sheenOffset, sheenOffset * 0.5);
      const sheenAlpha = isHovered
        ? 0.48 * p.hoverLerp
        : cef > 0.8 && centerFocus > 0.7 && autoShimmer < 1.1
          ? Math.sin((autoShimmer / 1.1) * Math.PI) * 0.34
          : 0;
      p.sheenMat.opacity = Math.max(0, sheenAlpha * (Math.cos(p.flipAngle) > 0 ? 1 : 0));

      const auraTarget = Math.max(p.hoverLerp * 0.38, cef * centerFocus * 0.22 + flipArcLift * 0.14);
      p.auraMat.opacity += (auraTarget - p.auraMat.opacity) * 0.14;
      p.clipMesh.visible = cef < 0.65;

      const targetOpacity = cef > 0.4 ? Math.max(0.12, 1 - Math.max(0, absRel - 2.6) * 0.36) : 1;
      p.frontMat.transparent = targetOpacity < 0.99;
      p.frontMat.opacity = targetOpacity;
      p.backMat.transparent = targetOpacity < 0.99;
      p.backMat.opacity = targetOpacity;
    }
  }

  window.addEventListener('beforeunload', clearUploadedBlobUrls);

  return {
    polaroids,
    buildPolaroidCards,
    updateSingleCard,
    updateGalleryCounter,
    updatePolaroids,
  };
}
