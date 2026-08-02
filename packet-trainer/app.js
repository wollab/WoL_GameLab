// Packet Trainer — flow ทั้งหมด (Drill / Composer / Progress)

const KEY = "packet_trainer_v1";
const AXIS_LABEL = {
  MODE: "เลือกโหมด", SCOPE: "คุมขอบเขต", DONE: "เกณฑ์ปิดงาน",
  DELTA: "รายงานเป็น delta", TOOL: "ใช้สคริปต์แทนโมเดล", CLOSE: "ปิดงาน ไม่สร้างเพิ่ม",
};

const LEVELS = [
  { n: 1, view: "match",    name: "จับคู่",            blurb: "ข้อความนี้อยู่ช่องไหน", taps: "แตะอย่างเดียว · 8 ข้อ" },
  { n: 2, view: "better",   name: "เลือกข้อที่ดีกว่า", blurb: "อันไหนใช้ได้จริง",      taps: "แตะอย่างเดียว · 8 ข้อ" },
  { n: 3, view: "assemble", name: "เรียง packet",      blurb: "ประกอบทีละช่องจนครบ 8", taps: "แตะอย่างเดียว · 8 ช่อง" },
  { n: 4, view: "drill",    name: "แต่ง packet เต็ม",  blurb: "โจทย์จริง มีพิมพ์นิดหน่อย", taps: "3 ข้อ" },
];

let S = {
  view: "home",
  queue: [], idx: 0,
  answer: null,
  result: null,
  round: [],
  hint: false,
  lesson: null,   // { level, items, idx, picked, correct, packet }
  composer: { mode: null, goal: "", files: [], currentState: "", deliverable: "", doneWhen: "", boundary: "", decisions: "" },
};

// ชื่อศัพท์แบบไทยนำ อังกฤษกำกับ
function termLabel(k) { const t = TERMS[k]; return `${t.th} (${t.en})`; }

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
  else if (S.view === "match" || S.view === "better") el.innerHTML = viewLesson();
  else if (S.view === "assemble") el.innerHTML = viewAssemble();
  else if (S.view === "lessonEnd") el.innerHTML = viewLessonEnd();
  else if (S.view === "drill") el.innerHTML = viewDrill();
  else if (S.view === "result") el.innerHTML = viewResult();
  else if (S.view === "roundEnd") el.innerHTML = viewRoundEnd();
  else if (S.view === "composer") el.innerHTML = viewComposer();
  else if (S.view === "progress") el.innerHTML = viewProgress();
  const tab = ["composer", "progress"].includes(S.view) ? S.view : "home";
  document.querySelectorAll("nav.tabs button").forEach((b) => {
    b.classList.toggle("on", b.dataset.go === tab);
  });
}

// ---------- home ----------
// ---------- หน้าแรก: แผนที่ด่าน ----------
function levelStats(d, n) {
  const rows = (d.lessons || []).filter((r) => r.level === n);
  if (n === 4) {
    const runs = d.runs || [];
    return { played: runs.length > 0, best: runs.length ? Math.max(...runs.map((r) => r.total)) / 100 : 0 };
  }
  return { played: rows.length > 0, best: rows.length ? Math.max(...rows.map((r) => r.correct / r.total)) : 0 };
}
function unlocked(d, n) {
  if (n < 4) return true;
  return [1, 2, 3].every((i) => levelStats(d, i).played);
}

