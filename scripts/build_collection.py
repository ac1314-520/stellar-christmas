"""Build the Christmas gallery image set and data from the Stellar Archive."""

from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps

ROOT = Path(__file__).resolve().parents[1]
STELLAR = Path(r"E:\deepseek工作区\starlit-archive")
DATA_FILE = STELLAR / "js" / "collection-data.js"
FULL_DIR = STELLAR / "assets" / "photos" / "full"
OUT_DIR = ROOT / "assets" / "collection"
THUMB_DIR = OUT_DIR / "thumbs"
DATA_OUT = ROOT / "src" / "collection-data.js"

CROP = (100, 120, 1100, 1380)


def load_collection() -> list[dict]:
    raw = DATA_FILE.read_text(encoding="utf-8")
    match = re.search(r"window\.STELLAR_DATA\s*=\s*(\[[\s\S]*?\]);", raw)
    if not match:
        raise SystemExit("Could not parse collection-data.js")
    return json.loads(match.group(1))


def build_image(src: Path, dst: Path, thumb: Path) -> None:
    with Image.open(src) as image:
        image = image.convert("RGB")
        image = image.crop(CROP)
        image = ImageOps.fit(image, (660, 804), method=Image.Resampling.LANCZOS)
        image = ImageEnhance.Color(image).enhance(0.94)
        image = ImageEnhance.Contrast(image).enhance(1.02)
        image = ImageEnhance.Brightness(image).enhance(0.985)
        dst.parent.mkdir(parents=True, exist_ok=True)
        image.save(dst, "WEBP", quality=84, method=6)
        thumb_image = ImageOps.fit(image, (300, 366), method=Image.Resampling.LANCZOS)
        thumb_image.save(thumb, "WEBP", quality=82, method=6)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    THUMB_DIR.mkdir(parents=True, exist_ok=True)
    collection = load_collection()
    records = []
    for item in collection:
        code = item["code"]
        number = re.sub(r"\D", "", code)
        src = FULL_DIR / f"{number}.webp"
        if not src.exists():
            raise SystemExit(f"Missing {src}")
        dst = OUT_DIR / f"{number}.webp"
        thumb = THUMB_DIR / f"{number}.webp"
        build_image(src, dst, thumb)
        records.append({
            "id": item["id"],
            "code": code,
            "title": item["title"],
            "series": item["series"],
            "collection": item["collection"],
            "story": item["story"],
            "accent": item.get("accent", "#cda96d"),
            "image": f"./assets/collection/{number}.webp?v=20261121a",
            "thumb": f"./assets/collection/thumbs/{number}.webp?v=20261121a",
        })
    if len(records) != 84:
        raise SystemExit(f"Expected 84 records, got {len(records)}")
    payload = "/* 星屿藏馆 · Christmas 3D collection data. Generated from starlit-archive. */\n"
    payload += "export const COLLECTION = " + json.dumps(records, ensure_ascii=False, indent=2) + ";\n"
    payload += "export const COLLECTION_SIZE = COLLECTION.length;\n"
    DATA_OUT.write_text(payload, encoding="utf-8")
    print(f"built {len(records)} images in {OUT_DIR}")
    print(f"wrote {DATA_OUT}")


if __name__ == "__main__":
    main()
