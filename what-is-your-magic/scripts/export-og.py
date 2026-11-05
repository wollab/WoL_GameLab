"""Resize/format the approved OG raster master; never alter its composition."""
from pathlib import Path
from PIL import Image
import hashlib
import json

folder = Path(__file__).resolve().parents[1] / 'assets' / 'social'
manifest_path = folder / 'og-image.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
master = folder / manifest['master']
original = master.read_bytes()
with Image.open(master) as source:
    manifest['masterDimensions'] = list(source.size)
    # Image Gen matched the requested ratio; the tiny rounding difference
    # is resampled directly, with no cropping or compositing.
    assert abs(source.width / source.height - 1200 / 630) < 0.01
    source.convert('RGB').resize((1200, 630), Image.Resampling.LANCZOS).save(
        folder / manifest['web'], 'JPEG', quality=90, optimize=True)
assert master.read_bytes() == original
manifest['masterSha256'] = hashlib.sha256(original).hexdigest()
manifest['webBytes'] = (folder / manifest['web']).stat().st_size
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f"OG export: 1200x630 JPEG, {manifest['webBytes']:,} bytes; master unchanged")
