// Run against an HTTP server; all evidence is written outside the repository.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {load,referenceRank,enumerate} = require('./fixtures.cjs');
const data=load(), fixtures=enumerate(data);
const base=process.env.MAGIC_BASE_URL || 'http://127.0.0.1:4187/WoL_GameLab/';
const isolated=process.env.MAGIC_ISOLATED_URL;
const out=process.env.TEST_OUTPUT_DIR || path.join(os.tmpdir(),'what-is-your-magic-e2e');
fs.mkdirSync(out,{recursive:true});
const report={browser:'Chrome/Chromium via Playwright',base,isolated,checks:[],errors:[],networkFailures:[],responses:[],expectedFailureChecks:[],reachability:{paths:fixtures.total,counts:fixtures.counts},screenshots:[]};
let browser;
async function check(name,fn){await fn();report.checks.push({name,status:'passed'});console.log('PASS '+name);}
async function snap(page,name){await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});report.screenshots.push(name+'.png');}
async function open(viewport,options={}){
  const context=await browser.newContext({viewport,...options});
  const page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
  page.on('requestfailed',r=>report.networkFailures.push({url:r.url(),error:r.failure()?.errorText}));
  page.on('response',r=>{
    const response={url:r.url(),status:r.status()};
    if(!report.responses.some(x=>x.url===response.url&&x.status===response.status))report.responses.push(response);
    if(r.status()>=400)report.networkFailures.push(response);
  });
  return {context,page};
}
async function noOverflow(page){assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'page-wide horizontal overflow');}
async function play(page,witness,{screenshots=false,keyboard=false}={}){
  const remaining=new Map(data.questions.map((q,i)=>[q.text,{q,i}]));
  const scores=Object.fromEntries(Object.keys(data.moves).map(id=>[id,0]));
  for(let step=0;step<10;step++){
    const label=await page.locator('#progress-label').textContent();assert.equal(label,'คำถาม '+(step+1)+' / 10');
    assert.equal(await page.locator('#progress').getAttribute('aria-valuenow'),String(step));
    const text=await page.locator('#quiz-title').textContent();const item=remaining.get(text);assert.ok(item,'question not duplicated');remaining.delete(text);
    if(step===9)assert.equal(item.i,9,'preference question stays last');
    const opt=item.q.options[witness.choices[item.i]];
    assert.equal(await page.locator('#options button').count(),item.q.options.length);
    const texts=await page.locator('#options button>span:last-child').allTextContents();
    assert.deepEqual([...texts].sort(),Array.from(item.q.options,x=>x.text).sort());
    if(screenshots && step===0)await snap(page,'quiz-'+page.viewportSize().width);
    const button=page.locator('#options button').filter({hasText:opt.text});assert.equal(await button.count(),1);
    if(keyboard){await page.keyboard.press('Tab');assert.ok(await page.locator('#options button').first().evaluate(el=>el===document.activeElement));await button.focus();await page.keyboard.press('Enter');}
    else await button.click();
    assert.equal(await button.getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('#quiz-title').textContent(),text,'choice remains visible until Next');
    if(keyboard){await page.locator('#quiz-next').focus();await page.keyboard.press('Enter');}else await page.locator('#quiz-next').click();
    scores[opt.move]+=item.q.weight;
  }
  assert.equal(remaining.size,0);
  assert.equal(await page.locator('#result').isVisible(),true);
  const ranked=referenceRank(scores,data.types),winner=ranked[0];
  assert.equal(await page.locator('#result-title').textContent(),winner.name);
  assert.ok((await page.locator('#result-family').textContent()).includes(data.families[winner.family].title));
  assert.equal(await page.locator('#result-quest-copy').textContent(),winner.quest);
  assert.ok((await page.locator('#result-gift').textContent()).includes(winner.gift));
  assert.equal(await page.locator('#signature .sig').count(),3);
  assert.equal(await page.locator('.angle-card').count(),9);
  for(const [id,n] of Object.entries(scores)){
    const card=page.locator('[data-angle="'+id+'"]');assert.equal(await card.locator('span').textContent(),n+' คะแนน');
    assert.equal(await card.evaluate(el=>el.classList.contains('score-low')),n<=1);
    assert.equal(await card.evaluate(el=>el.classList.contains('is-peak')),n===Math.max(...Object.values(scores))&&n>1);
    assert.ok(Number(await card.locator('.angle-score b').evaluate(el=>getComputedStyle(el).fontWeight))>=600,'bold raw score');
  }
  const expectedAlts=ranked.slice(1,4);
  assert.deepEqual(await page.locator('#alternatives b').allTextContents(),expectedAlts.map(x=>x.name));
  assert.deepEqual(await page.locator('#alternatives>a>span').allTextContents(),expectedAlts.map(x=>x.matchScore+' แต้มจับคู่'));
  assert.equal(await page.locator('#close-note').isVisible(),ranked[0].matchScore-ranked[1].matchScore<=2);
  assert.equal(await page.locator('#result-title').evaluate(el=>el===document.activeElement),true);
  await noOverflow(page);
  if(screenshots)await snap(page,'result-'+page.viewportSize().width);
  return {winner,scores,ranked};
}
(async()=>{
  browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
  const desktop=await open({width:1440,height:1000}),p=desktop.page;
  await check('Landing identity, 5 Families, all dependencies local, no blank/overlay',async()=>{
    await p.goto(base+'what-is-your-magic/');await p.locator('#start:enabled').waitFor();await p.evaluate(()=>document.fonts.ready);
    assert.ok((await p.title()).includes('27 Wizards of Learning'));assert.ok((await p.locator('#main-title').textContent()).includes('27 Wizards'));
    assert.equal(await p.locator('.family').count(),5);
    assert.deepEqual(await p.locator('.family b').allTextContents(),Object.values(data.families).map(x=>x.title));
    assert.equal(await p.locator('#startup-status').isVisible(),false);
    const resources=await p.evaluate(()=>performance.getEntriesByType('resource').map(r=>r.name));
    assert.ok(resources.filter(x=>x.includes('.js')).length>=5);
    assert.ok(!resources.some(x=>x.includes('/9-learning-angles/')),'runtime must not depend on original folder');
    await noOverflow(p);await snap(p,'landing-desktop');
  });
  await check('Start → all 10 original questions → correct scores/result, keyboard',async()=>{
    await p.locator('#start').focus();await p.keyboard.press('Enter');
    await play(p,fixtures.witnesses.bard,{screenshots:true,keyboard:true});
    await p.locator('[data-angle="meaningmaker"]').click();assert.ok((await p.locator('#angle-detail').textContent()).includes(data.moves.meaningmaker.detail));
    await p.locator('[data-angle="synthesizer"]').click();assert.ok((await p.locator('#angle-detail').textContent()).includes(data.moves.synthesizer.detail));
  });
  await check('Share: clipboard success, native success/cancel/failure, manual fallback',async()=>{
    await p.evaluate(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:undefined});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedResult=text}}});});
    await p.locator('#share').click();assert.ok((await p.locator('#share-status').textContent()).includes('คัดลอกข้อความผลลัพธ์แล้ว'));
    assert.ok((await p.evaluate(()=>window.copiedResult)).includes('Bard / Artist Mage'));
    await p.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.sharedResult=data.text}}));
    await p.locator('#share').click();assert.equal(await p.locator('#share-status').textContent(),'แชร์ผลแล้ว');
    assert.ok((await p.evaluate(()=>window.sharedResult)).includes('Bard / Artist Mage'));
    await p.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{throw new DOMException('cancel','AbortError')}}));
    await p.locator('#share').click();assert.equal(await p.locator('#share-status').textContent(),'ยกเลิกการแชร์แล้ว');
    await p.evaluate(()=>{
      Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{throw new Error('not supported')}});
      Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('denied')}}});
    });
    await p.locator('#share').click();assert.equal(await p.locator('#share-fallback').isVisible(),true);
    const text=await p.locator('#share-text').inputValue();assert.ok(text.includes('Bard / Artist Mage'));assert.ok(text.includes('ไม่ใช่ผลวินิจฉัย'));
    assert.ok(text.includes(base+'what-is-your-magic/'));await snap(p,'share-fallback');
  });
  await check('Retake clears scores/share state; quit returns to home',async()=>{
    await p.locator('#retake').click();assert.equal(await p.locator('#progress').getAttribute('aria-valuenow'),'0');
    assert.equal(await p.locator('#share-text').inputValue(),'');assert.equal(await p.locator('#share-status').textContent(),'');
    await play(p,fixtures.witnesses.scholar);
    await p.locator('#retake').click();await p.locator('#quit').click();assert.equal(await p.locator('#home').isVisible(),true);
  });
  await check('All 27 Wizards achieved through actual ten-answer browser journeys',async()=>{
    const gaps=[];
    for(const type of data.types){await p.locator('#start').click();const result=await play(p,fixtures.witnesses[type.id]);assert.equal(result.winner.id,type.id);gaps.push(result.ranked[0].matchScore-result.ranked[1].matchScore);await p.locator('#retake').click();await p.locator('#quit').click();}
    assert.ok(gaps.includes(0),'real answer path with exact tie');
    assert.ok(gaps.some(gap=>gap===1||gap===2),'real answer path with near tie');
    report.reachability.browserWinnerGaps=gaps;
  });
  for(const width of [390,320]){
    const mobile=await open({width,height:844},{isMobile:true,hasTouch:true,reducedMotion:'reduce'}),m=mobile.page;
    await check('Mobile '+width+': landing → 10 questions → result → manual share/retake, no overflow',async()=>{
      await m.goto(base+'what-is-your-magic/');await m.locator('#start:enabled').waitFor();await m.evaluate(()=>document.fonts.ready);
      assert.equal(await m.locator('.family').count(),5);await noOverflow(m);await snap(m,'landing-mobile-'+width);
      await m.locator('#start').tap();await play(m,fixtures.witnesses['holy-knight'],{screenshots:true});
      assert.ok(await m.locator('.sig>div').first().evaluate(el=>el.getBoundingClientRect().width>100),'signature text must remain readable on narrow screens');
      const cards=await m.locator('.angle-card').evaluateAll(items=>items.map(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right})));
      assert.equal(cards.length,9);assert.ok(cards.every(card=>card.left>=0&&card.right<=width),'all nine matrix cards fit the mobile viewport');
      await m.locator('#angle-matrix').scrollIntoViewIfNeeded();await snap(m,'matrix-mobile-'+width);
      await m.evaluate(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:undefined});Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined});});
      await m.locator('#share').tap();assert.equal(await m.locator('#share-fallback').isVisible(),true);await noOverflow(m);
      await m.locator('#retake').tap();assert.equal(await m.locator('#quiz').isVisible(),true);
    });await mobile.context.close();
  }
  if(isolated){
    const standalone=await open({width:1280,height:900});
    await check('Isolated app server root: all local assets and complete playable flow',async()=>{
      await standalone.page.goto(isolated);await standalone.page.locator('#start:enabled').waitFor();assert.equal(await standalone.page.locator('.family').count(),5);
      await standalone.page.locator('#start').click();await play(standalone.page,fixtures.witnesses.ritualist);
    });await standalone.context.close();
  }
  for(const width of [1440,390]){
    const old=await open({width,height:1000}),o=old.page;
    // The unchanged original has no favicon declaration; suppress only its browser-generated favicon request.
    await o.route('**/favicon.ico',r=>r.fulfill({status:204,body:''}));
    await check('Original 9 Learning Angles '+width+': ten questions, result and restart',async()=>{
      await o.goto(base+'9-learning-angles/');await o.locator('#btn-start').click();
      const questions=new Set();
      for(let i=0;i<10;i++){questions.add(await o.locator('.question-text').textContent());assert.ok([3,9].includes(await o.locator('.option-btn').count()));await o.locator('.option-btn').first().click();}
      assert.equal(questions.size,10);assert.equal(await o.locator('#screen-results').isVisible(),true);
      assert.ok((await o.locator('#top-moves-text').textContent()).includes('ความถนัดของคุณคือ'));
      await snap(o,'original-result-'+width);await o.locator('#btn-restart').click();assert.equal(await o.locator('#screen-intro').isVisible(),true);
    });await old.context.close();
  }
  await check('Missing dependency presents visible recovery and disables Start',async()=>{
    const context=await browser.newContext();const fail=await context.newPage();const expected=[];
    fail.on('pageerror',e=>expected.push(e.message));
    await fail.route('**/quiz-data.js*',r=>r.abort());
    await fail.goto(base+'what-is-your-magic/');
    await fail.locator('#startup-status').filter({hasText:'โหลดแบบสอบถามไม่สำเร็จ'}).waitFor();assert.equal(await fail.locator('#start').isDisabled(),true);
    report.expectedFailureChecks.push({case:'aborted quiz-data.js',errors:expected});await snap(fail,'startup-recovery');
    await fail.unroute('**/quiz-data.js*');await fail.reload();await fail.locator('#start:enabled').waitFor();assert.equal(await fail.locator('.family').count(),5);
    await context.close();
  });
  await check('Healthy flows: zero console/runtime errors and zero missing assets/404s',async()=>{
    assert.deepEqual(report.errors,[]);assert.deepEqual(report.networkFailures,[]);
  });
  report.status='passed';
})().catch(e=>{report.status='failed';report.failure=e.stack;console.error(e);process.exitCode=1;}).finally(async()=>{
  fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2));
  console.log('Evidence: '+out);if(browser)await browser.close();
});
