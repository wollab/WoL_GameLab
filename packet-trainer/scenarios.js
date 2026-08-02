// Packet Trainer — ข้อมูลโจทย์
// ไฟล์นี้คือไฟล์ที่จะแก้บ่อยที่สุด แก้แล้วรัน `node check-scenarios.js` ก่อนเสมอ
// วิธีเพิ่มโจทย์ใหม่ดูใน README.md

// ---------- catalog ไฟล์ ----------
// bytes ของกลุ่ม wol-gamelab = ขนาดจริงในรีโป (ณ 2026-08-02)
// bytes ของกลุ่ม workspace = ประมาณการจาก audit ของ codex — แก้ให้ตรงได้เลย
const FILES = {
  // --- WoL_GameLab (ขนาดจริง) ---
  "CLAUDE.md": { bytes: 9813 },
  "9-learning-angles/app.js": { bytes: 20113 },
  "9-learning-angles/data.js": { bytes: 25052 },
  "9-learning-angles/style.css": { bytes: 8118 },
  "9-learning-angles/index.html": { bytes: 5193 },
  "nhrc-venn/app.js": { bytes: 39300 },
  "nhrc-venn/styles.css": { bytes: 16325 },
  "nhrc-venn/index.html": { bytes: 8764 },
  "nhrc-venn/cards-data-v3.js": { bytes: 11268 },
  "nhrc-venn/cards-data-v2.js": { bytes: 12909 },
  "nhrc-venn/cards-data.js": { bytes: 16436 },
  "nhrc-venn/simulate-variants.js": { bytes: 16231 },
  "nhrc-venn/RULEBOOK-v3-th.md": { bytes: 8847 },
  "wishlist/index.html": { bytes: 84466 },
  "wizardhat/index.html": { bytes: 746 },
  "wizardhat-v2/index.html": { bytes: 746 },
  "wizardhat/assets/index-BBA4LvYW.js": { bytes: 411740, banned: true, why: "build artifact ที่ minify แล้ว" },
  "wizardhat/assets/index-DgmCH_Jt.css": { bytes: 15637, banned: true, why: "Tailwind ที่ compile แล้ว บรรทัดเดียว" },
  "wizardhat-v2/assets/index-2ucctrMB.js": { bytes: 413576, banned: true, why: "build artifact ที่ minify แล้ว" },

  // --- workspace ใหญ่ (ประมาณการจาก audit ของ codex) ---
  "pm/pm-data.js": { bytes: 21000, est: true },
  "pm/pm-working-rules.md": { bytes: 7800, est: true },
  "pm/dashboard.html": { bytes: 34000, est: true },
  "owned-audience/workplan-and-handoff.md": { bytes: 28500, est: true },
  "owned-audience/changelog.md": { bytes: 16000, est: true },
  "owned-audience/current-state.md": { bytes: 2600, est: true },
  "skills/README.md": { bytes: 6200, est: true },
  "skills/router/SKILL.md": { bytes: 5400, est: true },
  "scripts/build-mirror.js": { bytes: 4300, est: true },
  "reports/2026-07-snapshot.md": { bytes: 19000, est: true },
};

