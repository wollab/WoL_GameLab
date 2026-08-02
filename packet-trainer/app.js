// Packet Trainer — flow ทั้งหมด (Drill / Composer / Progress)

const KEY = "packet_trainer_v1";
const AXIS_LABEL = {
  MODE: "เลือกโหมด", SCOPE: "คุมขอบเขต", DONE: "เกณฑ์ปิดงาน",
  DELTA: "รายงานเป็น delta", TOOL: "ใช้สคริปต์แทนโมเดล", CLOSE: "ปิดงาน ไม่สร้างเพิ่ม",
};

let S = {
  view: "home",
  queue: [], idx: 0,
  answer: null,
  result: null,
  round: [],
  composer: { mode: null, goal: "", files: [], currentState: "", deliverable: "", doneWhen: "", boundary: "", decisions: "" },
};

// ---------- storage ----------
function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { runs: [], composer: [], paths: [] }; }
  catch (e) { return { runs: [], composer: [], paths: [] }; }
}
function save(d) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...d, runs: d.runs.slice(-200) })); } catch (e) {}
}

// ---------- helpers ----------
const $ = (sel) => document.querySelector(sel);
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function fileLabel(p) {
  const f = FILES[p] || { bytes: 0 };
  return `${f.est ? "≈" : ""}${fmtTokens(estTokens(f.bytes))}`;
}
function todayKey() { return new Date().toISOString().slice(0, 10); }

// ---------- routing ----------
function go(view) { S.view = view; window.scrollTo(0, 0); render(); }

function render() {
  const el = $("#app");
  if (S.view === "home") el.innerHTML = viewHome();
  else if (S.view === "drill") el.innerHTML = viewDrill();
  else if (S.view === "result") el.innerHTML = viewResult();
  else if (S.view === "roundEnd") el.innerHTML = viewRoundEnd();
  else if (S.view === "composer") el.innerHTML = viewComposer();
  else if (S.view === "progress") el.innerHTML = viewProgress();
  document.querySelectorAll("nav.tabs button").forEach((b) => {
    b.classList.toggle("on", b.dataset.go === S.view);
  });
}

// ---------- home ----------
function viewHome() {
  const d = load();
  const n = d.runs.length;
  return `
    <section class="card intro">
      <h2>ฝึกจัด context ให้ AI</h2>
      <p>โจทย์คือคำสั่งดิบแบบที่คนพูดจริง หน้าที่คุณคือแปลงมันเป็น Task Packet
      ที่ AI ทำงานต่อได้โดยไม่ต้องเดา และไม่ต้องเปิดไฟล์ที่ไม่เกี่ยว</p>
      <button class="big" onclick="startRound()">เริ่มฝึก 3 ข้อ</button>
      <p class="muted small">ฝึกมาแล้ว ${n} ข้อ${n ? ` · เฉลี่ย ${Math.round(d.runs.reduce((s, r) => s + r.total, 0) / n)}/100` : ""}</p>
    </section>
    <section class="card">
      <h3>6 แกนที่ฝึก</h3>
      <ul class="axes">
        ${Object.entries(AXIS_LABEL).map(([k, v]) => `<li><b>${k}</b> ${esc(v)}</li>`).join("")}
      </ul>
    </section>`;
}

function startRound() {
  const pool = SCENARIOS.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  S.queue = pool.slice(0, 3);
  S.idx = 0; S.round = [];
  newAnswer();
  go("drill");
}
function newAnswer() {
  S.answer = { mode: null, files: [], doneWhen: "", boundary: [], decisions: [] };
  S.result = null;
}
function cur() { return S.queue[S.idx]; }

