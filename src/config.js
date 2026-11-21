import { COLLECTION } from './collection-data.js';

export const HOLIDAY_YEAR = new Date().getFullYear();

/**
 * Brand configuration for the Stellar Archive Christmas experience.
 */
export const BRAND_CONFIG = {
  name: '星屿藏馆',
  href: 'https://ac1314-520.github.io/stellar-archive/',
  ariaLabel: '星屿藏馆 · 完整藏品馆',
  wordmark: '星屿藏馆',
};

const BATCH_SIZE = 12;

function toCard(item) {
  return {
    id: item.id,
    code: item.code,
    title: item.title,
    series: item.series,
    collection: item.collection,
    story: item.story,
    accent: item.accent,
    src: item.image,
    thumb: item.thumb,
    art: 'ornament',
    caption: item.title,
    wish: item.story,
  };
}

export const PHOTO_BATCHES = [];
for (let i = 0; i < COLLECTION.length; i += BATCH_SIZE) {
  PHOTO_BATCHES.push(COLLECTION.slice(i, i + BATCH_SIZE).map(toCard));
}

export const COLLECTION_SIZE = COLLECTION.length;
export const DEFAULT_PHOTOS = PHOTO_BATCHES[0] || [];



export const THEMES = {
  classic: {
    name: '翡翠圣诞',
    title: '翡翠圣诞',
    fog: 0x03080e,
    snowColor: 0xfffaf0,
    bokehColors: [0xfde68a, 0xf87171, 0x34d399, 0xfbbf24],
    dustColors: ['#fff4c2', '#f5ce70', '#ef4444', '#34d399'],
    keyLight: 0xffd782,
    fillLight: 0x34d399,
    rimLight: 0x93c5fd,
    ribbonA: 0xfff6cc,
    ribbonB: 0xf59e0b,
    pedestalGlow: 0xfbbf24,
    marquee: `Merry Christmas ${HOLIDAY_YEAR} — 经典翡翠金：雪地礼盒、冬青烫金拍立得与暖冬星光 ✨      滑动星尘拖尾 · 悬停卡片微倾 · 点击居中拍立得翻转明信片`,
    fireworkColors: [0xfde047, 0xef4444, 0x34d399, 0xfff7ed, 0xf59e0b],
    particlePalette: [
      { hex: 0x0f8a4b, w: 0.30 },
      { hex: 0x16a34a, w: 0.24 },
      { hex: 0x34d399, w: 0.16 },
      { hex: 0x065f46, w: 0.08 },
      { hex: 0xfef08a, w: 0.12 },
      { hex: 0xffffff, w: 0.06 },
      { hex: 0xf87171, w: 0.04 },
    ],
  },
  aurora: {
    name: '极光雪夜',
    title: '极光雪夜',
    fog: 0x030b18,
    snowColor: 0xe0f2fe,
    bokehColors: [0x7dd3fc, 0xc4b5fd, 0x5eead4, 0xe0f2fe],
    dustColors: ['#e0f2fe', '#7dd3fc', '#c4b5fd', '#5eead4'],
    keyLight: 0xbae6fd,
    fillLight: 0x818cf8,
    rimLight: 0x67e8f9,
    ribbonA: 0xe0f2fe,
    ribbonB: 0x818cf8,
    pedestalGlow: 0x38bdf8,
    marquee: 'Winter Wonderland — 冰雪极光晶：六角冰晶、极光光带与雪地星河 ❄️      滑动星尘拖尾 · 悬停卡片微倾 · 点击居中拍立得翻转明信片',
    fireworkColors: [0x7dd3fc, 0xc4b5fd, 0x5eead4, 0xffffff, 0x38bdf8],
    particlePalette: [
      { hex: 0x0ea5e9, w: 0.25 },
      { hex: 0x38bdf8, w: 0.24 },
      { hex: 0x2dd4bf, w: 0.15 },
      { hex: 0x818cf8, w: 0.13 },
      { hex: 0xe0f2fe, w: 0.13 },
      { hex: 0xffffff, w: 0.07 },
      { hex: 0xc084fc, w: 0.03 },
    ],
  },
  candy: {
    name: '香槟玫瑰',
    title: '香槟玫瑰',
    fog: 0x100512,
    snowColor: 0xffe4e6,
    bokehColors: [0xf9a8d4, 0x6ee7b7, 0xfde68a, 0xfb7185],
    dustColors: ['#ffe4f1', '#f472b6', '#6ee7b7', '#fde047'],
    keyLight: 0xffd1e8,
    fillLight: 0x6ee7b7,
    rimLight: 0xfde68a,
    ribbonA: 0xfef08a,
    ribbonB: 0xf472b6,
    pedestalGlow: 0xf472b6,
    marquee: 'Sweet Christmas — 糖果游乐园：甜甜圈、彩虹棒棒糖与马卡龙礼盒 🍬      滑动星尘拖尾 · 悬停卡片微倾 · 点击居中拍立得翻转明信片',
    fireworkColors: [0xf472b6, 0x6ee7b7, 0xfde047, 0xfb7185, 0xc084fc],
    particlePalette: [
      { hex: 0xf472b6, w: 0.27 },
      { hex: 0xfb7185, w: 0.20 },
      { hex: 0x6ee7b7, w: 0.17 },
      { hex: 0xfde68a, w: 0.15 },
      { hex: 0xfff1f2, w: 0.11 },
      { hex: 0xc084fc, w: 0.06 },
      { hex: 0x38bdf8, w: 0.04 },
    ],
  },
  cyber: {
    name: '赛博霓虹星',
    title: 'Cyber Xmas',
    fog: 0x060212,
    snowColor: 0x67e8f9,
    bokehColors: [0x22d3ee, 0xe879f9, 0xa855f7, 0xfacc15],
    dustColors: ['#67e8f9', '#e879f9', '#facc15', '#4ade80'],
    keyLight: 0x22d3ee,
    fillLight: 0xe879f9,
    rimLight: 0xfacc15,
    ribbonA: 0x22d3ee,
    ribbonB: 0xe879f9,
    pedestalGlow: 0x22d3ee,
    marquee: 'Cyber Xmas — 赛博霓虹星：全息线框多面体、双轨光环与霓虹星尘 🌌      滑动星尘拖尾 · 悬停卡片微倾 · 点击居中拍立得翻转明信片',
    fireworkColors: [0x22d3ee, 0xe879f9, 0xfacc15, 0xa855f7, 0x4ade80],
    particlePalette: [
      { hex: 0x06b6d4, w: 0.26 },
      { hex: 0xa855f7, w: 0.24 },
      { hex: 0xec4899, w: 0.18 },
      { hex: 0x22d3ee, w: 0.14 },
      { hex: 0xfacc15, w: 0.08 },
      { hex: 0x4ade80, w: 0.06 },
      { hex: 0xffffff, w: 0.04 },
    ],
  },
};

