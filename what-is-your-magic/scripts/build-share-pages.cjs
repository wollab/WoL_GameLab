// Build crawler-readable Wizard links and OG cards for static GitHub Pages.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),publicBase='https://yourmagic.wizardsoflearning.com/';
const context=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(root,'wizard-data.js'),'utf8')+';this.types=WIZARD_ARCHETYPES;this.families=WIZARD_FAMILIES;this.names=WIZARD_ANGLE_NAMES;',context);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.ttf':'font/ttf','.woff2':'font/woff2','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try{
  const p=await browser.newPage();await p.goto('http://127.0.0.1:'+server.address().port+'/index.html');await p.locator('#start:enabled').waitFor();
  const folder=path.join(root,'assets/social/wizards');fs.mkdirSync(folder,{recursive:true});
  for(const type of context.types){
   const family=context.families[type.family],url=publicBase+'share/'+type.id+'/',image=publicBase+'assets/social/wizards/'+type.id+'.jpg';
   if(!process.env.SKIP_OG){const bytes=await p.evaluate(async id=>{const result=await WizardShareCard.render(WIZARD_ARCHETYPES.find(t=>t.id===id),'og');return Array.from(new Uint8Array(await result.blob.arrayBuffer()));},type.id);
   fs.writeFileSync(path.join(folder,type.id+'.jpg'),Buffer.from(bytes));}
   const title=type.name+' · รายละเอียด Archetype · 27 Wizards of Learning';
   const desc=type.desc+' · มาค้นพบ Wizard ของคุณใน 10 คำถาม';
   const cardAlt=type.name+' · '+family.title+' · '+type.desc;
   // Reuse the actual long-form profile renderer, not a separate summary.
   const profile=await p.evaluate(id=>{
    WizardPages.profile(id);
    const copy=document.getElementById('wizard-profile').cloneNode(true);
    const stats=copy.querySelector('#profile-statistics');if(stats){stats.replaceChildren();const note=document.createElement('p');note.textContent='สถิติผลแบบสอบถามแสดงเมื่อเปิด JavaScript และเชื่อมต่ออินเทอร์เน็ต';stats.append(note);}
    copy.querySelectorAll('.return-result,.chapter-picker,#profile-match').forEach(e=>e.remove());
    copy.querySelectorAll('button').forEach(e=>e.disabled=true);
    copy.querySelectorAll('[src]').forEach(e=>{if(e.getAttribute('src').startsWith('assets/'))e.setAttribute('src','../../'+e.getAttribute('src'));});
    copy.querySelectorAll('a[href],use[href]').forEach(e=>{
     const href=e.getAttribute('href');
     if(href.startsWith('assets/'))e.setAttribute('href','../../'+href);
     else if(href.startsWith('#wizard/'+id+'/'))e.setAttribute('href','#profile-'+href.split('/')[2]);
     else if(/^#wizard\/[a-z-]+$/.test(href))e.setAttribute('href','../'+href.split('/')[1]+'/');
     else if(href==='#home')e.setAttribute('href','../../');
     else if(href.startsWith('#wizards'))e.setAttribute('href','../../'+href);
    });
    const label=document.createElement('p');label.className='hero-label';label.textContent='รายละเอียด Archetype';copy.querySelector('.profile-hero .hero-split>div').prepend(label);
    return copy.innerHTML;
   },type.id);
   const modal=await p.locator('#share-dialog').evaluate(e=>{const copy=e.cloneNode(true);copy.querySelectorAll('button').forEach(b=>b.disabled=true);return copy.outerHTML;});
   const scripts=['quiz-data.js','wizard-data.js','wizard-matching.js','result-stats.js','artwork.js','share-card.js','share.js','static-profile.js'].map(src=>'<script defer src="../../'+src+'?v=20261107-story"></script>').join('');
   const html=`<!doctype html>
<html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(title)}</title><meta name="description" content="${escape(desc)}"><link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:locale" content="th_TH"><meta property="og:site_name" content="Wizards of Learning"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${image}"><meta property="og:image:type" content="image/jpeg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${escape(cardAlt)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(desc)}"><meta name="twitter:image" content="${image}"><meta name="twitter:image:alt" content="${escape(cardAlt)}">
<link rel="icon" href="../../assets/brand/wol-logo.png"><link rel="stylesheet" href="../../style.css?v=20261107-save">${scripts}</head>
<body data-family="${type.family}"><a class="skip-link" href="#main">ข้ามไปเนื้อหา</a><header class="site-header"><div class="header-inner"><a class="brand" href="../../"><img class="brand-logo" src="../../assets/brand/wol-logo.png" alt="" width="64" height="64"><span>Wizards of Learning</span></a><nav aria-label="เมนูหลัก"><a href="../../">ค้นพบ Wizard ของฉัน</a><a href="../../#wizards">27 Wizard</a></nav></div></header>
<main id="main" class="static-profile" data-archetype="${type.id}" tabindex="-1" aria-labelledby="profile-title" style="--family-color:${family.color}">${profile}</main>${modal}
<footer class="site-footer"><p>27 Wizards of Learning · What Is Your Learning Magic?</p><a href="../../">ค้นพบเวทมนตร์ของคุณใน 10 คำถาม →</a></footer></body></html>`;
   const directory=path.join(root,'share',type.id);fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(path.join(directory,'index.html'),html);
  }
  console.log('Built 27 static Wizard share pages and 27 OG images from existing character art.');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
