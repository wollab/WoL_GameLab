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
  function centeredCopy(ctx,copy,{x=540,y,w=930,h,size,min=size-8,color=ink,font='Kanit',weight=400,italic=false,maxLines=2}){
    ctx.save();let rows,step;
    do{
      ctx.font=`${italic?'italic ':''}${weight} ${size}px "${font}"`;
      rows=lines(ctx,copy,w);step=size*1.28;
      if(rows.length<=maxLines&&rows.length*step<=h||size<=min)break;
      size-=2;
    }while(true);
    if(rows.length*step>h){step=h/rows.length;ctx.font=`${italic?'italic ':''}${weight} ${Math.min(size,step/1.28)}px "${font}"`;}
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;
    rows.forEach((row,i)=>ctx.fillText(row,x,y+h/2+(i-(rows.length-1)/2)*step,w));
    ctx.restore();
  }
  function rounded(ctx,x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h);}
  function darken(hex){return '#'+hex.slice(1).match(/../g).map(c=>Math.round(parseInt(c,16)*.73).toString(16).padStart(2,'0')).join('');}
  function portraitCard(ctx,type,format,scores,mode,family,portrait,logo,background,angles){
    const story=format==='story',personal=mode==='personal',tone=darken(family.color);
    const layout=story
      ? {eyebrow:135,title:163,titleH:91,family:286,sceneY:336,sceneH:520,quoteY:884,quoteH:146,descY:1046,descH:112,label:1202,grid:1230,row:144,cta:1730,footer:1874}
      : {eyebrow:103,title:118,titleH:65,family:212,sceneY:230,sceneH:324,quoteY:568,quoteH:114,descY:694,descH:88,label:820,grid:842,row:132,cta:1266,footer:1324};
    ctx.fillStyle='#fff';ctx.fillRect(0,0,1080,ctx.canvas.height);
    ctx.fillStyle=family.color+'14';ctx.fillRect(0,0,1080,ctx.canvas.height-(story?106:56));
    ctx.fillStyle=family.color;ctx.fillRect(0,0,1080,12);
    fit(ctx,logo,55,30,62,62);text(ctx,'27 Wizards of Learning',132,72,29,ink,600);
    text(ctx,personal?'เวทมนตร์การเรียนรู้ของฉัน':'รู้จักเวทมนตร์การเรียนรู้แบบ',540,layout.eyebrow,story?29:23,tone,400,'center');
    centeredCopy(ctx,type.name,{y:layout.title,w:970,h:layout.titleH,size:story?70:58,min:story?52:43,weight:600,maxLines:1});
    text(ctx,family.thai,540,layout.family,story?30:25,ink,600,'center');
    ctx.save();rounded(ctx,48,layout.sceneY,984,layout.sceneH,28);ctx.clip();
    scene(ctx,background,48,layout.sceneY,984,layout.sceneH,.87);ctx.restore();
    fit(ctx,portrait,260,layout.sceneY+8,560,layout.sceneH-16);
    ctx.fillStyle='#ffffffb8';rounded(ctx,48,layout.quoteY,984,layout.quoteH,24);ctx.fill();
    centeredCopy(ctx,'“'+type.quote+'”',{y:layout.quoteY,w:896,h:layout.quoteH,size:story?53:43,min:story?42:34,color:tone,font:'Bai Jamjuree',italic:true});
    centeredCopy(ctx,type.roleDescription,{y:layout.descY,w:944,h:layout.descH,size:story?36:32,min:story?30:28,font:'Bai Jamjuree'});
    text(ctx,personal?'คะแนน 9 Learning Angles ของฉัน':'สามมุมใน Learning Signature',540,layout.label,story?33:29,ink,600,'center');
    if(personal){
      const top=Math.max(...order.map(id=>scores[id]));
      order.forEach((id,i)=>{
        const a=MOVES[id],value=scores[id],peak=value===top,x=48+(i%3)*332,y=layout.grid+Math.floor(i/3)*layout.row,h=layout.row-10;
        rounded(ctx,x,y,320,h,14);ctx.fillStyle=value<=1?'#f0eff4':peak?a.color+'22':'#ffffffcc';ctx.fill();
        ctx.strokeStyle=peak?a.color:'#dedbe8';ctx.lineWidth=peak?4:1;ctx.stroke();
        ctx.save();if(value<=1){ctx.globalAlpha=.35;ctx.filter='grayscale(1)';}fit(ctx,angles[i],x+25,y+5,104,h-40);ctx.restore();
        text(ctx,String(value),x+283,y+54,peak?53:46,ink,600,'right');
        text(ctx,'คะแนน',x+283,y+80,20,muted,400,'right');
        text(ctx,a.thai,x+160,y+h-12,story?29:26,ink,600,'center');
      });
    }else{
      const roles=['มุมหลัก','มุมรอง','มุมสนับสนุน'],cardH=story?350:325;
      type.sig.forEach((id,i)=>{
        const original={communicator:'meaningmaker',summarizer:'synthesizer'}[id]||id,a=MOVES[original],x=48+i*332,y=layout.grid;
        rounded(ctx,x,y,320,cardH,22);ctx.fillStyle='#ffffffcc';ctx.fill();
        fit(ctx,angles[order.indexOf(original)],x+38,y+16,244,cardH-104);
        text(ctx,a.thai,x+160,y+cardH-49,31,ink,600,'center');text(ctx,roles[i],x+160,y+cardH-16,23,tone,400,'center');
      });
    }
    text(ctx,'คุณได้ Wizard แบบไหน? มาลองกัน',540,layout.cta,story?35:25,tone,600,'center');
    if(story)text(ctx,'อ่านรายละเอียด Archetype จากลิงก์ที่แชร์',540,1780,26,muted,400,'center');
    text(ctx,personal?'คะแนนสะท้อนคำตอบครั้งนี้ · ทุกคนเรียนรู้ได้หลายแบบ':'เรื่องเล่าเพื่อสำรวจวิธีเรียนรู้ · ไม่ใช่ผลวินิจฉัย',540,layout.footer,story?25:23,muted,400,'center');
  }
  async function render(type,format='post',scores,{mode='personal'}={}){
    if(!sizes[format])throw new Error('Unknown share format');
    if(!['personal','profile'].includes(mode))throw new Error('Unknown share context');
    if(format!=='og'&&mode==='personal'&&(!validScores(scores)||WizardMatching.matchWizards(scores,WIZARD_ARCHETYPES)[0].id!==type.id))throw new Error('ต้องใช้ผลจากแบบสอบถามที่ทำครบแล้ว');
    const sample=type.quote+type.desc+' '+type.name;
    await Promise.all([document.fonts.load('600 64px Kanit',sample),document.fonts.load('400 32px Kanit',sample),...(format==='og'?[]:[document.fonts.load('400 36px "Bai Jamjuree"',sample),document.fonts.load('italic 400 50px "Bai Jamjuree"',sample)])]);
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
    }else{portraitCard(ctx,type,format,scores,mode,family,portrait,logo,background,angles);}
    const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('สร้างไฟล์ภาพไม่สำเร็จ')),format==='og'?'image/jpeg':'image/png',.9));
    return {blob,width:canvas.width,height:canvas.height};
  }
  root.WizardShareCard={render,validScores,angleOrder:order};
})(window);