// ---------- drill ----------
function viewDrill() {
  const s = cur();
  const a = S.answer;
  const tokens = a.files.reduce((t, p) => t + estTokens((FILES[p] || {}).bytes || 0), 0);
  const blown = a.files.some((p) => (FILES[p] || {}).banned);

  const showFiles = !!a.mode;
  const showDone = showFiles && a.files.length > 0;
  const showGuard = showDone && a.doneWhen.trim().length > 0;

  return `
    <div class="crumb">ข้อ ${S.idx + 1}/${S.queue.length}${s.source === "codex-audit" ? ' · <span class="tag">workspace</span>' : ""}</div>

    <section class="card ask">
      <div class="quote">"${esc(s.ask)}"</div>
      <p class="muted">${esc(s.context)}</p>
    </section>

    <section class="card">
      <h3>1 · โหมด</h3>
      <div class="modes">
        ${MODES.map((m) => `
          <button class="mode ${a.mode === m ? "on" : ""}" onclick="pickMode('${m}')">
            <b>${m}</b><span>${esc(MODE_HINT[m])}</span>
          </button>`).join("")}
      </div>
    </section>

    ${!showFiles ? "" : `
    <section class="card">
      <h3>2 · Canonical source</h3>
      <p class="muted small">เลือกเท่าที่ AI ต้องเปิดจริง — codex แนะนำไม่เกิน 3</p>
      <div class="chips">
        ${s.fileOptions.map((p) => `
          <button class="chip ${a.files.includes(p) ? "on" : ""} ${(FILES[p] || {}).banned ? "danger" : ""}"
            onclick="toggleFile('${p}')">
            <span class="path">${esc(p)}</span><span class="tok">${fileLabel(p)}</span>
          </button>`).join("")}
      </div>
    </section>`}

    ${!showDone ? "" : `
    <section class="card">
      <h3>3 · DONE WHEN</h3>
      <p class="muted small">เขียนสิ่งที่เปิดดูแล้วตัดสินได้ทันทีว่าผ่านหรือไม่ผ่าน</p>
      <textarea id="dw" rows="3" placeholder="เช่น เปิด nhrc-venn/index.html แล้วตัวอักษรบนการ์ด ≥ 22px"
        oninput="onDone(this.value)">${esc(a.doneWhen)}</textarea>
      <div class="livecheck">${liveDoneHints(a.doneWhen)}</div>
    </section>`}

    ${!showGuard ? "" : `
    <section class="card" id="guardCard">
      <h3>4 · ล็อกขอบเขต</h3>
      <p class="muted small">BOUNDARY — ห้ามแตะอะไร</p>
      <div class="opts">
        ${s.boundaryOptions.map((o, i) => `
          <button class="opt ${a.boundary.includes(i) ? "on" : ""}" onclick="toggleOpt('boundary',${i})">${esc(o.text)}</button>`).join("")}
      </div>
      <p class="muted small mt">DECISIONS ALREADY MADE — ห้ามย้อนกลับไปคิดใหม่</p>
      <div class="opts">
        ${s.decisionOptions.map((o, i) => `
          <button class="opt ${a.decisions.includes(i) ? "on" : ""}" onclick="toggleOpt('decisions',${i})">${esc(o.text)}</button>`).join("")}
      </div>
    </section>`}

    <div class="stickybar">
      <div class="meter ${blown ? "blown" : ""}">
        <span class="lbl">${blown ? "💥 context ระเบิด" : "จะให้ AI โหลด"}</span>
        <b>${fmtTokens(tokens)}</b><span class="lbl">tokens</span>
      </div>
      <button class="go" ${showGuard ? "" : "disabled"} onclick="submitDrill()">ตรวจคำตอบ</button>
    </div>`;
}

function liveDoneHints(text) {
  const r = scoreDoneWhen(text);
  return r.checks.map((c) => `<span class="hint ${c.pass ? "ok" : ""}">${c.pass ? "✓" : "○"} ${esc(c.label)}</span>`).join("");
}

