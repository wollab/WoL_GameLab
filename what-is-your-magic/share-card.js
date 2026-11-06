/* Reuses unmodified character art to typeset exportable result cards. */
(function(root){
  'use strict';
  const ink='#26243b',muted='#626178';
  const sizes={post:[1080,1350],story:[1080,1920],og:[1200,630]};
  const order=['explorer','listener','experimenter','connector','meaningmaker','creator','decider','synthesizer','reflector'];
  function validScores(scores){return Boolean(scores&&order.every(id=>Number.isInteger(scores[id])&&scores[id]>=0&&scores[id]<=7)&&order.reduce((sum,id)=>sum+scores[id],0)===19);}
  const images=new Map();
  function image(src){
    if(!images.has(src))images.set(src,new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>{images.delete(src);reject(new Error('โหลดภาพตัวละครไม่สำเร็จ'));};i.src=src;}));
    return images.get(src);
  }
  function fit(ctx,img,x,y,w,h,blend=true){const s=Math.min(w/img.width,h/img.height);ctx.save();if(blend)ctx.globalCompositeOperation='multiply';ctx.drawImage(img,x+(w-img.width*s)/2,y+(h-img.height*s)/2,img.width*s,img.height*s);ctx.restore();}
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
  async function render(type,format='post',scores){
    if(!sizes[format])throw new Error('Unknown share format');
    if(format!=='og'&&(!validScores(scores)||WizardMatching.matchWizards(scores,WIZARD_ARCHETYPES)[0].id!==type.id))throw new Error('ต้องใช้ผลจากแบบสอบถามที่ทำครบแล้ว');
    await Promise.all([document.fonts.load('600 64px Kanit'),document.fonts.load('400 32px Kanit')]);
    const family=WIZARD_FAMILIES[type.family];
    const master=type.id==='necromancer'?'necromancer-sample.png':'masters/'+type.id+'.png';
    const [portrait,logo,...angles]=await Promise.all([image('assets/archetypes/'+master),image('assets/brand/wol-logo.png'),...order.map(id=>image(MOVES[id].img))]);
    const canvas=document.createElement('canvas');[canvas.width,canvas.height]=sizes[format];const ctx=canvas.getContext('2d');
    ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle=family.color+'12';ctx.fillRect(0,0,canvas.width,canvas.height-112);
    ctx.fillStyle=family.color;ctx.fillRect(0,0,canvas.width,12);
    fit(ctx,logo,50,34,72,72,false);text(ctx,'27 Wizards of Learning',140,82,32,ink,600);
    if(format==='og'){
      text(ctx,'รายละเอียด Archetype',64,186,27,muted);
      block(ctx,type.name,60,268,620,65,ink,600);
      text(ctx,family.title,64,370,28,ink,600);
      block(ctx,type.desc,64,422,630,28,muted);
      fit(ctx,portrait,750,102,360,390);
      text(ctx,'คุณเรียนรู้ด้วยเวทมนตร์แบบไหน?',64,557,30,ink,600);
      text(ctx,'ค้นพบของคุณได้ใน 10 คำถาม',64,598,24,muted);
      text(ctx,'Wizards of Learning',1138,581,24,muted,400,'right');
    }else{
      const story=format==='story',center=540;
      text(ctx,'ผลจากคำตอบของฉัน',center,story?205:170,32,muted,400,'center');
      const height=block(ctx,type.name,center,story?292:245,950,70,ink,600,'center');
      text(ctx,family.title,center,(story?292:245)+height+12,30,ink,600,'center');
      fit(ctx,portrait,story?290:90,story?430:365,story?500:350,story?490:350);
      if(story)block(ctx,type.desc,center,970,930,33,ink,400,'center');
      else {block(ctx,type.desc,500,455,510,34,ink,400);text(ctx,'ผลจาก 10 คำถาม · 19 คะแนน',500,650,25,muted);}
      text(ctx,'คะแนน 9 Learning Angles ของฉัน',center,story?1080:765,32,ink,600,'center');
      const top=Math.max(...order.map(id=>scores[id]));
      order.forEach((id,i)=>{
        const a=MOVES[id],value=scores[id],peak=value===top,x=60+(i%3)*320,y=(story?1110:790)+Math.floor(i/3)*(story?175:148),h=story?165:140;
        ctx.fillStyle=value<=1?'#f1f0f4':peak?a.color+'18':'#ffffffb3';ctx.fillRect(x,y,300,h);
        ctx.strokeStyle=peak?a.color:'#dedbe8';ctx.lineWidth=peak?4:1;ctx.strokeRect(x,y,300,h);
        ctx.save();if(value<=1){ctx.globalAlpha=.35;ctx.filter='grayscale(1)';}fit(ctx,angles[i],x+22,y+8,story?110:90,story?108:87);ctx.restore();
        text(ctx,String(value),x+265,y+(story?76:65),peak?54:46,ink,600,'right');
        text(ctx,'คะแนน',x+265,y+(story?107:92),20,muted,400,'right');
        text(ctx,a.thai,x+150,y+h-14,story?30:27,ink,600,'center');
      });
      if(story){text(ctx,'คุณได้ Wizard แบบไหน? มาลองกัน',center,1720,34,ink,600,'center');text(ctx,'อ่านรายละเอียด Archetype จากลิงก์ที่แชร์',center,1770,27,muted,400,'center');}
      text(ctx,'คะแนนสะท้อนคำตอบครั้งนี้ · ทุกคนเรียนรู้ได้หลายแบบ',center,canvas.height-40,24,muted,400,'center');
    }
    const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('สร้างไฟล์ภาพไม่สำเร็จ')),format==='og'?'image/jpeg':'image/png',.9));
    return {blob,width:canvas.width,height:canvas.height};
  }
  root.WizardShareCard={render,validScores,angleOrder:order};
})(window);
