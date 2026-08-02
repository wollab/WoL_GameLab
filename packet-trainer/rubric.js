// Packet Trainer — กติกาให้คะแนน (deterministic ล้วน ไม่เรียกโมเดล)
// แก้เกณฑ์ที่นี่ที่เดียว ทั้ง Drill และ Composer ใช้ตัวเดียวกัน

const MODES = ["Explore", "Decide", "Execute", "Audit"];

const MODE_HINT = {
  Explore: "เปิดทางเลือก ยังไม่สร้างของถาวร",
  Decide: "ขอ 2-3 ทางเลือก + ข้อเสนอแนะ",
  Execute: "ทิศทางล็อกแล้ว ลงมือจนผ่านเกณฑ์",
  Audit: "อ่านและรายงาน ห้ามแก้",
};

// คำที่ทำให้ DONE WHEN ตรวจรับไม่ได้
const VAGUE_WORDS = [
  "ดีขึ้น", "สวยขึ้น", "เรียบร้อย", "ครบถ้วน", "เหมาะสม", "ตามความเหมาะสม",
  "ให้ดี", "ปรับปรุง", "สมบูรณ์", "ตามสมควร", "optimize", "clean up", "polish",
];

// สัญญาณว่ามีสิ่งที่ "มองเห็นแล้วบอกได้ว่าผ่านหรือไม่ผ่าน"
const OBSERVABLE = /(เปิด|กด|แตะ|เห็น|รัน|ผ่าน|แสดง|โหลด|คลิก|ไม่มี error|console|pass|fail)/;
const PATH_LIKE = /[\w-]+\.(js|css|html|md|json|ts|py)\b/;

// ประมาณ token จาก byte — สูตรหยาบ ๆ ตัวเดียวกับที่ใช้วิเคราะห์รีโปนี้
function estTokens(bytes) {
  return Math.round(bytes / 3);
}

function fmtTokens(n) {
  return n.toLocaleString("en-US");
}

// ---------- ให้คะแนนรายส่วน ----------

function scoreMode(picked, scenario) {
  if (!picked) return { points: 0, max: 25, note: "ยังไม่ได้เลือกโหมด" };
  if (picked === scenario.expectedMode) {
    return { points: 25, max: 25, note: `โหมด ${picked} ตรงกับที่ควรเป็น` };
  }
  if ((scenario.acceptableModes || []).includes(picked)) {
    return { points: 12, max: 25, note: `${picked} พอใช้ได้ แต่ ${scenario.expectedMode} ตรงกว่า` };
  }
  return { points: 0, max: 25, note: `ควรเป็น ${scenario.expectedMode} ไม่ใช่ ${picked}` };
}

function scoreScope(selected, scenario, catalog) {
  const ref = scenario.referenceFiles || [];
  const banned = selected.filter((p) => catalog[p] && catalog[p].banned);

  if (banned.length) {
    const cost = banned.reduce((s, p) => s + estTokens(catalog[p].bytes), 0);
    return {
      points: 0, max: 30, blown: true, banned,
      note: `เลือก build artifact เข้ามา — ${fmtTokens(cost)} tokens ที่ไม่ได้อะไรเลย`,
    };
  }

  const extra = selected.filter((p) => !ref.includes(p));
  const missing = ref.filter((p) => !selected.includes(p));
  let pts = 30 - extra.length * 5 - missing.length * 10;
  if (pts < 0) pts = 0;

  const bits = [];
  if (extra.length) bits.push(`เกินมา ${extra.length} ไฟล์`);
  if (missing.length) bits.push(`ขาด ${missing.length} ไฟล์ที่จำเป็น`);
  return {
    points: pts, max: 30, extra, missing,
    note: bits.length ? bits.join(" · ") : "ขอบเขตตรงกับ packet อ้างอิงพอดี",
  };
}

