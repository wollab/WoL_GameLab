(function () {
  "use strict";
  const pages = Object.fromEntries(["home","quiz","result","wizards","wizard-profile","not-found"].map(id=>[id,document.getElementById(id)]));
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
  if(errors.length)throw new Error("Wizard data: "+errors.join("; "));
  let answers={},questions=[],choices=[],step=0,ranked=[];
  function show(page,scroll=true){
    Object.entries(pages).forEach(([key,element])=>element.classList.toggle("active",key===page));
    document.body.dataset.family=pages[page]?.dataset.family||"";
    el("nav-result").hidden=!ranked.length;
    document.querySelectorAll(".return-result").forEach(a=>a.hidden=!ranked.length);
    document.querySelectorAll("[data-nav]").forEach(a=>a.setAttribute("aria-current",a.dataset.nav===(page==="wizard-profile"?"wizards":page)?"page":"false"));
    if(scroll){
      window.scrollTo({top:0,behavior:"instant"});
      const title={home:"main-title",result:"result-title",wizards:"catalog-title","wizard-profile":"profile-title","not-found":"missing-title"}[page];
      if(title)el(title).focus({preventScroll:true});
    }
    document.title=(page==="wizard-profile"?el("profile-title").textContent+" · ":"")+"27 Wizards of Learning · 27 Wizard Archetypes";
  }
  function route(){
    const [name,id,part]=location.hash.slice(1).split("/");
    if(ranked.length)history.replaceState({...history.state,magicScores:{...answers}},"",location.href);
    let chapter;
    if(name==="wizard"){
      if(!WizardPages.profile(id,{ranked})){show("not-found");return;}
      show("wizard-profile",!part);chapter=part?el("profile-"+part):null;
    }else if(name==="wizards"){
      if(id&&!Object.hasOwn(WIZARD_FAMILIES,id)){show("not-found");return;}
      WizardPages.catalog(id||"all");show("wizards");
    }else if(name==="result"&&ranked.length){show("result",!id);chapter=id?el("result-"+id):null;}
    else if(name==="quiz"){
      if(questions.length&&step<questions.length){show("quiz");renderQuestion();}else begin();
    }else if(!name||name==="home"||name==="result"){show("home");}
    else show("not-found");
    document.querySelectorAll(".chapter-nav a").forEach(a=>a.setAttribute("aria-current",a.hash===location.hash?"location":"false"));
    document.querySelectorAll(".chapter-select").forEach(select=>{select.value=[...select.options].some(opt=>opt.value===location.hash)?location.hash:select.options[0].value;});
    if(chapter){chapter.scrollIntoView({block:"start",behavior:"instant"});const title=chapter.querySelector("h2");if(title){title.tabIndex=-1;title.focus({preventScroll:true});}}
  }
  function shuffled(items){
    const copy=[...items];for(let i=copy.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;
  }
  function families(){
    const wrap=el("family-list");
    const stories={
      A:{heading:"เข้าใจโลกผ่านความรู้",example:"เริ่มจากสำรวจว่าเรื่องนี้ทำงานอย่างไร และอะไรเชื่อมโยงกัน",cast:["mage","scholar","diviner"]},
      B:{heading:"สร้างเงื่อนไขให้เติบโต",example:"เริ่มจากฟังว่าใครต้องการอะไร แล้วลองปรับสิ่งที่ช่วยให้เติบโต",cast:["healer","holy-knight","alchemist"]},
      C:{heading:"ค้นคุณค่าในเรื่องราว",example:"เริ่มจากฟังประสบการณ์ ย้อนทบทวน และมองหาบทเรียนที่หลงลืม",cast:["necromancer","summoner","shaman"]},
      D:{heading:"เปลี่ยนมุมมองด้วยการสื่อสาร",example:"เริ่มจากหาวิธีเล่าหรือสร้างประสบการณ์ให้คนเข้าใจเรื่องเดียวกันใหม่",cast:["bard","illusionist","enchanter"]},
      E:{heading:"เปลี่ยนความคิดให้เป็นของจริง",example:"เริ่มจากทำต้นแบบ ฝึกใช้จริง และเลือกทางที่เหมาะกับข้อจำกัด",cast:["artificer","spellblade","blood-mage"]}
    };
    Object.entries(WIZARD_FAMILIES).forEach(([key,f])=>{
      const story=stories[key];
      const box=$("a","family");box.href="#wizards/"+key;box.style.setProperty("--family",f.color);
      box.setAttribute("aria-label",f.title+" · "+story.heading+" · สำรวจ "+memberCounts[key]+" สาย");
      const copy=$("div","family-copy");copy.append($("b","family-english",f.title),$("h3","",story.heading),$("p","family-description",f.description));
      const example=$("p","family-example");example.append($("span","","เมื่อเจอโจทย์ใหม่"),document.createTextNode(story.example));copy.append(example,$("span","family-link","สำรวจ "+memberCounts[key]+" สายในกลุ่มนี้ →"));
      const cast=$("div","family-cast");
      story.cast.forEach(id=>{const type=WIZARD_ARCHETYPES.find(t=>t.id===id),figure=$("figure");figure.append(WizardUI.portrait(type,"",true),$("figcaption","",type.name));cast.append(figure);});
      box.append(copy,cast);
      wrap.append(box);
    });
  }
  function begin(){
    WizardShare.reset();
    answers=Object.fromEntries(angleOrder.map(id=>[id,0]));
    ranked=[];
    questions=[...shuffled(QUESTIONS.slice(0,-1)).map(q=>({...q,options:shuffled(q.options)})), {...QUESTIONS[QUESTIONS.length-1],options:shuffled(QUESTIONS[QUESTIONS.length-1].options)}];
    step=0;choices=[];
    if(location.hash!=="#quiz")history.pushState({},"","#quiz");else history.replaceState({},"","#quiz");
    WizardStats.begin();
    show("quiz");renderQuestion();
  }
  function renderQuestion(){
    const q=questions[step];
    el("progress-label").textContent="คำถาม "+(step+1)+" / "+questions.length;
    const completed=choices.filter(Boolean).length;
    el("progress").setAttribute("aria-valuenow",completed);
    el("progress").setAttribute("aria-valuetext","เลือกคำตอบแล้ว "+completed+" จาก "+questions.length+" ข้อ");
    el("progress-fill").style.width=(completed/questions.length*100)+"%";
    el("quiz-title").textContent=q.text;
    el("question-note").textContent=q.note||"";
    const wrap=el("options");wrap.replaceChildren();
    q.options.forEach((opt,i)=>{
      const button=$("button","option"+(q.options.length>6?" thumb":""));
      button.type="button";
      button.setAttribute("aria-pressed",String(choices[step]===opt));
      if(q.options.length>6){
        const img=$("img");img.src=WizardArtwork.angle(opt.move);img.alt="";
        button.append(img);
      }else button.append($("span","bullet",String.fromCharCode(65+i)));
      button.append($("span","",opt.text));
      button.addEventListener("click",()=>{
        if(!button.isConnected)return;
        choices[step]=opt;
        wrap.querySelectorAll("button").forEach(item=>item.setAttribute("aria-pressed",String(item===button)));
        el("quiz-next").disabled=false;
        const count=choices.filter(Boolean).length;
        el("progress").setAttribute("aria-valuenow",count);
        el("progress").setAttribute("aria-valuetext","เลือกคำตอบแล้ว "+count+" จาก "+questions.length+" ข้อ");
        el("progress-fill").style.width=(count/questions.length*100)+"%";
      });
      wrap.append(button);
    });
    el("quiz-prev").disabled=step===0;
    el("quiz-next").disabled=!choices[step];
    el("quiz-next").textContent=step===questions.length-1?"ดู Wizard ของฉัน →":"ข้อถัดไป →";
    el("quiz-title").focus({preventScroll:true});
    window.scrollTo({top:0,behavior:"instant"});
  }
  function nextQuestion(){
    if(!choices[step])return;
    if(step<questions.length-1){step++;renderQuestion();return;}
    answers=Object.fromEntries(angleOrder.map(id=>[id,0]));
    choices.forEach((opt,i)=>{answers[opt.move]+=questions[i].weight||1;});
    step=questions.length;
    renderResult();history.replaceState({...history.state,magicScores:{...answers}},"","#result");show("result");WizardStats.complete(answers);
  }
  function renderResult(){
    ranked=WizardMatching.matchWizards(answers,WIZARD_ARCHETYPES);
    const winner=ranked[0],f=WIZARD_FAMILIES[winner.family];
    WizardStats.show(el("result-statistics-panel"),winner.id);
    el("result").style.setProperty("--family-color",f.color);
    el("result").dataset.family=winner.family;
    el("result-art").replaceChildren(WizardUI.heroVisual(winner));
    el("winner-profile").href=WizardUI.profileHref(winner.id);
    el("intro-profile-link").href=WizardUI.profileHref(winner.id);
    el("result-family").textContent="Family "+winner.family+" · "+f.thai;
    el("result-family").title=f.title;
    el("result-title").textContent=winner.name;
    el("result-motto").textContent="“"+winner.quote+"”";
    el("result-description").textContent=winner.name.split(" / ")[0]+" "+winner.desc;
    const highest=Math.max(...Object.values(answers));
    const peaks=angleOrder.filter(id=>answers[id]===highest);
    el("result-introduction").textContent="ในคำตอบชุดนี้ มุมที่คุณเลือกใช้มากที่สุดคือ "+peaks.map(id=>angles[id].thai).join(" / ")+" ("+highest+" คะแนน) ลองเทียบกับเหตุการณ์จริงของคุณว่าเห็นมุมเหล่านี้อย่างไร";
    el("result-gift").textContent=winner.gift;
    const contributed=winner.sig.filter(id=>answers[toOriginalId(id)]>0);
    const unused=winner.sig.filter(id=>answers[toOriginalId(id)]===0);
    el("result-reason").textContent="ระบบเทียบคะแนนทั้ง 9 มุมกับลายเซ็นที่ออกแบบให้ Wizard แต่ละสาย โดยมุมหลักมีน้ำหนักมากกว่ามุมรองและมุมสนับสนุน สำหรับสายนี้ คะแนนที่มีส่วนร่วมมาจาก "+contributed.map(id=>WIZARD_ANGLE_NAMES[id]+" "+answers[toOriginalId(id)]+" คะแนน").join(" / ")+(unused.length?" ส่วน "+unused.map(id=>WIZARD_ANGLE_NAMES[id]).join(" / ")+" ได้ 0 คะแนนในคำตอบชุดนี้ เป็นส่วนหนึ่งของลายเซ็น Wizard ไม่ใช่พฤติกรรมที่คุณเลือก":"")+" ผลนี้จึงเป็นข้อชวนสำรวจ ไม่ใช่คำอธิบายตัวคุณทุกด้าน";
    el("result-quest-copy").textContent=winner.quest;
    const signature=el("signature");signature.replaceChildren();
    ["มุมหลัก","มุมรอง","มุมสนับสนุน"].forEach((name,i)=>{
      const id=winner.sig[i],a=angles[toOriginalId(id)],row=$("div","sig");
      const img=$("img");img.src=WizardArtwork.angle(id);img.alt="";
      const copy=$("div");copy.append($("b","",a.thai),$("small","",a.guide));
      row.append(img,copy,$("span","tier",name+" • "+answers[toOriginalId(id)]+" คะแนน"));
      signature.append(row);
    });
    const note=el("close-note");
    const gap=ranked[0].matchScore-ranked[1].matchScore;
    const topNote=el("hero-close-note");topNote.hidden=!WizardMatching.hasCloseMatch(ranked);
    topNote.replaceChildren(document.createTextNode(gap===0?"มีมากกว่าหนึ่งสายที่ได้แต้มจับคู่สูงสุดเท่ากัน ":"มีอีกสายที่ใกล้กับคำตอบของคุณมาก "));
    const closeLink=$("a","", "สำรวจ "+ranked[1].name+" และสายใกล้เคียง →");closeLink.href="#result/nearby";topNote.append(closeLink);
    note.hidden=!WizardMatching.hasCloseMatch(ranked);
    note.textContent="ผลลัพธ์นี้มีสายที่ใกล้กันมาก ("+ranked[1].name+") คะแนนห่างเพียง "+gap+" คะแนน จึงควรมองทั้งสองสายเป็นความเป็นไปได้ ไม่ใช่คำตอบตายตัว";
    const alt=el("alternatives");alt.replaceChildren();
    ranked.slice(1,4).forEach(t=>{
      const fam=WIZARD_FAMILIES[t.family],box=WizardUI.profileLink(t,"alternative","");box.replaceChildren();box.style.setProperty("--family",fam.color);
      const label=$("div");label.append($("b","",t.name),$("small","",fam.title+" · "+t.sig.map(id=>WIZARD_ANGLE_NAMES[id]).join(" / ")));
      box.append(WizardUI.portrait(t,"alternative-portrait",true),label,$("span","small muted",t.matchScore+" แต้มจับคู่"),WizardUI.icon("arrow"));alt.append(box);
    });
    renderMatrix();
    WizardUI.chapters("result-chapters","#result",[["intro","บทนำ"],["statistics","สถิติผลแบบสอบถาม"],["matrix","9 Learning Angles"],["signature","Learning Signature"],["strength","จุดแข็ง"],["nearby","Wizard ใกล้เคียง"],["quest","Growth Quest"]]);
  }
  function renderMatrix(){
    const wrap=el("angle-matrix");
    const highest=Math.max(...Object.values(answers));
    const table=$("table","matrix"),thead=$("thead"),heading=$("tr");
    ["", "โลกภายนอก", "คน / ความสัมพันธ์", "โลกภายใน"].forEach(t=>{const h=$("th","",t);h.scope="col";heading.append(h);});
    thead.append(heading);table.append(thead);
    const tbody=$("tbody");
    const phaseNames=[["receive","เปิดรับ"],["process","แปรรูป"],["distill","ตกผลึก"]];
    phaseNames.forEach(([phase,title])=>{
      const row=$("tr"),rowTitle=$("th","",title);rowTitle.scope="row";row.append(rowTitle);
      ["world","people","self"].forEach(source=>{
        const a=Object.values(angles).find(item=>item.phase===phase&&item.source===source);
        const cell=$("td"),btn=$("button","angle-card");
        const score=answers[a.id];
        btn.classList.toggle("score-low",score<=1);
        btn.classList.toggle("score-high",score>=4);
        btn.classList.toggle("is-peak",score===highest&&score>1);
        btn.type="button";btn.style.setProperty("--a",a.color);
        const img=$("img");img.src=WizardArtwork.angle(a.id);img.alt="";
        const scoreLabel=$("span","angle-score");scoreLabel.append($("b","",score),document.createTextNode(" คะแนน"));
        btn.append(img,$("strong","",a.thai),scoreLabel);
        if(score===highest&&score>1)btn.append($("small","peak-label","สูงสุด"));
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
    const a=angles[id];document.querySelectorAll(".angle-card").forEach(e=>{e.classList.toggle("selected",e.dataset.angle===id);e.setAttribute("aria-pressed",String(e.dataset.angle===id));});
    const box=el("angle-detail");box.replaceChildren($("strong","",a.thai+" · "+answers[id]+" คะแนน"),$("p","",a.detail));
  }
  function share(event){if(ranked.length)WizardShare.open(answers,event.currentTarget);}
  families();
  document.querySelectorAll("[data-family-filter]").forEach(a=>{const id=a.dataset.familyFilter;a.textContent=id==="all"?"ทุกสาย · 27":WIZARD_FAMILIES[id].thai+" · "+memberCounts[id];});
  WizardUI.decorate();
  WizardShare.init();
  document.getElementById("start").addEventListener("click",begin);
  document.getElementById("quit").addEventListener("click",()=>{history.pushState({},"","#home");show("home");});
  document.getElementById("retake").addEventListener("click",begin);
  document.getElementById("share").addEventListener("click",share);
  el("share-hero").addEventListener("click",share);
  el("quiz-next").addEventListener("click",nextQuestion);
  el("quiz-prev").addEventListener("click",()=>{if(step>0){step--;renderQuestion();}});
  el("catalog-search").addEventListener("input",()=>WizardPages.catalog(location.hash.split("/")[1]||"all"));
  el("catalog-clear").addEventListener("click",()=>{el("catalog-search").value="";WizardPages.catalog(location.hash.split("/")[1]||"all");el("catalog-search").focus();});
  ["start","quit","retake","share","share-hero"].forEach(id=>el(id).disabled=false);
  el("startup-status").hidden=true;
  el("skip-content").addEventListener("click",event=>{event.preventDefault();el("main").focus();});
  document.addEventListener("click",event=>{
    const a=event.target.closest("a");
    if(a&&a.id!=="skip-content"&&a.origin===location.origin&&a.pathname===location.pathname&&a.hash&&a.hash===location.hash){event.preventDefault();route();}
  });
  window.addEventListener("hashchange",route);
  const saved=history.state?.magicScores;
  if(saved&&angleOrder.every(id=>Number.isInteger(saved[id])&&saved[id]>=0&&saved[id]<=7)&&angleOrder.reduce((sum,id)=>sum+saved[id],0)===19){answers=Object.fromEntries(angleOrder.map(id=>[id,saved[id]]));renderResult();WizardStats.resume(answers);}
  route();
})();