function viewHome() {
  const d = load();
  const weak = weakTerms(d, 3);
  return `
    <section class="card intro">
      <h2>ฝึกจัด context ให้ AI</h2>
      <p class="muted small">เริ่มจากรู้จักศัพท์ก่อน แล้วค่อยไปแต่ง packet จริง</p>
    </section>

    ${LEVELS.map((L) => {
      const st = levelStats(d, L.n);
      const open = unlocked(d, L.n);
      const badge = !open ? `<span class="lock">🔒 ผ่านด่าน 1-3 ก่อน</span>`
        : st.best >= 0.75 ? `<span class="pass">ผ่านแล้ว ${Math.round(st.best * 100)}%</span>`
        : st.played ? `<span class="tried">ล่าสุด ${Math.round(st.best * 100)}%</span>`
        : `<span class="fresh">ยังไม่เล่น</span>`;
      return `
      <button class="card levelcard ${open ? "" : "off"}" ${open ? `onclick="startLevel(${L.n})"` : "disabled"}>
        <div class="lvhead"><b>ด่าน ${L.n} · ${esc(L.name)}</b>${badge}</div>
        <div class="lvblurb">${esc(L.blurb)}</div>
        <div class="lvtaps muted small">${esc(L.taps)}</div>
      </button>`;
    }).join("")}

    ${weak.length ? `
    <section class="card">
      <h3>ศัพท์ที่ยังไม่แม่น</h3>
      <div class="chips">
        ${weak.map((k) => `<span class="chip">${esc(termLabel(k))}</span>`).join("")}
      </div>
      <button class="ghost" onclick="startLevel(1, true)">ฝึกเฉพาะคำพวกนี้</button>
    </section>` : ""}`;
}

// ---------- เก็บความแม่นรายคำ ----------
function noteTerm(term, ok) {
  const d = load();
  d.terms = d.terms || {};
  const t = (d.terms[term] = d.terms[term] || { ok: 0, miss: 0 });
  if (ok) t.ok++; else t.miss++;
  save(d);
}
function weakness(d, term) {
  const t = (d.terms || {})[term];
  if (!t) return 0.5;                       // ยังไม่เคยเจอ = กลาง ๆ
  return t.miss / Math.max(1, t.ok + t.miss);
}
function weakTerms(d, n) {
  return Object.keys(TERMS)
    .filter((k) => (d.terms || {})[k] && d.terms[k].miss > 0)
    .sort((a, b) => weakness(d, b) - weakness(d, a))
    .slice(0, n);
}

// ---------- สร้างข้อสอบ ----------
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const localScenarios = () => SCENARIOS.filter((s) => s.source === "wol-gamelab");

// ค่าของแต่ละช่องในโจทย์หนึ่ง ๆ
function slotValue(s, key) {
  const r = s.reference || {};
  if (key === "mode") return termLabel(s.expectedMode.toLowerCase());
  if (key === "goal") return r.goal;
  if (key === "files") return (s.referenceFiles || []).join(" + ");
  if (key === "currentState") return r.currentState;
  if (key === "deliverable") return r.deliverable;
  if (key === "doneWhen") return r.doneWhen;
  if (key === "decisions") return (s.decisionOptions.find((o) => o.correct) || {}).text;
  if (key === "boundary") return (s.boundaryOptions.find((o) => o.correct) || {}).text;
  return "";
}

function matchPool() {
  const items = [];
  for (const s of localScenarios()) {
    for (const k of FIELD_ORDER) {
      const v = slotValue(s, k);
      if (v && k !== "mode") items.push({ term: k, text: v });
    }
  }
  for (const [k, t] of Object.entries(TERMS)) {
    for (const c of t.cues) items.push({ term: k, text: c });
  }
  return items;
}

// ตัวลวงมาจาก confusedWith ของคำนั้น และต้องเป็นชนิดเดียวกัน (field/mode)
function optionsFor(term) {
  const kind = TERMS[term].kind;
  const opts = [term];
  for (const c of TERMS[term].confusedWith) {
    if (TERMS[c] && TERMS[c].kind === kind && !opts.includes(c)) opts.push(c);
  }
  const rest = shuffle(Object.keys(TERMS).filter((k) => TERMS[k].kind === kind && !opts.includes(k)));
  while (opts.length < 4 && rest.length) opts.push(rest.pop());
  return shuffle(opts);
}

