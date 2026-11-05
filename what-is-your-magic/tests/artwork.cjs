const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = (process.env.MAGIC_BASE_URL || 'http://127.0.0.1:4187/WoL_GameLab/') + 'what-is-your-magic/';
const out = process.env.TEST_OUTPUT_DIR;
if (!out) throw new Error('Set TEST_OUTPUT_DIR for artwork evidence');
fs.mkdirSync(out, { recursive: true });
const report = { checks: [], errors: [], failedRequests: [] };
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const p = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    p.on('pageerror', e => report.errors.push(e.message));
    p.on('console', m => { if (m.type() === 'error') report.errors.push(m.text()); });
    p.on('response', r => { if (r.status() >= 400) report.failedRequests.push({ url: r.url(), status: r.status() }); });
    p.on('requestfailed', r => report.failedRequests.push({ url: r.url(), error: r.failure()?.errorText }));
    for (const width of [1440, 390, 320]) {
      await p.setViewportSize({ width, height: 1000 });
      await p.goto(base);
      await p.locator('#start').waitFor({ state: 'visible' });
      await p.evaluate(() => document.fonts.ready);
      assert.equal(await p.locator('.family').count(), 5);
      assert.equal(new Set(await p.locator('.family h3').allTextContents()).size, 5);
      for (const [i, family] of (await p.locator('.family').all()).entries()) {
        await family.scrollIntoViewIfNeeded();
        assert.equal(await family.locator('figure').count(), 3);
        assert.equal(await family.locator('figcaption').count(), 3);
        await family.locator('img').evaluateAll(imgs => Promise.all(imgs.map(img => img.decode())));
        assert.ok((await family.locator('.family-example').innerText()).includes('เมื่อเจอโจทย์ใหม่'));
        assert.equal(await family.getAttribute('href'), '#wizards/' + 'ABCDE'[i]);
        assert.ok(await family.locator('img').evaluateAll(imgs => imgs.every(img => {
          const r = img.getBoundingClientRect();
          return img.naturalWidth === 512 && r.left >= 0 && r.right <= innerWidth;
        })));
      }
      assert.ok(await p.locator('header .brand-logo').evaluate(async img => {
        await img.decode(); const r = img.getBoundingClientRect();
        return img.naturalWidth === 1024 && r.width === r.height && r.left >= 0 && r.right <= innerWidth;
      }));
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await p.locator('.family').first().scrollIntoViewIfNeeded();
      await p.screenshot({ path: path.join(out, `families-${width}.png`) });
      report.checks.push({ name: `Families, three named portraits per row, logo and no overflow at ${width}px`, status: 'passed' });
    }
    await p.setViewportSize({ width: 1440, height: 1000 });
    await p.goto(base + 'assets/archetypes/contact-sheet.html');
    await p.evaluate(() => document.fonts.ready);
    assert.equal(await p.locator('figure').count(), 27);
    assert.equal(new Set(await p.locator('figcaption b').allTextContents()).size, 27);
    await p.locator('figure img').evaluateAll(imgs => Promise.all(imgs.map(img => img.decode())));
    await p.screenshot({ path: path.join(out, 'contact-sheet.png'), fullPage: true });
    report.checks.push({ name: 'Named gallery decodes all 27 distinct portraits', status: 'passed' });
    assert.deepEqual(report.errors, []); assert.deepEqual(report.failedRequests, []);
    report.status = 'passed';
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(out, 'artwork-results.json'), JSON.stringify(report, null, 2));
  }
  console.log(JSON.stringify(report, null, 2));
})().catch(e => { console.error(e); process.exitCode = 1; });