function pickMode(m) { S.answer.mode = m; render(); }
function toggleFile(p) {
  const f = S.answer.files;
  const i = f.indexOf(p);
  if (i >= 0) f.splice(i, 1); else f.push(p);
  render();
}
// อัปเดต hint ในที่ (ถ้า re-render ทุกตัวอักษร โฟกัสใน textarea จะหลุด)
// จะ render ใหม่เฉพาะตอนที่ส่วน "ล็อกขอบเขต" ต้องโผล่หรือหายไป
function onDone(v) {
  S.answer.doneWhen = v;
  $(".livecheck").innerHTML = liveDoneHints(v);
  const shown = !!$("#guardCard");
  const should = v.trim().length > 0;
  if (shown !== should) render();
}
function toggleOpt(kind, i) {
  const arr = S.answer[kind];
  const at = arr.indexOf(i);
  if (at >= 0) arr.splice(at, 1); else arr.push(i);
  render();
}

function submitDrill() {
  const s = cur();
  S.result = scorePacket(S.answer, s, FILES);
  S.round.push(S.result);

  const d = load();
  d.runs.push({
    ts: Date.now(), day: todayKey(), scenarioId: s.id,
    total: S.result.total, tokens: S.result.tokens, refTokens: S.result.refTokens,
    axes: s.axes.reduce((o, a) => { o[a] = axisScoreFor(a, S.result); return o; }, {}),
  });
  save(d);
  go("result");
}

// แปลงคะแนน 4 ส่วนเป็นคะแนนของแกนที่ scenario ติดแท็กไว้
function axisScoreFor(axis, r) {
  if (axis === "MODE") return r.axes.MODE;
  if (axis === "SCOPE") return r.axes.SCOPE;
  if (axis === "DONE") return r.axes.DONE;
  return (r.axes.SCOPE + r.axes.GUARD) / 2; // DELTA / TOOL / CLOSE วัดผ่านขอบเขต+การล็อก
}

// ---------- result ----------
function viewResult() {
  const s = cur(), r = S.result, a = S.answer;
  const ratio = r.refTokens ? (r.tokens / r.refTokens) : 1;
  const refPacket = buildPacketText({
    mode: s.expectedMode, goal: s.reference.goal, files: s.referenceFiles,
    currentState: s.reference.currentState,
    decisions: s.decisionOptions.filter((o) => o.correct).map((o) => o.text),
    deliverable: s.reference.deliverable, doneWhen: s.reference.doneWhen,
    boundary: s.boundaryOptions.filter((o) => o.correct).map((o) => o.text),
  });

  return `
    <section class="card score">
      <div class="total ${r.total >= 80 ? "good" : r.total >= 50 ? "mid" : "low"}">${r.total}<small>/100</small></div>
      <div class="tokencmp ${r.scope.blown ? "blown" : ""}">
        <div><span class="lbl">packet ของคุณ</span><b>${fmtTokens(r.tokens)}</b></div>
        <div><span class="lbl">packet อ้างอิง</span><b>${fmtTokens(r.refTokens)}</b></div>
        <div class="ratio">${r.scope.blown ? "💥" : (ratio <= 1.2 ? "พอดี" : `${ratio.toFixed(1)}×`)}</div>
      </div>
    </section>

    <section class="card">
      ${part("โหมด", r.mode)}
      ${part("ขอบเขต", r.scope)}
      ${part("เกณฑ์ปิดงาน", r.done)}
      ${part("ล็อกขอบเขต", r.guard)}
      ${r.done.checks.filter((c) => !c.pass).length ? `
        <div class="missed">DONE WHEN ที่คุณเขียนยังขาด:
          ${r.done.checks.filter((c) => !c.pass).map((c) => `<span>${esc(c.label)}</span>`).join("")}
        </div>` : ""}
      ${r.scope.blown ? `<div class="alert">คุณเลือก ${r.scope.banned.map(esc).join(", ")} —
        ${esc((FILES[r.scope.banned[0]] || {}).why || "")} อ่านเข้าไปก็ไม่ได้อะไร</div>` : ""}
    </section>

    <section class="card">
      <h3>สิ่งที่โจทย์นี้สอน</h3>
      <p>${esc(s.teaching)}</p>
    </section>

    <section class="card">
      <h3>packet อ้างอิง</h3>
      <p class="muted small">เกณฑ์อัตโนมัติวัดได้แค่โครงสร้าง วัดความหมายไม่ได้ — เทียบกับอันนี้เองคือส่วนที่สอนจริง</p>
      <pre>${esc(refPacket)}</pre>
    </section>

    <div class="stickybar">
      <button class="go" onclick="nextDrill()">${S.idx + 1 < S.queue.length ? "ข้อถัดไป" : "จบรอบ"}</button>
    </div>`;
}