function startLevel(n, weakOnly) {
  const d = load();
  if (!unlocked(d, n)) return;
  if (n === 4) { startRound(); return; }
  if (n === 3) { startAssemble(); return; }

  let items = [];
  if (n === 1) {
    let pool = matchPool();
    if (weakOnly) {
      const w = weakTerms(d, 3);
      if (w.length) pool = pool.filter((i) => w.includes(i.term));
    }
    // ถ่วงน้ำหนักให้คำที่ผิดบ่อยโผล่ก่อน แล้วคุมไม่ให้คำเดียวเกิน 2 ข้อ
    pool = shuffle(pool).sort((a, b) => weakness(d, b.term) - weakness(d, a.term));
    const used = {};
    for (const it of pool) {
      if (items.length >= 8) break;
      used[it.term] = used[it.term] || 0;
      if (used[it.term] >= 2) continue;
      used[it.term]++;
      items.push({ kind: "match", term: it.term, text: it.text, options: optionsFor(it.term) });
    }
  } else if (n === 2) {
    items = shuffle(PAIRS.slice()).slice(0, 8).map((p) => ({
      kind: "better", term: p.term, why: p.why,
      choices: shuffle([{ text: p.good, ok: true }, { text: p.bad, ok: false }]),
    }));
  }

  S.lesson = { level: n, items, idx: 0, picked: null, correct: 0, packet: {} };
  go(LEVELS[n - 1].view);
}

// ---------- ด่าน 1 และ 2 ----------
function lessonHead() {
  const L = S.lesson;
  const dots = L.items.map((_, i) =>
    `<i class="${i < L.idx ? "done" : i === L.idx ? "now" : ""}"></i>`).join("");
  return `<div class="crumb lessonhead">
    <span>ด่าน ${L.level} · ${esc(LEVELS[L.level - 1].name)}</span>
    <span class="dots">${dots}</span>
    <span>${L.idx + 1}/${L.items.length}</span>
  </div>`;
}

function viewLesson() {
  const L = S.lesson;
  const it = L.items[L.idx];
  const p = L.picked;

  const body = it.kind === "match" ? `
    <section class="card ask">
      <div class="quote">${esc(it.text)}</div>
    </section>
    <section class="card">
      <p class="muted small">ข้อความนี้เป็นช่องไหนของ packet?</p>
      <div class="answers grid2">
        ${it.options.map((k) => {
          let cls = "";
          if (p !== null) cls = k === it.term ? "ok" : (k === p ? "no" : "dim");
          return `<button class="ans ${cls}" ${p !== null ? "disabled" : ""} onclick="pickLesson('${k}')">
            <b>${esc(TERMS[k].th)}</b><span>${esc(TERMS[k].en)}</span></button>`;
        }).join("")}
      </div>
    </section>` : `
    <section class="card">
      <h3>${esc(termLabel(it.term))}</h3>
      <p class="muted small">${esc(TERMS[it.term].short)} — อันไหนใช้ได้จริง?</p>
      <div class="answers">
        ${it.choices.map((c, i) => {
          let cls = "";
          if (p !== null) cls = c.ok ? "ok" : (i === p ? "no" : "dim");
          return `<button class="ans wide ${cls}" ${p !== null ? "disabled" : ""} onclick="pickLesson(${i})">
            ${esc(c.text)}</button>`;
        }).join("")}
      </div>
    </section>`;

  return lessonHead() + body + (p === null ? "" : feedbackCard(it, p));
}

function feedbackCard(it, p) {
  const right = it.kind === "match" ? p === it.term : it.choices[p].ok;
  const t = TERMS[it.term];
  const why = it.kind === "match"
    ? `<b>${esc(termLabel(it.term))}</b> คือ${esc(t.short)} — ${esc(t.why)}`
    : esc(it.why);
  return `
    <section class="card fb ${right ? "right" : "wrong"}">
      <div class="fbtop">${right ? "✓ ถูก" : "✗ ยังไม่ใช่"}</div>
      <p>${why}</p>
    </section>
    <div class="stickybar">
      <button class="go" onclick="nextLesson()">${S.lesson.idx + 1 < S.lesson.items.length ? "ข้อถัดไป" : "ดูผล"}</button>
    </div>`;
}

function pickLesson(v) {
  const L = S.lesson;
  if (L.picked !== null) return;
  const it = L.items[L.idx];
  L.picked = v;
  const right = it.kind === "match" ? v === it.term : it.choices[v].ok;
  if (right) L.correct++;
  noteTerm(it.term, right);
  render();
}

