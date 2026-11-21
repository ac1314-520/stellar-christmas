import {
  BRAND_CONFIG,
  COLLECTION_SIZE,
  DEFAULT_PHOTOS,
  HOLIDAY_YEAR,
  PHOTO_BATCHES,
  THEMES,
} from './config.js';
import { COLLECTION } from './collection-data.js';
import { state } from './state.js';
import { createAudioEngine } from './audio.js';
import { createStardustOverlay } from './stardust.js';
import { createTreeScene, SPIRAL_TURNS, TREE_BASE_RADIUS, TREE_HEIGHT } from './scene.js';
import { createPolaroidManager } from './polaroids.js';
import { createGestureController } from './gestures.js?v=20261122c';

const THREE = window.THREE;

const $ = (selector, root = document) => root.querySelector(selector);

const container = document.getElementById('scene-container');
const bgWarmEl = document.getElementById('bg-warm');
const bgAuroraEl = document.getElementById('bg-aurora');
const stardustCanvas = document.getElementById('stardust-canvas');
const entryKicker = document.getElementById('entry-kicker');
const entryDesc = document.getElementById('entry-desc');
const entryScreen = document.getElementById('entry-screen');
const btnEnterMagic = document.getElementById('btn-enter-magic');
const titleText = document.getElementById('title-text');
const themeBar = document.getElementById('theme-bar');
const marqueeTrack = document.getElementById('marquee-track');
const statusDot = document.getElementById('status-dot');
const statusLabel = document.getElementById('status-label');
const statusSub = document.getElementById('status-sub');
const camBox = document.getElementById('cam-box');
const camToggleBtn = document.getElementById('cam-toggle-btn');
const camVideo = document.getElementById('cam-video');
const camOverlay = document.getElementById('cam-overlay');
const snowflakeIcon = document.getElementById('snowflake-icon');
const galleryPill = document.getElementById('gallery-pill');
const galleryCounter = document.getElementById('gallery-counter');
const batchLabel = document.getElementById('batch-label');
const btnFlipCard = document.getElementById('btn-flip-card');
const btnMode = document.getElementById('btn-mode');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnFirework = document.getElementById('btn-firework');
const btnAll = document.getElementById('btn-all');
const btnBatch = document.getElementById('btn-batch');
const btnSfx = document.getElementById('btn-sfx');
const btnMusic = document.getElementById('btn-music');
const btnReset = document.getElementById('btn-reset');
const btnGuide = document.getElementById('btn-guide');
const btnTrackNext = document.getElementById('btn-track-next');
const btnUploadAudio = document.getElementById('btn-upload-audio');
const audioInput = document.getElementById('audio-input');
const musicTrackNameEl = document.getElementById('music-track-name');
const guideModal = document.getElementById('guide-modal');
const guideClose = document.getElementById('guide-close');
const toastEl = document.getElementById('toast');
const collectionModal = document.getElementById('collection-modal');
const collectionClose = document.getElementById('collection-close');
const collectionGrid = document.getElementById('all-grid');
const allSearch = document.getElementById('all-search');
const allStatus = document.getElementById('all-status');

document.body.classList.add('is-entry');

if (entryKicker) entryKicker.textContent = `✦ ${HOLIDAY_YEAR} STELLAR CHRISTMAS ✦`;
if (entryDesc) {
  entryDesc.innerHTML =
    `${COLLECTION_SIZE} 件私人藏品、${PHOTO_BATCHES.length} 批拍立得与一棵金色星尘圣诞树已就绪<br />` +
    '轻点下方，把晶晶的收藏挂进冬夜';
}

['entry-brand-crest', 'brand-stage-crest'].forEach((id) => {
  const el = document.getElementById(id);
  if (!el || !BRAND_CONFIG) return;
  el.href = BRAND_CONFIG.href;
  el.setAttribute('aria-label', BRAND_CONFIG.ariaLabel);
});

let toastTimer = null;
function showToast(msg, duration = 2600) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), duration);
}

function updateStatus(label, sub, isMagic) {
  if (statusLabel) statusLabel.textContent = label;
  if (statusSub) statusSub.textContent = sub;
  statusDot?.classList.toggle('magic', !!isMagic);
}

const audio = createAudioEngine({
  btnMusic,
  btnSfx,
  btnTrackNext,
  btnUploadAudio,
  audioInput,
  musicTrackNameEl,
  showToast,
});

