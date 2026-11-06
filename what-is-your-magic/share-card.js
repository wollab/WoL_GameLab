/* Reuses unmodified character art to typeset exportable result cards. */
(function(root){
  'use strict';
  const ink='#26243b',muted='#626178';
  const original=id=>({communicator:'meaningmaker',summarizer:'synthesizer'}[id]||id);
  const sizes={post:[1080,1350],story:[1080,1920],og:[1200,630]};
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
  async function render(type,format='post'){
    if(!sizes[format])throw new Error('Unknown share format');
    await Promise.all([document.fonts.load('600 64px Kanit'),document.fonts.load('400 32px Kanit')]);
    const family=WIZARD_FAMILIES[type.family];
    const master=type.id==='necromancer'?'necromancer-sample.png':'masters/'+type.id+'.png';
    const [portrait,logo,...triad]=await Promise.all([image('assets/archetypes/'+master),image('assets/brand/wol-logo.png'),...type.sig.map(id=>image(MOVES[original(id)].img))]);
    const canvas=document.createElement('canvas');[canvas.width,canvas.height]=sizes[format];const ctx=canvas.getContext('2d');
    ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle=family.color+'12';ctx.fillRect(0,0,canvas.width,canvas.height-112);
    ctx.fillStyle=family.color;ctx.fillRect(0,0,canvas.width,12);
    fit(ctx,logo,50,34,72,72,false);text(ctx,'27 Wizards of Learning',140,82,32,ink,600);
    if(format==='og'){
      text(ctx,'Wizard ที่ฉันค้นพบ',64,186,27,muted);
      block(ctx,type.name,60,268,620,65,ink,600);
      text(ctx,family.title,64,370,28,ink,600);
      block(ctx,type.desc,64,422,630,28,muted);
      fit(ctx,portrait,750,102,360,390);
      text(ctx,'คุณเรียนรู้ด้วยเวทมนตร์แบบไหน?',64,557,30,ink,600);
      text(ctx,'ค้นพบของคุณได้ใน 10 คำถาม',64,598,24,muted);
      text(ctx,'Wizards of Learning',1138,581,24,muted,400,'right');
    }else{
      const story=format==='story',center=540;
      text(ctx,'Wizard ของฉันคือ',center,story?205:170,32,muted,400,'center');
      const height=block(ctx,type.name,center,story?292:245,950,70,ink,600,'center');
      text(ctx,family.title,center,(story?292:245)+height+12,30,ink,600,'center');
      fit(ctx,portrait,story?220:280,story?420:380,story?640:520,story?700:485);
      block(ctx,type.desc,center,story?1220:940,940,story?36:30,ink,400,'center');
      const labelY=story?1360:1020;
      text(ctx,'Learning Signature ของสายนี้',center,labelY,25,muted,400,'center');
      type.sig.forEach((id,i)=>{
        const x=180+i*360;
        fit(ctx,triad[i],x-55,labelY+20,110,story?150:120);
        text(ctx,WIZARD_ANGLE_NAMES[id],x,labelY+(story?210:182),27,ink,600,'center');
      });
      if(story){text(ctx,'คุณเรียนรู้ด้วยเวทมนตร์แบบไหน?',center,1680,36,ink,600,'center');text(ctx,'ค้นพบของคุณได้ใน 10 คำถาม',center,1730,29,muted,400,'center');}
      text(ctx,'ทุกคนเรียนรู้ได้หลายแบบ · Wizards of Learning',center,canvas.height-40,24,muted,400,'center');
    }
    const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('สร้างไฟล์ภาพไม่สำเร็จ')),format==='og'?'image/jpeg':'image/png',.9));
    return {blob,width:canvas.width,height:canvas.height};
  }
  root.WizardShareCard={render};
})(window);
