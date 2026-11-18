"""Regenerate original, non-Discord artwork. Requires Python 3 and Pillow.
No downloaded artwork, trademarks, fonts, or private data are used.
"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SCALE = 4


def icon(size):
    image = Image.new("RGBA", (512, 512))
    draw = ImageDraw.Draw(image)
    # Exactly 16px transparent padding in the 128px export.
    draw.rounded_rectangle((64, 64, 447, 447), radius=88, fill="#087e8b")
    # Original outbound-link mark: open corner with an arrow.
    draw.line([(224, 196), (164, 196), (164, 348), (316, 348), (316, 288)],
              fill="white", width=28, joint="curve")
    draw.line([(236, 276), (348, 164)], fill="white", width=28)
    draw.line([(256, 164), (348, 164), (348, 256)], fill="white", width=28, joint="curve")
    resized = image.resize((size, size), Image.Resampling.LANCZOS)
    # Trim resampling halos so the required transparent padding stays exact.
    margin = size // 8
    padded = Image.new("RGBA", (size, size))
    padded.paste(resized.crop((margin, margin, size-margin, size-margin)), (margin, margin))
    return padded


for size in (16, 32, 48, 128):
    dest = ROOT / f"extension/icons/icon-{size}.png"
    dest.parent.mkdir(parents=True, exist_ok=True)
    icon(size).save(dest)
assets = ROOT / "store/assets"
assets.mkdir(parents=True, exist_ok=True)
icon(128).save(assets / "store-icon-128.png")
for name, width, height in [("promo-small", 440, 280), ("promo-marquee", 1400, 560)]:
    image = Image.new("RGB", (width * SCALE, height * SCALE), "#102d39")
    draw = ImageDraw.Draw(image)
    w, h = image.size
    # Illustrative artwork, deliberately not an application screenshot.
    draw.line([(0, h * .74), (w * .31, h * .74), (w * .69, h * .26), (w, h * .26)],
              fill="#196375", width=20 * SCALE, joint="curve")
    mark = icon(int(h * .90))
    image.paste(mark, ((w-mark.width)//2, (h-mark.height)//2), mark)
    image.resize((width, height), Image.Resampling.LANCZOS).save(assets / f"{name}.png")
print("Generated four runtime icons, store icon, and two illustrative promotional tiles.")
