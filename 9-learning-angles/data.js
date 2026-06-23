// WoL Learning Moves — data definitions
// แก้ไขสีหรือชื่อได้ที่นี่ที่เดียว ทุกหน้าจะอัปเดตตาม

const MOVES = {
  explorer: {
    id: "explorer", thai: "นักสำรวจ", en: "Explorer",
    source: "world", phase: "receive",
    color: "#2f9e44", img: "assets/characters/explorer.png",
    guide: "คุณเปิดรับโลกผ่านการออกไปเจอของจริงด้วยตัวเอง ช่างสังเกตและอยากรู้อยากเห็นกับสิ่งรอบตัว",
    activity: "ลองหาเวลาไปที่ใหม่ที่ไม่เคยไปในสัปดาห์นี้ แล้วจดสิ่งที่สังเกตเห็น 3 อย่างที่ไม่เคยสังเกตมาก่อน",
  },
  listener: {
    id: "listener", thai: "นักฟัง", en: "Listener",
    source: "people", phase: "receive",
    color: "#4dabf7", img: "assets/characters/listener.png",
    guide: "คุณเปิดรับความหมายผ่านการฟังคนอื่นอย่างตั้งใจ เข้าใจมุมมองคนรอบข้างได้ลึก",
    activity: "ลองฟังเพื่อนหรือคนในบ้านพูดโดยไม่ขัด แล้วสรุปสิ่งที่เขาพูดกลับไปให้เขาฟัง ดูว่าตรงกับที่เขาตั้งใจพูดไหม",
  },
  experimenter: {
    id: "experimenter", thai: "นักทดลอง", en: "Experimenter",
    source: "self", phase: "receive",
    color: "#fcc419", img: "assets/characters/experimenter.png",
    guide: "คุณเรียนรู้ผ่านการลองสมมติฐานและวิธีใหม่ในหัว ไม่กลัวลองผิดเพื่อค้นพบสิ่งที่ได้ผล",
    activity: "เลือกเรื่องเล็ก ๆ ที่ทำเป็นประจำ แล้วลองทำให้ต่างจากปกติ 1 อย่าง สังเกตว่าผลลัพธ์เปลี่ยนไปยังไง",
  },
  connector: {
    id: "connector", thai: "นักเชื่อมโยง", en: "Connector",
    source: "world", phase: "process",
    color: "#1c7ed6", img: "assets/characters/connector.png",
    guide: "คุณเก่งเรื่องเห็นว่าสิ่งต่าง ๆ เชื่อมกันยังไง มองเห็น pattern ที่คนอื่นอาจมองไม่เห็น",
    activity: "ลองทำ mind map เชื่อมเรื่องที่กำลังเรียนหรือทำอยู่ เข้ากับสิ่งที่คุณรู้อยู่แล้วอย่างน้อย 3 จุด",
  },
  meaningmaker: {
    // Keep legacy key/id for compatibility; display name follows current canon.
    id: "meaningmaker", thai: "นักสื่อสาร", en: "Communicator",
    source: "people", phase: "process",
    color: "#f76707", img: "assets/characters/meaningmaker.png",
    guide: "คุณคิดชัดขึ้นเมื่อได้พูด เขียน หรืออธิบาย และใช้การสื่อสารเป็นเครื่องมือจัดความเข้าใจตัวเองให้ดีขึ้น",
    activity: "ลองอธิบายเรื่องที่กำลังเรียนรู้อยู่ให้คนที่ไม่รู้เรื่องนี้เลยฟัง แล้วสังเกตว่าจุดไหนที่อธิบายไม่ออก",
  },
  creator: {
    id: "creator", thai: "นักสร้างสรรค์", en: "Creator",
    source: "self", phase: "process",
    color: "#9c36b5", img: "assets/characters/creator.png",
    guide: "คุณสร้างความเป็นไปได้ใหม่จากภายใน มองเห็นทางเลือกที่ยังไม่มีใครเคยทำ",
    activity: "ลองหยิบของหรือวิธีที่มีอยู่แล้ว 2 อย่างมาผสมกันเป็นไอเดียใหม่ที่ยังไม่มีใครทำ",
  },
  decider: {
    id: "decider", thai: "นักตัดสินใจ", en: "Decider",
    source: "world", phase: "distill",
    color: "#e03131", img: "assets/characters/decider.png",
    guide: "คุณกล้าชั่งน้ำหนักข้อจำกัดและเลือกทางเดินต่อ แม้ข้อมูลจะไม่ครบ 100%",
    activity: "ครั้งหน้าที่ต้องเลือกอะไรที่ค้างใจ ให้ตั้งเดดไลน์ตัดสินใจของตัวเองภายใน 24 ชม. แล้วลองทำตามนั้นดู",
  },
  synthesizer: {
    // Keep legacy key/id for compatibility; display name follows current canon.
    id: "synthesizer", thai: "นักสรุป", en: "Summarizer",
    source: "people", phase: "distill",
    color: "#868e96", img: "assets/characters/synthesizer.png",
    guide: "คุณกลั่นข้อมูลหรือความเห็นจำนวนมากให้เหลือแก่นที่ชัดและใช้ได้จริง",
    activity: "ลองสรุปบทความ การประชุม หรือบทเรียนล่าสุด ให้เหลือ 3 ประโยคที่สำคัญที่สุด",
  },
  reflector: {
    id: "reflector", thai: "นักทบทวน", en: "Reflector",
    source: "self", phase: "distill",
    color: "#33353a", img: "assets/characters/reflector.png",
    guide: "คุณถอยกลับมาอยู่กับตัวเอง ตกผลึก และเข้าใจสิ่งที่เกิดขึ้นอย่างมั่นคงก่อนเดินต่อ",
    activity: "ลองเขียน journal สั้น ๆ ก่อนนอน 3 บรรทัด ว่าวันนี้เรียนรู้อะไรเกี่ยวกับตัวเองบ้าง",
  },
};

