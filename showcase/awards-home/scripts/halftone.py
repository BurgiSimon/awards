"""Reprint a capture as two offset plates: key dots from darkness at 45°, yellow dots from warmth at 0°.
Usage: python3 scripts/halftone.py <capture.png> <out-prefix> [width] [pitch]
Writes <out-prefix>-k.png and <out-prefix>-y.png, transparent, in the page's two inks (DESIGN.md)."""
import math, sys
from PIL import Image, ImageDraw, ImageFilter

src, out = sys.argv[1], sys.argv[2]
W = int(sys.argv[3]) if len(sys.argv) > 3 else 1200
pitch = float(sys.argv[4]) if len(sys.argv) > 4 else 7.0
KEY = (31, 28, 26, 255)
YEL = (255, 212, 0, 255)

im = Image.open(src).convert('RGB')
H = round(im.height * W / im.width)
im = im.resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
px = im.load()
S = 3  # supersample for clean dot edges

def plate(angle, amount, colour):
    canvas = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(canvas)
    a = math.radians(angle)
    ca, sa = math.cos(a), math.sin(a)
    diag = int(math.hypot(W, H) / pitch) + 2
    for i in range(-diag, diag):
        for j in range(-diag, diag):
            u, v = i * pitch, j * pitch
            x = W / 2 + u * ca - v * sa
            y = H / 2 + u * sa + v * ca
            if not (0 <= x < W and 0 <= y < H):
                continue
            k = amount(px[int(x), int(y)])
            if k <= 0.02:
                continue
            r = pitch * 0.5 * math.sqrt(min(1.0, k)) * 1.08
            d.ellipse([(x - r) * S, (y - r) * S, (x + r) * S, (y + r) * S], fill=colour)
    return canvas.resize((W, H), Image.LANCZOS)

def darkness(c):
    r, g, b = [v / 255 for v in c]
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return max(0.0, (1 - lum) - 0.2) / 0.8  # the paper-white floor keeps the wall open and the type dense

def warmth(c):
    r, g, b = [v / 255 for v in c]
    w = max(0.0, ((r + g) / 2 - b)) * 2.2
    return min(1.0, w)

def save(img, path):
    # Two inks and their anti-aliased edges fit a 32-colour palette with alpha: a fraction of the RGBA bytes.
    img.quantize(colors=32, method=Image.Quantize.FASTOCTREE).save(path, optimize=True)

save(plate(45, darkness, KEY), f'{out}-k.png')
save(plate(0, warmth, YEL), f'{out}-y.png')
print(W, H)
