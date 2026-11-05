(function(root){
  'use strict';
  function node(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
  function icon(name,className=''){
    const e=document.createElementNS('http://www.w3.org/2000/svg','svg');e.setAttribute('class','icon '+className);e.setAttribute('viewBox','0 0 96 96');e.setAttribute('aria-hidden','true');
    const use=document.createElementNS(e.namespaceURI,'use');use.setAttribute('href','assets/icons.svg#'+name);e.append(use);return e;
  }
  const familyIcons={A:'book',B:'leaf',C:'moon',D:'lyre',E:'tools'};
  function emblem(family,className=''){const e=node('div','emblem '+className);e.style.setProperty('--family',WIZARD_FAMILIES[family].color);e.setAttribute('aria-hidden','true');e.append(icon(familyIcons[family]));return e;}
  function profileHref(id){return '#wizard/'+encodeURIComponent(id);}
  function profileLink(type,className='text-link',text){const a=node('a',className,text||'ดู Profile '+type.name);a.href=profileHref(type.id);return a;}
  function heading(title,name){const h=node('h2','section-heading');h.append(icon(name),node('span','',title));return h;}
  const toOriginal=id=>({communicator:'meaningmaker',summarizer:'synthesizer'}[id]||id);
  function heroVisual(type){
    const stage=node('div','hero-visual'),portrait=node('div','archetype-portrait');
    if(type.id==='necromancer'){
      const img=node('img');img.src='assets/archetypes/necromancer-sample.png';img.alt='Necromancer ผู้ค้นความรู้จากเรื่องราวในอดีต';portrait.append(img);
    }else portrait.append(emblem(type.family));
    const triad=node('div','hero-triad');triad.setAttribute('aria-label','สามมุมใน Learning Signature');
    ['มุมหลัก','มุมรอง','มุมสนับสนุน'].forEach((role,i)=>{
      const angle=MOVES[toOriginal(type.sig[i])],figure=node('figure','hero-angle'),img=node('img');img.src=angle.img;img.alt='';
      const caption=node('figcaption','',angle.thai);caption.append(node('small','',role));figure.append(img,caption);triad.append(figure);
    });stage.append(portrait,triad);return stage;
  }
  function chapters(target,prefix,items){
    const wrap=document.getElementById(target);wrap.replaceChildren(node('h2','','สำรวจหัวข้อนี้'));
    items.forEach(([id,title])=>{const a=node('a','',title);a.href=prefix+'/'+id;a.append(icon('arrow'));wrap.append(a);});
  }
  function decorate(){document.querySelectorAll('[data-icon]').forEach(e=>{e.replaceChildren(icon(e.dataset.icon));});}
  root.WizardUI={node,icon,emblem,profileHref,profileLink,heading,heroVisual,chapters,decorate};
})(window);