const N = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77, C6: 1046.50,
  C3: 130.81, F3: 174.61, G3: 196.00, A3: 220.00, D3: 146.83,
};


THEMES.stellar = {
  name: '星屿黑金',
  title: '星屿圣诞',
  fog: 0x020202,
  snowColor: 0xfff3d8,
  bokehColors: [0xf1d49a, 0xcda96d, 0x8f1d2c, 0x1f4a3a],
  dustColors: ['#fff3d8', '#e2c088', '#cda96d', '#9b2335'],
  keyLight: 0xffdfa3,
  fillLight: 0x214f3d,
  rimLight: 0xcda96d,
  ribbonA: 0xffe8b5,
  ribbonB: 0xb8863d,
  pedestalGlow: 0xd7b06a,
  marquee: `STELLAR CHRISTMAS ${HOLIDAY_YEAR} · 星屿藏馆：84 件私人藏品、7 批拍立得、金色星尘与一棵会发光的圣诞树 ✦ 拖动旋转 · 滚轮缩放 · 点击展开照片墙`,
  fireworkColors: [0xf7e2b0, 0xcda96d, 0x9b2335, 0x2f5d46, 0xfffaf0],
  particlePalette: [
    { hex: 0xb8863d, w: 0.26 },
    { hex: 0xd8b16a, w: 0.24 },
    { hex: 0xf4e2ba, w: 0.18 },
    { hex: 0x8f1d2c, w: 0.12 },
    { hex: 0x1f4a3a, w: 0.10 },
    { hex: 0xfffaf0, w: 0.06 },
    { hex: 0xcda96d, w: 0.04 },
  ],
};