const stardust = createStardustOverlay(stardustCanvas);
const treeScene = createTreeScene(container);
const polaroidMgr = createPolaroidManager({
  photoGroup: treeScene.photoGroup,
  renderer: treeScene.renderer,
  TREE_HEIGHT,
  TREE_BASE_RADIUS,
  SPIRAL_TURNS,
  galleryCounter,
});

function triggerCelebrationFireworks() {
  audio.playSfx('firework');
  treeScene.spawnFirework((Math.random() - 0.5) * 11, 3.6 + Math.random() * 4.4, (Math.random() - 0.5) * 5 - 2);
  setTimeout(() => {
    treeScene.spawnFirework((Math.random() - 0.5) * 12, 2.6 + Math.random() * 4.8, (Math.random() - 0.5) * 5 - 3);
  }, 230);
}

/* ── themes ─────────────────────────────────────────────────────────── */

function applyTheme(themeKey, silent) {
  if (!THEMES[themeKey]) return;
  state.theme = themeKey;
  const cfg = THEMES[themeKey];
  document.body.setAttribute('data-theme', themeKey);
  if (titleText) titleText.textContent = cfg.title;
  if (marqueeTrack) marqueeTrack.textContent = cfg.marquee;
  treeScene.applyThemeToScene(themeKey);
  themeBar?.querySelectorAll('.theme-pill').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.theme === themeKey);
  });
  if (!silent) {
    audio.playSfx('theme');
    showToast('已切换主题：' + cfg.name + ' ✦');
    treeScene.spawnFirework((Math.random() - 0.5) * 6, 5.0, -1);
  }
}

themeBar?.addEventListener('click', (event) => {
  const btn = event.target.closest('.theme-pill');
  if (!btn) return;
  applyTheme(btn.dataset.theme, false);
});

applyTheme('stellar', true);

/* ── batches & photo wall ───────────────────────────────────────────── */

let activeBatch = 0;
let collectionBuilt = false;

function batchRange(index) {
  const start = index * 12;
  const end = Math.min(start + 12, COLLECTION_SIZE);
  return `${COLLECTION[start]?.code || ''}–${COLLECTION[end - 1]?.code || ''}`;
}

function updateBatchUI() {
  if (batchLabel) batchLabel.textContent = `第 ${activeBatch + 1} / ${PHOTO_BATCHES.length} 批`;
  if (btnBatch) btnBatch.textContent = `⟳ 换一批 ${activeBatch + 1}/${PHOTO_BATCHES.length}`;
}

function setMode(newMode, reasonLabel, reasonSub) {
  const changed = state.mode !== newMode;
  state.mode = newMode;
  if (newMode === 'exploded') {
    state.targetExplode = 1;
    if (btnMode) btnMode.textContent = '✊ 收起照片墙';
    btnMode?.classList.add('active');
    galleryPill?.classList.add('visible');
    polaroidMgr.updateGalleryCounter();
    if (changed) audio.playSfx('explode');
    updateStatus(reasonLabel || '状态: ✦ 照片墙展开', reasonSub || '点击中间卡片或单指轻点翻到明信片背面', true);
  } else {
    state.targetExplode = 0;
    state.flippedCardIndex = -1;
    if (btnMode) btnMode.textContent = '✦ 展开照片墙';
    btnMode?.classList.remove('active');
    galleryPill?.classList.remove('visible');
    if (changed) audio.playSfx('gather');
    updateStatus(reasonLabel || '状态: 星屿圣诞已就绪', reasonSub || '悬停卡片微倾 · 点击展开拍立得', false);
  }
}

function loadBatch(index, options = {}) {
  const { focus = 0, explode = false, announce = true } = options;
  if (!PHOTO_BATCHES.length) return;
  activeBatch = ((index % PHOTO_BATCHES.length) + PHOTO_BATCHES.length) % PHOTO_BATCHES.length;
  state.flippedCardIndex = -1;
  polaroidMgr.buildPolaroidCards(PHOTO_BATCHES[activeBatch]);
  const safeFocus = Math.max(0, Math.min(focus, PHOTO_BATCHES[activeBatch].length - 1));
  state.carouselIndex = safeFocus;
  state.currentCarousel = safeFocus;
  polaroidMgr.updateGalleryCounter();
  updateBatchUI();
  if (explode) {
    setMode('exploded', '状态: ✦ 拍立得特写', '点击中间卡片或单指轻点翻到明信片背面');
  } else {
    setMode('tree', '状态: 星屿圣诞已就绪', '悬停卡片微倾 · 点击展开拍立得');
  }
  if (announce) showToast(`第 ${activeBatch + 1} 批 · ${batchRange(activeBatch)} · ${PHOTO_BATCHES[activeBatch].length} 件`);
}

