// Build crawler-readable Wizard links and OG cards for static GitHub Pages.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),publicBase='https://wollab.github.io/WoL_GameLab/what-is-your-magic/';
const context=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(root,'wizard-data.js'),'utf8')+';this.types=WIZARD_ARCHETYPES;this.families=WIZARD_FAMILIES;this.names=WIZARD_ANGLE_NAMES;',context);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const orig=id=>({communicator:'meaningmaker',summarizer:'synthesizer'}[id]||id);
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
   const bytes=await p.evaluate(async id=>{const result=await WizardShareCard.render(WIZARD_ARCHETYPES.find(t=>t.id===id),'og');return Array.from(new Uint8Array(await result.blob.arrayBuffer()));},type.id);
   fs.writeFileSync(path.join(folder,type.id+'.jpg'),Buffer.from(bytes));
   const title='ฉันค้นพบ '+type.name+' · 27 Wizards of Learning';
   const desc=type.desc+' · มาค้นพบ Wizard ของคุณใน 10 คำถาม';
   const cardAlt=type.name+' · '+family.title+' · '+type.desc;
   const sig=type.sig.map(id=>`<figure><img src="../../assets/characters/${orig(id)}.png" alt="" width="120" height="120"><figcaption>${escape(context.names[id])}</figcaption></figure>`).join('');
   const html=`<!doctype html>
<html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(title)}</title><meta name="description" content="${escape(desc)}"><link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:locale" content="th_TH"><meta property="og:site_name" content="Wizards of Learning"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${image}"><meta property="og:image:type" content="image/jpeg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${escape(cardAlt)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(desc)}"><meta name="twitter:image" content="${image}"><meta name="twitter:image:alt" content="${escape(cardAlt)}">
<link rel="icon" href="../../assets/brand/wol-logo.png"><link rel="stylesheet" href="../../style.css?v=20261106-share"></head>
<body><a class="skip-link" href="#main">ข้ามไปเนื้อหา</a><header class="site-header"><div class="header-inner"><a class="brand" href="../../"><img class="brand-logo" src="../../assets/brand/wol-logo.png" alt="" width="64" height="64"><span>Wizards of Learning</span></a><nav aria-label="เมนูหลัก"><a href="../../">ค้นพบ Wizard ของฉัน</a><a href="../../#wizards">27 Wizard</a></nav></div></header>
<main id="main" class="shared-wizard" tabindex="-1"><div class="hero" style="background:${family.color}12"><div class="content-width hero-split"><div><p class="hero-label">Wizard ที่เพื่อนแชร์มาให้คุณ</p><h1>${escape(type.name)}</h1><p class="family-title">Family ${type.family} · ${escape(family.title)}</p><p class="lead">${escape(type.desc)}</p><p class="motto">“${escape(family.motto)}”</p><div class="shared-actions"><a class="primary button-link" href="../../">ค้นพบ Wizard ของฉัน</a><a class="secondary button-link" href="../../#wizard/${type.id}">รู้จัก ${escape(type.name)}</a></div></div><img class="share-entry-portrait" src="../../assets/archetypes/${type.id}.webp" alt="${escape(type.name)}" width="512" height="640"></div></div>
<section class="shared-copy"><h2>Learning Signature</h2><p>สามมุมการเรียนรู้ในลายเซ็นของ Wizard สายนี้</p><div class="shared-signature">${sig}</div><p>${escape(type.gift)}</p><p class="small muted">นี่คือลายเซ็นของ Wizard สายนี้ ไม่ใช่คะแนนส่วนตัวของผู้แชร์ ทุกคนเรียนรู้ได้หลายแบบ และผลนี้ไม่ใช่การวินิจฉัยบุคลิกภาพ</p></section></main>
<footer class="site-footer"><p>27 Wizards of Learning · What Is Your Learning Magic?</p><a href="../../">ค้นพบเวทมนตร์ของคุณใน 10 คำถาม →</a></footer></body></html>`;
   const directory=path.join(root,'share',type.id);fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(path.join(directory,'index.html'),html);
  }
  console.log('Built 27 static Wizard share pages and 27 OG images from existing character art.');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
