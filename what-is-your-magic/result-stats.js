(function(root){
'use strict';
const endpoint='/api/result-stats',VERSION='v1-20261107';
let cached=null,cachedAt=0,readPromise=null,epoch=0,run=null;
const number=new Intl.NumberFormat('th-TH'),percent=new Intl.NumberFormat('th-TH',{minimumFractionDigits:1,maximumFractionDigits:1});
const angleIds=['explorer','listener','experimenter','connector','meaningmaker','creator','decider','synthesizer','reflector'];
const node=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
async function request(body){const response=await fetch(endpoint,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(12000)}:{signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('Statistics unavailable');return response.json();}
function valid(data){return data?.version===VERSION&&Number.isSafeInteger(data.total)&&data.total>=0&&WIZARD_ARCHETYPES.every(t=>Number.isSafeInteger(data.counts?.[t.id])&&data.counts[t.id]>=0)&&WIZARD_ARCHETYPES.reduce((n,t)=>n+data.counts[t.id],0)===data.total&&Number.isSafeInteger(data.angleResults)&&data.angleResults>=0&&data.angleResults<=data.total&&angleIds.every(id=>Number.isSafeInteger(data.anglePoints?.[id])&&data.anglePoints[id]>=0)&&angleIds.reduce((n,id)=>n+data.anglePoints[id],0)===data.angleResults*19;}
async function read(){
 if(cached&&Date.now()-cachedAt<30000)return cached;
 if(!readPromise){const started=epoch;readPromise=request().then(data=>{if(!valid(data))throw Error('Invalid statistics');if(started===epoch){cached=data;cachedAt=Date.now();}return cached||data;}).finally(()=>{readPromise=null;});}
 return readPromise;
}
function state(value){try{history.replaceState({...history.state,magicStats:value},'',location.href);}catch{}}
function begin(){const item={token:null,done:false,promise:null};run=item;item.promise=request({action:'start'}).then(data=>{if(data.version!==VERSION||!data.token)throw Error('Invalid ticket');item.token=data.token;if(run===item)state({token:item.token,done:false});return data.token;}).catch(()=>null);}
function status(panel,message,retry){panel.replaceChildren(node('h2','','สัดส่วนผลแบบสอบถาม'),node('p','muted',message));if(retry){const button=node('button','secondary','ลองโหลดสถิติอีกครั้ง');button.type='button';button.onclick=()=>show(panel,panel.dataset.archetype);panel.append(button);}}
function render(panel,typeId,data){
 if(panel.dataset.archetype!==typeId)return;
 panel.replaceChildren(node('p','eyebrow','จากผลแบบสอบถามที่บันทึกไว้'),node('h2','','มีผลสายเดียวกันมากแค่ไหน?'));
 if(data.total===0)panel.append(node('p','statistics-empty','ยังไม่มีผลแบบสอบถามที่บันทึกไว้ในเวอร์ชันนี้ เมื่อมีข้อมูลจะแสดงสัดส่วนที่นี่'));
 else{
  const count=data.counts[typeId],figure=node('p','statistics-figure');figure.append(node('strong','statistics-value',percent.format(count/data.total*100)+'%'),node('span','','ของผลที่บันทึกไว้เป็นสายนี้'));
  panel.append(figure,node('p','statistics-base',number.format(count)+' ครั้ง จากทั้งหมด '+number.format(data.total)+' ผลแบบสอบถาม'));
  const ranked=[...WIZARD_ARCHETYPES].sort((a,b)=>data.counts[b.id]-data.counts[a.id]||a.name.localeCompare(b.name,'en')),top=ranked.filter(t=>data.counts[t.id]===data.counts[ranked[0].id]);
  panel.append(node('p','statistics-top','สายที่พบมากที่สุด'+(top.length>1?' (จำนวนเท่ากัน)':'')+': '+top.map(t=>t.name).join(', ')));
  const details=node('details','statistics-distribution'),summary=node('summary','','ดูสัดส่วนทั้ง 27 สาย'),list=node('ol','statistics-list');
  for(const type of ranked){const li=node('li',type.id===typeId?'statistics-current':'');li.append(node('span','',type.name),node('strong','',percent.format(data.counts[type.id]/data.total*100)+'%'),node('small','',number.format(data.counts[type.id])+' ครั้ง'));list.append(li);}
  details.append(summary,list);panel.append(details);
  if(data.firstRecordedAt)panel.append(node('p','small muted','เริ่มเก็บข้อมูล '+new Intl.DateTimeFormat('th-TH',{dateStyle:'medium'}).format(new Date(data.firstRecordedAt))));
 }
 const angleDetails=node('details','statistics-angles'),angleSummary=node('summary','','ดูสถิติรวม 9 Learning Angles');
 angleDetails.append(angleSummary);
 if(data.angleResults){
  angleDetails.append(node('h3','','สัดส่วนคะแนนรวมของแต่ละมุม'),node('p','small muted','จากคะแนนรวม '+number.format(data.angleResults*19)+' แต้ม ของผลแบบสอบถาม '+number.format(data.angleResults)+' ครั้ง · ไม่ใช่เปอร์เซ็นต์ของคน'));
  const angleList=node('ol','statistics-list statistics-angle-list');for(const id of [...angleIds].sort((a,b)=>data.anglePoints[b]-data.anglePoints[a]||angleIds.indexOf(a)-angleIds.indexOf(b))){const li=node('li'),pct=data.anglePoints[id]/(data.angleResults*19)*100;li.append(node('span','',MOVES[id].thai),node('strong','',percent.format(pct)+'%'),node('small','',number.format(data.anglePoints[id])+' แต้ม'));angleList.append(li);}angleDetails.append(angleList);
 }else angleDetails.append(node('p','small muted','ยังไม่มีคะแนนรวม 9 มุมที่บันทึกไว้ เริ่มเก็บใหม่พร้อมแบบสอบถามเวอร์ชันนี้'));
 panel.append(angleDetails);
 panel.append(node('p','small muted statistics-explanation','นับเป็นครั้งที่ทำแบบสอบถามเสร็จ ไม่ใช่จำนวนคน คนหนึ่งอาจเล่นซ้ำได้ สถิตินี้ไม่ได้แทนประชากรทั้งหมด และเปอร์เซ็นต์มีการปัดเศษ'),node('p','small muted','เก็บสายที่ได้ เวอร์ชัน เวลา รหัสรายการกันนับซ้ำ และคะแนนรวม 9 มุม โดยไม่เก็บชื่อ อีเมล คำตอบรายข้อ หรือชุดคะแนนรายบุคคล'));
}
function show(panel,typeId){if(!panel||!WIZARD_ARCHETYPES.some(t=>t.id===typeId))return;panel.dataset.statistics='';panel.dataset.archetype=typeId;panel.classList.add('statistics-panel');panel.setAttribute('aria-live','polite');status(panel,'กำลังโหลดสถิติ…');read().then(data=>render(panel,typeId,data)).catch(()=>{if(panel.dataset.archetype===typeId)status(panel,'ยังโหลดสถิติไม่ได้ คุณยังอ่านผลและแชร์ได้ตามปกติ',true);});}
function refresh(){document.querySelectorAll('[data-statistics][data-archetype]').forEach(panel=>show(panel,panel.dataset.archetype));}
async function complete(scores){
 const item=run;if(!item||item.done||item.sending)return;item.sending=true;const note=document.getElementById('statistics-save-status');if(note)note.textContent='กำลังบันทึกสถิติผลครั้งนี้…';
 try{
  if(!item.token){await item.promise;if(!item.token){const data=await request({action:'start'});item.token=data.token;if(run===item)state({token:item.token,done:false});}}
  const data=await request({action:'record',token:item.token,scores});if(!valid(data))throw Error('Invalid statistics');item.done=true;epoch++;cached=data;cachedAt=Date.now();
  if(run===item){state({token:item.token,done:true});if(note)note.textContent='บันทึกผลครั้งนี้ในสถิติแล้ว';refresh();}
 }catch{if(run===item&&note){note.replaceChildren(document.createTextNode('ยังบันทึกสถิติครั้งนี้ไม่ได้ '));const retry=node('button','statistics-retry','ลองบันทึกอีกครั้ง');retry.type='button';retry.onclick=()=>complete(scores);note.append(retry);}}
 finally{item.sending=false;}
}
function resume(scores){const saved=history.state?.magicStats;if(saved?.token){run={token:saved.token,done:!!saved.done};if(!run.done)complete(scores);}}
root.WizardStats={begin,complete,resume,show,refresh};
})(window);