function stepCarousel(delta) {
  if (state.mode !== 'exploded') {
    setMode('exploded', '状态: ✦ 照片墙展开', '点击中间卡片或单指轻点翻到明信片背面');
  }
  if (!polaroidMgr.polaroids.length) return;
  state.flippedCardIndex = -1;
  state.carouselIndex = Math.round(state.carouselIndex + delta);
  audio.playSfx('flip');
  polaroidMgr.updateGalleryCounter();
}

function flipCurrentCenterCard() {
  if (state.mode !== 'exploded' || !polaroidMgr.polaroids.length) return;
  const n = polaroidMgr.polaroids.length;
  const centerIdx = ((Math.round(state.carouselIndex) % n) + n) % n;
  state.flippedCardIndex = state.flippedCardIndex === centerIdx ? -1 : centerIdx;
  polaroidMgr.polaroids[centerIdx].flipVel += state.flippedCardIndex === centerIdx ? 2.6 : -2.6;
  polaroidMgr.polaroids[centerIdx].focusPop = 0.14;
  stardust.spawn(window.innerWidth * 0.5, window.innerHeight * 0.5, 16);
  audio.playSfx('flip');
}

btnFlipCard?.addEventListener('click', flipCurrentCenterCard);
btnMode?.addEventListener('click', () => setMode(state.mode === 'tree' ? 'exploded' : 'tree'));
btnPrev?.addEventListener('click', () => stepCarousel(-1));
btnNext?.addEventListener('click', () => stepCarousel(1));
btnFirework?.addEventListener('click', triggerCelebrationFireworks);

btnBatch?.addEventListener('click', () => {
  loadBatch(activeBatch + 1, { explode: false });
});

/* ── full collection overlay ─────────────────────────────────────────── */

function renderAllCollection() {
  if (!collectionGrid) return;
  const query = (allSearch?.value || '').trim().toLowerCase();
  const visible = [];
  collectionGrid.innerHTML = COLLECTION.map((item, index) => {
    const haystack = `${item.code} ${item.title} ${item.series} ${item.collection}`.toLowerCase();
    const matched = !query || haystack.includes(query);
    if (matched) visible.push(index);
    return `
      <button class="all-card" type="button" data-collection-index="${index}" ${matched ? '' : 'hidden'} aria-label="在圣诞树上看 ${item.code} ${item.title}">
        <img class="all-card__img" src="${item.thumb}" alt="${item.series} ${item.title}" loading="lazy" decoding="async" width="300" height="366" />
        <span class="all-card__meta">
          <span class="all-card__series">${item.series} · ${item.collection}</span>
          <span class="all-card__title">${item.title}</span>
          <span class="all-card__code">NO. ${item.code}</span>
        </span>
      </button>`;
  }).join('');
  if (allStatus) {
    allStatus.textContent = query
      ? `找到 ${visible.length} 件藏品 · 点任意一件挂上圣诞树`
      : `${COLLECTION_SIZE} 件藏品 · ${PHOTO_BATCHES.length} 批拍立得 · 每一件都有自己的编号`;
  }
  collectionBuilt = true;
}

function openCollection() {
  if (!collectionModal) return;
  if (!collectionBuilt) renderAllCollection();
  collectionModal.hidden = false;
  document.body.classList.add('is-collection-open');
  setTimeout(() => allSearch?.focus(), 30);
}

function closeCollection() {
  if (!collectionModal) return;
  collectionModal.hidden = true;
  document.body.classList.remove('is-collection-open');
}

btnAll?.addEventListener('click', openCollection);
collectionClose?.addEventListener('click', closeCollection);
collectionModal?.addEventListener('click', (event) => {
  if (event.target === collectionModal) closeCollection();
});
allSearch?.addEventListener('input', renderAllCollection);
collectionGrid?.addEventListener('click', (event) => {
  const card = event.target.closest('[data-collection-index]');
  if (!card) return;
  const index = Number(card.dataset.collectionIndex);
  const batch = Math.floor(index / 12);
  const local = index % 12;
  closeCollection();
  loadBatch(batch, { focus: local, explode: true, announce: false });
  showToast(`已挂上 ${COLLECTION[index].code} · ${COLLECTION[index].title}`);
});

