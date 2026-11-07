const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {load,enumerate,referenceRank}=require('./fixtures.cjs');
const data=load(),fixtures=enumerate(data),base=process.env.MAGIC_BASE_URL||'http://127.0.0.1:4187/WoL_GameLab/';
const out=process.env.TEST_OUTPUT_DIR||path.join(os.tmpdir(),'what-is-your-magic-reading-qa');fs.mkdirSync(out,{recursive:true});
const report={checks:[],errors:[],failedRequests:[],screenshots:[]};let browser;
async function check(name,fn){await fn();report.checks.push({name,status:'passed'});console.log('PASS '+name);}
// Make lazy off-screen art eager only for deterministic screenshot capture.
async function snap(page,name,fullPage=false){await page.evaluate(()=>document.fonts.ready);await page.locator('.page.active img').evaluateAll(images=>Promise.all(images.map(img=>{img.loading='eager';return img.decode().catch(()=>{});})));await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.screenshot({path:path.join(out,name+'.png'),fullPage});report.screenshots.push(name+'.png');}
async function page(width){const p=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});p.on('response',r=>{if(r.status()>=400)report.failedRequests.push({url:r.url(),status:r.status()})});p.on('requestfailed',r=>report.failedRequests.push({url:r.url(),error:r.failure()?.errorText}));return p;}
async function noOverflow(p){assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'page horizontal overflow');}
async function quiz(p,id){
  const witness=fixtures.witnesses[id];await p.locator('#start').click();
  for(let i=0;i<10;i++){
    const text=await p.locator('#quiz-title').textContent(),index=data.questions.findIndex(q=>q.text===text);
    await p.locator('#options button').filter({hasText:data.questions[index].options[witness.choices[index]].text}).click();
  }
  assert.equal(await p.locator('#result-title').textContent(),data.types.find(t=>t.id===id).name);return witness;
}
(async()=>{
  browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
  const p=await page(1440);await p.goto(base+'what-is-your-magic/');
  await check('Reference-led landing has illustrated steps and open page rhythm',async()=>{
    await p.evaluate(()=>document.fonts.ready);assert.equal(await p.locator('.step-card').count(),3);assert.equal(await p.locator('.step-illustration svg use').count(),3);await noOverflow(p);await snap(p,'new-landing-desktop',true);
  });
  let witness;
  await check('Hero: archetype sample plus three original signature characters',async()=>{
    witness=await quiz(p,'necromancer');assert.equal(await p.locator('#result-art .hero-angle img').count(),3);
    await p.locator('#result-art .archetype-portrait img').waitFor();assert.equal(await p.locator('#result-art .archetype-portrait img').getAttribute('src'),'assets/archetypes/cutouts/necromancer.png');assert.ok(await p.locator('#result-art .archetype-portrait img').evaluate(async el=>{await el.decode();return el.complete&&el.naturalWidth>0}));
    await p.evaluate(()=>document.fonts.ready);await snap(p,'new-result-hero-desktop');
  });
  await check('Nearby profile link, Browser Back and reload preserve all nine scores',async()=>{
    const first=referenceRank(witness.scores,data.types)[1];
    await p.locator('#alternatives a').first().click();await p.locator('#wizard-profile.active').waitFor();assert.equal(await p.locator('#profile-title').textContent(),first.name);
    assert.ok((await p.locator('#profile-match').textContent()).includes(first.matchScore+' แต้มจับคู่'));
    await p.goBack();await p.locator('#result.active').waitFor();
    await p.reload();await p.locator('#result.active').waitFor();assert.equal(await p.locator('#result-title').textContent(),'Necromancer');
    for(const [id,n]of Object.entries(witness.scores))assert.equal(await p.locator('[data-angle="'+id+'"] .angle-score b').textContent(),String(n));
  });
  await check('Desktop reading chapters are sequential, navigable and roomy',async()=>{
    await p.locator('#result-chapters a[href="#result/matrix"]').click();await p.waitForURL('**/#result/matrix');
    await p.locator('#result-chapters a[href="#result/matrix"][aria-current="location"]').waitFor();
    assert.equal(await p.locator('#result-matrix .angle-card').count(),9);await snap(p,'new-result-matrix-desktop');
    await p.locator('#result-quest').scrollIntoViewIfNeeded();await p.locator('#result-chapters a[href="#result/matrix"]').click();
    assert.ok(await p.locator('#result-matrix').evaluate(el=>el.getBoundingClientRect().top<300),'re-selecting current chapter scrolls back to it');
    const chapters=await p.locator('#result .reading-content .chapter').evaluateAll(els=>els.map(el=>({top:el.getBoundingClientRect().top,height:el.offsetHeight})));
    assert.equal(chapters.length,8);assert.ok(chapters.every((c,i)=>i===0||c.top>chapters[i-1].top+chapters[i-1].height));
    await p.locator('#winner-profile').click();await p.locator('#wizard-profile.active').waitFor();await snap(p,'new-profile-desktop');
  });
  await check('All 27 profile routes render correct source content and reload directly',async()=>{
    for(const type of data.types){
      await p.goto(base+'what-is-your-magic/#wizard/'+type.id);await p.locator('#profile-title').filter({hasText:type.name}).waitFor();
      assert.equal(await p.locator('#profile-description').textContent(),type.desc);
      assert.equal(await p.locator('#profile-art .hero-angle img').count(),3);assert.equal(await p.locator('#profile-art .archetype-portrait img').getAttribute('src'),'assets/archetypes/cutouts/'+type.id+'.png');assert.ok(await p.locator('#profile-art .archetype-portrait img').evaluate(async img=>{await img.decode();return img.naturalWidth===512&&img.naturalHeight>600}));
      assert.equal(await p.locator('.profile-signature-row').count(),3);
      assert.equal(await p.locator('#profile-strength .large-copy').textContent(),type.gift);
      assert.equal(await p.locator('#profile-strength #profile-development').textContent(),data.guidance[type.id].develop);
      assert.equal(await p.locator('#profile-quest p').textContent(),data.guidance[type.id].quest);
      assert.equal(await p.locator('#profile-related .wizard-card').count(),3);await noOverflow(p);
    }
    await p.reload();await p.locator('#wizard-profile.active').waitFor();assert.equal(await p.locator('#profile-title').textContent(),'Blood Mage');
  });
  await check('Catalog has 27 distinct profile links and working Family filters',async()=>{
    await p.goto(base+'what-is-your-magic/#wizards');await p.locator('#wizards.active').waitFor();assert.equal(await p.locator('#wizard-groups .wizard-card').count(),27);assert.equal(await p.locator('#wizard-groups .card-portrait').count(),27);
    assert.equal(new Set(await p.locator('#wizard-groups .wizard-card').evaluateAll(items=>items.map(a=>a.hash))).size,27);
    await snap(p,'new-catalog-desktop');
    await p.locator('[data-family-filter="B"]').click();await p.locator('[data-family-filter="B"][aria-current="page"]').waitFor();assert.equal(await p.locator('#wizard-groups .wizard-card').count(),7);
    await p.locator('[data-family-filter="all"]').click();await p.locator('[data-family-filter="all"][aria-current="page"]').waitFor();assert.equal(await p.locator('#wizard-groups .wizard-card').count(),27);
  });
  await check('Invalid profile and family routes offer a real catalog recovery',async()=>{
    for(const hash of ['#wizard/unknown','#wizards/nope']){await p.goto(base+'what-is-your-magic/'+hash);await p.locator('#not-found.active').waitFor();assert.equal(await p.locator('#missing-title').textContent(),'ยังไม่พบ Wizard สายนี้');}
    await p.locator('#not-found a').click();await p.locator('#wizards.active').waitFor();
  });
  for(const width of [390,320]){
    const m=await page(width);await m.setViewportSize({width,height:844});await m.goto(base+'what-is-your-magic/');
    await check('Mobile '+width+': full 3×3 matrix, original images, faded 0–1, all tied highs',async()=>{
      await quiz(m,'necromancer');await m.evaluate(()=>document.fonts.ready);await snap(m,'new-result-hero-mobile-'+width);
      await m.locator('#result-chapters-select').selectOption('#result/matrix');await m.locator('.matrix').scrollIntoViewIfNeeded();
      await noOverflow(m);
      const cells=await m.locator('.angle-card').evaluateAll(items=>items.map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,score:Number(el.querySelector('b').textContent),low:el.classList.contains('score-low'),peak:el.classList.contains('is-peak'),filter:getComputedStyle(el.querySelector('img')).filter,src:el.querySelector('img').getAttribute('src')};}));
      assert.equal(cells.length,9);assert.equal(new Set(cells.map(c=>Math.round(c.left))).size,3);assert.equal(new Set(cells.map(c=>Math.round(c.top))).size,3);
      assert.ok(cells.every(c=>c.left>=0&&c.right<=width&&c.top>=0&&c.bottom<=844),'all nine cells visible together');
      for(const cell of cells){assert.equal(cell.low,cell.score<=1);assert.ok(cell.src.startsWith('assets/characters/'));if(cell.low)assert.ok(cell.filter.includes('grayscale(1)'));}
      const high=Math.max(...cells.map(c=>c.score));assert.equal(cells.filter(c=>c.peak).length,cells.filter(c=>c.score===high).length);
      await snap(m,'new-matrix-mobile-'+width);await m.locator('.matrix').screenshot({path:path.join(out,'matrix-detail-'+width+'.png')});report.screenshots.push('matrix-detail-'+width+'.png');
      await m.locator('#winner-profile').click();await m.locator('#wizard-profile.active').waitFor();assert.equal(await m.locator('#profile-art .hero-angle img').count(),3);await noOverflow(m);await snap(m,'new-profile-mobile-'+width);
      await m.reload();await m.locator('#wizard-profile.active').waitFor();await m.locator('.return-result').click();await m.locator('#result.active').waitFor();assert.equal(await m.locator('#result-title').textContent(),'Necromancer');
    });await m.close();
  }
  await check('No runtime/console errors, 404s or failed assets on new routes',async()=>{assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedRequests,[]);});
  report.status='passed';
})().catch(e=>{report.status='failed';report.failure=e.stack;process.exitCode=1;console.error(e);}).finally(async()=>{fs.writeFileSync(path.join(out,'profile-results.json'),JSON.stringify(report,null,2));if(browser)await browser.close();console.log('Evidence: '+out);});
