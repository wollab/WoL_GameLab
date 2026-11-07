// Regression checks for the observed 2026-11-05 UX audit findings.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {load,enumerate,referenceRank}=require('./fixtures.cjs');
const data=load(),fixtures=enumerate(data),base=(process.env.MAGIC_BASE_URL||'http://127.0.0.1:4187/WoL_GameLab/')+'what-is-your-magic/';
const out=process.env.TEST_OUTPUT_DIR||path.join(os.tmpdir(),'magic-audit');fs.mkdirSync(out,{recursive:true});
const report={checks:[],errors:[],requests:[],measurements:[]};let browser;
const original=id=>({communicator:'meaningmaker',summarizer:'synthesizer'}[id]||id);
async function check(name,fn){await fn();report.checks.push({name,status:'passed'});console.log('PASS '+name);}
async function play(p,witness){await p.locator('#start').click();for(let i=0;i<10;i++){const text=await p.locator('#quiz-title').textContent(),q=data.questions.findIndex(q=>q.text===text);await p.locator('#options button').filter({hasText:data.questions[q].options[witness.choices[q]].text}).click();}}
function contrast(a,b){const lum=s=>s.match(/[\d.]+/g).slice(0,3).map(Number).map(n=>n/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4).reduce((n,c,i)=>n+c*[.2126,.7152,.0722][i],0);const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
(async()=>{
  browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
  const p=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});p.on('response',r=>{if(r.status()>=400)report.requests.push({url:r.url(),status:r.status()})});p.on('requestfailed',r=>report.requests.push(r.url()));
  await p.goto(base);
  await check('Answers advance immediately, and Back retains the option and supports Next',async()=>{
    await p.locator('#start').click();assert.ok(await p.locator('#quiz-next').isDisabled());assert.ok(await p.locator('#quiz-prev').isDisabled());
    const title=await p.locator('#quiz-title').textContent(),buttons=p.locator('#options button');
    const selected=await buttons.first().textContent();
    await buttons.first().click();const secondTitle=await p.locator('#quiz-title').textContent();assert.notEqual(secondTitle,title);
    await p.locator('#quiz-prev').click();assert.equal(await p.locator('#quiz-title').textContent(),title);assert.equal(await p.locator('#options button[aria-pressed=true]').textContent(),selected);
    await p.locator('#quiz-next').click();assert.equal(await p.locator('#quiz-title').textContent(),secondTitle);
    await p.locator('#quiz-prev').click();const revised=await buttons.nth(1).textContent();await buttons.nth(1).click();
    assert.equal(await p.locator('#quiz-title').textContent(),secondTitle);await p.locator('#quiz-prev').click();
    assert.equal(await p.locator('#options button[aria-pressed=true]').textContent(),revised);
    const scores=Object.fromEntries(Object.keys(data.moves).map(id=>[id,0]));
    for(let i=0;i<10;i++){
      const text=await p.locator('#quiz-title').textContent(),q=data.questions.find(q=>q.text===text),choiceText=await p.locator('#options button>span:last-child').first().textContent(),opt=q.options.find(o=>o.text===choiceText);
      await p.locator('#options button').first().click();scores[opt.move]+=q.weight;
    }
    assert.equal(Object.values(scores).reduce((n,x)=>n+x,0),19);for(const [id,n]of Object.entries(scores))assert.equal(await p.locator('[data-angle="'+id+'"] .angle-score b').textContent(),String(n));assert.equal(await p.locator('#result-title').textContent(),referenceRank(scores,data.types)[0].name);
  });
  let witness,type;
  await check('Zero-score signature is explicitly distinguished from actual answers; close match visible in hero',async()=>{
    for(const t of data.types){const w=fixtures.witnesses[t.id];if(t.sig.some(id=>w.scores[original(id)]===0)&&referenceRank(w.scores,data.types)[0].matchScore-referenceRank(w.scores,data.types)[1].matchScore<=2){witness=w;type=t;break;}}
    assert.ok(witness);await p.goto(base+'#home');await play(p,witness);const reason=await p.locator('#result-reason').textContent();assert.ok(reason.includes('ได้ 0 คะแนน'));assert.ok(reason.includes('ไม่ใช่พฤติกรรมที่คุณเลือก'));assert.ok(!reason.includes('เพราะคุณใช้มุม'));
    for(const id of type.sig.filter(id=>witness.scores[original(id)]===0))assert.ok(reason.includes(data.moves[original(id)].thai));
    assert.ok(await p.locator('#hero-close-note').isVisible());assert.equal(await p.locator('#hero-close-note a').getAttribute('href'),'#result/nearby');
    await p.locator('#hero-close-note a').click();await p.locator('#result-nearby h2').waitFor();assert.ok(await p.locator('#result-nearby h2').evaluate(el=>el===document.activeElement));
  });
  await check('Mobile chapters expose all destinations, land below sticky bars, matrix labels pass contrast',async()=>{
    for(const width of [390,320]){
      await p.setViewportSize({width,height:844});const select=p.locator('#result-chapters-select');assert.ok(await select.isVisible());assert.equal(await select.locator('option').count(),6);
      await select.selectOption('#result/matrix');await p.waitForURL('**/#result/matrix');const top=await p.locator('#result-matrix').evaluate(el=>el.getBoundingClientRect().top);assert.ok(top>=158&&top<=195,'single scroll offset: '+top);assert.ok(await p.locator('#result-matrix h2').evaluate(el=>el===document.activeElement));
      const low=await p.locator('.score-low').first().evaluate(el=>({fg:getComputedStyle(el.querySelector('strong')).color,bg:getComputedStyle(el).backgroundColor}));assert.ok(contrast(low.fg,low.bg)>=4.5);const badge=await p.locator('.peak-label').first().evaluate(el=>({fg:getComputedStyle(el).color,bg:getComputedStyle(el).backgroundColor,size:parseFloat(getComputedStyle(el).fontSize)}));assert.ok(badge.size>=10);assert.ok(contrast(badge.fg,badge.bg)>=4.5);
      report.measurements.push({width,chapterTop:top,lowLabelContrast:contrast(low.fg,low.bg),badgeContrast:contrast(badge.fg,badge.bg),badgeSize:badge.size});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await select.selectOption('#result/quest');await p.waitForURL('**/#result/quest');await select.selectOption('#result/matrix');await p.waitForURL('**/#result/matrix');
    }
    await p.locator('#winner-profile').click();await p.locator('#wizard-profile.active').waitFor();assert.equal(await p.locator('#profile-chapters-select option').count(),5);await p.locator('#profile-chapters-select').selectOption('#wizard/'+type.id+'/signature');await p.waitForURL('**/signature');assert.ok(await p.locator('#profile-signature h2').evaluate(el=>el===document.activeElement));
  });
  await check('Catalog searches names/Thai angles, combines Family, recovers empty results and retains input focus',async()=>{
    await p.goto(base+'#wizards');const search=p.locator('#catalog-search');await search.fill('Necromancer');assert.equal(await p.locator('#wizard-groups .wizard-card').count(),1);assert.ok(await search.evaluate(el=>el===document.activeElement));assert.ok((await p.locator('#catalog-status').textContent()).includes('พบ 1 จาก 27'));
    await p.locator('#catalog-clear').click();assert.equal(await p.locator('#wizard-groups .wizard-card').count(),27);await search.fill('นักทบทวน');assert.ok(await p.locator('#wizard-groups .wizard-card').count()>1);
    await search.fill('not-a-wizard');assert.equal(await p.locator('#wizard-groups .wizard-card').count(),0);assert.ok(await p.locator('.catalog-empty').isVisible());await p.locator('.catalog-empty a').click();assert.equal(await search.inputValue(),'');assert.equal(await p.locator('#wizard-groups .wizard-card').count(),27);
    await p.locator('[data-family-filter="B"]').click();await p.waitForURL('**/#wizards/B');await search.fill('Necromancer');assert.equal(await p.locator('#wizard-groups .wizard-card').count(),0);await p.locator('.catalog-empty a').click();await p.waitForURL('**/#wizards');assert.equal(await p.locator('#wizard-groups .wizard-card').count(),27);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  });
  await check('Audit regression journey has no console/runtime errors or failed assets',async()=>{assert.deepEqual(report.errors,[]);assert.deepEqual(report.requests,[]);});
  report.status='passed';
})().catch(e=>{report.status='failed';report.failure=e.stack;process.exitCode=1;console.error(e);}).finally(async()=>{fs.writeFileSync(path.join(out,'audit-results.json'),JSON.stringify(report,null,2));if(browser)await browser.close();console.log('Evidence: '+out);});