/* ── gestures, pointer & camera ─────────────────────────────────────── */

createGestureController({
  camBox,
  camToggleBtn,
  camVideo,
  camOverlay,
  snowflakeIcon,
  setMode,
  updateGalleryCounter: polaroidMgr.updateGalleryCounter,
  updateStatus,
  showToast,
  flipCurrentCard: flipCurrentCenterCard,
});

const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
let parallaxX = 0;
let parallaxY = 0;
let targetParallaxX = 0;
let targetParallaxY = 0;

function updateHoverCard(clientX, clientY) {
  const rect = treeScene.renderer.domElement.getBoundingClientRect();
  pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointerNDC, treeScene.camera);
  const meshes = polaroidMgr.polaroids.map((p) => p.frontMesh);
  const hits = raycaster.intersectObjects(meshes, false);
  if (hits.length > 0) {
    state.hoverCardIndex = hits[0].object.userData.polaroidIndex;
    if (hits[0].uv) {
      state.hoverNormX = (hits[0].uv.x - 0.5) * 2;
      state.hoverNormY = (hits[0].uv.y - 0.5) * 2;
    }
    container.classList.add('card-hover');
  } else {
    state.hoverCardIndex = -1;
    container.classList.remove('card-hover');
  }
}

function handleTapPolaroid(clientX, clientY) {
  const rect = treeScene.renderer.domElement.getBoundingClientRect();
  pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointerNDC, treeScene.camera);
  const meshes = polaroidMgr.polaroids.map((p) => p.frontMesh);
  const hits = raycaster.intersectObjects(meshes, false);
  if (!hits.length) return;
  const idx = hits[0].object.userData.polaroidIndex;
  if (state.mode === 'tree') {
    state.carouselIndex = idx;
    state.flippedCardIndex = -1;
    setMode('exploded', '状态: ✦ 拍立得特写', '再点中间卡片或单指轻点翻到藏品小传');
  } else {
    const n = polaroidMgr.polaroids.length;
    const current = ((Math.round(state.carouselIndex) % n) + n) % n;
    if (idx === current) {
      flipCurrentCenterCard();
    } else {
      let diff = idx - current;
      if (diff > n / 2) diff -= n;
      if (diff < -n / 2) diff += n;
      state.flippedCardIndex = -1;
      state.carouselIndex = Math.round(state.carouselIndex) + diff;
      audio.playSfx('flip');
      polaroidMgr.updateGalleryCounter();
    }
  }
}

container?.addEventListener('pointerdown', (e) => {
  state.isDragging = true;
  state.dragMoved = false;
  state.pointerStartX = e.clientX;
  state.pointerStartY = e.clientY;
  state.lastPointerX = e.clientX;
  state.lastPointerY = e.clientY;
  stardust.spawn(e.clientX, e.clientY, 5);
});

window.addEventListener('pointermove', (e) => {
  if (Math.random() < 0.45) stardust.spawn(e.clientX, e.clientY, state.isDragging ? 2 : 1);
  targetParallaxX = (e.clientX / window.innerWidth - 0.5) * -28;
  targetParallaxY = (e.clientY / window.innerHeight - 0.5) * -18;
  if (!state.isDragging) {
    updateHoverCard(e.clientX, e.clientY);
    return;
  }
  const dx = e.clientX - state.lastPointerX;
  const dy = e.clientY - state.lastPointerY;
  if (Math.hypot(e.clientX - state.pointerStartX, e.clientY - state.pointerStartY) > 6) state.dragMoved = true;
  state.lastPointerX = e.clientX;
  state.lastPointerY = e.clientY;
  if (state.mode === 'exploded') {
    state.carouselIndex -= dx * 0.008;
    state.flippedCardIndex = -1;
    polaroidMgr.updateGalleryCounter();
  } else {
    state.targetRotY += dx * 0.008;
    state.targetRotX = Math.max(-0.42, Math.min(0.52, state.targetRotX + dy * 0.0045));
  }
});

