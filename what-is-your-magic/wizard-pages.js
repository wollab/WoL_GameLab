(function(root){
  'use strict';
  const {node,icon,emblem,profileLink,heading}=WizardUI;
  const original=id=>({communicator:'meaningmaker',summarizer:'synthesizer'}[id]||id);
  function related(type){
    return WIZARD_ARCHETYPES.filter(t=>t.id!==type.id).map(t=>({type:t,overlap:t.sig.reduce((n,id)=>n+(type.sig.includes(id)?1:0),0)})).sort((a,b)=>b.overlap-a.overlap||a.type.name.localeCompare(b.type.name,'en')).slice(0,3).map(x=>x.type);
  }
  function card(type){
    const a=profileLink(type,'wizard-card','');a.replaceChildren();a.style.setProperty('--family',WIZARD_FAMILIES[type.family].color);
    const copy=node('div','wizard-card-copy');copy.append(node('h3','',type.name),node('p','',type.desc));
    const sig=node('div','mini-signature');type.sig.forEach(id=>{const img=node('img');img.src=MOVES[original(id)].img;img.alt=WIZARD_ANGLE_NAMES[id];sig.append(img);});
    const more=node('span','card-link','รู้จัก Wizard นี้');more.append(icon('arrow'));
    a.append(WizardUI.portrait(type,'card-portrait',true),copy,sig,more);return a;
  }
  function catalog(family='all'){
    const wrap=document.getElementById('wizard-groups');wrap.replaceChildren();
    const input=document.getElementById('catalog-search'),query=input.value.trim().toLocaleLowerCase('th');
    const matches=WIZARD_ARCHETYPES.filter(t=>(family==='all'||t.family===family)&&[t.name,t.desc,WIZARD_FAMILIES[t.family].thai,...t.sig.map(id=>WIZARD_ANGLE_NAMES[id])].join(' ').toLocaleLowerCase('th').includes(query));
    document.getElementById('catalog-status').textContent='พบ '+matches.length+' จาก 27 สาย'+(family==='all'?'':' · '+WIZARD_FAMILIES[family].thai);
    document.getElementById('catalog-clear').disabled=!input.value;
    document.querySelectorAll('[data-family-filter]').forEach(a=>a.setAttribute('aria-current',a.dataset.familyFilter===family?'page':'false'));
    Object.entries(WIZARD_FAMILIES).filter(([id])=>matches.some(t=>t.family===id)).forEach(([id,f])=>{
      const section=node('section','family-group');section.style.setProperty('--family',f.color);
      const intro=node('div','family-intro');intro.append(emblem(id),node('div'));
      intro.lastChild.append(node('p','family-kicker','Family '+id),node('h2','',f.title),node('p','',f.description));
      const grid=node('div','wizard-grid');matches.filter(t=>t.family===id).forEach(t=>grid.append(card(t)));
      section.append(intro,grid);wrap.append(section);
    });
    if(!matches.length){const empty=node('div','catalog-empty');empty.append(heading('ยังไม่พบ Wizard ที่ตรงกับคำค้น','book'),node('p','','ลองค้นด้วยชื่อ Wizard หรือมุมการเรียนรู้ เช่น นักสำรวจ หรือล้างคำค้นแล้วเลือกดูทุกสาย'));const reset=node('a','text-link','ล้างคำค้นและดูทั้ง 27 สาย →');reset.href='#wizards';reset.addEventListener('click',()=>{input.value='';catalog('all');});empty.append(reset);wrap.append(empty);}
  }
  function signature(type){
    const list=node('div','profile-signature');
    ['มุมหลัก','มุมรอง','มุมสนับสนุน'].forEach((label,i)=>{
      const a=MOVES[original(type.sig[i])],row=node('div','profile-signature-row'),img=node('img');img.src=a.img;img.alt='';
      const copy=node('div');copy.append(node('small','',label),node('h3','',a.thai),node('p','',a.guide));row.append(img,copy);list.append(row);
    });return list;
  }
  function profile(id,{ranked=[]}={}){
    const type=WIZARD_ARCHETYPES.find(t=>t.id===id);if(!type)return false;
    const family=WIZARD_FAMILIES[type.family],wrap=document.getElementById('profile-content');wrap.replaceChildren();
    document.getElementById('profile-title').textContent=type.name;
    document.getElementById('profile-family').textContent='Family '+type.family+' · '+family.title;
    document.getElementById('profile-description').textContent=type.desc;
    document.getElementById('profile-motto').textContent='“'+family.motto+'”';
    document.getElementById('profile-art').replaceChildren(WizardUI.heroVisual(type));
    document.getElementById('wizard-profile').style.setProperty('--family-color',family.color);
    const context=document.getElementById('profile-match'),match=ranked.find(t=>t.id===id);context.hidden=!match;
    if(match)context.textContent=(ranked[0].id===id?'Wizard หลักจากคำตอบของคุณ':'จากคำตอบชุดเดียวกันของคุณ')+' · '+match.matchScore+' แต้มจับคู่';
    const intro=node('section','chapter');intro.id='profile-intro';intro.append(heading('รู้จัก '+type.name,'spark'),node('p','large-copy',type.desc),node('p','',family.description),node('p','muted','ลายเซ็นนี้เป็นวิธีเล่าเรื่องการเรียนรู้ ไม่ใช่เงื่อนไขว่าคุณต้องเป็นแบบนี้ทุกครั้งหรือใช้มุมอื่นไม่ได้'));
    const sig=node('section','chapter');sig.id='profile-signature';sig.append(heading('Learning Signature','book'),node('p','section-intro','สามมุมการเรียนรู้ที่ใช้เป็นลายเซ็นของ Wizard สายนี้'),signature(type));
    const strength=node('section','chapter');strength.id='profile-strength';strength.append(heading('จุดแข็งที่ชวนสำรวจ','spark'),node('p','large-copy',type.gift),node('p','muted','ลองนึกถึงเหตุการณ์ที่คุณเคยใช้มุมเหล่านี้ แล้วสังเกตว่ามันช่วยให้เข้าใจหรือทำสิ่งต่าง ๆ ได้อย่างไร'));
    const quest=node('section','chapter');quest.id='profile-quest';quest.append(heading('Growth Quest','quest'),node('p','large-copy',type.quest),node('p','muted','ลองทำเป็นกิจกรรมเล็ก ๆ แล้วทบทวนว่าได้เรียนรู้อะไร ไม่จำเป็นต้องทำให้ได้เหมือนคำอธิบายทุกข้อ'));
    wrap.append(intro,sig,strength,quest);
    const more=node('section','chapter related-chapter');more.id='profile-related';more.append(heading('Wizard ที่มี Learning Signature ใกล้กัน','people'),node('p','section-intro','สำรวจสายที่ใช้มุมการเรียนรู้ร่วมกัน แล้วเลือกอ่านสิ่งที่รู้สึกเชื่อมโยงกับคุณ'));
    const grid=node('div','wizard-grid');related(type).forEach(t=>grid.append(card(t)));more.append(grid);wrap.append(more);
    WizardUI.chapters('profile-chapters','#wizard/'+id,[['intro','บทนำ'],['signature','Learning Signature'],['strength','จุดแข็ง'],['quest','Growth Quest'],['related','Wizard ใกล้เคียง']]);
    return true;
  }
  root.WizardPages={catalog,profile,related};
})(window);