// ---------- โจทย์ ----------
const SCENARIOS = [
  {
    id: "t1-wizardhat-button",
    source: "wol-gamelab",
    trap: true,
    axes: ["SCOPE", "MODE"],
    ask: "ปุ่มใน wizardhat กดยากบนมือถือ ขยายให้ใหญ่ขึ้นหน่อย",
    context: "เปิดจากมือถือแล้วปุ่มเล็กจริง แต่ wizardhat เป็น React ที่ build มาวางไว้ ไม่มี source ในรีโปนี้",
    expectedMode: "Audit",
    acceptableModes: ["Decide"],
    fileOptions: [
      "wizardhat/index.html", "CLAUDE.md", "wizardhat/assets/index-BBA4LvYW.js",
      "wizardhat/assets/index-DgmCH_Jt.css", "wizardhat-v2/index.html",
    ],
    referenceFiles: ["CLAUDE.md", "wizardhat/index.html"],
    boundaryOptions: [
      { text: "ห้ามแก้ไฟล์ใน wizardhat*/assets/ ทุกกรณี", correct: true },
      { text: "ห้ามแตะ wizardhat-v2/ ซึ่งเป็น path ใหม่", correct: true },
      { text: "แก้ได้ทุกไฟล์ในโฟลเดอร์ wizardhat/", correct: false },
      { text: "ถ้าจำเป็นให้ decompile bundle แล้วแก้", correct: false },
    ],
    decisionOptions: [
      { text: "wizardhat กับ wizardhat-v2 ต้องแยกกันอยู่ ไม่รวมกัน", correct: true },
      { text: "source อยู่นอกรีโป การแก้ที่นี่ทำได้แค่ index.html 19 บรรทัด", correct: true },
      { text: "ยังไม่ตัดสินใจว่าจะย้าย source เข้ามาไหม", correct: false },
    ],
    reference: {
      goal: "ยืนยันว่าแก้ขนาดปุ่ม wizardhat ในรีโปนี้ได้หรือไม่ แล้วรายงานทางเลือก",
      currentState: "wizardhat/ มีแค่ index.html 19 บรรทัด + bundle ที่ minify แล้ว · source React/Vite ไม่ได้อยู่ในรีโปนี้",
      deliverable: "คำตอบสั้น ๆ ว่าทำได้/ไม่ได้ พร้อมบอกว่าต้องไปแก้ที่ไหน",
      doneWhen: "ได้คำตอบว่าต้องแก้ที่ source repo แล้ว build มาวางทับ โดยไม่มีไฟล์ไหนถูกแก้",
    },
    teaching:
      "โจทย์นี้ไม่ใช่งาน Execute เพราะรีโปนี้แก้ไม่ได้จริง ๆ การเปิด bundle เข้ามาอ่านคือการจ่าย ~137,000 tokens เพื่อดูตัวอักษรที่มนุษย์อ่านไม่ออก",
  },

  {
    id: "t2-deck-balance",
    source: "wol-gamelab",
    trap: true,
    axes: ["TOOL", "MODE"],
    ask: "ดูหน่อยว่าสำรับ v3 สมดุลไหม คู่ไหนเล่นแล้วการ์ดไม่พอบ้าง",
    context: "รีโปมี simulate-variants.js ที่รันด้วย node เพื่อทดสอบสมดุลสำรับอยู่แล้ว",
    expectedMode: "Audit",
    acceptableModes: ["Explore"],
    fileOptions: [
      "nhrc-venn/simulate-variants.js", "nhrc-venn/cards-data-v3.js", "nhrc-venn/app.js",
      "nhrc-venn/cards-data.js", "nhrc-venn/cards-data-v2.js", "nhrc-venn/RULEBOOK-v3-th.md",
    ],
    referenceFiles: ["nhrc-venn/simulate-variants.js"],
    boundaryOptions: [
      { text: "ห้ามแก้การ์ดในรอบนี้ รายงานอย่างเดียว", correct: true },
      { text: "รันสคริปต์แล้วอ่านผล ไม่ต้องอ่านการ์ดทีละใบ", correct: true },
      { text: "อ่าน cards-data ทั้ง 3 เวอร์ชันเพื่อเทียบเอง", correct: false },
      { text: "เขียนสคริปต์ตรวจตัวใหม่ให้ครอบคลุมกว่าเดิม", correct: false },
    ],
    decisionOptions: [
      { text: "สำรับที่ใช้จริงคือ v3 · v1/v2 เก็บไว้เทียบเท่านั้น", correct: true },
      { text: "เกณฑ์สมดุลผูกกับค่าคงที่หัว app.js ห้ามเปลี่ยนเอง", correct: true },
      { text: "ยังไม่รู้ว่าจะใช้เกณฑ์ไหนวัด", correct: false },
    ],
    reference: {
      goal: "รู้ว่าคู่ Venn ไหนในสำรับ v3 มีการ์ดไม่พอตามเกณฑ์ในกติกา",
      currentState: "simulate-variants.js รันได้อยู่แล้ว โหลดสำรับทั้ง 3 เวอร์ชันและจำลองตามเกณฑ์เดียวกับ app.js",
      deliverable: "ผลรันของสคริปต์ + สรุปคู่ที่ตก 3-5 บรรทัด",
      doneWhen: "รัน node simulate-variants.js แล้วได้รายชื่อคู่ที่ไม่ผ่านเกณฑ์ MIN_SIDE_CARDS_FOR_PAIR",
    },
    teaching:
      "งานนับและตรวจเงื่อนไขเป็นงาน deterministic — สคริปต์ให้คำตอบเดิมทุกครั้งในไม่กี่วินาที การให้โมเดลอ่านการ์ด 53 ใบแล้วนับเองแพงกว่าและเชื่อถือได้น้อยกว่า",
  },

  {
    id: "t5-sharecard-font",
    source: "wol-gamelab",
    trap: true,
    axes: ["SCOPE", "DONE"],
    ask: "share card ของ 9 learning angles ตัวหนังสือไทยเพี้ยน แก้ให้หน่อย",
    context: "บั๊กนี้เคยเกิดมาแล้ว 2 รอบ — ฟอนต์โหลดไม่ทันก่อน canvas วาด",
    expectedMode: "Execute",
    acceptableModes: [],
    fileOptions: [
      "9-learning-angles/app.js", "CLAUDE.md", "9-learning-angles/style.css",
      "9-learning-angles/data.js", "9-learning-angles/index.html",
    ],
    referenceFiles: ["9-learning-angles/app.js"],
    boundaryOptions: [
      { text: "แตะเฉพาะฟังก์ชันที่วาด canvas ไม่แก้ layout อื่น", correct: true },
      { text: "ห้ามเปลี่ยนวิธีโหลดฟอนต์ไปใช้ CDN", correct: true },
      { text: "ปรับ style.css ให้ฟอนต์ตรงกันทั้งหน้า", correct: false },
      { text: "แก้ข้อความใน data.js ให้สั้นลงจะได้ไม่ล้น", correct: false },
    ],
    decisionOptions: [
      { text: "ฟอนต์ต้องเป็น ttf local เพราะใช้ในห้องอบรมที่เน็ตอาจไม่มี", correct: true },
      { text: "ต้อง await document.fonts.ready ก่อนวาดเสมอ", correct: true },
      { text: "ยังไม่ตัดสินใจว่าจะใช้ฟอนต์อะไร", correct: false },
    ],
    reference: {
      goal: "ให้ข้อความไทยบน share card แสดงด้วย Kanit ทุกครั้ง ไม่ตกไป fallback",
      currentState: "app.js วาด canvas ตอนกดปุ่มแชร์ · โค้ดโหลดรูปแล้วแต่ยังไม่รอฟอนต์",
      deliverable: "แก้ 9-learning-angles/app.js จุดเดียว",
      doneWhen: "กดปุ่มแชร์ 3 ครั้งติดบนเครื่องที่ล้าง cache แล้ว PNG ที่ได้เป็นฟอนต์ Kanit ทุกครั้ง",
    },
    teaching:
      "คำสั่งบอกว่า 'ฟอนต์เพี้ยน' แต่ปลายทางจริงอยู่ที่ลำดับการรอโหลด — ถ้าไม่ล็อกข้อตัดสินใจ 'ห้ามเปลี่ยนไป CDN' ไว้ AI มีโอกาสสูงที่จะ 'แก้' ด้วยการเปลี่ยนไป Google Fonts ซึ่งพังในห้องอบรม",
  },

  {
    id: "venn-readability",
    source: "wol-gamelab",
    axes: ["SCOPE", "DONE"],
    ask: "ปรับการ์ด nhrc-venn ให้อ่านง่ายขึ้นหน่อย",
    context: "ครูทดลองเล่นแล้วบอกว่าอ่านจากหลังห้องไม่ออก ตัวหนังสือบนการ์ดเล็กไป",
    expectedMode: "Execute",
    acceptableModes: ["Decide"],
    fileOptions: [
      "nhrc-venn/styles.css", "nhrc-venn/app.js", "nhrc-venn/index.html",
      "nhrc-venn/cards-data-v3.js", "CLAUDE.md",
    ],
    referenceFiles: ["nhrc-venn/styles.css"],
    boundaryOptions: [
      { text: "แก้เฉพาะ styles.css ไม่แตะ logic ใน app.js", correct: true },
      { text: "ห้ามเปลี่ยนข้อความบนการ์ด", correct: true },
      { text: "ปรับจำนวนการ์ดต่อแถวใน app.js ด้วย", correct: false },
      { text: "เปลี่ยนฟอนต์เป็นตัวที่อ่านง่ายกว่า", correct: false },
    ],
    decisionOptions: [
      { text: "ใช้ WoL CI teal/orange เดิม ไม่เปลี่ยนชุดสี", correct: true },
      { text: "ฟอนต์ยังเป็น woff2 local ตามเดิม", correct: true },
      { text: "ยังไม่ได้ตกลงว่าจะให้ใหญ่ขึ้นเท่าไร", correct: false },
    ],
    reference: {
      goal: "ให้ข้อความบนการ์ดอ่านออกจากระยะ 3 เมตรบนจอโปรเจกเตอร์",
      currentState: "การ์ดใช้ขนาดตัวอักษรเดิมจากตอนออกแบบบนจอคอม ยังไม่เคยปรับสำหรับฉายขึ้นจอ",
      deliverable: "แก้ nhrc-venn/styles.css",
      doneWhen: "เปิด nhrc-venn/index.html แล้วข้อความบนการ์ดมีขนาด ≥ 22px และ contrast ผ่าน WCAG AA",
    },
    teaching:
      "'อ่านง่ายขึ้น' ยังไม่ใช่เกณฑ์ ต้องแปลงเป็นตัวเลขที่คนสองคนดูแล้วตัดสินตรงกันได้",
  },

  {
    id: "wishlist-split",
    source: "wol-gamelab",
    axes: ["SCOPE", "CLOSE"],
    ask: "wishlist/index.html มันใหญ่มาก แก้ทีนึงลำบาก ทำไงดี",
    context: "ไฟล์เดียว 1,230 บรรทัด รวม CSS + JS + HTML และเป็นไฟล์ที่แก้บ่อยที่สุดในรีโป (14 ครั้ง)",
    expectedMode: "Decide",
    acceptableModes: ["Explore"],
    fileOptions: ["wishlist/index.html", "CLAUDE.md", "9-learning-angles/app.js", "nhrc-venn/index.html"],
    referenceFiles: ["wishlist/index.html"],
    boundaryOptions: [
      { text: "รอบนี้เสนอทางเลือกก่อน ยังไม่ลงมือแยกไฟล์", correct: true },
      { text: "ห้ามเปลี่ยนพฤติกรรมเกมแม้แต่นิดเดียว", correct: true },
      { text: "แยกไฟล์ให้เลยไม่ต้องถาม", correct: false },
      { text: "เปลี่ยนไปใช้ framework จะได้จัดการง่าย", correct: false },
    ],
    decisionOptions: [
      { text: "ยังเป็น static ไม่มี build step", correct: true },
      { text: "ชุดสี navy/gold ของ wishlist คงเดิม ไม่เปลี่ยนเป็น WoL CI", correct: true },
      { text: "ยังไม่ตัดสินใจว่าจะเก็บ Supabase ไว้ไหม", correct: false },
    ],
    reference: {
      goal: "ได้แผนแยก wishlist/index.html เป็นไฟล์ย่อยโดยไม่เปลี่ยนพฤติกรรมเกม",
      currentState: "index.html 1,230 บรรทัด · CSS บรรทัด 7-172 · JS บรรทัด 196-1228 · แก้มาแล้ว 14 ครั้ง",
      deliverable: "ทางเลือก 2-3 แบบ พร้อมข้อดีข้อเสียและข้อเสนอแนะ",
      doneWhen: "ได้ทางเลือกที่ระบุว่าไฟล์ผลลัพธ์มีอะไรบ้าง และแต่ละไฟล์ประมาณกี่บรรทัด",
    },
    teaching:
      "คำถามปลายเปิดแบบนี้ควรเป็น Decide ไม่ใช่ Execute — ถ้าปล่อยเป็น Execute จะได้ผลลัพธ์ที่ตัวเองตัดสินใจแทนคุณไปแล้ว",
  },

  {
    id: "quiz-copy",
    source: "wol-gamelab",
    axes: ["SCOPE"],
    ask: "คำอธิบายตัวละคร 'นักฟัง' ในควิซอ่านแล้วยังไม่โดน ปรับถ้อยคำหน่อย",
    context: "เนื้อหาตัวละครทั้ง 9 อยู่ใน data.js แยกจาก logic แล้ว",
    expectedMode: "Execute",
    acceptableModes: [],
    fileOptions: [
      "9-learning-angles/data.js", "9-learning-angles/app.js",
      "9-learning-angles/style.css", "9-learning-angles/index.html", "CLAUDE.md",
    ],
    referenceFiles: ["9-learning-angles/data.js"],
    boundaryOptions: [
      { text: "แก้เฉพาะ field ของ listener ไม่แตะตัวละครอื่น", correct: true },
      { text: "ห้ามแตะ app.js เพราะเป็นงานเนื้อหาล้วน", correct: true },
      { text: "ปรับความยาวให้เท่ากันทั้ง 9 ตัวไปเลย", correct: false },
      { text: "เพิ่ม field ใหม่ถ้าจำเป็น", correct: false },
    ],
    decisionOptions: [
      { text: "โทนเรียกผู้อ่านว่า 'คุณ' ไม่ใช้ศัพท์วิชาการ", correct: true },
      { text: "โครงสร้าง field เดิม (guide/detail/activity) คงไว้", correct: true },
      { text: "ยังไม่ได้ตกลงว่าจะใช้โทนไหน", correct: false },
    ],
    reference: {
      goal: "ปรับถ้อยคำของตัวละคร listener ให้อ่านแล้วเห็นภาพตัวเอง",
      currentState: "data.js เก็บเนื้อหาทั้ง 9 ตัว แต่ละตัวมี guide / detail / activity",
      deliverable: "แก้ field ของ listener ใน 9-learning-angles/data.js",
      doneWhen: "field detail ของ listener ยาวไม่เกิน 4 บรรทัด และไม่มีคำว่า 'ศักยภาพ' หรือ 'กระบวนการ'",
    },
    teaching:
      "งานแก้เนื้อหาไม่ควรลาก app.js เข้ามา — การแยก data ออกจาก logic มีไว้ให้ประหยัด context แบบนี้",
  },

  {
    id: "card-add",
    source: "wol-gamelab",
    axes: ["SCOPE", "DONE"],
    ask: "เพิ่มการ์ดคำอีก 10 ใบให้สำรับ v3 หน่อย",
    context: "การ์ดทุกใบต้องมี no / text / treaties / type / reason และเกณฑ์สมดุลผูกกับกติกาในไฟล์แยก",
    expectedMode: "Execute",
    acceptableModes: ["Decide"],
    fileOptions: [
      "nhrc-venn/cards-data-v3.js", "nhrc-venn/RULEBOOK-v3-th.md", "nhrc-venn/simulate-variants.js",
      "nhrc-venn/app.js", "nhrc-venn/cards-data.js", "nhrc-venn/index.html",
    ],
    referenceFiles: ["nhrc-venn/cards-data-v3.js", "nhrc-venn/simulate-variants.js"],
    boundaryOptions: [
      { text: "ห้ามแก้การ์ด 53 ใบเดิม เพิ่มอย่างเดียว", correct: true },
      { text: "ห้ามแตะ cards-data.js และ cards-data-v2.js", correct: true },
      { text: "ปรับค่าคงที่ในกติกาถ้าสำรับไม่ผ่านเกณฑ์", correct: false },
      { text: "แก้ app.js ให้รองรับการ์ดมากขึ้น", correct: false },
    ],
    decisionOptions: [
      { text: "ถ้อยคำสิทธิต้องตรงตามสนธิสัญญา ห้ามแต่งเอง", correct: true },
      { text: "ถ้าจะแก้ค่าคงที่ต้องอัปเดต RULEBOOK ให้ตรงกันเสมอ", correct: true },
      { text: "ยังไม่ได้เลือกว่าจะเพิ่มคู่สนธิสัญญาไหน", correct: false },
    ],
    reference: {
      goal: "เพิ่มการ์ดคำ 10 ใบใน v3 โดยสำรับยังผ่านเกณฑ์สมดุลเดิม",
      currentState: "v3 มี 53 ใบ · เกณฑ์ MIN_PLAYABLE_FOR_PAIR = 10 · ตรวจได้ด้วย simulate-variants.js",
      deliverable: "แก้ nhrc-venn/cards-data-v3.js",
      doneWhen: "รัน node simulate-variants.js แล้วทุกคู่ยังผ่านเกณฑ์ และการ์ดใหม่ 10 ใบมี field ครบ 5 ตัว",
    },
    teaching:
      "เอา simulate-variants.js เข้ามาใน canonical source ตั้งแต่แรก เพราะมันคือเกณฑ์ตรวจรับ ไม่ใช่แค่เครื่องมือเสริม",
  },

  {
    id: "t4-owned-audience",
    source: "codex-audit",
    trap: true,
    axes: ["DELTA", "MODE"],
    ask: "สรุปสถานะ Owned Audience ให้ที ตอนนี้ไปถึงไหนแล้ว",
    context: "ไฟล์ handoff เป็นแบบ append status ต่อท้ายไปเรื่อย ๆ ตอนนี้ 396 บรรทัด",
    expectedMode: "Audit",
    acceptableModes: [],
    fileOptions: [
      "owned-audience/current-state.md", "owned-audience/workplan-and-handoff.md",
      "owned-audience/changelog.md", "pm/pm-data.js", "reports/2026-07-snapshot.md",
    ],
    referenceFiles: ["owned-audience/current-state.md"],
    boundaryOptions: [
      { text: "อ่านเฉพาะบล็อก Current State ไม่ต้องไล่ประวัติ", correct: true },
      { text: "ห้ามสร้างไฟล์สรุปใหม่", correct: true },
      { text: "อ่าน handoff ทั้งไฟล์เพื่อความมั่นใจ", correct: false },
      { text: "สร้าง portfolio summary ชุดใหม่ให้ครบทุกโครงการ", correct: false },
    ],
    decisionOptions: [
      { text: "current-state.md คือแหล่งความจริงเดียว ประวัติอยู่ที่ changelog", correct: true },
      { text: "รายงานเป็น delta: อะไรเปลี่ยน/ยังไม่เปลี่ยน/ต้องตัดสินใจอะไร", correct: true },
      { text: "ยังไม่ได้ตกลงว่าใครเป็นเจ้าของไฟล์สถานะ", correct: false },
    ],
    reference: {
      goal: "รู้ว่า Owned Audience ตอนนี้อยู่สถานะไหน และติดอะไรอยู่",
      currentState: "current-state.md เก็บสถานะล่าสุด · changelog.md เก็บประวัติ · handoff เดิมยาว 396 บรรทัด",
      deliverable: "สรุป 5-8 บรรทัด: เปลี่ยนอะไร ยังไม่เปลี่ยนอะไร ต้องตัดสินใจอะไร",
      doneWhen: "ได้สรุปที่อ้าง current-state.md และมีหัวข้อ 'ต้องตัดสินใจ' อย่างน้อย 1 ข้อ",
    },
    teaching:
      "ถ้าปล่อยให้ AI อ่าน handoff ทั้ง 396 บรรทัด มันจะสรุปประวัติซ้ำทุกครั้งที่คุณถาม — ค่าใช้จ่ายเดิมจ่ายซ้ำทุกรอบ",
  },

  {
    id: "t3-new-dashboard",
    source: "codex-audit",
    trap: true,
    axes: ["CLOSE", "MODE"],
    ask: "อยากได้ dashboard ตัวใหม่ที่รวมสถานะทุกโปรเจกต์ไว้หน้าเดียว",
    context: "ตอนนี้มี PM dashboard, workplan, handoff และ skills 27 ตัวอยู่แล้ว · PM records 34 รายการ Done 1",
    expectedMode: "Decide",
    acceptableModes: ["Audit"],
    fileOptions: [
      "pm/pm-data.js", "pm/dashboard.html", "pm/pm-working-rules.md",
      "skills/README.md", "reports/2026-07-snapshot.md",
    ],
    referenceFiles: ["pm/pm-data.js", "pm/dashboard.html"],
    boundaryOptions: [
      { text: "ยังไม่สร้างไฟล์หรือ skill ใหม่ในรอบนี้", correct: true },
      { text: "ถ้ามีของเดิมที่ทำได้อยู่แล้ว ให้เสนอปรับของเดิมก่อน", correct: true },
      { text: "สร้าง prototype ให้ดูเลยจะได้เห็นภาพ", correct: false },
      { text: "เพิ่ม skill ตัวที่ 28 ไว้คุม dashboard ใหม่", correct: false },
    ],
    decisionOptions: [
      { text: "ไม่เพิ่มชั้นควบคุมใหม่ถ้าของเดิมยังใช้ไม่เต็ม", correct: true },
      { text: "Done 1 จาก 34 แปลว่าปัญหาอยู่ที่การปิดงาน ไม่ใช่การมองเห็น", correct: true },
      { text: "ยังไม่รู้ว่าจะเอาข้อมูลจากไหนมาแสดง", correct: false },
    ],
    reference: {
      goal: "ตัดสินใจว่าควรสร้าง dashboard ใหม่หรือปรับของเดิม",
      currentState: "PM dashboard + pm-data.js 34 records (Now 5 / Next 8 / Waiting 4 / Parked 16 / Done 1) · skills 27 ตัว",
      deliverable: "ทางเลือก 2-3 แบบ พร้อมข้อเสนอแนะว่าควรทำอันไหน",
      doneWhen: "ได้คำตอบที่ระบุว่าของเดิมขาดอะไรจริง ๆ 1-3 ข้อ หรือสรุปว่าไม่ต้องสร้างใหม่",
    },
    teaching:
      "Parked 16 / Done 1 ไม่ได้แปลว่ามองไม่เห็นงาน แต่แปลว่างานไม่ถูกปิด — dashboard ตัวที่สองแก้อาการผิดจุด",
  },

  {
    id: "pm-parked-cleanup",
    source: "codex-audit",
    axes: ["CLOSE", "DONE"],
    ask: "งานใน Parked เยอะมาก ช่วยจัดการหน่อย",
    context: "Parked 16 รายการ บางอันค้างมาหลายเดือน · pm-working-rules.md มีกติกา Delivery Complete ≠ Project Closed อยู่แล้ว",
    expectedMode: "Decide",
    acceptableModes: ["Audit"],
    fileOptions: [
      "pm/pm-data.js", "pm/pm-working-rules.md", "pm/dashboard.html", "reports/2026-07-snapshot.md",
    ],
    referenceFiles: ["pm/pm-data.js", "pm/pm-working-rules.md"],
    boundaryOptions: [
      { text: "ไม่ลบ record ทิ้ง เปลี่ยนสถานะเท่านั้น", correct: true },
      { text: "ใช้กติกาที่มีอยู่แล้วใน pm-working-rules ไม่เขียนกติกาใหม่", correct: true },
      { text: "ออกแบบสถานะใหม่ให้ละเอียดกว่าเดิม", correct: false },
      { text: "ย้ายทุกอันที่ค้างเกิน 3 เดือนไป Done", correct: false },
    ],
    decisionOptions: [
      { text: "Parked = ตั้งใจพัก ไม่ใช่ลืม ต้องมีเหตุผลกำกับทุกอัน", correct: true },
      { text: "กติกา Delivery Complete ≠ Project Closed ใช้ได้อยู่แล้ว", correct: true },
      { text: "ยังไม่ได้ตกลงว่าอะไรคือเงื่อนไขปิดงาน", correct: false },
    ],
    reference: {
      goal: "ได้ข้อเสนอว่า Parked 16 รายการควรถูกปิด / ปลุก / ยุบรวม อันไหนบ้าง",
      currentState: "pm-data.js มี 34 records · Parked 16 · Done 1 · กติกาปิดงานเขียนไว้แล้วแต่ไม่ค่อยถูกใช้",
      deliverable: "ตาราง 16 แถว: id · ข้อเสนอ (ปิด/ปลุก/ยุบ) · เหตุผล 1 บรรทัด",
      doneWhen: "ทุก record ใน Parked มีข้อเสนอกำกับ และมีอย่างน้อย 3 อันที่เสนอให้ปิด",
    },
    teaching:
      "'ช่วยจัดการหน่อย' ไม่มีเกณฑ์ปิด — ระบุจำนวนแถวและรูปแบบผลลัพธ์ไว้ตั้งแต่ต้น AI จะไม่วนสร้างระบบจัดหมวดใหม่ให้",
  },

  {
    id: "skill-router",
    source: "codex-audit",
    axes: ["CLOSE", "SCOPE"],
    ask: "อยากทำ skill ตัวใหม่ที่คุมทุกอย่างให้เลือก skill ถูกตัว",
    context: "ตอนนี้มี custom skills 27 ตัว และมี router อยู่แล้ว",
    expectedMode: "Decide",
    acceptableModes: ["Audit"],
    fileOptions: ["skills/README.md", "skills/router/SKILL.md", "pm/pm-working-rules.md", "CLAUDE.md"],
    referenceFiles: ["skills/README.md", "skills/router/SKILL.md"],
    boundaryOptions: [
      { text: "ยังไม่สร้าง skill ตัวที่ 28 ในรอบนี้", correct: true },
      { text: "ดูก่อนว่า router เดิมแก้อะไรได้บ้าง", correct: true },
      { text: "รวม 27 ตัวเป็น master skill ตัวเดียว", correct: false },
      { text: "เขียน skill ใหม่แล้วค่อยลบตัวเก่าทีหลัง", correct: false },
    ],
    decisionOptions: [
      { text: "ทางที่คุ้มกว่าคือทำ router เดิมให้เลือกแคบลง", correct: true },
      { text: "จำนวน skill ที่มากอยู่แล้วคือต้นทุน ไม่ใช่สินทรัพย์", correct: true },
      { text: "ยังไม่ได้สำรวจว่า skill ไหนถูกใช้จริงบ้าง", correct: false },
    ],
    reference: {
      goal: "ตัดสินใจว่าจะปรับ router เดิมหรือสร้าง skill ใหม่",
      currentState: "custom skills 27 ตัว · มี router เป็น front door อยู่แล้ว",
      deliverable: "ข้อเสนอ 2 ทาง พร้อมประเมินว่าทางไหนอ่านไฟล์น้อยกว่า",
      doneWhen: "ได้คำตอบที่ระบุว่า router เดิมต้องแก้กี่จุด หรือเหตุผลชัดเจนว่าทำไมต้องมีตัวใหม่",
    },
    teaching:
      "เมื่อของเดิมมี 27 ตัว การเพิ่มตัวที่ 28 เพื่อคุมอีก 27 ตัวคือการเพิ่มชั้นควบคุม ไม่ใช่การแก้ปัญหา",
  },

  {
    id: "delta-workplan-update",
    source: "codex-audit",
    axes: ["DELTA", "DONE"],
    ask: "อัปเดต workplan ให้เป็นปัจจุบันหน่อย ทำอะไรไปบ้างสัปดาห์นี้",
    context: "รูปแบบเดิมคือ append status ต่อท้ายไฟล์เดิมไปเรื่อย ๆ จนตอนนี้ 396 บรรทัด",
    expectedMode: "Execute",
    acceptableModes: ["Audit"],
    fileOptions: [
      "owned-audience/current-state.md", "owned-audience/changelog.md",
      "owned-audience/workplan-and-handoff.md", "pm/pm-data.js", "reports/2026-07-snapshot.md",
    ],
    referenceFiles: ["owned-audience/current-state.md", "owned-audience/changelog.md"],
    boundaryOptions: [
      { text: "ห้าม append status ต่อท้าย handoff เพิ่มอีก", correct: true },
      { text: "ประวัติที่เก่ากว่าสัปดาห์นี้ให้ย้ายไป changelog", correct: true },
      { text: "เขียนสรุปรวมทั้งโครงการใหม่ให้อ่านง่ายขึ้น", correct: false },
      { text: "สร้างไฟล์ status ประจำสัปดาห์แยกอีกไฟล์", correct: false },
    ],
    decisionOptions: [
      { text: "current-state.md ต้องไม่เกิน 50 บรรทัด", correct: true },
      { text: "โครง Current State / Next 3 Actions / Open Decisions / Canonical Links ล็อกแล้ว", correct: true },
      { text: "ยังไม่ได้ตกลงว่าจะเก็บประวัติไว้ที่ไหน", correct: false },
    ],
    reference: {
      goal: "ให้ current-state.md สะท้อนสถานะล่าสุด โดยประวัติเก่าถูกย้ายออก",
      currentState: "handoff ยาว 396 บรรทัดเพราะ append มาตลอด · current-state.md ยังไม่ถูกอัปเดตมา 2 สัปดาห์",
      deliverable: "แก้ current-state.md + ย้ายท่อนเก่าลง changelog.md",
      doneWhen: "current-state.md ไม่เกิน 50 บรรทัด มีครบ 4 หัวข้อ และไม่มีบรรทัดที่ลงวันที่ก่อนสัปดาห์นี้",
    },
    teaching:
      "'อัปเดต' กับ 'เขียนสรุปใหม่' ต่างกันมากในแง่ token — ถ้าไม่ห้ามไว้ AI มักเลือกสร้างสรุปชุดใหม่ทั้งหมดเพราะดูเหมือนเป็นประโยชน์มากกว่า",
  },

  {
    id: "html-mirror-regen",
    source: "codex-audit",
    axes: ["TOOL", "SCOPE"],
    ask: "ต้อง regenerate หน้า HTML mirror ใหม่หมด format เปลี่ยน",
    context: "HTML ที่ถูกแตะใน 30 วันมี ~650 ไฟล์ ส่วนใหญ่เป็น generated mirror · มี scripts/build-mirror.js อยู่แล้ว",
    expectedMode: "Execute",
    acceptableModes: ["Decide"],
    fileOptions: [
      "scripts/build-mirror.js", "pm/dashboard.html", "reports/2026-07-snapshot.md", "skills/README.md",
    ],
    referenceFiles: ["scripts/build-mirror.js"],
    boundaryOptions: [
      { text: "แก้ที่สคริปต์ตัวเดียว ไม่ไล่แก้ไฟล์ผลลัพธ์", correct: true },
      { text: "ห้ามแก้ไฟล์ HTML ที่ generate ออกมาด้วยมือ", correct: true },
      { text: "ให้ AI ไล่แก้ทีละไฟล์จะได้คุมคุณภาพ", correct: false },
      { text: "แก้ 20 ไฟล์แรกก่อนแล้วดูผล", correct: false },
    ],
    decisionOptions: [
      { text: "ไฟล์ผลลัพธ์เป็น generated ห้ามแก้มือ", correct: true },
      { text: "format ใหม่ล็อกแล้ว ไม่ต้องเสนอทางเลือกอีก", correct: true },
      { text: "ยังไม่ได้ตกลงว่า format ใหม่หน้าตาเป็นยังไง", correct: false },
    ],
    reference: {
      goal: "ให้ HTML mirror ทุกไฟล์ออกมาตาม format ใหม่",
      currentState: "build-mirror.js generate mirror ทั้งหมด · format เปลี่ยนแล้วแต่สคริปต์ยังเป็นของเดิม",
      deliverable: "แก้ scripts/build-mirror.js แล้วรันใหม่",
      doneWhen: "รันสคริปต์แล้วไฟล์ผลลัพธ์ทุกไฟล์มี tag ใหม่ และ diff ไม่มีไฟล์ไหนถูกแก้ด้วยมือ",
    },
    teaching:
      "งานแปลงรูปแบบไฟล์จำนวนมากคืองาน deterministic — แก้สคริปต์ครั้งเดียวแล้ว rerun ถูกกว่าให้โมเดลไล่แก้ 650 ไฟล์หลายเท่า",
  },
];

if (typeof module !== "undefined") {
  module.exports = { FILES, SCENARIOS };
}
