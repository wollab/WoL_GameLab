// WoL Learning Moves — data definitions
// แก้ไขสีหรือชื่อได้ที่นี่ที่เดียว ทุกหน้าจะอัปเดตตาม

const MOVES = {
  explorer: {
    id: "explorer", thai: "นักสำรวจ", en: "Explorer",
    source: "world", phase: "receive",
    color: "#2f9e44", img: "assets/characters/explorer.png",
    desc: "เปิดโลก เปิดคำถาม เปิดการรับรู้จากสิ่งแวดล้อมและประสบการณ์ตรง",
  },
  listener: {
    id: "listener", thai: "นักฟัง", en: "Listener",
    source: "people", phase: "receive",
    color: "#4dabf7", img: "assets/characters/listener.png",
    desc: "เปิดรับความหมายจากผู้อื่นผ่านการฟังอย่างตั้งใจ",
  },
  experimenter: {
    id: "experimenter", thai: "นักทดลอง", en: "Experimenter",
    source: "self", phase: "receive",
    color: "#fcc419", img: "assets/characters/experimenter.png",
    desc: "เล่นกับสมมติฐาน ความเป็นไปได้ และวิธีใหม่ในโลกภายในหัว",
  },
  connector: {
    id: "connector", thai: "นักเชื่อมโยง", en: "Connector",
    source: "world", phase: "process",
    color: "#1c7ed6", img: "assets/characters/connector.png",
    desc: "เชื่อมข้อมูล ประสบการณ์ คน หรือบริบทที่มีอยู่แล้วให้เห็นความสัมพันธ์ใหม่",
  },
  meaningmaker: {
    id: "meaningmaker", thai: "นักสื่อความหมาย", en: "Meaning Maker",
    source: "people", phase: "process",
    color: "#f76707", img: "assets/characters/meaningmaker.png",
    desc: "ทำให้ความคิดชัดขึ้นผ่านการอธิบาย เล่า เขียน วาด หรือสื่อสารออกมา",
  },
  creator: {
    id: "creator", thai: "นักสร้างสรรค์", en: "Creator",
    source: "self", phase: "process",
    color: "#9c36b5", img: "assets/characters/creator.png",
    desc: "สร้างความเป็นไปได้ใหม่ สร้างไอเดียหรือรูปแบบใหม่จากภายใน",
  },
  decider: {
    id: "decider", thai: "นักตัดสินใจ", en: "Decider",
    source: "world", phase: "distill",
    color: "#e03131", img: "assets/characters/decider.png",
    desc: "ชั่งน้ำหนักข้อจำกัดและเลือกทางที่จะเดินต่อ",
  },
  synthesizer: {
    id: "synthesizer", thai: "นักสรุป", en: "Synthesizer",
    source: "people", phase: "distill",
    color: "#868e96", img: "assets/characters/synthesizer.png",
    desc: "กลั่นหลายเสียง หลายข้อมูล ให้เหลือแก่นที่ชัดและใช้ได้",
  },
  reflector: {
    id: "reflector", thai: "นักทบทวน", en: "Reflector",
    source: "self", phase: "distill",
    color: "#364fc7", img: "assets/characters/reflector.png",
    desc: "ถอยกลับมาอยู่กับตัวเอง ตกผลึก และเข้าใจสิ่งที่เกิดขึ้นอย่างมั่นคง",
  },
};

// ลำดับ matrix 3x3: แถว = phase, คอลัมน์ = source
const MATRIX_ROWS = ["receive", "process", "distill"];
const MATRIX_COLS = ["world", "people", "self"];
const ROW_LABELS = { receive: "เปิดรับ", process: "แปรรูป / สร้างความหมาย", distill: "ตกผลึก / เลือกทาง" };
const COL_LABELS = { world: "โลกภายนอก", people: "คน / ความสัมพันธ์", self: "โลกภายใน" };

// ลำดับคงที่สำหรับวาดกราฟแมงมุม (9 แกน เรียงรอบ matrix ตามเข็มนาฬิกา)
const RADAR_ORDER = [
  "explorer", "connector", "decider",
  "synthesizer", "reflector", "creator",
  "experimenter", "listener", "meaningmaker",
];

