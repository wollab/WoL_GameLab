(function () {
  "use strict";
  const pages = { home:document.getElementById("home"), quiz:document.getElementById("quiz"), result:document.getElementById("result") };
  const el = id => document.getElementById(id);
  const $ = (tag, className, text) => {
    const node=document.createElement(tag); if(className) node.className=className;
    if(text!==undefined) node.textContent=text; return node;
  };
  const angleOrder=["explorer","listener","experimenter","connector","meaningmaker","creator","decider","synthesizer","reflector"];
  const toOriginalId = id => ({communicator:"meaningmaker",summarizer:"synthesizer"}[id] || id);
  const angles=Object.fromEntries(angleOrder.map(id=>[id,MOVES[id]]));
  const memberCounts=Object.fromEntries(Object.keys(WIZARD_FAMILIES).map(f=>[f,WIZARD_ARCHETYPES.filter(x=>x.family===f).length]));
  const errors=WizardMatching.validateSignatures(WIZARD_ARCHETYPES);
  if(errors.length){console.error("Wizard data:",errors);el("start").disabled=true;el("start").textContent="ข้อมูล Wizard ยังไม่พร้อม";return;}
  let answers={},questions=[],step=0,ranked=[];
  function show(page){
    Object.entries(pages).forEach(([key,element])=>element.classList.toggle("active",key===page));
    window.scrollTo({top:0,behavior:"instant"});
  }
  function shuffled(items){
    const copy=[...items];for(let i=copy.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;
  }
  function families(){
    const wrap=el("family-list");
    Object.entries(WIZARD_FAMILIES).forEach(([key,f])=>{
      const box=$("div","family");box.style.setProperty("--family",f.color);
      box.append($("div","symbol",f.icon),$("b","",f.title),$("small","",memberCounts[key]+" Archetypes"));
      wrap.append(box);
    });
  }
  function begin(){
    answers=Object.fromEntries(angleOrder.map(id=>[id,0]));
    questions=[...shuffled(QUESTIONS.slice(0,-1)).map(q=>({...q,options:shuffled(q.options)})), {...QUESTIONS[QUESTIONS.length-1],options:shuffled(QUESTIONS[QUESTIONS.length-1].options)}];
    step=0;show("quiz");renderQuestion();
  }
  function renderQuestion(){
    const q=questions[step];
    el("progress-label").textContent="คำถาม "+(step+1)+" / "+questions.length;
    el("progress").setAttribute("aria-valuenow",step);
    el("progress-fill").style.width=(step/questions.length*100)+"%";
    el("quiz-title").textContent=q.text;
    el("question-note").textContent=q.note||"";
    const wrap=el("options");wrap.replaceChildren();
    q.options.forEach((opt,i)=>{
      const button=$("button","option"+(q.options.length>6?" thumb":""));
      button.type="button";
      if(q.options.length>6){
        const img=$("img");img.src="../9-learning-angles/"+angles[opt.move].img;img.alt="";
        button.append(img);
      }else button.append($("span","bullet",String.fromCharCode(65+i)));
      button.append($("span","",opt.text));
      button.addEventListener("click",()=>{
        answers[opt.move]+=q.weight||1;
        step++;
        if(step<questions.length)renderQuestion();
        else{el("progress").setAttribute("aria-valuenow",questions.length);showResult();}
      });
      wrap.append(button);
    });
  }
  function showResult(){
    ranked=WizardMatching.matchWizards(answers,WIZARD_ARCHETYPES);
    const winner=ranked[0],f=WIZARD_FAMILIES[winner.family];
    el("result").style.setProperty("--family-color",f.color);
    el("result-art").textContent=f.icon;
    el("result-family").textContent="Family "+winner.family+" · "+f.title+" · "+f.thai;
    el("result-title").textContent=winner.name;
    el("result-motto").textContent="“"+f.motto+"”";
    el("result-description").textContent=winner.desc;
    el("result-reason").textContent="ผลคะแนนของคุณใกล้กับสายนี้ เพราะคุณใช้มุม "+winner.sig.map(id=>WIZARD_ANGLE_NAMES[id]).join(" / ")+" ในสัดส่วนที่สอดคล้องกับ Learning Signature ที่ออกแบบให้ Wizard นี้";
    el("result-quest").textContent=winner.quest;
    const signature=el("signature");signature.replaceChildren();
    ["มุมหลัก","มุมรอง","มุมสนับสนุน"].forEach((name,i)=>{
      const id=winner.sig[i],a=angles[toOriginalId(id)],row=$("div","sig");
      const img=$("img");img.src="../9-learning-angles/"+a.img;img.alt="";
      const copy=$("div");copy.append($("b","",a.thai),$("small","",a.guide));
      row.append(img,copy,$("span","tier",name+" • "+answers[toOriginalId(id)]+" คะแนน"));
      signature.append(row);
    });
    const note=el("close-note");
    const gap=ranked[0].matchScore-ranked[1].matchScore;
    note.hidden=!WizardMatching.hasCloseMatch(ranked);
    note.textContent="ผลลัพธ์นี้มีสายที่ใกล้กันมาก ("+ranked[1].name+") คะแนนห่างเพียง "+gap+" คะแนน จึงควรมองทั้งสองสายเป็นความเป็นไปได้ ไม่ใช่คำตอบตายตัว";
    const alt=el("alternatives");alt.replaceChildren();
    ranked.slice(1,4).forEach(t=>{
      const fam=WIZARD_FAMILIES[t.family],box=$("div","alternative");box.style.setProperty("--family",fam.color);
      const label=$("div");label.append($("b","",t.name),$("small","",fam.title+" · "+t.sig.map(id=>WIZARD_ANGLE_NAMES[id]).join(" / ")));
      box.append(label,$("span","small muted",t.matchScore+" แต้มจับคู่"));alt.append(box);
    });
    renderMatrix();
    show("result");
  }
  function renderMatrix(){
    const wrap=el("angle-matrix");
    const table=$("table","matrix"),thead=$("thead"),heading=$("tr");
    ["", "โลกภายนอก", "คน / ความสัมพันธ์", "โลกภายใน"].forEach(t=>heading.append($("th","",t)));
    thead.append(heading);table.append(thead);
    const tbody=$("tbody");
    const phaseNames=[["receive","เปิดรับ"],["process","แปรรูป"],["distill","ตกผลึก"]];
    phaseNames.forEach(([phase,title])=>{
      const row=$("tr");row.append($("th","",title));
      ["world","people","self"].forEach(source=>{
        const a=Object.values(angles).find(item=>item.phase===phase&&item.source===source);
        const cell=$("td"),btn=$("button","angle-card");
        btn.type="button";btn.style.setProperty("--a",a.color);
        const img=$("img");img.src="../9-learning-angles/"+a.img;img.alt="";
        btn.append(img,$("strong","",a.thai),$("span","",answers[a.id]+" คะแนน"));
        btn.addEventListener("click",()=>selectAngle(a.id));
        btn.dataset.angle=a.id;
        cell.append(btn);row.append(cell);
      });
      tbody.append(row);
    });
    table.append(tbody);wrap.replaceChildren(table);
    const top=[...angleOrder].sort((a,b)=>answers[b]-answers[a]||angleOrder.indexOf(a)-angleOrder.indexOf(b))[0];
    selectAngle(top);
  }
  function selectAngle(id){
    const a=angles[id];document.querySelectorAll(".angle-card").forEach(e=>e.classList.toggle("selected",e.dataset.angle===id));
    const box=el("angle-detail");box.replaceChildren($("strong","",a.thai+" · "+answers[id]+" คะแนน"),$("p","",a.detail));
  }
  async function share(){
    const winner=ranked[0];
    const text="What Is Your Magic? ✨\nWizard ของฉันคือ "+winner.name+" ("+WIZARD_FAMILIES[winner.family].title+")\nมาค้นหาเวทมนตร์ของคุณ: "+location.origin+location.pathname;
    try{
      if(navigator.share){await navigator.share({title:"What Is Your Magic?",text});}
      else if(navigator.clipboard){await navigator.clipboard.writeText(text);el("share-status").textContent="คัดลอกข้อความแชร์แล้ว";}
      else el("share-status").textContent=text;
    }catch(e){if(e.name!=="AbortError")el("share-status").textContent="แชร์ไม่สำเร็จ ลองคัดลอกลิงก์จากแถบที่อยู่";}
  }
  families();el("start").addEventListener("click",begin);el("quit").addEventListener("click",()=>show("home"));
  el("retake").addEventListener("click",begin);el("share").addEventListener("click",share);
})();