function nextLesson() {
  const L = S.lesson;
  if (L.idx + 1 < L.items.length) { L.idx++; L.picked = null; go(LEVELS[L.level - 1].view); }
  else finishLesson();
}

function finishLesson() {
  const L = S.lesson;
  const d = load();
  d.lessons = d.lessons || [];
  d.lessons.push({ ts: Date.now(), day: todayKey(), level: L.level, correct: L.correct, total: L.items.length });
  save(d);
  go("lessonEnd");
}

function viewLessonEnd() {
  const L = S.lesson;
  const pct = Math.round((L.correct / L.items.length) * 100);
  const d = load();
  const justOpened = L.level === 3 && unlocked(d, 4);
  return `
    <section class="card intro">
      <h2>จบด่าน ${L.level}</h2>
      <div class="total ${pct >= 75 ? "good" : pct >= 50 ? "mid" : "low"}">${L.correct}<small>/${L.items.length}</small></div>
      ${L.level === 3 ? `<pre>${esc(assembledText())}</pre>
        <button class="ghost" onclick="copyText(this, assembledText())">copy packet ที่เพิ่งประกอบ</button>` : ""}
      ${justOpened ? `<p class="unlocked">🔓 ปลดล็อกด่าน 4 แล้ว</p>` : ""}
      <button class="big" onclick="startLevel(${L.level})">เล่นด่านนี้อีกรอบ</button>
      <button class="ghost" onclick="go('home')">กลับไปเลือกด่าน</button>
    </section>`;
}

// ---------- ด่าน 3: เรียง packet ----------
function startAssemble() {
  const s = shuffle(localScenarios().slice())[0];
  const items = FIELD_ORDER.map((k) => {
    const correct = slotValue(s, k);
    let pool;
    if (k === "mode") {
      pool = MODE_KEYS.map((m) => termLabel(m)).filter((v) => v !== correct);
    } else {
      pool = TERMS[k].confusedWith.map((c) => slotValue(s, c)).filter((v) => v && v !== correct);
    }
    const choices = shuffle([correct, ...shuffle(pool).slice(0, 2)]);
    return { kind: "assemble", term: k, correct, choices };
  });
  S.lesson = { level: 3, scenario: s, items, idx: 0, picked: null, correct: 0, packet: {} };
  go("assemble");
}

function viewAssemble() {
  const L = S.lesson;
  const it = L.items[L.idx];
  const p = L.picked;
  const filled = FIELD_ORDER.filter((k) => L.packet[k]);

  return lessonHead() + `
    <section class="card ask">
      <div class="quote">"${esc(L.scenario.ask)}"</div>
      <p class="muted small">${esc(L.scenario.context)}</p>
    </section>

    ${filled.length ? `<section class="card built">
      ${filled.map((k) => `<div class="brow"><span>${esc(TERMS[k].th)}</span><b>${esc(L.packet[k])}</b></div>`).join("")}
    </section>` : ""}

    <section class="card">
      <h3>${esc(termLabel(it.term))}</h3>
      <p class="muted small">${esc(TERMS[it.term].short)}</p>
      <div class="answers">
        ${it.choices.map((c, i) => {
          let cls = "";
          if (p !== null) cls = c === it.correct ? "ok" : (i === p ? "no" : "dim");
          return `<button class="ans wide ${cls}" ${p !== null ? "disabled" : ""} onclick="pickSlot(${i})">${esc(c)}</button>`;
        }).join("")}
      </div>
    </section>

    ${p === null ? "" : `
      <section class="card fb ${it.choices[p] === it.correct ? "right" : "wrong"}">
        <div class="fbtop">${it.choices[p] === it.correct ? "✓ ถูก" : "✗ ยังไม่ใช่"}</div>
        <p><b>${esc(termLabel(it.term))}</b> คือ${esc(TERMS[it.term].short)} — ${esc(TERMS[it.term].why)}</p>
      </section>
      <div class="stickybar">
        <button class="go" onclick="nextLesson()">${L.idx + 1 < L.items.length ? "ช่องถัดไป" : "ดูผล"}</button>
      </div>`}`;
}

