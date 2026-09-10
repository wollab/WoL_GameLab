// ตรวจข้อมูล scenario ก่อนเอาขึ้น — รันด้วย `node check-scenarios.js`
// ไม่ได้โหลดในหน้าเว็บ (แนวเดียวกับ nhrc-venn/simulate-variants.js)

const { FILES, SCENARIOS } = require("./scenarios.js");
const { MODES, estTokens, fmtTokens, scoreDoneWhen } = require("./rubric.js");
const { TERMS, FIELD_ORDER, MODE_KEYS, PAIRS } = require("./lessons.js");

const errors = [];
const warnings = [];
const seen = new Set();

function err(id, msg) { errors.push(`[${id}] ${msg}`); }
function warn(id, msg) { warnings.push(`[${id}] ${msg}`); }

for (const s of SCENARIOS) {
  const id = s.id || "(ไม่มี id)";

  if (!s.id) err(id, "ไม่มี id");
  if (seen.has(s.id)) err(id, "id ซ้ำ");
  seen.add(s.id);

  for (const f of ["ask", "context", "expectedMode", "teaching"]) {
    if (!s[f]) err(id, `ขาดฟิลด์ ${f}`);
  }
  if (!["wol-gamelab", "codex-audit"].includes(s.source)) {
    err(id, `source ต้องเป็น wol-gamelab หรือ codex-audit (ได้ ${s.source})`);
  }
  if (!MODES.includes(s.expectedMode)) {
    err(id, `expectedMode ไม่ถูกต้อง: ${s.expectedMode}`);
  }
  for (const m of s.acceptableModes || []) {
    if (!MODES.includes(m)) err(id, `acceptableModes มีค่าไม่ถูกต้อง: ${m}`);
    if (m === s.expectedMode) err(id, `acceptableModes ซ้ำกับ expectedMode`);
  }

  if (!(s.axes || []).length) err(id, "ไม่ได้ติดแกนทักษะ");

  const opts = s.fileOptions || [];
  if (opts.length < 3) err(id, "fileOptions ควรมีอย่างน้อย 3 ตัวเลือก");
  for (const p of opts) {
    if (!FILES[p]) err(id, `fileOptions อ้างไฟล์ที่ไม่มีใน catalog: ${p}`);
  }

  const ref = s.referenceFiles || [];
  if (!ref.length) err(id, "ไม่มี referenceFiles");
  for (const p of ref) {
    if (!opts.includes(p)) err(id, `referenceFiles ไม่ได้อยู่ใน fileOptions: ${p}`);
    if (FILES[p] && FILES[p].banned) err(id, `referenceFiles มีไฟล์ที่ห้ามอ่าน: ${p}`);
  }
  if (ref.length > 3) warn(id, `canonical source ${ref.length} ไฟล์ — codex แนะนำไม่เกิน 3`);

  for (const key of ["boundaryOptions", "decisionOptions"]) {
    const list = s[key] || [];
    if (list.length < 3) err(id, `${key} ควรมีอย่างน้อย 3 ตัวเลือก`);
    if (!list.some((o) => o.correct)) err(id, `${key} ไม่มีตัวเลือกที่ถูกเลย`);
    if (!list.some((o) => !o.correct)) err(id, `${key} ไม่มีตัวลวงเลย`);
    for (const o of list) {
      if (!o.text) err(id, `${key} มีตัวเลือกที่ไม่มีข้อความ`);
    }
  }

  const r = s.reference || {};
  for (const f of ["goal", "currentState", "deliverable", "doneWhen"]) {
    if (!r[f]) err(id, `reference ขาด ${f}`);
  }

  if (s.trap && !opts.some((p) => FILES[p] && FILES[p].banned) && !s.acceptableModes) {
    warn(id, "ติดแฟล็ก trap แต่ไม่มีทั้งไฟล์ต้องห้ามและโหมดลวง");
  }
}

// ---------- ตรวจศัพท์และแบบฝึกด่าน 1-3 ----------
for (const [k, t] of Object.entries(TERMS)) {
  const id = `TERM ${k}`;
  for (const f of ["kind", "th", "en", "short", "why", "good", "bad"]) {
    if (!t[f]) err(id, `ขาดฟิลด์ ${f}`);
  }
  if (!["field", "mode"].includes(t.kind)) err(id, `kind ต้องเป็น field หรือ mode (ได้ ${t.kind})`);
  if (!(t.cues || []).length) err(id, "ไม่มี cues — ด่าน 1 จะมีข้อสอบน้อยเกินไป");
  if (!(t.confusedWith || []).length) err(id, "ไม่มี confusedWith — ตัวลวงจะสุ่มมั่ว");
  for (const c of t.confusedWith || []) {
    if (!TERMS[c]) err(id, `confusedWith ชี้ไปคำที่ไม่มี: ${c}`);
    else if (TERMS[c].kind !== t.kind) err(id, `confusedWith ข้ามชนิด (${k} เป็น ${t.kind} แต่ ${c} เป็น ${TERMS[c].kind})`);
    if (c === k) err(id, "confusedWith ชี้กลับมาที่ตัวเอง");
  }
  if (t.good === t.bad) err(id, "ตัวอย่างดีกับแย่เหมือนกัน");
}
if (FIELD_ORDER.length !== 8) err("FIELD_ORDER", `ต้องมี 8 ช่อง (ได้ ${FIELD_ORDER.length})`);
for (const k of FIELD_ORDER) {
  if (!TERMS[k]) err("FIELD_ORDER", `อ้างคำที่ไม่มี: ${k}`);
  else if (TERMS[k].kind !== "field") err("FIELD_ORDER", `${k} ไม่ใช่ kind field`);
}
for (const k of MODE_KEYS) {
  if (!TERMS[k]) err("MODE_KEYS", `อ้างคำที่ไม่มี: ${k}`);
  else if (TERMS[k].kind !== "mode") err("MODE_KEYS", `${k} ไม่ใช่ kind mode`);
}
if (MODE_KEYS.length < 4) err("MODE_KEYS", "ต้องมี 4 โหมดเพื่อให้มีตัวเลือกครบ");