export const CHRISTMAS_TRACKS = [
  {
    name: '🔔 铃儿响叮当 Pop',
    tempoMs: 250,
    sleighBell: true,
    melody: [
      N.E5, 0, N.E5, 0, N.E5, 0, 0, 0, N.E5, 0, N.E5, 0, N.E5, 0, 0, 0,
      N.E5, 0, N.G5, 0, N.C5, 0, N.D5, 0, N.E5, 0, 0, 0, 0, 0, 0, 0,
      N.F5, 0, N.F5, 0, N.F5, 0, N.F5, 0, N.F5, 0, N.E5, 0, N.E5, 0, N.E5, 0,
      N.E5, 0, N.D5, 0, N.D5, 0, N.E5, 0, N.D5, 0, 0, 0, N.G5, 0, 0, 0,
    ],
    chords: [
      [N.C4, N.E4, N.G4], [N.C4, N.E4, N.G4], [N.F4, N.A4, N.C5], [N.G4, N.B4, N.D5],
    ],
    bass: [N.C3, N.C3, N.F3, N.G3],
  },
  {
    name: '✨ 平安夜星光曲',
    tempoMs: 360,
    sleighBell: false,
    melody: [
      N.G5, 0, N.A5, N.G5, N.E5, 0, 0, 0, N.G5, 0, N.A5, N.G5, N.E5, 0, 0, 0,
      N.D5, 0, 0, N.D5, N.B4, 0, 0, 0, N.C5, 0, 0, N.C5, N.G4, 0, 0, 0,
      N.A4, 0, N.A4, 0, N.C5, 0, N.B4, N.A4, N.G4, 0, N.A4, N.G4, N.E4, 0, 0, 0,
    ],
    chords: [
      [N.C4, N.E4, N.G4], [N.G4, N.B4, N.D5], [N.C4, N.E4, N.G4], [N.F4, N.A4, N.C5],
    ],
    bass: [N.C3, N.G3, N.C3, N.F3],
  },
  {
    name: '🎄 圣诞快乐 Swing',
    tempoMs: 265,
    sleighBell: true,
    melody: [
      N.G4, 0, N.C5, 0, N.C5, N.D5, N.C5, N.B4, N.A4, 0, N.A4, 0, N.A4, 0,
      N.D5, 0, N.D5, N.E5, N.D5, N.C5, N.B4, 0, N.G4, 0, N.G4, 0,
      N.E5, 0, N.E5, N.F5, N.E5, N.D5, N.C5, 0, N.A4, 0, N.G4, N.G4,
      N.A4, 0, N.D5, 0, N.B4, 0, N.C5, 0, 0, 0,
    ],
    chords: [
      [N.C4, N.E4, N.G4], [N.F4, N.A4, N.C5], [N.D4, N.F4, N.A4], [N.G4, N.B4, N.D5],
    ],
    bass: [N.C3, N.F3, N.D3, N.G3],
  },
];

/**
 * Optional on-demand CDN bases for MediaPipe Hands (only requested if user clicks OPEN).
 * Deployers in mainland China can prepend their own self-hosted mirror here.
 */
export const MEDIAPIPE_CDN_BASES = [
  'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/',
  'https://unpkg.com/@mediapipe/hands@0.4.1675469240/',
];
