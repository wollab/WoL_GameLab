"""Format/resize family scenes only; retain original generated PNG bytes."""
from pathlib import Path
from PIL import Image
import hashlib
import json

root = Path(__file__).resolve().parents[1] / 'assets' / 'families'
manifest = json.loads((root / 'scenes.json').read_text(encoding='utf-8'))
for scene in manifest['scenes']:
    source = root / scene['master']
    raw = source.read_bytes()
    with Image.open(source) as image:
        scene['masterDimensions'] = list(image.size)
        image = image.convert('RGB')
        image.thumbnail((1200, 800), Image.Resampling.LANCZOS)
        image.save(root / scene['web'], 'WEBP', quality=86, method=6)
    scene['masterSha256'] = hashlib.sha256(raw).hexdigest()
    scene['webBytes'] = (root / scene['web']).stat().st_size
    assert source.read_bytes() == raw
(root / 'scenes.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Exported five family scenes; original PNG masters retained unchanged.')