function scoreDoneWhen(text) {
  const t = (text || "").trim();
  const lines = t ? t.split("\n").filter((l) => l.trim()).length : 0;
  const checks = [
    { label: "มีตัวเลขหรือจำนวนที่วัดได้", pass: /\d/.test(t) },
    { label: "อ้างไฟล์หรือหน้าที่เจาะจง", pass: PATH_LIKE.test(t) },
    { label: "มีสิ่งที่มองเห็นแล้วตัดสินได้", pass: OBSERVABLE.test(t) },
    { label: "ไม่มีคำคลุมเครือ", pass: t.length > 0 && !VAGUE_WORDS.some((w) => t.includes(w)) },
    { label: "สั้น ไม่เกิน 2 บรรทัด", pass: lines >= 1 && lines <= 2 && t.length <= 200 },
  ];
  const passed = checks.filter((c) => c.pass).length;
  return { points: passed * 5, max: 25, checks };
}

function scoreGuard(boundaryPicked, decisionPicked, scenario) {
  function half(picked, options) {
    if (!picked.length) return 0;
    const wrong = picked.filter((i) => !options[i].correct).length;
    const right = picked.filter((i) => options[i].correct).length;
    if (right && !wrong) return 10;
    if (right && wrong) return 5;
    return 0;
  }
  const b = half(boundaryPicked, scenario.boundaryOptions || []);
  const d = half(decisionPicked, scenario.decisionOptions || []);
  const notes = [];
  if (b < 10) notes.push("BOUNDARY ยังไม่รัดกุม");
  if (d < 10) notes.push("ยังไม่ได้ล็อกข้อตัดสินใจที่ห้ามย้อนกลับไปคิดใหม่");
  return { points: b + d, max: 20, note: notes.length ? notes.join(" · ") : "กันขอบเขตครบ" };
}

// ---------- รวม ----------

function scorePacket(answer, scenario, catalog) {
  const mode = scoreMode(answer.mode, scenario);
  const scope = scoreScope(answer.files || [], scenario, catalog);
  const done = scoreDoneWhen(answer.doneWhen);
  const guard = scoreGuard(answer.boundary || [], answer.decisions || [], scenario);

  const tokens = (answer.files || []).reduce(
    (s, p) => s + (catalog[p] ? estTokens(catalog[p].bytes) : 0),
    0
  );
  const refTokens = (scenario.referenceFiles || []).reduce(
    (s, p) => s + (catalog[p] ? estTokens(catalog[p].bytes) : 0),
    0
  );

  return {
    mode, scope, done, guard,
    total: mode.points + scope.points + done.points + guard.points,
    tokens, refTokens,
    ratio: refTokens > 0 ? tokens / refTokens : 1,
    axes: {
      MODE: mode.points / mode.max,
      SCOPE: scope.points / scope.max,
      DONE: done.points / done.max,
      GUARD: guard.points / guard.max,
    },
  };
}

// ประกอบข้อความ Task Packet ตามฟอร์แมตของ codex
const FIRST_ROUND_RULE =
  "รอบแรกอ่านไม่เกิน 5 ไฟล์ ถ้าจำเป็นต้องขยาย scope ให้บอกเหตุผลและรายชื่อไฟล์ก่อน";

function buildPacketText(p) {
  const list = (arr) => (arr && arr.length ? arr.map((x) => `- ${x}`).join("\n") : "- (ยังไม่ระบุ)");
  return [
    `MODE: ${p.mode || "(ยังไม่เลือก)"}`,
    `GOAL: ${p.goal || "(ยังไม่ระบุ)"}`,
    `CANONICAL SOURCE:\n${list(p.files)}`,
    `CURRENT STATE:\n${p.currentState || "- (ยังไม่ระบุ)"}`,
    `DECISIONS ALREADY MADE:\n${list(p.decisions)}`,
    `DELIVERABLE: ${p.deliverable || "(ยังไม่ระบุ)"}`,
    `DONE WHEN: ${p.doneWhen || "(ยังไม่ระบุ)"}`,
    `BOUNDARY:\n${list(p.boundary)}`,
    ``,
    FIRST_ROUND_RULE,
  ].join("\n\n");
}

if (typeof module !== "undefined") {
  module.exports = {
    MODES, MODE_HINT, VAGUE_WORDS, estTokens, fmtTokens,
    scoreMode, scoreScope, scoreDoneWhen, scoreGuard, scorePacket,
    buildPacketText, FIRST_ROUND_RULE,
  };
}