function part(label, r) {
  const pct = Math.round((r.points / r.max) * 100);
  return `<div class="part">
    <div class="row"><span>${esc(label)}</span><b>${r.points}/${r.max}</b></div>
    <div class="bar"><i style="width:${pct}%"></i></div>
    ${r.note ? `<p class="muted small">${esc(r.note)}</p>` : ""}
  </div>`;
}

function nextDrill() {
  if (S.idx + 1 < S.queue.length) { S.idx++; newAnswer(); go("drill"); }
  else go("roundEnd");
}

function viewRoundEnd() {
  const avg = Math.round(S.round.reduce((s, r) => s + r.total, 0) / S.round.length);
  const tok = S.round.reduce((s, r) => s + r.tokens, 0);
  const ref = S.round.reduce((s, r) => s + r.refTokens, 0);
  return `
    <section class="card intro">
      <h2>จบรอบ</h2>
      <div class="total ${avg >= 80 ? "good" : avg >= 50 ? "mid" : "low"}">${avg}<small>/100 เฉลี่ย</small></div>
      <p>รอบนี้ packet ของคุณจะทำให้ AI โหลด <b>${fmtTokens(tok)}</b> tokens
      เทียบกับ packet อ้างอิงที่ <b>${fmtTokens(ref)}</b></p>
      <button class="big" onclick="startRound()">ฝึกอีกรอบ</button>
      <button class="ghost" onclick="go('progress')">ดูพัฒนาการ</button>
    </section>`;
}

// ---------- composer ----------
function viewComposer() {
  const c = S.composer;
  const d = load();
  const warn = composerWarnings(c);
  return `
    <section class="card intro">
      <h2>แต่ง packet ของงานจริง</h2>
      <p class="muted small">กรอกแล้วกด copy ไปวางใน Codex ได้เลย</p>
    </section>

    <section class="card">
      <h3>โหมด</h3>
      <div class="modes">
        ${MODES.map((m) => `<button class="mode ${c.mode === m ? "on" : ""}" onclick="setC('mode','${m}')">
          <b>${m}</b><span>${esc(MODE_HINT[m])}</span></button>`).join("")}
      </div>
    </section>

    <section class="card">
      <h3>GOAL</h3>
      <textarea rows="2" placeholder="สิ่งเดียวที่ต้องสำเร็จ" oninput="setC('goal',this.value,1)">${esc(c.goal)}</textarea>

      <h3 class="mt">CANONICAL SOURCE</h3>
      <div class="chips">
        ${c.files.map((p, i) => `<button class="chip on" onclick="dropPath(${i})"><span class="path">${esc(p)}</span>✕</button>`).join("")}
      </div>
      <div class="addrow">
        <input id="np" placeholder="เช่น nhrc-venn/styles.css" />
        <button onclick="addPath()">เพิ่ม</button>
      </div>
      ${d.paths && d.paths.length ? `<div class="chips faded">
        ${d.paths.slice(0, 8).filter((p) => !c.files.includes(p)).map((p) =>
          `<button class="chip" onclick="addPath('${esc(p)}')">${esc(p)}</button>`).join("")}
      </div>` : ""}

      <h3 class="mt">CURRENT STATE</h3>
      <textarea rows="3" placeholder="3-5 บรรทัด สถานะตอนนี้" oninput="setC('currentState',this.value,1)">${esc(c.currentState)}</textarea>

      <h3 class="mt">DECISIONS ALREADY MADE</h3>
      <textarea rows="2" placeholder="บรรทัดละข้อ — สิ่งที่ห้ามย้อนกลับไปคิดใหม่" oninput="setC('decisions',this.value,1)">${esc(c.decisions)}</textarea>

      <h3 class="mt">DELIVERABLE</h3>
      <textarea rows="2" placeholder="ไฟล์หรือผลลัพธ์ที่ต้องได้" oninput="setC('deliverable',this.value,1)">${esc(c.deliverable)}</textarea>

      <h3 class="mt">DONE WHEN</h3>
      <textarea rows="2" placeholder="เกณฑ์ตรวจรับที่ตัดสินได้ทันที" oninput="setC('doneWhen',this.value)">${esc(c.doneWhen)}</textarea>
      <div class="livecheck">${liveDoneHints(c.doneWhen)}</div>

      <h3 class="mt">BOUNDARY</h3>
      <textarea rows="2" placeholder="บรรทัดละข้อ — ห้ามแตะอะไร" oninput="setC('boundary',this.value,1)">${esc(c.boundary)}</textarea>
    </section>

    ${warn.length ? `<section class="card warnbox">
      <b>ก่อน copy ลองดูอีกที</b>
      ${warn.map((w) => `<div>· ${esc(w)}</div>`).join("")}
    </section>` : ""}

    <section class="card">
      <h3>ผลลัพธ์</h3>
      <pre id="out">${esc(composerText())}</pre>
      <button class="big" onclick="copyPacket(this)">copy packet</button>
      <button class="ghost" onclick="resetComposer()">ล้างฟอร์ม</button>
    </section>`;
}

