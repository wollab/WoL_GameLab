// Family visual/sharing regressions from Chief's actual mobile/reference feedback.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {load,enumerate}=require('./fixtures.cjs');
const data=load(),fixtures=enumerate(data),root=(process.env.MAGIC_BASE_URL||'http://127.0.0.1:4189/')+'what-is-your-magic/';
const out=process.env.TEST_OUTPUT_DIR;if(!out)throw Error('Set TEST_OUTPUT_DIR');fs.mkdirSync(out,{recursive:true});
const report={checks:[],errors:[],requests:[],layouts:[],screenshots:[]};let browser;
async function check(name,fn){await fn();report.checks.push({name,status:'passed'});console.log('PASS '+name)}
async function snap(p,name){await p.screenshot({path:path.join(out,name+'.png')});report.screenshots.push(name+'.png')}
async function ready(p){await p.waitForFunction(()=>!document.getElementById('share-download').disabled);await p.locator('#share-preview').evaluate(i=>i.decode())}
async function save(p,name){const event=p.waitForEvent('download');await p.locator('#share-download').click();const d=await event;const target=path.join(out,name+'.png');await d.saveAs(target);return fs.readFileSync(target)}
async function result(p,type){await p.goto(root);await p.evaluate(scores=>history.replaceState({magicScores:scores},'','#result'),fixtures.witnesses[type.id].scores);await p.reload();await p.locator('#result.active').waitFor();await p.evaluate(()=>document.fonts.ready);await p.locator('#result-art img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())))}
(async()=>{
 browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 const p=await browser.newPage({viewport:{width:1440,height:1000}});
 p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});p.on('response',r=>{if(r.status()>=400)report.requests.push({url:r.url(),status:r.status()})});p.on('requestfailed',r=>report.requests.push({url:r.url(),error:r.failure()?.errorText}));
 await check('All 27 unique quotes match the character, are centered/italic, and all five Family scenes decode',async()=>{
  assert.equal(new Set(data.types.map(t=>t.quote)).size,27);assert.ok(data.types.every(t=>t.quote&&t.quote.length>10));
  const themes=[];for(const family of 'ABCDE'){
   const type=data.types.find(t=>t.family===family);await p.goto(root+'#wizard/'+type.id);await p.locator('#wizard-profile.active').waitFor();await p.locator('#profile-art img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));
   assert.equal(await p.locator('#profile-motto').textContent(),'“'+type.quote+'”');const style=await p.locator('#profile-motto').evaluate(e=>({align:getComputedStyle(e).textAlign,style:getComputedStyle(e).fontStyle}));assert.deepEqual(style,{align:'center',style:'italic'});
   const accent=await p.locator('#profile-share').evaluate(e=>getComputedStyle(e).backgroundColor);themes.push(accent);
   const scene=await p.locator('.archetype-portrait').filter({visible:true}).evaluate(e=>getComputedStyle(e,'::before').backgroundImage);assert.ok(scene.includes('/'+family.toLowerCase()+'.webp'));
   const response=await p.request.get(root+'assets/families/'+family.toLowerCase()+'.webp');assert.equal(response.status(),200);
   const portrait=await p.locator('#profile-art .archetype-portrait img').evaluate(i=>{const r=i.getBoundingClientRect();return {height:r.height,ratio:r.width/r.height,natural:i.naturalWidth/i.naturalHeight,fit:getComputedStyle(i).objectFit}});assert.ok(portrait.height>=360);assert.equal(portrait.fit,'contain');assert.ok(Math.abs(portrait.ratio-portrait.natural)<.01);await snap(p,'desktop-family-'+family);
  }assert.equal(new Set(themes).size,5);
 });
 for(const width of [390,320])await check('Mobile '+width+': all 27 result names and full three-character signatures visible before scrolling',async()=>{
  await p.setViewportSize({width,height:740});
  for(const type of data.types){await result(p,type);const layout=await p.evaluate(()=>{const title=document.getElementById('result-title').getBoundingClientRect(),family=document.getElementById('result-family'),triad=document.querySelector('#result-art .hero-triad').getBoundingClientRect(),images=[...document.querySelectorAll('#result-art img')].map(i=>{const r=i.getBoundingClientRect();return {fit:getComputedStyle(i).objectFit,ratio:r.width/r.height,natural:i.naturalWidth/i.naturalHeight}});return {titleTop:title.top,triadBottom:triad.bottom,familyHeight:family.getBoundingClientRect().height,familyLine:parseFloat(getComputedStyle(family).lineHeight),overflow:document.documentElement.scrollWidth>innerWidth,images}});
   assert.ok(layout.titleTop>=0&&layout.triadBottom<=740,JSON.stringify({id:type.id,width,...layout}));assert.ok(layout.familyHeight<=layout.familyLine+1);assert.equal(layout.overflow,false);assert.ok(layout.images.every(i=>i.fit==='contain'&&Math.abs(i.ratio-i.natural)<.01));report.layouts.push({id:type.id,width,...layout});
  }
  await result(p,data.types.find(t=>t.id==='mage'));await snap(p,'mobile-first-view-'+width);
 });
 await check('Nearby results use the actual three matched portraits and keep correct profile links',async()=>{
  const type=data.types.find(t=>t.id==='necromancer');await result(p,type);const expected=data.matching.matchWizards(fixtures.witnesses[type.id].scores,data.types).slice(1,4);assert.equal(await p.locator('#alternatives .alternative-portrait').count(),3);
  for(const [i,t]of expected.entries()){assert.equal(await p.locator('#alternatives a').nth(i).getAttribute('href'),'#wizard/'+t.id);assert.equal(await p.locator('#alternatives img').nth(i).getAttribute('src'),'assets/archetypes/cutouts/'+t.id+'.png')}
  await p.locator('#result-nearby').scrollIntoViewIfNeeded();await snap(p,'nearby-portraits-mobile');
 });
 await check('Personal popup visibly presents actual-result caption, unique quote, correct type link and real PNG',async()=>{
  await p.setViewportSize({width:1440,height:1000});await result(p,data.types.find(t=>t.id==='healer'));await p.locator('#share-hero').click();await ready(p);
  const caption=await p.locator('#share-caption-preview').inputValue();assert.ok(caption.includes('เวทมนตร์การเรียนรู้ที่ได้คือ “Healer”'));assert.ok(caption.includes(root+'share/healer/')&&caption.includes('ลองทำแบบสอบถามได้ที่\n'+root));assert.ok(caption.includes('คะแนน'));
  assert.equal(await p.locator('#share-dialog').getAttribute('data-family'),'B');assert.ok((await p.locator('#share-quote').textContent()).includes(data.types.find(t=>t.id==='healer').quote));await snap(p,'personal-popup-desktop');
  const bytes=await save(p,'personal-healer-post');assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],[1080,1350]);await p.locator('[data-share-format=story]').click();await ready(p);await save(p,'personal-healer-story');await p.locator('#share-close').click();
 });
 await check('Every SPA profile opens its own share context without requiring quiz scores',async()=>{
  for(const type of data.types){await p.goto(root+'#wizard/'+type.id);await p.locator('#profile-share').click();await ready(p);const caption=await p.locator('#share-caption-preview').inputValue();assert.ok(caption.includes(type.name)&&caption.includes(type.quote));assert.ok(!caption.includes('มุมที่ฉันเลือก'));assert.equal(await p.locator('#share-link').inputValue(),root+'share/'+type.id+'/');assert.equal(await p.locator('#share-dialog').getAttribute('data-family'),type.family);await p.locator('#share-close').click();}
 });
 await check('Facebook opens a composer window for the matched details URL; personal caption remains ready to copy',async()=>{
  const type=data.types.find(t=>t.id==='healer');await result(p,type);await p.locator('#share-hero').click();await ready(p);const caption=await p.locator('#share-caption-preview').inputValue();assert.ok(caption.includes('เวทมนตร์การเรียนรู้ที่ได้คือ “Healer”'));
  await p.context().route('https://www.facebook.com/sharer/sharer.php**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Share destination test stub</title><p>URL routing check only</p>'}));
  const opening=p.waitForEvent('popup');await p.locator('#share-facebook-link').click();const popup=await opening;await popup.waitForLoadState();const destination=new URL(popup.url());assert.equal(destination.hostname,'www.facebook.com');assert.equal(destination.searchParams.get('u'),root+'share/healer/');await popup.close();await p.context().unroute('https://www.facebook.com/sharer/sharer.php**');await p.locator('#share-close').click();
  report.facebookLimit='Destination window is intercepted with an explicit test stub; actual Facebook composer/post/cache not verified.';
 });
 await check('All 27 static details pages can share; each Family downloads a correctly named profile card',async()=>{
  const seen=new Set();for(const type of data.types){await p.goto(root+'share/'+type.id+'/');await p.locator('#profile-share').click();await ready(p);assert.equal(await p.locator('#share-link').inputValue(),root+'share/'+type.id+'/');const caption=await p.locator('#share-caption-preview').inputValue();assert.ok(caption.includes('มารู้จัก')&&caption.includes(type.quote));assert.ok(!caption.includes('มุมที่ฉันเลือก'));
   if(!seen.has(type.family)){seen.add(type.family);await save(p,'profile-family-'+type.family+'-post');await p.locator('[data-share-format=story]').click();await ready(p);await save(p,'profile-family-'+type.family+'-story');await snap(p,'profile-popup-family-'+type.family)}await p.locator('#share-close').click();
  }
  const exports=await p.evaluate(async()=>{const result=[];for(const type of WIZARD_ARCHETYPES)for(const format of ['post','story']){const card=await WizardShareCard.render(type,format,null,{mode:'profile'}),image=await createImageBitmap(card.blob);result.push({id:type.id,format,width:image.width,height:image.height});image.close()}return result});assert.equal(exports.length,54);assert.ok(exports.every(x=>x.width===1080&&x.height===(x.format==='post'?1350:1920)));report.profileExports=exports;
 });
 await check('Healthy Family/profile sharing journeys have no console errors or missing assets',async()=>{assert.deepEqual(report.errors,[]);assert.deepEqual(report.requests,[])});report.status='passed';
})().catch(e=>{report.status='failed';report.failure=e.stack;console.error(e);process.exitCode=1}).finally(async()=>{fs.writeFileSync(path.join(out,'family-results.json'),JSON.stringify(report,null,2));if(browser)await browser.close()});
