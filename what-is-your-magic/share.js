(function(root){
  'use strict';
  const el=id=>document.getElementById(id),dialog=()=>el('share-dialog');
  let winner=null,scores=null,format='post',file=null,imageUrl=null,generation=0,opener=null;
  function status(message){el('share-status').textContent=message;}
  function link(){return new URL('share/'+winner.id+'/',new URL('.',location.href)).href;}
  function peak(){const highest=Math.max(...Object.values(scores));return WizardShareCard.angleOrder.filter(id=>scores[id]===highest).map(id=>MOVES[id].thai).join(' / ')+' ('+highest+' คะแนน)';}
  function caption(){return 'ผลจากแบบสอบถามของฉัน ✨\nฉันได้ '+winner.name+' · '+WIZARD_FAMILIES[winner.family].thai+'\nมุมที่ฉันเลือกใช้มากที่สุด: '+peak()+'\n\nอ่านรายละเอียด Archetype '+winner.name+':\n'+link()+'\n\nลองทำแบบสอบถามแล้วมาเทียบกัน!';}
  function clean(){generation++;file=null;if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=null;el('share-preview').removeAttribute('src');}
  async function prepare(){
    const current=++generation;file=null;el('share-download').disabled=true;el('share-image').disabled=true;el('share-facebook').disabled=true;
    el('share-preview-wrap').setAttribute('aria-busy','true');el('share-loading').hidden=false;el('share-error').hidden=true;
    el('share-preview-wrap').dataset.format=format;
    try{
      const result=await WizardShareCard.render(winner,format,scores);if(current!==generation)return;
      const next=URL.createObjectURL(result.blob);if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=next;
      file=new File([result.blob],'my-wizard-'+winner.id+'-'+format+'.png',{type:'image/png'});
      el('share-preview').src=next;el('share-preview').alt='ผลของฉัน '+winner.name+' · '+WizardShareCard.angleOrder.map(id=>MOVES[id].thai+' '+scores[id]+' คะแนน').join(' · ');
      el('share-full').href=next;el('share-full').hidden=false;
      el('share-download').disabled=false;
      el('share-facebook').disabled=false;
      const supported=Boolean(navigator.share&&navigator.canShare?.({files:[file]}));
      el('share-image').hidden=false;el('share-image').disabled=!supported;
      el('share-image-help').hidden=false;
    }catch(e){if(current!==generation)return;el('share-error').hidden=false;el('share-full').hidden=true;}
    finally{if(current===generation){el('share-preview-wrap').setAttribute('aria-busy','false');el('share-loading').hidden=true;}}
  }
  function close(){if(dialog().open)dialog().close();}
  function open(completedScores,trigger){
    if(!WizardShareCard.validScores(completedScores))return false;
    scores=Object.freeze(Object.fromEntries(WizardShareCard.angleOrder.map(id=>[id,completedScores[id]])));
    winner=WizardMatching.matchWizards(scores,WIZARD_ARCHETYPES)[0];opener=trigger||document.activeElement;format='post';status('');el('share-fallback').hidden=true;
    el('share-heading').textContent='แชร์ผลของฉัน: '+winner.name;el('share-link').value=link();
    el('share-personal-summary').textContent='จากคำตอบ 10 ข้อของคุณ · มุมคะแนนสูงสุด: '+peak();
    el('share-line').href='https://social-plugins.line.me/lineit/share?url='+encodeURIComponent(link())+'&text='+encodeURIComponent(caption());
    el('share-native-link').hidden=!navigator.share;
    document.querySelectorAll('[data-share-format]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.shareFormat===format)));
    el('share-full').hidden=true;dialog().showModal();prepare();return true;
  }
  async function copy(value,label){
    try{if(!navigator.clipboard)throw new Error('unavailable');await navigator.clipboard.writeText(value);status('คัดลอก'+label+'แล้ว');el('share-fallback').hidden=true;return true;}
    catch(e){el('share-text').value=value;el('share-fallback').hidden=false;status('เลือกและคัดลอก'+label+'ด้านล่างได้เลย');el('share-text').focus();el('share-text').select();return false;}
  }
  function download(){
    if(!file||!imageUrl)return;const a=document.createElement('a');a.href=imageUrl;a.download=file.name;document.body.append(a);a.click();a.remove();status('เริ่มดาวน์โหลดภาพแล้ว เลือกภาพจากแกลเลอรีเพื่อโพสต์ได้เลย');
  }
  async function shareImage(){
    if(!file)return;
    el('share-image').disabled=true;
    try{await navigator.share({files:[file],title:'ผลของฉัน: '+winner.name,text:caption(),url:link()});status('เปิดเมนูแชร์ภาพผลลัพธ์แล้ว');}
    catch(e){if(e.name==='AbortError'){status('ยกเลิกการแชร์แล้ว ภาพยังพร้อมบันทึก');return;}status('ส่งภาพไปแอปนี้ไม่ได้ กดบันทึกภาพแล้วเลือกจากแกลเลอรีได้เลย');}
    finally{if(file)el('share-image').disabled=false;}
  }
  async function shareLink(){
    el('share-native-link').disabled=true;
    try{await navigator.share({title:'ผลของฉัน: '+winner.name,text:caption(),url:link()});status('เปิดเมนูแชร์ข้อความผลลัพธ์แล้ว');}
    catch(e){if(e.name==='AbortError'){status('ยกเลิกการแชร์แล้ว');return;}await copy(caption(),'ผลลัพธ์พร้อมลิงก์');}
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
    el('share-facebook').addEventListener('click',async()=>{if(!file)return;download();if(await copy(caption(),'ผลลัพธ์พร้อมลิงก์'))status('เริ่มดาวน์โหลดภาพและคัดลอกผลพร้อมลิงก์แล้ว เพิ่มภาพและวางข้อความในโพสต์ Facebook ได้เลย');});
    el('share-retry').addEventListener('click',prepare);
    document.querySelectorAll('[data-share-format]').forEach(b=>b.addEventListener('click',()=>{if(format===b.dataset.shareFormat)return;format=b.dataset.shareFormat;status('');document.querySelectorAll('[data-share-format]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));prepare();}));
    // Controls become usable only after their handlers have been registered.
    dialog().querySelectorAll('button:not(#share-image):not(#share-download):not(#share-facebook)').forEach(b=>b.disabled=false);
  }
  root.WizardShare={init,open,reset:()=>{close();clean();winner=null;scores=null;status('');el('share-fallback').hidden=true;el('share-text').value='';}};
})(window);