// ลำดับ matrix 3x3: แถว = phase, คอลัมน์ = source
const MATRIX_ROWS = ["receive", "process", "distill"];
const MATRIX_COLS = ["world", "people", "self"];
const ROW_LABELS = { receive: "เปิดรับ", process: "แปรรูป / สร้างความหมาย", distill: "ตกผลึก / เลือกทาง" };
const COL_LABELS = { world: "โลกภายนอก", people: "คน / ความสัมพันธ์", self: "โลกภายใน" };

// ลำดับคงที่สำหรับวาดกราฟ/ลิสต์ (ไม่ใช้กราฟแมงมุมแล้ว แต่ยังใช้ลำดับนี้เพื่อความสม่ำเสมอ)
const RADAR_ORDER = [
  "explorer", "connector", "decider",
  "synthesizer", "reflector", "creator",
  "experimenter", "listener", "meaningmaker",
];

// คำถาม 7 ข้อ — เชื่อมกับสถานการณ์ในชีวิตประจำวัน
// Q1-6: ข้อละ 2 แต้ม ครอบคลุมแต่ละ move 2 ครั้งพอดี (รวม 12 แต้ม)
// Q7: เลือกตัวละครที่ชอบที่สุด ให้แค่ 1 แต้ม ใช้เป็น tiebreaker เท่านั้น ไม่ใช่ตัวชี้วัดหลัก
const QUESTIONS = [
  {
    text: "มีเวลาว่างวันหยุด ไม่มีแพลนอะไรเลย คุณมักจะ...",
    weight: 2,
    options: [
      { move: "explorer", text: "ออกไปเดินเล่น สำรวจที่ใหม่ ๆ แถวบ้านหรือที่ไม่เคยไป" },
      { move: "listener", text: "คุยโทรศัพท์หรือนั่งฟังเพื่อน/คนในบ้านเล่าเรื่องยาว ๆ" },
      { move: "experimenter", text: "ลองทำอะไรใหม่ที่ไม่เคยทำ เผื่อสนุกหรือได้ของใหม่" },
    ],
  },
  {
    text: "มีเรื่องที่อ่านหรือฟังแล้วยังไม่ค่อยเข้าใจ คุณมักจะ...",
    weight: 2,
    options: [
      { move: "connector", text: "ลองหาว่ามันคล้ายกับเรื่องที่เคยรู้มาก่อนไหม" },
      { move: "meaningmaker", text: "ลองอธิบายให้คนอื่นฟังดู เผื่อตัวเองจะเข้าใจมากขึ้น" },
      { move: "creator", text: "ลองตีความใส่มุมของตัวเองเข้าไป จนกลายเป็นความเข้าใจแบบใหม่" },
    ],
  },
  {
    text: "ถึงเวลาต้องสรุปหรือเลือกอะไรสักอย่างในชีวิตจริง คุณมักจะ...",
    weight: 2,
    options: [
      { move: "decider", text: "ชั่งใจเปรียบเทียบข้อดีข้อเสีย แล้วเลือกเดินทางหนึ่ง" },
      { move: "synthesizer", text: "ตัดรายละเอียดที่ไม่จำเป็นออก เหลือแค่ใจความสำคัญ" },
      { move: "reflector", text: "ขอเวลาอยู่กับตัวเองสักพักก่อนค่อยตัดสินใจ" },
    ],
  },
  {
    text: "ทำงานกลุ่มหรือทำกิจกรรมกับคนอื่น คุณมักรับบทเป็นคน...",
    weight: 2,
    options: [
      { move: "explorer", text: "ที่ออกไปหาข้อมูล สอบถาม หรือสำรวจให้กลุ่ม" },
      { move: "connector", text: "ที่เห็นว่าข้อมูลแต่ละชิ้นที่ทุกคนเอามาเชื่อมกันยังไง" },
      { move: "decider", text: "ที่ผลักดันให้กลุ่มตัดสินใจและไปต่อ เมื่อคุยกันนานเกินไป" },
    ],
  },
  {
    text: "เวลาคุยกับเพื่อนหรือคนในทีม คุณมักโดดเด่นเรื่อง...",
    weight: 2,
    options: [
      { move: "listener", text: "ฟังคนอื่นจนจับใจความที่เขาอยากพูดได้จริง ๆ" },
      { move: "meaningmaker", text: "อธิบายเรื่องยาก ๆ ให้คนอื่นเข้าใจง่ายขึ้น" },
      { move: "synthesizer", text: "สรุปสิ่งที่หลายคนพูดให้เหลือประเด็นเดียวที่ทุกคนเห็นตรงกัน" },
    ],
  },
  {
    text: "เวลาอยู่กับตัวเองเงียบ ๆ คุณมักจะ...",
    weight: 2,
    options: [
      { move: "experimenter", text: "ลองคิดเล่น ๆ ว่าถ้าทำอีกแบบจะเป็นยังไง" },
      { move: "creator", text: "ปล่อยให้ไอเดียใหม่ผุดขึ้นมาเรื่อย ๆ แบบที่ไม่เคยคิดมาก่อน" },
      { move: "reflector", text: "ทบทวนสิ่งที่ผ่านมา แล้วค่อย ๆ เข้าใจตัวเองมากขึ้น" },
    ],
  },
  {
    text: "ถ้าวันนี้ต้องเลือกพ่อมด/แม่มดตัวแทนตัวเองได้แค่ 1 ตัว คุณจะเลือกตัวไหน?",
    weight: 1,
    note: "ข้อนี้แค่ดูความชอบ ใช้เป็นตัวช่วยตัดสินตอนคะแนนเท่ากันเท่านั้น",
    options: RADAR_ORDER.map((id) => ({ move: id, text: MOVES[id].thai })),
  },
];

const TOTAL_POINTS = QUESTIONS.reduce((sum, q) => sum + (q.weight || 1), 0); // = 13