// ทุกโจทย์ wol-gamelab ต้องประกอบเป็น packet ครบ 8 ช่อง (ด่าน 3 ใช้)
function slotValue(s, key) {
  const r = s.reference || {};
  if (key === "mode") return s.expectedMode;
  if (key === "files") return (s.referenceFiles || []).join(" + ");
  if (key === "decisions") return (s.decisionOptions.find((o) => o.correct) || {}).text;
  if (key === "boundary") return (s.boundaryOptions.find((o) => o.correct) || {}).text;
  return r[key];
}
for (const s of SCENARIOS.filter((x) => x.source === "wol-gamelab")) {
  for (const k of FIELD_ORDER) {
    if (!slotValue(s, k)) err(s.id, `ประกอบด่าน 3 ไม่ได้ — ไม่มีค่าสำหรับช่อง ${k}`);
  }
  // ตัวลวงของแต่ละช่องต้องหาได้อย่างน้อย 1 ตัวและต้องไม่ซ้ำคำตอบ
  for (const k of FIELD_ORDER) {
    if (k === "mode") continue;
    const correct = slotValue(s, k);
    const lures = TERMS[k].confusedWith.map((c) => slotValue(s, c)).filter((v) => v && v !== correct);
    if (!lures.length) warn(s.id, `ช่อง ${k} ไม่มีตัวลวงที่ต่างจากคำตอบ`);
  }
}

// คู่ดี/แย่
const pairByTerm = {};
PAIRS.forEach((p, i) => {
  const id = `PAIR ${i + 1} (${p.term})`;
  if (!TERMS[p.term]) err(id, `term ไม่มีในศัพท์: ${p.term}`);
  if (!p.good || !p.bad) err(id, "ขาด good หรือ bad");
  if (p.good === p.bad) err(id, "good กับ bad เหมือนกัน");
  if (!p.why) err(id, "ไม่มีคำอธิบายว่าทำไม");
  pairByTerm[p.term] = (pairByTerm[p.term] || 0) + 1;
  // ข้อที่บอกว่าดี ต้องได้คะแนนเกณฑ์ปิดงานสูงกว่าจริง
  if (p.term === "doneWhen") {
    const g = scoreDoneWhen(p.good).points, b = scoreDoneWhen(p.bad).points;
    if (g <= b) err(id, `ตัวที่ทำเครื่องหมายว่าดีได้คะแนนไม่สูงกว่า (ดี ${g} vs แย่ ${b})`);
  }
});
if (PAIRS.length < 8) err("PAIRS", `ด่าน 2 ต้องมีอย่างน้อย 8 คู่ (ได้ ${PAIRS.length})`);

// สรุป
const byAxis = {};
for (const s of SCENARIOS) for (const a of s.axes || []) byAxis[a] = (byAxis[a] || 0) + 1;

console.log(`scenario ทั้งหมด: ${SCENARIOS.length}`);
console.log(`  wol-gamelab: ${SCENARIOS.filter((s) => s.source === "wol-gamelab").length}`);
console.log(`  codex-audit: ${SCENARIOS.filter((s) => s.source === "codex-audit").length} (path เป็นประมาณการ)`);
console.log(`  กับดัก: ${SCENARIOS.filter((s) => s.trap).length}`);
console.log(`แกนทักษะ: ${Object.entries(byAxis).map(([k, v]) => `${k}=${v}`).join(" · ")}`);

const bannedTokens = Object.entries(FILES)
  .filter(([, f]) => f.banned)
  .reduce((s, [, f]) => s + estTokens(f.bytes), 0);
console.log(`ไฟล์ต้องห้ามในระบบ: ${fmtTokens(bannedTokens)} tokens ถ้าเผลออ่านทั้งหมด`);

console.log(`ศัพท์: ${Object.keys(TERMS).length} คำ (ช่อง ${FIELD_ORDER.length} · โหมด ${MODE_KEYS.length})`);
console.log(`ด่าน 2: ${PAIRS.length} คู่ · ครอบคลุม ${Object.keys(pairByTerm).length} คำ`);
for (const k of FIELD_ORDER) {
  if (!pairByTerm[k]) warnings.push(`ด่าน 2 ยังไม่มีคู่ดี/แย่ของ ${TERMS[k].th} (${k})`);
}

for (const a of Object.keys(byAxis)) {
  if (byAxis[a] < 2) warnings.push(`แกน ${a} มีโจทย์แค่ ${byAxis[a]} ข้อ — ควรมีอย่างน้อย 2`);
}

if (warnings.length) {
  console.log(`\nเตือน ${warnings.length} ข้อ:`);
  warnings.forEach((w) => console.log("  ! " + w));
}
if (errors.length) {
  console.log(`\nผิดพลาด ${errors.length} ข้อ:`);
  errors.forEach((e) => console.log("  x " + e));
  process.exit(1);
}
console.log("\nผ่านทั้งหมด");
