from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "src" / "config.js"
text = CONFIG.read_text(encoding="utf-8")

text = text.replace(
    "export const HOLIDAY_YEAR = new Date().getFullYear();",
    "import { COLLECTION } from './collection-data.js';\n\nexport const HOLIDAY_YEAR = new Date().getFullYear();",
)

brand = """export const BRAND_CONFIG = {
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
"""
text = re.sub(
    r"export const BRAND_CONFIG = \{[\s\S]*?\n\};",
    brand,
    text,
    count=1,
)
text = re.sub(
    r"export const DEFAULT_PHOTOS = \[[\s\S]*?\n\];",
    "",
    text,
    count=1,
)

stellar = """
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
"""
marker = "export const CHRISTMAS_TRACKS = ["
if marker not in text:
    raise SystemExit("track marker missing")
text = text.replace(marker, stellar + "\n" + marker, 1)

# Keep the existing music and gesture config. The sample photo entries are gone.
CONFIG.write_text(text, encoding="utf-8")
print("prepared", CONFIG)