function setC(k, v, quiet) {
  S.composer[k] = v;
  if (quiet) { $("#out").textContent = composerText(); return; }
  $("#out").textContent = composerText();
  $(".livecheck").innerHTML = liveDoneHints(S.composer.doneWhen);
}
function lines(s) { return (s || "").split("\n").map((x) => x.trim()).filter(Boolean); }
function composerText() {
  const c = S.composer;
  return buildPacketText({
    mode: c.mode, goal: c.goal, files: c.files, currentState: c.currentState,
    decisions: lines(c.decisions), deliverable: c.deliverable,
    doneWhen: c.doneWhen, boundary: lines(c.boundary),
  });
}
function composerWarnings(c) {
  const w = [];
  if (!c.mode) w.push("ยังไม่ได้เลือกโหมด — AI จะไม่รู้ว่าให้สำรวจต่อหรือปิดงาน");
  if (!c.files.length) w.push("ยังไม่ได้ระบุ canonical source — AI จะไปไล่อ่านเอง");
  if (c.files.length > 3) w.push(`canonical source ${c.files.length} path — codex แนะนำไม่เกิน 3`);
  const d = scoreDoneWhen(c.doneWhen);
  if (d.points < 15) w.push("DONE WHEN ยังไม่มีเกณฑ์ที่ตรวจรับได้ชัด");
  if (!lines(c.boundary).length) w.push("ยังไม่ได้ตั้ง BOUNDARY — งานมีโอกาสบานปลาย");
  return w;
}
function addPath(p) {
  const inp = $("#np");
  const v = p || (inp ? inp.value.trim() : "");
  if (!v) return;
  if (!S.composer.files.includes(v)) S.composer.files.push(v);
  const d = load();
  d.paths = [v, ...(d.paths || []).filter((x) => x !== v)].slice(0, 20);
  save(d);
  if (inp) inp.value = "";
  render();
}
function dropPath(i) { S.composer.files.splice(i, 1); render(); }
function resetComposer() {
  S.composer = { mode: null, goal: "", files: [], currentState: "", deliverable: "", doneWhen: "", boundary: "", decisions: "" };
  render();
}
function copyPacket(btn) {
  const txt = composerText();
  const done = () => {
    const d = load();
    d.composer.push({ ts: Date.now(), paths: S.composer.files.length });
    save(d);
    if (btn) { const t = btn.textContent; btn.textContent = "copy แล้ว"; setTimeout(() => (btn.textContent = t), 1500); }
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(done, fallback);
  } else fallback();
  function fallback() {
    const ta = document.createElement("textarea");
    ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) {}
    document.body.removeChild(ta);
  }
}