function pickSlot(i) {
  const L = S.lesson;
  if (L.picked !== null) return;
  const it = L.items[L.idx];
  L.picked = i;
  const right = it.choices[i] === it.correct;
  if (right) L.correct++;
  L.packet[it.term] = it.correct;   // ใส่ค่าที่ถูกเสมอ เพื่อให้ packet ที่ประกอบเสร็จใช้ได้จริง
  noteTerm(it.term, right);
  render();
}

function assembledText() {
  const L = S.lesson;
  return buildPacketText({
    mode: (L.packet.mode || "").replace(/^.*\(|\)$/g, ""),
    goal: L.packet.goal,
    files: (L.packet.files || "").split(" + ").filter(Boolean),
    currentState: L.packet.currentState,
    decisions: [L.packet.decisions].filter(Boolean),
    deliverable: L.packet.deliverable,
    doneWhen: L.packet.doneWhen,
    boundary: [L.packet.boundary].filter(Boolean),
  });
}

function copyText(btn, txt) {
  const done = () => { const t = btn.textContent; btn.textContent = "copy แล้ว"; setTimeout(() => (btn.textContent = t), 1500); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, fb);
  else fb();
  function fb() {
    const ta = document.createElement("textarea");
    ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) {}
    document.body.removeChild(ta);
  }
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
    <div class="crumb drillhead">
      <span>ข้อ ${S.idx + 1}/${S.queue.length}${s.source === "codex-audit" ? ' · <span class="tag">workspace</span>' : ""}</span>
      <button class="hintbtn ${S.hint ? "on" : ""}" onclick="toggleHint()">${S.hint ? "ปิดใบ้" : "ดูใบ้"}</button>
    </div>

    <section class="card ask">
      <div class="quote">"${esc(s.ask)}"</div>
      <p class="muted">${esc(s.context)}</p>
    </section>

    <section class="card">
      <h3>1 · ${termLabel("mode")}</h3>
      <p class="muted small">${esc(TERMS.mode.short)}</p>
      <div class="modes">
        ${MODES.map((m) => `
          <button class="mode ${a.mode === m ? "on" : ""}" onclick="pickMode('${m}')">
            <b>${m}</b><span>${esc(MODE_HINT[m])}</span>
          </button>`).join("")}
      </div>
    </section>

    ${!showFiles ? "" : `
    <section class="card">
      <h3>2 · ${termLabel("files")}</h3>
      <p class="muted small">${esc(TERMS.files.short)} — ${S.hint ? esc(TERMS.files.why) : "เลือกเท่าที่ AI ต้องเปิดจริง"}</p>
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
      <h3>3 · ${termLabel("doneWhen")}</h3>
      <p class="muted small">${esc(TERMS.doneWhen.short)}</p>
      ${S.hint ? `<div class="hintbox"><b>ตัวอย่างที่ใช้ได้</b><p>${esc(TERMS.doneWhen.good)}</p>
        <b>ตัวอย่างที่ยังไม่ได้</b><p>${esc(TERMS.doneWhen.bad)}</p></div>` : ""}
      <textarea id="dw" rows="3" placeholder="เช่น เปิด nhrc-venn/index.html แล้วตัวอักษรบนการ์ด ≥ 22px"
        oninput="onDone(this.value)">${esc(a.doneWhen)}</textarea>
      <div class="livecheck">${liveDoneHints(a.doneWhen)}</div>
    </section>`}

    ${!showGuard ? "" : `
    <section class="card" id="guardCard">
      <h3>4 · ล็อกขอบเขต</h3>
      <p class="muted small">${termLabel("boundary")} — ${esc(TERMS.boundary.short)}</p>
      <div class="opts">
        ${s.boundaryOptions.map((o, i) => `
          <button class="opt ${a.boundary.includes(i) ? "on" : ""}" onclick="toggleOpt('boundary',${i})">${esc(o.text)}</button>`).join("")}
      </div>
      <p class="muted small mt">${termLabel("decisions")} — ${esc(TERMS.decisions.short)}</p>
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

function toggleHint() { S.hint = !S.hint; render(); }
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
    b.onclick = () => go(b.dataset.go);
  });
  render();
});
