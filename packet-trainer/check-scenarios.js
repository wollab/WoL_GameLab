// ตรวจข้อมูล scenario ก่อนเอาขึ้น — รันด้วย `node check-scenarios.js`
// ไม่ได้โหลดในหน้าเว็บ (แนวเดียวกับ nhrc-venn/simulate-variants.js)

const { FILES, SCENARIOS } = require("./scenarios.js");
const { MODES, estTokens, fmtTokens } = require("./rubric.js");

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