// ---------- progress ----------
function viewProgress() {
  const d = load();
  const runs = d.runs;
  if (!runs.length) {
    return `<section class="card intro"><h2>ยังไม่มีข้อมูล</h2>
      <p class="muted">ฝึกสัก 5 ข้อแล้วกลับมาดูเทรนด์</p>
      <button class="big" onclick="startRound()">เริ่มฝึก</button></section>`;
  }
  const last5 = runs.slice(-5), prev5 = runs.slice(-10, -5);
  const avg = (arr, f) => (arr.length ? arr.reduce((s, r) => s + f(r), 0) / arr.length : null);

  const axisRows = Object.keys(AXIS_LABEL).map((a) => {
    const pick = (arr) => arr.filter((r) => r.axes && a in r.axes);
    const now = avg(pick(last5), (r) => r.axes[a]);
    const before = avg(pick(prev5), (r) => r.axes[a]);
    if (now == null) return `<div class="prow muted"><span>${a}</span><span class="small">ยังไม่ได้ฝึกแกนนี้</span></div>`;
    const delta = before == null ? null : now - before;
    const arrow = delta == null ? "" : delta > 0.05 ? `<i class="up">▲</i>` : delta < -0.05 ? `<i class="down">▼</i>` : `<i class="flat">–</i>`;
    return `<div class="prow">
      <span>${a} <small class="muted">${esc(AXIS_LABEL[a])}</small></span>
      <div class="bar"><i style="width:${Math.round(now * 100)}%"></i></div>
      <b>${Math.round(now * 100)}%${arrow}</b></div>`;
  }).join("");

  const ratios = runs.filter((r) => r.refTokens > 0).slice(-12).map((r) => r.tokens / r.refTokens);
  const spark = ratios.map((v) => {
    const h = Math.max(4, Math.min(100, Math.round((1 / Math.max(v, 0.2)) * 60)));
    return `<i style="height:${h}%" class="${v <= 1.2 ? "ok" : v <= 2 ? "mid" : "bad"}"></i>`;
  }).join("");

  const days = [...new Set(runs.map((r) => r.day).filter(Boolean))].sort();
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const dt = new Date(); dt.setDate(dt.getDate() - i);
    if (days.includes(dt.toISOString().slice(0, 10))) streak++;
    else if (i > 0) break;
  }

  return `
    <section class="card">
      <h3>พัฒนาการรายแกน</h3>
      <p class="muted small">เฉลี่ย 5 ครั้งล่าสุด · ลูกศรเทียบกับ 5 ครั้งก่อนหน้า</p>
      ${axisRows}
    </section>
    <section class="card">
      <h3>token ratio</h3>
      <p class="muted small">packet ของคุณ ÷ packet อ้างอิง — แท่งสูง = ประหยัด</p>
      <div class="spark">${spark || '<span class="muted small">ยังไม่มีข้อมูล</span>'}</div>
      <p class="muted small">ล่าสุด ${ratios.length ? ratios[ratios.length - 1].toFixed(1) + "×" : "-"}</p>
    </section>
    <section class="card">
      <div class="prow"><span>ฝึกสะสม</span><b>${runs.length} ข้อ</b></div>
      <div class="prow"><span>เข้าฝึกติดกัน</span><b>${streak} วัน</b></div>
      <div class="prow"><span>ใช้ Composer</span><b>${(d.composer || []).length} ครั้ง</b></div>
      <button class="ghost" onclick="wipe()">ล้างประวัติ</button>
    </section>`;
}
function wipe() {
  if (confirm("ล้างประวัติทั้งหมด?")) { try { localStorage.removeItem(KEY); } catch (e) {} render(); }
}

// ---------- init ----------
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("nav.tabs button").forEach((b) => {
    b.onclick = () => (b.dataset.go === "drill" ? startRound() : go(b.dataset.go));
  });
  render();
});
