const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {load,enumerate,app}=require('./fixtures.cjs');
const data=load(),fixtures=enumerate(data),root=(process.env.MAGIC_BASE_URL||'http://127.0.0.1:4189/')+'what-is-your-magic/';
const out=process.env.TEST_OUTPUT_DIR;if(!out)throw Error('Set TEST_OUTPUT_DIR');fs.mkdirSync(out,{recursive:true});
const report={checks:[],errors:[],requests:[],alpha:[],screenshots:[]};let browser;
async function check(name,fn){await fn();report.checks.push({name,status:'passed'});console.log('PASS '+name)}
async function snap(p,name,fullPage=false){await p.screenshot({path:path.join(out,name+'.png'),fullPage});report.screenshots.push(name+'.png')}
(async()=>{
 browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});const p=await browser.newPage({viewport:{width:1440,height:1000}});
 p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});p.on('response',r=>{if(r.status()>=400)report.requests.push({url:r.url(),status:r.status()})});p.on('requestfailed',r=>report.requests.push({url:r.url(),error:r.failure()?.errorText}));
 await p.goto(root);await p.locator('#start:enabled').waitFor();
 await check('All 27 Wizard and nine Learning Angle PNGs decode with actual alpha and intact solid regions',async()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(app,'assets/cutouts.json'),'utf8'));assert.equal(manifest.assets.length,36);
  const results=await p.evaluate(async assets=>{const rows=[];for(const asset of assets){const i=new Image();i.src=new URL(asset.web,location.href).href;await i.decode();const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;const ctx=c.getContext('2d');ctx.drawImage(i,0,0);const pixels=ctx.getImageData(0,0,c.width,c.height).data;let transparent=0,solid=0;for(let x=3;x<pixels.length;x+=4){if(pixels[x]===0)transparent++;if(pixels[x]>=250)solid++}rows.push({id:asset.id,kind:asset.kind,width:c.width,height:c.height,transparent:transparent/(c.width*c.height),solid:solid/(c.width*c.height),firstAlpha:pixels[3]})}return rows},manifest.assets);
  assert.equal(results.length,36);assert.ok(results.every(r=>r.firstAlpha===0&&r.transparent>.1&&r.solid>.05));report.alpha=results;
 });
 await check('Real ten-answer result uses transparent PNGs and a centered name-prefixed description',async()=>{
  const witness=fixtures.witnesses.mage;await p.locator('#start').click();for(let i=0;i<10;i++){const label=await p.locator('#quiz-title').textContent(),q=data.questions.findIndex(q=>q.text===label);await p.locator('#options button').filter({hasText:data.questions[q].options[witness.choices[q]].text}).click();await p.locator('#quiz-next').click()}
  await p.locator('#result.active').waitFor();const type=data.types.find(t=>t.id==='mage');assert.equal(await p.locator('#result-description').textContent(),'Mage '+type.desc);assert.equal(await p.locator('#result-description').evaluate(e=>getComputedStyle(e).textAlign),'center');
  const state=await p.locator('#result-art img').evaluateAll(async imgs=>{await Promise.all(imgs.map(i=>i.decode()));return imgs.map(i=>({src:i.getAttribute('src'),blend:getComputedStyle(i).mixBlendMode,fit:getComputedStyle(i).objectFit}))});assert.equal(state.length,4);assert.ok(state.every(i=>i.src.includes('/cutouts/')&&i.src.endsWith('.png')&&i.blend==='normal'&&i.fit==='contain'));
  for(const [id,n]of Object.entries(witness.scores))assert.equal(await p.locator('[data-angle="'+id+'"] .angle-score b').textContent(),String(n));await snap(p,'transparent-mage-desktop');
  for(const width of [390,320]){await p.setViewportSize({width,height:740});await p.locator('#result-art img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));assert.ok(await p.locator('#result-art .hero-triad').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight));assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await snap(p,'transparent-mage-mobile-'+width)}
 });
 await check('Named PNG gallery supports light/dark transparency review and a real PNG download',async()=>{
  await p.setViewportSize({width:1440,height:1000});await p.goto(root+'assets/archetypes/contact-sheet.html');assert.equal(await p.locator('figure').count(),27);await p.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));assert.ok((await p.locator('figure img').evaluateAll(imgs=>imgs.map(i=>i.getAttribute('src')))).every(src=>src.startsWith('cutouts/')&&src.endsWith('.png')));await snap(p,'transparent-gallery-light',true);await p.locator('#dark').check();await snap(p,'transparent-gallery-dark',true);
  const event=p.waitForEvent('download');await p.locator('figure a').first().click();const d=await event;assert.ok(d.suggestedFilename().endsWith('.png'));await d.saveAs(path.join(out,'gallery-download.png'));const bytes=fs.readFileSync(path.join(out,'gallery-download.png'));assert.equal(bytes.subarray(1,4).toString(),'PNG');
 });
 await check('PNG replacement journeys have no console errors, asset failures or 404s',async()=>{assert.deepEqual(report.errors,[]);assert.deepEqual(report.requests,[])});report.status='passed';
})().catch(e=>{report.status='failed';report.failure=e.stack;console.error(e);process.exitCode=1}).finally(async()=>{fs.writeFileSync(path.join(out,'cutout-results.json'),JSON.stringify(report,null,2));if(browser)await browser.close()});
