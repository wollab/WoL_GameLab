(function(root){
  'use strict';
  const el=id=>document.getElementById(id),dialog=()=>el('share-dialog');
  let winner=null,format='post',file=null,imageUrl=null,generation=0,opener=null;
  function status(message){el('share-status').textContent=message;}
  function link(){return new URL('share/'+winner.id+'/',new URL('.',location.href)).href;}
  function caption(){return 'Wizard ของฉันคือ '+winner.name+' ✨\n'+winner.desc+'\n\nคุณเรียนรู้ด้วยเวทมนตร์แบบไหน? มาค้นพบของคุณใน 10 คำถาม\n'+link();}
  function clean(){generation++;file=null;if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=null;el('share-preview').removeAttribute('src');}
  async function prepare(){
    const current=++generation;file=null;el('share-download').disabled=true;el('share-image').disabled=true;
    el('share-preview-wrap').setAttribute('aria-busy','true');el('share-loading').hidden=false;el('share-error').hidden=true;
    el('share-preview-wrap').dataset.format=format;
    try{
      const result=await WizardShareCard.render(winner,format);if(current!==generation)return;
      const next=URL.createObjectURL(result.blob);if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=next;
      file=new File([result.blob],'my-wizard-'+winner.id+'-'+format+'.png',{type:'image/png'});
      el('share-preview').src=next;el('share-preview').alt='การ์ด '+winner.name+' รูปแบบ '+(format==='post'?'โพสต์':'Story');
      el('share-full').href=next;el('share-full').hidden=false;
      el('share-download').disabled=false;
      const supported=Boolean(navigator.share&&navigator.canShare?.({files:[file]}));
      el('share-image').hidden=false;el('share-image').disabled=!supported;
      el('share-image-help').hidden=false;
    }catch(e){if(current!==generation)return;el('share-error').hidden=false;el('share-full').hidden=true;}
    finally{if(current===generation){el('share-preview-wrap').setAttribute('aria-busy','false');el('share-loading').hidden=true;}}
  }
  function close(){if(dialog().open)dialog().close();}
  function open(type,trigger){
    winner=type;opener=trigger||document.activeElement;format='post';status('');el('share-fallback').hidden=true;
    el('share-heading').textContent='แชร์ '+winner.name+' ของคุณ';el('share-link').value=link();
    el('share-facebook').href='https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(link());
    el('share-line').href='https://social-plugins.line.me/lineit/share?url='+encodeURIComponent(link());
    el('share-native-link').hidden=!navigator.share;
    document.querySelectorAll('[data-share-format]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.shareFormat===format)));
    el('share-full').hidden=true;dialog().showModal();prepare();
  }
  async function copy(value,label){
    try{if(!navigator.clipboard)throw new Error('unavailable');await navigator.clipboard.writeText(value);status('คัดลอก'+label+'แล้ว');el('share-fallback').hidden=true;}
    catch(e){el('share-text').value=value;el('share-fallback').hidden=false;status('เลือกและคัดลอก'+label+'ด้านล่างได้เลย');el('share-text').focus();el('share-text').select();}
  }
  function download(){
    if(!file||!imageUrl)return;const a=document.createElement('a');a.href=imageUrl;a.download=file.name;document.body.append(a);a.click();a.remove();status('เริ่มดาวน์โหลดภาพแล้ว เลือกภาพจากแกลเลอรีเพื่อโพสต์ได้เลย');
  }
  async function shareImage(){
    if(!file)return;
    el('share-image').disabled=true;
    try{await navigator.share({files:[file],title:'Wizard ของฉันคือ '+winner.name,text:caption()});status('เปิดเมนูแชร์ภาพแล้ว');}
    catch(e){if(e.name==='AbortError'){status('ยกเลิกการแชร์แล้ว ภาพยังพร้อมบันทึก');return;}status('ส่งภาพไปแอปนี้ไม่ได้ กดบันทึกภาพแล้วเลือกจากแกลเลอรีได้เลย');}
    finally{if(file)el('share-image').disabled=false;}
  }
  async function shareLink(){
    el('share-native-link').disabled=true;
    try{await navigator.share({title:'Wizard ของฉันคือ '+winner.name,text:'Wizard ของฉันคือ '+winner.name+' — '+winner.desc,url:link()});status('เปิดเมนูแชร์ลิงก์แล้ว');}
    catch(e){if(e.name==='AbortError'){status('ยกเลิกการแชร์แล้ว');return;}await copy(link(),'ลิงก์');}
    finally{el('share-native-link').disabled=false;}
  }
  function init(){
    el('share-close').addEventListener('click',close);
    dialog().addEventListener('keydown',event=>{
      if(event.key!=='Tab')return;
      const targets=[...dialog().querySelectorAll('a[href],button,input,textarea,[tabindex]')].filter(e=>!e.disabled&&e.tabIndex>=0&&e.getClientRects().length);
      const first=targets[0],last=targets[targets.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    });
    dialog().addEventListener('click',event=>{
      if(event.target!==dialog())return;const r=dialog().getBoundingClientRect();
      if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();
    });
    dialog().addEventListener('close',()=>{clean();if(opener?.isConnected)opener.focus({preventScroll:true});});
    el('share-download').addEventListener('click',download);el('share-image').addEventListener('click',shareImage);
    el('share-native-link').addEventListener('click',shareLink);
    el('share-copy-link').addEventListener('click',()=>copy(link(),'ลิงก์'));
    el('share-copy-caption').addEventListener('click',()=>copy(caption(),'ข้อความ'));
    el('share-retry').addEventListener('click',prepare);
    document.querySelectorAll('[data-share-format]').forEach(b=>b.addEventListener('click',()=>{if(format===b.dataset.shareFormat)return;format=b.dataset.shareFormat;status('');document.querySelectorAll('[data-share-format]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));prepare();}));
    // Controls become usable only after their handlers have been registered.
    dialog().querySelectorAll('button:not(#share-image):not(#share-download)').forEach(b=>b.disabled=false);
  }
  root.WizardShare={init,open,reset:()=>{close();clean();winner=null;status('');el('share-fallback').hidden=true;el('share-text').value='';}};
})(window);
