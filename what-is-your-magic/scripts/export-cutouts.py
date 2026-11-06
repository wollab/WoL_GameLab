"""Validate Image Gen cutouts and resize PNG delivery copies. Never remove backgrounds here."""
from pathlib import Path
from PIL import Image, ImageChops, ImageStat
import hashlib
import html
import json

app = Path(__file__).resolve().parents[1]
sources = sorted((app / 'assets/cutout-provenance').glob('*.json'))
records = [json.loads(p.read_text(encoding='utf-8')) for p in sources]
families = {p['id']: p['family'] for p in json.loads((app / 'assets/archetypes/artwork-manifest.json').read_text(encoding='utf-8'))['portraits']}
assert len(records) == 36, f'Expected all 27 Wizards + 9 angles, found {len(records)}'
assert len({(r['kind'], r['id']) for r in records}) == 36
for record in records:
    if record['kind'] == 'archetype':
        record['family'] = families[record['id']]
    original = app / record['sourceOriginal']
    master = app / record['master']
    original_bytes, master_bytes = original.read_bytes(), master.read_bytes()
    with Image.open(master) as image, Image.open(original) as before:
        assert image.mode == 'RGBA', f"No RGBA: {record['id']}"
        assert abs(image.width / image.height - before.width / before.height) < .01, f"Extraction changed aspect: {record['id']}"
        alpha = image.getchannel('A')
        histogram = alpha.histogram()
        transparent_fraction = histogram[0] / (image.width * image.height)
        assert alpha.getextrema()[0] == 0 and alpha.getextrema()[1] >= 250 and transparent_fraction > .1, f"Missing transparency: {record['id']}"
        opaque = alpha.point(lambda value: 255 if value >= 250 else 0)
        comparison = before.convert('RGB').resize(image.size, Image.Resampling.LANCZOS)
        difference = ImageChops.difference(comparison, image.convert('RGB'))
        record['solidCoreRgbMeanDifference'] = [round(v, 4) for v in ImageStat.Stat(difference, mask=opaque).mean]
        record['solidPixelFraction'] = round(sum(histogram[250:]) / (image.width * image.height), 4)
        assert record['solidPixelFraction'] > .05, f"Character too translucent: {record['id']}"
        record['dimensions'] = list(image.size)
        record['originalDimensions'] = list(before.size)
        record['transparentFraction'] = round(transparent_fraction, 4)
        record['masterSha256'] = hashlib.sha256(master_bytes).hexdigest()
        record['sourceSha256'] = hashlib.sha256(original_bytes).hexdigest()
        delivery = image.copy()
        delivery.thumbnail((512, 768), Image.Resampling.LANCZOS)
        web = app / record['web']
        web.parent.mkdir(parents=True, exist_ok=True)
        delivery.save(web, 'PNG', optimize=True)
        record['webDimensions'] = list(delivery.size)
        record['webBytes'] = web.stat().st_size
    assert original.read_bytes() == original_bytes and master.read_bytes() == master_bytes

manifest = {'tool':'Built-in image_gen background extraction', 'status':'All 36 RGBA cutouts exported; inspect visual edges separately', 'export':'PNG, preserve alpha/aspect, width at most512, no source-master edits', 'assets':records}
(app / 'assets/cutouts.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f"Exported {len(records)} transparent PNGs, {sum(r['webBytes'] for r in records):,} bytes; original source/master bytes unchanged.")

# A named native HTML handoff gallery; CSS backgrounds reveal actual transparency.
cards = []
for record in records:
    if record['kind'] != 'archetype':
        continue
    name = html.escape(record['name'])
    relative = 'cutouts/' + record['id'] + '.png'
    cards.append(f'<figure><a href="{relative}" download><img src="{relative}" alt="{name}" width="{record["webDimensions"][0]}" height="{record["webDimensions"][1]}"></a><figcaption><b>{name}</b><small>Family {record["family"]}</small><br><a href="{relative}" download>บันทึก PNG โปร่งใส</a></figcaption></figure>')
style = '@font-face{font-family:Kanit;src:url(../fonts/Kanit-Regular.ttf)}*{box-sizing:border-box}body{margin:0;color:#26243b;font:16px/1.6 Kanit,sans-serif}header,footer{padding:24px 32px}h1{margin:0}.cast{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:20px;padding:24px}figure{margin:0;text-align:center;border:1px solid #dedbe8;border-radius:12px;padding:14px;background:#f0eefb}img{display:block;width:100%;height:260px;object-fit:contain}figcaption b{display:block;font-size:18px}a{color:#5547a1}body:has(#dark:checked) figure{background:#26243b;color:white}body:has(#dark:checked) figure a{color:#cfcbff}label{display:inline-flex;gap:12px;align-items:center}input{width:22px;height:22px}@media(max-width:520px){.cast{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:12px}img{height:210px}h1{font-size:28px}figcaption b{font-size:15px}figcaption a{font-size:12px}}'
page = '<!doctype html><html lang="th"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>27 Wizards · Transparent PNG Gallery</title><link rel="icon" href="../brand/wol-logo.png"><style>' + style + '</style><header><h1>27 Wizards of Learning</h1><p>PNG พื้นหลังโปร่งใส · กดแต่ละตัวเพื่อบันทึกภาพ</p><label><input id="dark" type="checkbox">ดูบนพื้นหลังเข้ม</label></header><main class="cast">' + ''.join(cards) + '</main><footer><a href="../../#wizards">กลับไปสำรวจ Wizard ทั้ง 27 สาย →</a></footer></html>'
(app / 'assets/archetypes/contact-sheet.html').write_text(page, encoding='utf-8')
