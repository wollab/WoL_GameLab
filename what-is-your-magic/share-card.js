/* Reuses unmodified character art to typeset exportable result cards. */
(function(root){
  'use strict';
  const ink='#26243b',muted='#626178';
  const sizes={post:[1080,1350],story:[1080,1920],og:[1200,630]};
  const order=['explorer','listener','experimenter','connector','meaningmaker','creator','decider','synthesizer','reflector'];
  function validScores(scores){return Boolean(scores&&order.every(id=>Number.isInteger(scores[id])&&scores[id]>=0&&scores[id]<=7)&&order.reduce((sum,id)=>sum+scores[id],0)===19);}
  const images=new Map();
  function image(src){
    src=new URL(src,new URL('.',document.querySelector('link[rel="stylesheet"]').href)).href;
    if(!images.has(src))images.set(src,new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>{images.delete(src);reject(new Error('โหลดภาพตัวละครไม่สำเร็จ'));};i.src=src;}));
    return images.get(src);
  }
  function fit(ctx,img,x,y,w,h){const s=Math.min(w/img.width,h/img.height);ctx.save();ctx.drawImage(img,x+(w-img.width*s)/2,y+(h-img.height*s)/2,img.width*s,img.height*s);ctx.restore();}
  function scene(ctx,img,x,y,w,h,alpha=.75){const s=Math.max(w/img.width,h/img.height);ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.globalAlpha=alpha;ctx.drawImage(img,x+(w-img.width*s)/2,y+(h-img.height*s)/2,img.width*s,img.height*s);ctx.restore();}
  function quote(ctx,copy,x,y,width,size){ctx.font=`italic 400 ${size}px Kanit`;ctx.textAlign='center';ctx.fillStyle=ink;const rows=lines(ctx,'“'+copy+'”',width);rows.forEach((line,i)=>ctx.fillText(line,x,y+i*size*1.35));return rows.length*size*1.35;}
  function text(ctx,copy,x,y,size,color=ink,weight=400,align='left'){
    ctx.font=`${weight} ${size}px Kanit`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(copy,x,y);
  }
  function lines(ctx,copy,width){
    const words=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter('th',{granularity:'word'}).segment(copy)].map(x=>x.segment):Array.from(copy);
    const result=[];let line='';for(const word of words){if(line&&ctx.measureText(line+word).width>width){result.push(line.trim());line=word;}else line+=word;}if(line)result.push(line.trim());return result;
  }
  function block(ctx,copy,x,y,width,size,color=ink,weight=400,align='left'){
    ctx.font=`${weight} ${size}px Kanit`;const rows=lines(ctx,copy,width);rows.forEach((s,i)=>text(ctx,s,x,y+i*size*1.3,size,color,weight,align));return rows.length*size*1.3;
  }
  async function render(type,format='post',scores,{mode='personal'}={}){
    if(!sizes[format])throw new Error('Unknown share format');
    if(!['personal','profile'].includes(mode))throw new Error('Unknown share context');
    if(format!=='og'&&mode==='personal'&&(!validScores(scores)||WizardMatching.matchWizards(scores,WIZARD_ARCHETYPES)[0].id!==type.id))throw new Error('ต้องใช้ผลจากแบบสอบถามที่ทำครบแล้ว');
    await Promise.all([document.fonts.load('600 64px Kanit'),document.fonts.load('400 32px Kanit')]);
    const family=WIZARD_FAMILIES[type.family];
    const [portrait,logo,background,...angles]=await Promise.all([image(WizardArtwork.portrait(type.id)),image('assets/brand/wol-logo.png'),image('assets/families/'+type.family.toLowerCase()+'.webp'),...order.map(id=>image(WizardArtwork.angle(id)))]);
    const canvas=document.createElement('canvas');[canvas.width,canvas.height]=sizes[format];const ctx=canvas.getContext('2d');
    ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle=family.color+'12';ctx.fillRect(0,0,canvas.width,canvas.height-112);
    ctx.fillStyle=family.color;ctx.fillRect(0,0,canvas.width,12);
    fit(ctx,logo,50,34,72,72,false);text(ctx,'27 Wizards of Learning',140,82,32,ink,600);
    if(format==='og'){
      scene(ctx,background,720,115,480,435,.7);ctx.fillStyle='#fffffff0';ctx.fillRect(35,135,695,385);
      text(ctx,'รายละเอียด Archetype',64,180,27,muted);
      block(ctx,type.name,60,260,620,63,ink,600);
      text(ctx,family.thai,64,328,27,ink,600);
      block(ctx,type.desc,64,380,630,27,muted);
      quote(ctx,type.quote,380,466,610,29);
      fit(ctx,portrait,770,150,360,395);
      ctx.fillStyle='#fff';ctx.fillRect(0,550,1200,80);text(ctx,'ค้นพบเวทมนตร์การเรียนรู้ของคุณใน 10 คำถาม',64,600,27,ink,600);
    }else{
      const story=format==='story',personal=mode==='personal',center=540;
      text(ctx,personal?'เวทมนตร์การเรียนรู้ของฉัน':'รู้จักเวทมนตร์การเรียนรู้แบบ',center,story?205:170,32,muted,400,'center');
      const height=block(ctx,type.name,center,story?292:245,950,70,ink,600,'center');
      text(ctx,family.thai,center,(story?292:245)+height+12,30,ink,600,'center');
      if(personal&&!story)scene(ctx,background,40,355,420,355,.78);
      else scene(ctx,background,0,story?420:355,1080,personal?510:(story?660:450),.78);
      fit(ctx,portrait,story?290:(personal?90:340),story?430:365,story?500:(personal?350:400),personal?(story?490:335):(story?630:440));
      if(personal){
      if(story)block(ctx,type.desc,center,980,930,30,ink,400,'center');
      else {block(ctx,type.desc,500,450,510,32,ink,400);text(ctx,'ผลจาก 10 คำถาม · 19 คะแนน',500,655,25,muted);}
      quote(ctx,type.quote,center,story?1080:748,960,story?32:27);
      text(ctx,'คะแนน 9 Learning Angles ของฉัน',center,story?1160:797,32,ink,600,'center');
      const top=Math.max(...order.map(id=>scores[id]));
      order.forEach((id,i)=>{
        const a=MOVES[id],value=scores[id],peak=value===top,x=60+(i%3)*320,y=(story?1190:820)+Math.floor(i/3)*(story?160:137),h=story?150:129;
        ctx.fillStyle=value<=1?'#f1f0f4':peak?a.color+'18':'#ffffffb3';ctx.fillRect(x,y,300,h);
        ctx.strokeStyle=peak?a.color:'#dedbe8';ctx.lineWidth=peak?4:1;ctx.strokeRect(x,y,300,h);
        ctx.save();if(value<=1){ctx.globalAlpha=.35;ctx.filter='grayscale(1)';}fit(ctx,angles[i],x+22,y+5,story?105:85,story?96:78);ctx.restore();
        text(ctx,String(value),x+265,y+(story?68:58),peak?54:46,ink,600,'right');
        text(ctx,'คะแนน',x+265,y+(story?98:86),20,muted,400,'right');
        text(ctx,a.thai,x+150,y+h-14,story?30:27,ink,600,'center');
      });
      }else{
        quote(ctx,type.quote,center,story?1155:890,960,story?40:35);
        block(ctx,type.desc,center,story?1280:980,930,32,ink,400,'center');
        text(ctx,'สามมุมใน Learning Signature',center,story?1390:1060,30,ink,600,'center');
        type.sig.forEach((id,i)=>{const original={communicator:'meaningmaker',summarizer:'synthesizer'}[id]||id,a=MOVES[original],x=220+i*320;fit(ctx,angles[order.indexOf(original)],x-85,story?1430:1080,170,story?180:130);text(ctx,a.thai,x,story?1650:1240,28,ink,600,'center');});
      }
      if(story){text(ctx,'คุณได้ Wizard แบบไหน? มาลองกัน',center,1720,34,ink,600,'center');text(ctx,'อ่านรายละเอียด Archetype จากลิงก์ที่แชร์',center,1770,27,muted,400,'center');}
      text(ctx,personal?'คะแนนสะท้อนคำตอบครั้งนี้ · ทุกคนเรียนรู้ได้หลายแบบ':'เรื่องเล่าเพื่อสำรวจวิธีเรียนรู้ · ไม่ใช่ผลวินิจฉัย',center,canvas.height-40,24,muted,400,'center');
    }
    const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('สร้างไฟล์ภาพไม่สำเร็จ')),format==='og'?'image/jpeg':'image/png',.9));
    return {blob,width:canvas.width,height:canvas.height};
  }
  root.WizardShareCard={render,validScores,angleOrder:order};
})(window);