window.addEventListener('pointerup', (e) => {
  if (!state.isDragging) return;
  state.isDragging = false;
  if (!state.dragMoved) handleTapPolaroid(e.clientX, e.clientY);
  else if (state.mode === 'exploded') {
    state.carouselIndex = Math.round(state.carouselIndex);
    polaroidMgr.updateGalleryCounter();
  }
});

container?.addEventListener('dblclick', triggerCelebrationFireworks);
container?.addEventListener('wheel', (event) => {
  event.preventDefault();
  state.targetCameraZ = Math.max(12.0, Math.min(35, state.targetCameraZ + event.deltaY * 0.015));
}, { passive: false });

container?.addEventListener('touchstart', (event) => {
  if (event.touches.length === 2) {
    state.pinchDist = Math.hypot(
      event.touches[0].clientX - event.touches[1].clientX,
      event.touches[0].clientY - event.touches[1].clientY,
    );
  }
}, { passive: true });

container?.addEventListener('touchmove', (event) => {
  if (event.touches.length === 2 && state.pinchDist > 0) {
    const dist = Math.hypot(
      event.touches[0].clientX - event.touches[1].clientX,
      event.touches[0].clientY - event.touches[1].clientY,
    );
    state.targetCameraZ = Math.max(12.0, Math.min(35, state.targetCameraZ + (state.pinchDist - dist) * 0.04));
    state.pinchDist = dist;
  }
}, { passive: true });

/* ── entry, reset, guide, keyboard ──────────────────────────────────── */

btnReset?.addEventListener('click', () => {
  state.targetRotX = 0.05;
  state.targetCameraZ = 24.5;
  state.pokeVelocity = 0;
  setMode('tree', '状态: 星屿圣诞已就绪', '视角已复位 · 悬停卡片微倾');
});

if (btnEnterMagic && entryScreen) {
  btnEnterMagic.addEventListener('click', () => {
    document.body.classList.remove('is-entry');
    entryScreen.classList.add('hidden');
    audio.ensureAudio();
    audio.startMusicPlayback();
    audio.playSfx('explode');
    triggerCelebrationFireworks();
    setTimeout(() => {
      entryScreen.style.display = 'none';
    }, 900);
  });
}

btnGuide?.addEventListener('click', () => {
  if (guideModal) guideModal.hidden = false;
});
guideClose?.addEventListener('click', () => {
  if (guideModal) guideModal.hidden = true;
});
guideModal?.addEventListener('click', (event) => {
  if (event.target === guideModal) guideModal.hidden = true;
});

window.addEventListener('keydown', (event) => {
  const tag = (document.activeElement && document.activeElement.tagName) || '';
  const isTyping = tag === 'INPUT' || tag === 'TEXTAREA';
  if (event.key === 'Escape') {
    if (guideModal) guideModal.hidden = true;
    closeCollection();
    return;
  }
  if (isTyping) return;
  if (event.key === ' ') {
    event.preventDefault();
    setMode(state.mode === 'tree' ? 'exploded' : 'tree');
  } else if (event.key === 'ArrowLeft') stepCarousel(-1);
  else if (event.key === 'ArrowRight') stepCarousel(1);
  else if (event.key === 'Enter' && state.mode === 'exploded') flipCurrentCenterCard();
});

/* ── animation ──────────────────────────────────────────────────────── */

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.getElapsedTime();
  const force = (state.targetExplode - state.explodeFactor) * 18.0;
  state.explodeVel = (state.explodeVel + force * dt) * Math.pow(0.08, dt);
  state.explodeFactor = Math.max(0, Math.min(1.06, state.explodeFactor + state.explodeVel * dt));
  const ef = Math.min(1, Math.max(0, state.explodeFactor));

  parallaxX += (targetParallaxX - parallaxX) * 0.06;
  parallaxY += (targetParallaxY - parallaxY) * 0.06;
  const pTransform = `translate3d(${parallaxX.toFixed(1)}px,${parallaxY.toFixed(1)}px,0)`;
  if (bgWarmEl) bgWarmEl.style.transform = pTransform;
  if (bgAuroraEl) bgAuroraEl.style.transform = pTransform;

  treeScene.updateScene(dt, elapsed, ef);
  polaroidMgr.updatePolaroids(dt, elapsed, ef);
  stardust.render();
  treeScene.render();
}

window.addEventListener('resize', () => {
  treeScene.resize();
  stardust.resize();
});

loadBatch(0, { announce: false });
animate();