// คำถาม 7 ข้อ — แต่ละข้อ 3 ตัวเลือก ยกเว้นข้อ 7 (ตัวเลือกครบ 9)
// คะแนนรวมทั้งหมด = 8 แต้ม (Q1-6 ข้อละ 1 แต้ม + Q7 ให้ 2 แต้ม) ใช้หาร % ทีหลัง
const QUESTIONS = [
  {
    text: "เวลาต้องเรียนรู้เรื่องใหม่ที่ไม่คุ้นเลย คุณมักจะ...",
    options: [
      { move: "explorer", text: "ออกไปดูของจริง ลงพื้นที่ ลองสัมผัสด้วยตัวเอง" },
      { move: "listener", text: "หาคนที่รู้เรื่องนี้แล้ว ถามและฟังเขาเล่า" },
      { move: "experimenter", text: "ลองทำเองดูก่อน ผิดก็ไม่เป็นไร ค่อยปรับ" },
    ],
  },
  {
    text: "ตอนกำลังทำความเข้าใจเรื่องที่ซับซ้อน คุณมักจะ...",
    options: [
      { move: "connector", text: "โยงมันกับสิ่งที่เคยรู้มาก่อน หาความเชื่อมโยง" },
      { move: "meaningmaker", text: "อธิบายหรือเล่าให้คนอื่นฟัง เพื่อให้ตัวเองเข้าใจขึ้น" },
      { move: "creator", text: "ลองคิดมุมใหม่ ผสมไอเดียเป็นอะไรที่ไม่เคยมี" },
    ],
  },
  {
    text: "ตอนต้องสรุปหรือปิดเรื่องอะไรสักอย่าง คุณมักจะ...",
    options: [
      { move: "decider", text: "ชั่งน้ำหนักตัวเลือก แล้วเลือกทางที่จะเดินต่อ" },
      { move: "synthesizer", text: "ตัดสิ่งที่ไม่จำเป็นออก เหลือแค่แก่นที่สำคัญ" },
      { move: "reflector", text: "หยุดอยู่กับตัวเองสักพัก ค่อยสรุปว่าเข้าใจอะไร" },
    ],
  },
  {
    text: "เวลาทำโปรเจกต์กลุ่ม บทบาทที่คุณมักรับไปเองคือ...",
    options: [
      { move: "explorer", text: "คนออกไปหาข้อมูล สำรวจตลาด หรือลงพื้นที่" },
      { move: "connector", text: "คนที่เห็นว่าข้อมูลแต่ละชิ้นเชื่อมกันยังไง" },
      { move: "decider", text: "คนที่ผลักดันให้กลุ่มตัดสินใจและเดินต่อ" },
    ],
  },
  {
    text: "ในความสัมพันธ์กับคนอื่น คุณมักโดดเด่นเรื่อง...",
    options: [
      { move: "listener", text: "การฟังคนอื่นอย่างตั้งใจ จนเข้าใจมุมเขาจริง ๆ" },
      { move: "meaningmaker", text: "การอธิบายให้คนอื่นเข้าใจในสิ่งที่ซับซ้อน" },
      { move: "synthesizer", text: "การสรุปสิ่งที่หลายคนพูดให้เหลือประเด็นเดียวที่ชัด" },
    ],
  },
  {
    text: "เวลาอยู่กับความคิดตัวเองเงียบ ๆ คุณมักจะ...",
    options: [
      { move: "experimenter", text: "ลองสมมติฐานเล่น ๆ ในหัวหลายแบบ" },
      { move: "creator", text: "ปล่อยให้ไอเดียใหม่ผุดขึ้นมาแบบที่ไม่เคยคิดมาก่อน" },
      { move: "reflector", text: "ทบทวนสิ่งที่เกิดขึ้น แล้วค่อย ๆ เข้าใจตัวเองมากขึ้น" },
    ],
  },
  {
    text: "ถ้าวันนี้ต้องเลือกพ่อมด/แม่มดตัวแทนตัวเองได้แค่ 1 ตัว คุณจะเลือกตัวไหน?",
    weight: 2,
    options: RADAR_ORDER.map((id) => ({ move: id, text: MOVES[id].thai })),
  },
];

const TOTAL_POINTS = QUESTIONS.reduce((sum, q) => sum + (q.weight || 1), 0); // = 8
