import { THEMES } from './config.js';
import { state } from './state.js';

const THREE = window.THREE;

export const TREE_HEIGHT = 12.4;
export const TREE_BASE_RADIUS = 4.55;
export const SPIRAL_TURNS = 4.6;

export function createTreeScene(container) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x03080e, 0.01);

  const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 220);
  camera.position.set(0, 0.5, state.cameraZ);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xdce8ff, 0.78);
  scene.add(ambientLight);

  const warmKeyLight = new THREE.PointLight(0xffd782, 2.3, 65);
  warmKeyLight.position.set(8, 12, 14);
  scene.add(warmKeyLight);

  const emeraldFill = new THREE.PointLight(0x34d399, 1.35, 48);
  emeraldFill.position.set(-10, -4, 8);
  scene.add(emeraldFill);

  const rimLight = new THREE.PointLight(0x93c5fd, 1.15, 52);
  rimLight.position.set(0, 10, -14);
  scene.add(rimLight);

  const treeGroup = new THREE.Group();
  treeGroup.position.y = -0.7;
  scene.add(treeGroup);

  const decorGroup = new THREE.Group();
  treeGroup.add(decorGroup);

  const topperContainer = new THREE.Group();
  treeGroup.add(topperContainer);

  const pedestalGroup = new THREE.Group();
  treeGroup.add(pedestalGroup);

  const photoGroup = new THREE.Group();
  scene.add(photoGroup);

  const fireworksGroup = new THREE.Group();
  scene.add(fireworksGroup);

  // =========================================================
  // Procedural Textures
  // =========================================================
  function createGlowTexture(innerColor, midColor, outerColor) {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0.0, innerColor);
    g.addColorStop(0.28, midColor);
    g.addColorStop(0.65, outerColor);
    g.addColorStop(1.0, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  function createSnowflakeTexture() {
    const c = document.createElement('canvas');
    c.width = 96;
    c.height = 96;
    const ctx = c.getContext('2d');
    ctx.translate(48, 48);
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 42);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.45, 'rgba(220,242,255,0.4)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -34);
      ctx.moveTo(0, -16);
      ctx.lineTo(-9, -24);
      ctx.moveTo(0, -16);
      ctx.lineTo(9, -24);
      ctx.moveTo(0, -25);
      ctx.lineTo(-6, -31);
      ctx.moveTo(0, -25);
      ctx.lineTo(6, -31);
      ctx.stroke();
      ctx.restore();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  const sparkleTex = createGlowTexture('rgba(255,255,255,1)', 'rgba(255,248,220,0.85)', 'rgba(180,255,220,0.18)');
  const snowflakeTex = createSnowflakeTexture();
  const bokehTex = createGlowTexture('rgba(255,255,255,0.45)', 'rgba(255,244,210,0.22)', 'rgba(255,220,140,0.0)');
  const sharedTextures = new Set([sparkleTex, snowflakeTex, bokehTex]);

  // =========================================================
  // Tree Particle Cloud + Spiral Ribbon + Fairy Lights + Fireflies
  // =========================================================
  const TREE_PARTICLE_COUNT = 4500;
  const treeGeo = new THREE.BufferGeometry();
  const treePositions = new Float32Array(TREE_PARTICLE_COUNT * 3);
  const treeBasePos = new Float32Array(TREE_PARTICLE_COUNT * 3);
  const treeExplodePos = new Float32Array(TREE_PARTICLE_COUNT * 3);
  const treeColors = new Float32Array(TREE_PARTICLE_COUNT * 3);
  const treeBaseColors = new Float32Array(TREE_PARTICLE_COUNT * 3);
  const treePhases = new Float32Array(TREE_PARTICLE_COUNT);
  const treeColorSeed = new Float32Array(TREE_PARTICLE_COUNT);

  for (let i = 0; i < TREE_PARTICLE_COUNT; i++) {
    const t = Math.pow(Math.random(), 0.78);
    const y = (0.5 - t) * TREE_HEIGHT;
    const tierWave = 1 + 0.12 * Math.sin(t * Math.PI * 11);
    const maxR = t * TREE_BASE_RADIUS * tierWave;
    const r = maxR * (0.42 + 0.58 * Math.pow(Math.random(), 0.35));
    const angle = Math.random() * Math.PI * 2;

    treeBasePos[i * 3] = Math.cos(angle) * r;
    treeBasePos[i * 3 + 1] = y;
    treeBasePos[i * 3 + 2] = Math.sin(angle) * r;
    treePositions[i * 3] = treeBasePos[i * 3];
    treePositions[i * 3 + 1] = y;
    treePositions[i * 3 + 2] = treeBasePos[i * 3 + 2];

    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const explodeR = 7.8 + Math.random() * 17.5;
    treeExplodePos[i * 3] = explodeR * Math.sin(phi) * Math.cos(theta) * 1.35;
    treeExplodePos[i * 3 + 1] = explodeR * Math.cos(phi) * 0.85;
    treeExplodePos[i * 3 + 2] = explodeR * Math.sin(phi) * Math.sin(theta) - 2.5;

    treePhases[i] = Math.random() * Math.PI * 2;
    treeColorSeed[i] = Math.random();
  }

  treeGeo.setAttribute('position', new THREE.BufferAttribute(treePositions, 3));
  treeGeo.setAttribute('color', new THREE.BufferAttribute(treeColors, 3));
  const treeMat = new THREE.PointsMaterial({
    size: 0.28,
    map: sparkleTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.96,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  treeGroup.add(new THREE.Points(treeGeo, treeMat));

  function recolorTreeParticles(themeKey) {
    const pal = THEMES[themeKey].particlePalette;
    const tmpCol = new THREE.Color();
    for (let i = 0; i < TREE_PARTICLE_COUNT; i++) {
      let acc = 0;
      let chosen = pal[pal.length - 1].hex;
      const seed = treeColorSeed[i];
      for (let j = 0; j < pal.length; j++) {
        acc += pal[j].w;
        if (seed <= acc) {
          chosen = pal[j].hex;
          break;
        }
      }
      tmpCol.setHex(chosen);
      treeBaseColors[i * 3] = tmpCol.r;
      treeBaseColors[i * 3 + 1] = tmpCol.g;
      treeBaseColors[i * 3 + 2] = tmpCol.b;
      treeColors[i * 3] = tmpCol.r;
      treeColors[i * 3 + 1] = tmpCol.g;
      treeColors[i * 3 + 2] = tmpCol.b;
    }
    treeGeo.attributes.color.needsUpdate = true;
  }

  const RIBBON_POINTS = 560;
  const ribbonGeo = new THREE.BufferGeometry();
  const ribbonPos = new Float32Array(RIBBON_POINTS * 3);
  const ribbonBasePos = new Float32Array(RIBBON_POINTS * 3);
  const ribbonExplodePos = new Float32Array(RIBBON_POINTS * 3);
  const ribbonColors = new Float32Array(RIBBON_POINTS * 3);

  for (let i = 0; i < RIBBON_POINTS; i++) {
    const t = i / (RIBBON_POINTS - 1);
    const y = (0.48 - t * 0.96) * TREE_HEIGHT;
    const r = (t * TREE_BASE_RADIUS + 0.35) * (1 + 0.04 * Math.sin(t * 20));
    const angle = t * Math.PI * 2 * SPIRAL_TURNS;
    ribbonBasePos[i * 3] = Math.cos(angle) * r;
    ribbonBasePos[i * 3 + 1] = y;
    ribbonBasePos[i * 3 + 2] = Math.sin(angle) * r;
    ribbonPos[i * 3] = ribbonBasePos[i * 3];
    ribbonPos[i * 3 + 1] = y;
    ribbonPos[i * 3 + 2] = ribbonBasePos[i * 3 + 2];

    const exR = 9 + Math.random() * 14;
    const exA = angle + (Math.random() - 0.5) * 1.4;
    ribbonExplodePos[i * 3] = Math.cos(exA) * exR * 1.25;
    ribbonExplodePos[i * 3 + 1] = (Math.random() - 0.5) * 15;
    ribbonExplodePos[i * 3 + 2] = Math.sin(exA) * exR - 3;
  }

  ribbonGeo.setAttribute('position', new THREE.BufferAttribute(ribbonPos, 3));
  ribbonGeo.setAttribute('color', new THREE.BufferAttribute(ribbonColors, 3));
  const ribbonMat = new THREE.PointsMaterial({
    size: 0.34,
    map: sparkleTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  treeGroup.add(new THREE.Points(ribbonGeo, ribbonMat));

  const ribbonCurvePts = [];
  for (let i = 0; i <= 140; i++) {
    const t = i / 140;
    const y = (0.47 - t * 0.94) * TREE_HEIGHT;
    const r = t * TREE_BASE_RADIUS + 0.34;
    const a = t * Math.PI * 2 * SPIRAL_TURNS;
    ribbonCurvePts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
  }
  const ribbonTubeGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ribbonCurvePts), 160, 0.048, 8, false);
  const ribbonTubeMat = new THREE.MeshStandardMaterial({
    color: 0xf7d070,
    metalness: 0.88,
    roughness: 0.18,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.9,
  });
  const ribbonTubeMesh = new THREE.Mesh(ribbonTubeGeo, ribbonTubeMat);
  treeGroup.add(ribbonTubeMesh);

  // Counter-spiraling fairy lights
  const FAIRY_COUNT = 300;
  const fairyGeo = new THREE.BufferGeometry();
  const fairyPos = new Float32Array(FAIRY_COUNT * 3);
  const fairyBasePos = new Float32Array(FAIRY_COUNT * 3);
  const fairyExplodePos = new Float32Array(FAIRY_COUNT * 3);
  const fairyCols = new Float32Array(FAIRY_COUNT * 3);
  const fairyBaseCols = new Float32Array(FAIRY_COUNT * 3);
  const fairyPalette = [
    new THREE.Color(0xfff5c0),
    new THREE.Color(0xff4d6d),
    new THREE.Color(0x34d399),
    new THREE.Color(0xfbbf24),
  ];

  for (let i = 0; i < FAIRY_COUNT; i++) {
    const t = i / (FAIRY_COUNT - 1);
    const y = (0.46 - t * 0.92) * TREE_HEIGHT;
    const r = t * TREE_BASE_RADIUS + 0.42;
    const a = -t * Math.PI * 2 * 3.8 + Math.PI;
    fairyBasePos[i * 3] = Math.cos(a) * r;
    fairyBasePos[i * 3 + 1] = y;
    fairyBasePos[i * 3 + 2] = Math.sin(a) * r;
    fairyPos[i * 3] = fairyBasePos[i * 3];
    fairyPos[i * 3 + 1] = y;
    fairyPos[i * 3 + 2] = fairyBasePos[i * 3 + 2];

    const exR = 10 + Math.random() * 13;
    fairyExplodePos[i * 3] = Math.cos(a * 2) * exR;
    fairyExplodePos[i * 3 + 1] = (Math.random() - 0.5) * 16;
    fairyExplodePos[i * 3 + 2] = Math.sin(a * 2) * exR - 2;

    const c = fairyPalette[i % fairyPalette.length];
    fairyBaseCols[i * 3] = c.r;
    fairyBaseCols[i * 3 + 1] = c.g;
    fairyBaseCols[i * 3 + 2] = c.b;
    fairyCols[i * 3] = c.r;
    fairyCols[i * 3 + 1] = c.g;
    fairyCols[i * 3 + 2] = c.b;
  }
  fairyGeo.setAttribute('position', new THREE.BufferAttribute(fairyPos, 3));
  fairyGeo.setAttribute('color', new THREE.BufferAttribute(fairyCols, 3));
  const fairyMat = new THREE.PointsMaterial({
    size: 0.36,
    map: sparkleTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  treeGroup.add(new THREE.Points(fairyGeo, fairyMat));

  // Orbiting fireflies
  const fireflies = [];
  for (let i = 0; i < 32; i++) {
    const ffMat = new THREE.SpriteMaterial({
      map: sparkleTex,
      color: 0xffe89c,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sp = new THREE.Sprite(ffMat);
    const s = 0.22 + Math.random() * 0.24;
    sp.scale.set(s, s, 1);
    treeGroup.add(sp);
    fireflies.push({
      sprite: sp,
      mat: ffMat,
      r: 2.2 + Math.random() * 4.2,
      yBase: (Math.random() - 0.5) * TREE_HEIGHT * 0.95,
      speed: (Math.random() > 0.5 ? 1 : -1) * (0.28 + Math.random() * 0.45),
      phase: Math.random() * Math.PI * 2,
    });
  }

  function recolorRibbon(themeKey) {
    const cfg = THEMES[themeKey];
    const colA = new THREE.Color(cfg.ribbonA);
    const colB = new THREE.Color(cfg.ribbonB);
    for (let i = 0; i < RIBBON_POINTS; i++) {
      const mix = 0.5 + 0.5 * Math.sin((i / RIBBON_POINTS) * Math.PI * 18);
      const c = colA.clone().lerp(colB, mix);
      ribbonColors[i * 3] = c.r;
      ribbonColors[i * 3 + 1] = c.g;
      ribbonColors[i * 3 + 2] = c.b;
    }
    ribbonGeo.attributes.color.needsUpdate = true;
    ribbonTubeMat.color.setHex(cfg.ribbonA);
    ribbonTubeMat.emissive.setHex(cfg.ribbonB);
    fireflies.forEach((ff) => ff.mat.color.setHex(cfg.ribbonA));
  }

  // =========================================================
  // Shared Geometries & GPU Disposal Helper
  // =========================================================
  const sharedGeos = {
    sphere: new THREE.SphereGeometry(1, 18, 18),
    box: new THREE.BoxGeometry(1, 1, 1),
    ribbonBandX: new THREE.BoxGeometry(1.06, 1.06, 0.22),
    ribbonBandZ: new THREE.BoxGeometry(0.22, 1.06, 1.06),
    octa: new THREE.OctahedronGeometry(1, 0),
    icosa: new THREE.IcosahedronGeometry(1, 0),
    torus: new THREE.TorusGeometry(0.7, 0.28, 12, 24),
    thinRing: new THREE.TorusGeometry(0.95, 0.08, 10, 28),
    cone: new THREE.ConeGeometry(0.7, 1.1, 14),
    stick: new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8),
  };
  const sharedGeoSet = new Set(Object.values(sharedGeos));

  function clearGroupWithDispose(group) {
    const disposedMats = new Set();
    const disposedGeos = new Set();
    const disposedTex = new Set();

    group.traverse((child) => {
      if (child.geometry && !sharedGeoSet.has(child.geometry) && !disposedGeos.has(child.geometry)) {
        disposedGeos.add(child.geometry);
        child.geometry.dispose();
      }
      if (child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m) => {
          if (!m || disposedMats.has(m)) return;
          disposedMats.add(m);
          if (m.map && !sharedTextures.has(m.map) && !disposedTex.has(m.map)) {
            disposedTex.add(m.map);
            m.map.dispose();
          }
          m.dispose();
        });
      }
    });
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
  }

  function makeGiftBox(boxColor, ribbonColor) {
    const g = new THREE.Group();
    const boxMat = new THREE.MeshStandardMaterial({
      color: boxColor,
      metalness: 0.34,
      roughness: 0.34,
      emissive: boxColor,
      emissiveIntensity: 0.14,
    });
    const ribMat = new THREE.MeshStandardMaterial({
      color: ribbonColor,
      metalness: 0.76,
      roughness: 0.18,
      emissive: ribbonColor,
      emissiveIntensity: 0.26,
    });
    g.add(new THREE.Mesh(sharedGeos.box, boxMat));
    g.add(new THREE.Mesh(sharedGeos.ribbonBandX, ribMat));
    g.add(new THREE.Mesh(sharedGeos.ribbonBandZ, ribMat));
    const bow1 = new THREE.Mesh(sharedGeos.torus, ribMat);
    bow1.scale.set(0.32, 0.32, 0.32);
    bow1.position.set(-0.18, 0.62, 0);
    bow1.rotation.z = 0.4;
    const bow2 = bow1.clone();
    bow2.position.x = 0.18;
    bow2.rotation.z = -0.4;
    g.add(bow1, bow2);
    return g;
  }

  // =========================================================
  // Snow Pedestal & Under-Tree Gift Boxes
  // =========================================================
  let pedestalGlowRing = null;
  function buildSnowPedestal() {
    const ringGeo = new THREE.RingGeometry(1.2, 5.6, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    pedestalGlowRing = new THREE.Mesh(ringGeo, ringMat);
    pedestalGlowRing.rotation.x = -Math.PI / 2;
    pedestalGlowRing.position.y = -TREE_HEIGHT * 0.5 - 0.55;
    pedestalGroup.add(pedestalGlowRing);

    const snowBaseCount = 340;
    const sbGeo = new THREE.BufferGeometry();
    const sbPos = new Float32Array(snowBaseCount * 3);
    for (let i = 0; i < snowBaseCount; i++) {
      const r = Math.sqrt(Math.random()) * 5.4;
      const a = Math.random() * Math.PI * 2;
      sbPos[i * 3] = Math.cos(a) * r;
      sbPos[i * 3 + 1] = -TREE_HEIGHT * 0.5 - 0.55 + Math.exp(-r * 0.45) * 0.45;
      sbPos[i * 3 + 2] = Math.sin(a) * r;
    }
    sbGeo.setAttribute('position', new THREE.BufferAttribute(sbPos, 3));
    const sbPoints = new THREE.Points(
      sbGeo,
      new THREE.PointsMaterial({
        size: 0.28,
        map: sparkleTex,
        color: 0xe2f1ff,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    pedestalGroup.add(sbPoints);

    const baseGifts = [
      { x: -2.1, z: 2.3, sx: 0.95, sy: 0.85, sz: 0.95, ry: 0.35, bc: 0xb91c1c, rc: 0xfde047 },
      { x: -1.1, z: 2.9, sx: 0.68, sy: 0.62, sz: 0.68, ry: -0.4, bc: 0x047857, rc: 0xfef08a },
      { x: 1.9, z: 2.4, sx: 1.05, sy: 0.9, sz: 0.9, ry: -0.25, bc: 0x991b1b, rc: 0xf59e0b },
      { x: 2.8, z: 1.3, sx: 0.72, sy: 0.78, sz: 0.72, ry: 0.55, bc: 0x1d4ed8, rc: 0xfde68a },
      { x: 0.4, z: -2.8, sx: 0.92, sy: 0.8, sz: 0.92, ry: 0.15, bc: 0xd97706, rc: 0xfffbeb },
      { x: -2.5, z: -1.4, sx: 0.82, sy: 0.75, sz: 0.82, ry: -0.6, bc: 0xbe123c, rc: 0xfef08a },
      { x: 1.8, z: -1.9, sx: 0.76, sy: 0.68, sz: 0.76, ry: 0.8, bc: 0x0f766e, rc: 0xfde047 },
    ];
    baseGifts.forEach((cfg) => {
      const gift = makeGiftBox(cfg.bc, cfg.rc);
      gift.scale.set(cfg.sx, cfg.sy, cfg.sz);
      gift.position.set(cfg.x, -TREE_HEIGHT * 0.5 - 0.55 + cfg.sy * 0.5, cfg.z);
      gift.rotation.y = cfg.ry;
      pedestalGroup.add(gift);
    });
  }
  buildSnowPedestal();

  // =========================================================
  // Theme Ornaments & Toppers
  // =========================================================
  function makeCandyCane(primaryHex, stripeHex) {
    const g = new THREE.Group();
    const mat1 = new THREE.MeshStandardMaterial({ color: primaryHex, roughness: 0.25, metalness: 0.15, emissive: primaryHex, emissiveIntensity: 0.15 });
    const mat2 = new THREE.MeshStandardMaterial({ color: stripeHex, roughness: 0.25, metalness: 0.15, emissive: stripeHex, emissiveIntensity: 0.15 });
    for (let s = 0; s < 5; s++) {
      const seg = new THREE.Mesh(sharedGeos.stick, s % 2 === 0 ? mat1 : mat2);
      seg.scale.set(1.3, 0.22, 1.3);
      seg.position.y = -0.65 + s * 0.3;
      g.add(seg);
    }
    const hook = new THREE.Mesh(sharedGeos.torus, mat1);
    hook.scale.set(0.45, 0.45, 0.45);
    hook.position.set(0.3, 0.75, 0);
    g.add(hook);
    return g;
  }

  function makeGoldenBell() {
    const g = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.88, roughness: 0.16, emissive: 0xd97706, emissiveIntensity: 0.24 });
    g.add(new THREE.Mesh(sharedGeos.cone, goldMat));
    const clapper = new THREE.Mesh(sharedGeos.sphere, goldMat);
    clapper.scale.setScalar(0.24);
    clapper.position.y = -0.55;
    g.add(clapper);
    return g;
  }

  function makeDonut(glazeHex) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(sharedGeos.torus, new THREE.MeshStandardMaterial({ color: 0xf6c98e, roughness: 0.65, metalness: 0.05 }));
    const glaze = new THREE.Mesh(sharedGeos.torus, new THREE.MeshStandardMaterial({ color: glazeHex, roughness: 0.22, metalness: 0.12, emissive: glazeHex, emissiveIntensity: 0.2 }));
    glaze.scale.set(1.02, 1.02, 0.75);
    glaze.position.z = 0.09;
    g.add(base, glaze);
    return g;
  }

  function makeLollipop(colorHex) {
    const g = new THREE.Group();
    const candyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.15, metalness: 0.25, emissive: colorHex, emissiveIntensity: 0.3 });
    const stickMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const head = new THREE.Mesh(sharedGeos.sphere, candyMat);
    head.scale.set(0.62, 0.62, 0.35);
    head.position.y = 0.45;
    const ring = new THREE.Mesh(sharedGeos.thinRing, stickMat);
    ring.scale.setScalar(0.45);
    ring.position.set(0, 0.45, 0.26);
    const stick = new THREE.Mesh(sharedGeos.stick, stickMat);
    stick.scale.set(0.9, 0.85, 0.9);
    stick.position.y = -0.45;
    g.add(head, ring, stick);
    return g;
  }

  function makeIceCrystal(colorHex) {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.55, roughness: 0.1, emissive: colorHex, emissiveIntensity: 0.38, transparent: true, opacity: 0.9 });
    const core = new THREE.Mesh(sharedGeos.octa, mat);
    core.scale.set(0.65, 1.35, 0.65);
    g.add(core);
    return g;
  }

  function makeCyberHolo(colorHex) {
    const g = new THREE.Group();
    const outer = new THREE.Mesh(sharedGeos.icosa, new THREE.MeshBasicMaterial({ color: colorHex, wireframe: true, transparent: true, opacity: 0.9 }));
    const inner = new THREE.Mesh(sharedGeos.octa, new THREE.MeshStandardMaterial({ color: colorHex, emissive: colorHex, emissiveIntensity: 0.7, metalness: 0.8, roughness: 0.2 }));
    inner.scale.setScalar(0.48);
    g.add(outer, inner);
    return g;
  }

  let ornaments = [];
  let currentTopper = null;

  function buildTopperForTheme(themeKey) {
    clearGroupWithDispose(topperContainer);
    const group = new THREE.Group();
    let spinSub = null;
    let spinSub2 = null;

    if ((themeKey === 'classic' || themeKey === 'stellar')) {
      const shape = new THREE.Shape();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 0.88 : 0.37;
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        if (i === 0) shape.moveTo(Math.cos(a) * r, -Math.sin(a) * r);
        else shape.lineTo(Math.cos(a) * r, -Math.sin(a) * r);
      }
      shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 2 });
      geo.center();
      group.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xffe484, emissive: 0xffb703, emissiveIntensity: 0.88, metalness: 0.75, roughness: 0.16 })));
      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: createGlowTexture('rgba(255,252,220,1)', 'rgba(255,212,92,0.75)', 'rgba(255,180,40,0.08)'),
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      halo.scale.set(4.1, 4.1, 1);
      group.add(halo);
    } else if (themeKey === 'aurora') {
      const crystal = makeIceCrystal(0x7dd3fc);
      crystal.scale.setScalar(0.95);
      const frostRing = new THREE.Mesh(sharedGeos.thinRing, new THREE.MeshStandardMaterial({ color: 0xe0f2fe, emissive: 0x38bdf8, emissiveIntensity: 0.85, metalness: 0.6, roughness: 0.15 }));
      frostRing.scale.setScalar(1.15);
      frostRing.rotation.x = Math.PI / 3;
      spinSub = frostRing;
      group.add(crystal, frostRing);
      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: createGlowTexture('rgba(240,252,255,1)', 'rgba(125,211,252,0.75)', 'rgba(129,140,248,0.12)'),
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      halo.scale.set(4.2, 4.2, 1);
      group.add(halo);
    } else if (themeKey === 'candy') {
      const disc = new THREE.Mesh(sharedGeos.torus, new THREE.MeshStandardMaterial({ color: 0xf472b6, emissive: 0xfb7185, emissiveIntensity: 0.45, roughness: 0.18, metalness: 0.2 }));
      disc.scale.setScalar(0.95);
      const innerRing = new THREE.Mesh(sharedGeos.torus, new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfde047, emissiveIntensity: 0.55, roughness: 0.2 }));
      innerRing.scale.setScalar(0.5);
      const centerDot = new THREE.Mesh(sharedGeos.sphere, new THREE.MeshStandardMaterial({ color: 0x6ee7b7, emissive: 0x34d399, emissiveIntensity: 0.6 }));
      centerDot.scale.setScalar(0.24);
      const stick = new THREE.Mesh(sharedGeos.stick, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 }));
      stick.scale.set(1.2, 0.9, 1.2);
      stick.position.y = -0.9;
      group.add(disc, innerRing, centerDot, stick);
      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: createGlowTexture('rgba(255,245,250,1)', 'rgba(249,168,212,0.75)', 'rgba(244,114,182,0.1)'),
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      halo.scale.set(4.0, 4.0, 1);
      group.add(halo);
    } else {
      const core = new THREE.Mesh(sharedGeos.octa, new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 1.0, metalness: 0.9, roughness: 0.1 }));
      core.scale.setScalar(0.58);
      const ringA = new THREE.Mesh(sharedGeos.thinRing, new THREE.MeshBasicMaterial({ color: 0xe879f9 }));
      ringA.scale.setScalar(1.25);
      ringA.rotation.x = Math.PI / 2.6;
      const ringB = new THREE.Mesh(sharedGeos.thinRing, new THREE.MeshBasicMaterial({ color: 0x22d3ee }));
      ringB.scale.setScalar(1.0);
      ringB.rotation.y = Math.PI / 3;
      spinSub = ringA;
      spinSub2 = ringB;
      group.add(core, ringA, ringB);
      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: createGlowTexture('rgba(235,255,255,1)', 'rgba(34,211,238,0.75)', 'rgba(232,121,249,0.14)'),
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      halo.scale.set(4.3, 4.3, 1);
      group.add(halo);
    }
    group.position.set(0, TREE_HEIGHT * 0.5 + 0.72, 0);
    topperContainer.add(group);
    currentTopper = { group, spinSub, spinSub2 };
  }

  function buildDecorationsForTheme(themeKey) {
    clearGroupWithDispose(decorGroup);
    ornaments = [];
    const TOTAL = 114;
    for (let i = 0; i < TOTAL; i++) {
      const onSpiral = i < 72;
      let t, r, angle, y;
      if (onSpiral) {
        t = 0.06 + (i / 72) * 0.9;
        y = (0.48 - t * 0.96) * TREE_HEIGHT;
        r = t * TREE_BASE_RADIUS + 0.38;
        angle = t * Math.PI * 2 * SPIRAL_TURNS;
      } else {
        t = 0.12 + Math.random() * 0.84;
        y = (0.5 - t) * TREE_HEIGHT;
        r = t * TREE_BASE_RADIUS * (0.88 + Math.random() * 0.14);
        angle = Math.random() * Math.PI * 2;
      }

      let obj;
      let baseScale = 0.18;
      let selfSpin = 0;

      if (themeKey === 'stellar') {
        if (i % 9 === 0) {
          const boxCols = [0x7f1d2b, 0x1f4a3a, 0xcda96d, 0x6b4b2a];
          obj = makeGiftBox(boxCols[i % boxCols.length], 0xf3e3bd);
          baseScale = 0.34;
          selfSpin = 0.8;
        } else if (i % 11 === 0) {
          obj = makeCandyCane(0x9b2335, 0xfff3d8);
          baseScale = 0.32;
          selfSpin = 0.5;
        } else if (i % 13 === 0) {
          obj = makeGoldenBell();
          baseScale = 0.28;
          selfSpin = 0.7;
        } else {
          const cols = [0xcda96d, 0x9b2335, 0x1f4a3a, 0xf4e2ba, 0x8b6b3f, 0xfffaf0];
          const hex = cols[i % cols.length];
          obj = new THREE.Mesh(sharedGeos.sphere, new THREE.MeshStandardMaterial({ color: hex, metalness: 0.84, roughness: 0.16, emissive: hex, emissiveIntensity: 0.16 }));
          baseScale = 0.14 + (i % 4) * 0.025;
        }
      } else if (themeKey === 'classic') {
        if (i % 9 === 0) {
          const boxCols = [0xdc2626, 0x059669, 0x2563eb, 0xd97706];
          obj = makeGiftBox(boxCols[i % boxCols.length], 0xfde047);
          baseScale = 0.34;
          selfSpin = 0.8;
        } else if (i % 11 === 0) {
          obj = makeCandyCane(0xef4444, 0xffffff);
          baseScale = 0.32;
          selfSpin = 0.5;
        } else if (i % 13 === 0) {
          obj = makeGoldenBell();
          baseScale = 0.28;
          selfSpin = 0.7;
        } else {
          const cols = [0xdc2626, 0xf59e0b, 0x38bdf8, 0xfde68a, 0xe11d48, 0x34d399, 0xf8fafc];
          const hex = cols[i % cols.length];
          obj = new THREE.Mesh(sharedGeos.sphere, new THREE.MeshStandardMaterial({ color: hex, metalness: 0.84, roughness: 0.16, emissive: hex, emissiveIntensity: 0.16 }));
          baseScale = 0.14 + (i % 4) * 0.025;
        }
      } else if (themeKey === 'aurora') {
        if (i % 4 === 0) {
          const crysCols = [0x7dd3fc, 0xc4b5fd, 0x5eead4, 0xe0f2fe];
          obj = makeIceCrystal(crysCols[i % crysCols.length]);
          baseScale = 0.24;
          selfSpin = 1.1;
        } else if (i % 7 === 0) {
          obj = new THREE.Mesh(sharedGeos.thinRing, new THREE.MeshStandardMaterial({ color: 0xe0f2fe, emissive: 0x38bdf8, emissiveIntensity: 0.65, metalness: 0.7, roughness: 0.15 }));
          baseScale = 0.24;
          selfSpin = 1.4;
        } else {
          const cols = [0xbae6fd, 0x818cf8, 0x2dd4bf, 0xffffff, 0xc084fc];
          const hex = cols[i % cols.length];
          obj = new THREE.Mesh(sharedGeos.sphere, new THREE.MeshStandardMaterial({ color: hex, metalness: 0.72, roughness: 0.12, emissive: hex, emissiveIntensity: 0.28 }));
          baseScale = 0.14 + (i % 3) * 0.03;
        }
      } else if (themeKey === 'candy') {
        if (i % 5 === 0) {
          const glazes = [0xf472b6, 0x6ee7b7, 0xfde047, 0xc084fc, 0xfb7185];
          obj = makeDonut(glazes[i % glazes.length]);
          baseScale = 0.28;
          selfSpin = 0.9;
        } else if (i % 6 === 0) {
          obj = makeCandyCane(i % 12 === 0 ? 0xf43f5e : 0xf472b6, 0xffffff);
          baseScale = 0.34;
          selfSpin = 0.6;
        } else if (i % 7 === 0) {
          const pops = [0xf472b6, 0x34d399, 0xfacc15, 0x38bdf8];
          obj = makeLollipop(pops[i % pops.length]);
          baseScale = 0.32;
          selfSpin = 0.8;
        } else if (i % 8 === 0) {
          const boxCols = [0xf9a8d4, 0xa7f3d0, 0xfef08a, 0xddd6fe];
          obj = makeGiftBox(boxCols[i % boxCols.length], 0xf43f5e);
          baseScale = 0.31;
          selfSpin = 0.7;
        } else {
          const cols = [0xf9a8d4, 0x6ee7b7, 0xfde68a, 0xfb7185, 0xffffff, 0xc4b5fd];
          const hex = cols[i % cols.length];
          obj = new THREE.Mesh(sharedGeos.sphere, new THREE.MeshStandardMaterial({ color: hex, metalness: 0.35, roughness: 0.22, emissive: hex, emissiveIntensity: 0.22 }));
          baseScale = 0.16 + (i % 3) * 0.025;
        }
      } else {
        if (i % 4 === 0) {
          const holos = [0x22d3ee, 0xe879f9, 0xfacc15, 0x4ade80];
          obj = makeCyberHolo(holos[i % holos.length]);
          baseScale = 0.26;
          selfSpin = 1.6;
        } else if (i % 5 === 0) {
          const ringCols = [0x22d3ee, 0xe879f9, 0xa855f7];
          obj = new THREE.Mesh(sharedGeos.thinRing, new THREE.MeshBasicMaterial({ color: ringCols[i % ringCols.length] }));
          baseScale = 0.26;
          selfSpin = 1.9;
        } else if (i % 7 === 0) {
          obj = makeGiftBox(0x111827, i % 14 === 0 ? 0x22d3ee : 0xe879f9);
          baseScale = 0.31;
          selfSpin = 1.2;
        } else {
          const cols = [0x22d3ee, 0xe879f9, 0xa855f7, 0xfacc15, 0x4ade80];
          const hex = cols[i % cols.length];
          obj = new THREE.Mesh(sharedGeos.sphere, new THREE.MeshStandardMaterial({ color: hex, metalness: 0.9, roughness: 0.1, emissive: hex, emissiveIntensity: 0.55 }));
          baseScale = 0.14 + (i % 3) * 0.025;
        }
      }

      obj.scale.setScalar(baseScale);
      const basePos = new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r);
      obj.position.copy(basePos);
      obj.rotation.set(Math.random() * 0.6, angle, Math.random() * 0.4);

      const exR = 8 + Math.random() * 14;
      const exTheta = Math.random() * Math.PI * 2;
      const exPhi = Math.acos(2 * Math.random() - 1);
      const explodePos = new THREE.Vector3(
        exR * Math.sin(exPhi) * Math.cos(exTheta) * 1.3,
        exR * Math.cos(exPhi) * 0.85,
        exR * Math.sin(exPhi) * Math.sin(exTheta) - 2.5
      );

      decorGroup.add(obj);
      ornaments.push({ obj, basePos, explodePos, phase: Math.random() * Math.PI * 2, baseScale, selfSpin });
    }
  }

  // =========================================================
  // Falling Snowflakes + Bokeh Orbs + Fireworks
  // =========================================================
  const SNOW_COUNT = 680;
  const snowGeo = new THREE.BufferGeometry();
  const snowPos = new Float32Array(SNOW_COUNT * 3);
  const snowSpeeds = new Float32Array(SNOW_COUNT);
  for (let i = 0; i < SNOW_COUNT; i++) {
    snowPos[i * 3] = (Math.random() - 0.5) * 62;
    snowPos[i * 3 + 1] = (Math.random() - 0.5) * 42;
    snowPos[i * 3 + 2] = (Math.random() - 0.5) * 44 - 6;
    snowSpeeds[i] = 0.015 + Math.random() * 0.024;
  }
  snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
  const snowMat = new THREE.PointsMaterial({
    size: 0.52,
    map: snowflakeTex,
    color: 0xfffaf0,
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  scene.add(new THREE.Points(snowGeo, snowMat));

  const bokehOrbs = [];
  const BOKEH_COUNT = 26;
  for (let i = 0; i < BOKEH_COUNT; i++) {
    const mat = new THREE.SpriteMaterial({
      map: bokehTex,
      color: 0xfde68a,
      transparent: true,
      opacity: 0.25 + Math.random() * 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sp = new THREE.Sprite(mat);
    const sz = 2.6 + Math.random() * 4.2;
    sp.scale.set(sz, sz, 1);
    sp.position.set((Math.random() - 0.5) * 42, (Math.random() - 0.5) * 26, -14 - Math.random() * 18);
    scene.add(sp);
    bokehOrbs.push({ sprite: sp, mat, phase: Math.random() * Math.PI * 2, baseY: sp.position.y, speed: 0.35 + Math.random() * 0.4 });
  }

  const activeFireworks = [];
  function spawnFirework(x, y, z) {
    const cfg = THEMES[state.theme];
    const count = 92;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c1 = new THREE.Color(cfg.fireworkColors[Math.floor(Math.random() * cfg.fireworkColors.length)]);
    const c2 = new THREE.Color(cfg.fireworkColors[Math.floor(Math.random() * cfg.fireworkColors.length)]);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const spd = 2.3 + Math.random() * 4.8;
      vel[i * 3] = Math.sin(phi) * Math.cos(theta) * spd;
      vel[i * 3 + 1] = Math.cos(phi) * spd;
      vel[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * spd;
      const c = i % 2 === 0 ? c1 : c2;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({ size: 0.44, map: sparkleTex, vertexColors: true, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
    const points = new THREE.Points(geo, mat);
    fireworksGroup.add(points);
    activeFireworks.push({ points, geo, mat, vel, age: 0, life: 1.65 });
  }

  function applyThemeToScene(themeKey) {
    const cfg = THEMES[themeKey];
    scene.fog.color.setHex(cfg.fog);
    snowMat.color.setHex(cfg.snowColor);
    warmKeyLight.color.setHex(cfg.keyLight);
    emeraldFill.color.setHex(cfg.fillLight);
    rimLight.color.setHex(cfg.rimLight);
    if (pedestalGlowRing) pedestalGlowRing.material.color.setHex(cfg.pedestalGlow);

    bokehOrbs.forEach((b, i) => {
      b.mat.color.setHex(cfg.bokehColors[i % cfg.bokehColors.length]);
    });

    recolorTreeParticles(themeKey);
    recolorRibbon(themeKey);
    buildTopperForTheme(themeKey);
    buildDecorationsForTheme(themeKey);
  }

  function updateScene(dt, elapsed, ef) {
    camera.position.z += (state.targetCameraZ - camera.position.z) * 0.09;

    if (!state.isDragging) {
      state.targetRotY += state.autoSpinSpeed * (1 - ef * 0.65) + state.pokeVelocity;
      state.pokeVelocity *= 0.93;
    }
    state.treeRotY += (state.targetRotY - state.treeRotY) * 0.1;
    state.treeRotX += (state.targetRotX - state.treeRotX) * 0.1;
    treeGroup.rotation.y = state.treeRotY;
    treeGroup.rotation.x = state.treeRotX * (1 - ef);

    pedestalGroup.scale.setScalar(Math.max(0.001, 1 - ef * 0.92));
    pedestalGroup.position.y = -ef * 3.0;

    // Tree particles morph + warm twinkle
    const posArr = treeGeo.attributes.position.array;
    const colArr = treeGeo.attributes.color.array;
    const swirlAngle = ef * (1 - ef) * 2.4;
    const cosS = Math.cos(swirlAngle);
    const sinS = Math.sin(swirlAngle);

    for (let i = 0; i < TREE_PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      let x = treeBasePos[i3] + (treeExplodePos[i3] - treeBasePos[i3]) * ef;
      let y = treeBasePos[i3 + 1] + (treeExplodePos[i3 + 1] - treeBasePos[i3 + 1]) * ef;
      let z = treeBasePos[i3 + 2] + (treeExplodePos[i3 + 2] - treeBasePos[i3 + 2]) * ef;
      if (swirlAngle > 0.001) {
        const rx = x * cosS - z * sinS;
        z = x * sinS + z * cosS;
        x = rx;
      }
      posArr[i3] = x;
      posArr[i3 + 1] = y;
      posArr[i3 + 2] = z;
      const twinkle = 0.72 + 0.36 * Math.sin(elapsed * 3.1 + treePhases[i]);
      colArr[i3] = Math.min(1, treeBaseColors[i3] * twinkle);
      colArr[i3 + 1] = Math.min(1, treeBaseColors[i3 + 1] * twinkle);
      colArr[i3 + 2] = Math.min(1, treeBaseColors[i3 + 2] * twinkle);
    }
    treeGeo.attributes.position.needsUpdate = true;
    treeGeo.attributes.color.needsUpdate = true;

    // Spiral ribbon morph
    const ribArr = ribbonGeo.attributes.position.array;
    for (let i = 0; i < RIBBON_POINTS; i++) {
      const i3 = i * 3;
      ribArr[i3] = ribbonBasePos[i3] + (ribbonExplodePos[i3] - ribbonBasePos[i3]) * ef;
      ribArr[i3 + 1] = ribbonBasePos[i3 + 1] + (ribbonExplodePos[i3 + 1] - ribbonBasePos[i3 + 1]) * ef;
      ribArr[i3 + 2] = ribbonBasePos[i3 + 2] + (ribbonExplodePos[i3 + 2] - ribbonBasePos[i3 + 2]) * ef;
    }
    ribbonGeo.attributes.position.needsUpdate = true;
    ribbonTubeMat.opacity = Math.max(0, (1 - ef * 1.6) * 0.9);
    ribbonTubeMesh.visible = ef < 0.65;

    // Counter-spiraling chasing fairy lights
    const fPos = fairyGeo.attributes.position.array;
    const fCol = fairyGeo.attributes.color.array;
    for (let i = 0; i < FAIRY_COUNT; i++) {
      const i3 = i * 3;
      fPos[i3] = fairyBasePos[i3] + (fairyExplodePos[i3] - fairyBasePos[i3]) * ef;
      fPos[i3 + 1] = fairyBasePos[i3 + 1] + (fairyExplodePos[i3 + 1] - fairyBasePos[i3 + 1]) * ef;
      fPos[i3 + 2] = fairyBasePos[i3 + 2] + (fairyExplodePos[i3 + 2] - fairyBasePos[i3 + 2]) * ef;
      const chase = 0.45 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(i * 0.28 - elapsed * 5.2), 2);
      fCol[i3] = Math.min(1, fairyBaseCols[i3] * chase);
      fCol[i3 + 1] = Math.min(1, fairyBaseCols[i3 + 1] * chase);
      fCol[i3 + 2] = Math.min(1, fairyBaseCols[i3 + 2] * chase);
    }
    fairyGeo.attributes.position.needsUpdate = true;
    fairyGeo.attributes.color.needsUpdate = true;

    // Orbiting fireflies
    for (let i = 0; i < fireflies.length; i++) {
      const ff = fireflies[i];
      const fa = elapsed * ff.speed + ff.phase;
      const fr = ff.r + ef * 6.5;
      ff.sprite.position.set(Math.cos(fa) * fr, ff.yBase + Math.sin(elapsed * 1.3 + ff.phase) * 0.85, Math.sin(fa) * fr);
      ff.mat.opacity = 0.45 + 0.45 * Math.sin(elapsed * 3.5 + ff.phase);
    }

    // Ornaments
    for (let i = 0; i < ornaments.length; i++) {
      const item = ornaments[i];
      item.obj.position.lerpVectors(item.basePos, item.explodePos, ef);
      if (ef > 0.02) item.obj.position.y += Math.sin(elapsed * 1.4 + item.phase) * 0.25 * ef;
      if (item.selfSpin > 0) item.obj.rotation.y += dt * item.selfSpin;
      item.obj.scale.setScalar(item.baseScale * (1 + ef * 0.42));
    }

    // Topper
    if (currentTopper) {
      currentTopper.group.rotation.y = elapsed * 0.9;
      if (currentTopper.spinSub) currentTopper.spinSub.rotation.z = elapsed * 1.4;
      if (currentTopper.spinSub2) currentTopper.spinSub2.rotation.x = -elapsed * 1.7;
      const tScale = Math.max(0.01, (1 - ef * 0.85) * (1 + 0.07 * Math.sin(elapsed * 3.2)));
      currentTopper.group.scale.setScalar(tScale);
      currentTopper.group.position.y = TREE_HEIGHT * 0.5 + 0.72 + ef * 4.5;
    }

    // Snowflakes
    const sArr = snowGeo.attributes.position.array;
    for (let i = 0; i < SNOW_COUNT; i++) {
      const i3 = i * 3;
      sArr[i3 + 1] -= snowSpeeds[i] * (1 + ef * 0.5);
      sArr[i3] += Math.sin(elapsed * 0.7 + i) * 0.006;
      if (sArr[i3 + 1] < -21) sArr[i3 + 1] = 21;
    }
    snowGeo.attributes.position.needsUpdate = true;

    // Bokeh orbs
    for (let i = 0; i < bokehOrbs.length; i++) {
      const b = bokehOrbs[i];
      b.sprite.position.y = b.baseY + Math.sin(elapsed * b.speed + b.phase) * 0.9;
    }

    // Fireworks physics
    for (let f = activeFireworks.length - 1; f >= 0; f--) {
      const fw = activeFireworks[f];
      fw.age += dt;
      if (fw.age >= fw.life) {
        fireworksGroup.remove(fw.points);
        fw.geo.dispose();
        fw.mat.dispose();
        activeFireworks.splice(f, 1);
        continue;
      }
      const arr = fw.geo.attributes.position.array;
      for (let k = 0; k < fw.vel.length; k += 3) {
        fw.vel[k] *= 0.975;
        fw.vel[k + 1] = fw.vel[k + 1] * 0.975 - 2.4 * dt;
        fw.vel[k + 2] *= 0.975;
        arr[k] += fw.vel[k] * dt;
        arr[k + 1] += fw.vel[k + 1] * dt;
        arr[k + 2] += fw.vel[k + 2] * dt;
      }
      fw.geo.attributes.position.needsUpdate = true;
      fw.mat.opacity = Math.max(0, 1 - fw.age / fw.life);
    }
  }

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function render() {
    renderer.render(scene, camera);
  }

  return {
    scene,
    camera,
    renderer,
    photoGroup,
    applyThemeToScene,
    spawnFirework,
    updateScene,
    resize,
    render,
  };
}
