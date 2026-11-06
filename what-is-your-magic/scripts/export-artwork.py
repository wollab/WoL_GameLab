"""Export lightweight web copies/contact sheet without changing source PNGs."""
from pathlib import Path
from PIL import Image
import hashlib
import html
import json

root = Path(__file__).resolve().parents[1] / 'assets' / 'archetypes'
manifest_path = root / 'artwork-manifest.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8-sig'))
cards = []
for item in manifest['portraits']:
    master = root / item['master']
    original = master.read_bytes()
    with Image.open(master) as image:
        size = image.size
        image = image.convert('RGB')
        image = image.resize((512, round(image.height * 512 / image.width)), Image.Resampling.LANCZOS)
        target = root / (item['id'] + '.webp')
        image.save(target, 'WEBP', quality=88, method=6)
    assert master.read_bytes() == original, 'Source PNG changed'
    item['masterSha256'] = hashlib.sha256(original).hexdigest()
    item['masterDimensions'] = list(size)
    item['web'] = target.name
    item['webBytes'] = target.stat().st_size
    name = html.escape(item['name'])
    cards.append(f'<figure><a href="{target.name}"><img src="{target.name}" alt="{name}" width="512" height="640"></a><figcaption><b>{name}</b><small>Family {item["family"]}</small></figcaption></figure>')

manifest['export'] = {'format': 'WebP', 'width': 512, 'quality': 88, 'sourcePngsModified': False}
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
style = '''@font-face{font-family:Kanit;src:url(../fonts/Kanit-Regular.ttf)}@font-face{font-family:Kanit;src:url(../fonts/Kanit-SemiBold.ttf);font-weight:600}*{box-sizing:border-box}body{margin:0;background:#fff;color:#26243b;font:16px/1.5 Kanit,sans-serif}header{padding:32px 40px 20px;border-bottom:2px solid #e5e2ef}h1{margin:0;font-size:38px;font-weight:600}header p{margin:6px 0;color:#626178}.cast{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:20px;padding:28px 32px}figure{margin:0;text-align:center;border-bottom:1px solid #e5e2ef;padding:12px 8px 20px}img{width:100%;height:270px;object-fit:contain}figcaption b{display:block;font-size:18px;font-weight:600}small{display:block;color:#626178;margin-top:6px}footer{padding:20px 40px;border-top:1px solid #e5e2ef}a{color:#5d4bc4}@media(max-width:900px){.cast{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:550px){.cast{grid-template-columns:repeat(2,minmax(0,1fr));padding:16px;gap:12px}img{height:220px}h1{font-size:28px}header{padding:24px}figcaption b{font-size:16px}}'''
page = '<!doctype html><html lang="th"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>27 Wizards of Learning · Character Gallery</title><link rel="icon" href="../brand/wol-logo.png" type="image/png"><style>' + style + '</style><header><h1>27 Wizards of Learning</h1><p>What Is Your Learning Magic? · 27 Wizard Archetypes</p></header><main class="cast">' + ''.join(cards) + '</main><footer><a href="../../#wizards">สำรวจ Wizard ทั้ง 27 สาย →</a></footer></html>'
# Transparent gallery is owned by export-cutouts.py once cutouts are available.
# Re-exporting historical WebPs must not replace the current PNG handoff.
if not (root.parent / 'cutouts.json').exists():
    (root / 'contact-sheet.html').write_text(page, encoding='utf-8')
print(f'Exported {len(cards)} web portraits; {sum(x["webBytes"] for x in manifest["portraits"]):,} bytes total. Source PNGs unchanged.')
