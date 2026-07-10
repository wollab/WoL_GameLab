// ชุดคำ v2 — คำเดี่ยวใกล้ตัว (Codenames style) draft 2026-07-10 รอ กสม./SME ตรวจ mapping
const WORD_CARDS_V2 = [
 {
  "no": 1,
  "text": "นม",
  "treaties": [
   "CRC",
   "ICESCR"
  ],
  "type": "overlap",
  "reason": "โภชนาการเด็ก + สิทธิอาหาร"
 },
 {
  "no": 2,
  "text": "การบ้าน",
  "treaties": [
   "CRC",
   "ICESCR"
  ],
  "type": "overlap",
  "reason": "เด็ก + สิทธิการศึกษา"
 },
 {
  "no": 3,
  "text": "ของเล่น",
  "treaties": [
   "CRC"
  ],
  "type": "clear",
  "reason": "สิทธิการเล่นและพัฒนาการเด็ก"
 },
 {
  "no": 4,
  "text": "สนามเด็กเล่น",
  "treaties": [
   "CRC",
   "ICESCR"
  ],
  "type": "overlap",
  "reason": "พื้นที่เล่นปลอดภัย + บริการสาธารณะ"
 },
 {
  "no": 5,
  "text": "ชุดนักเรียน",
  "treaties": [
   "CRC",
   "ICESCR"
  ],
  "type": "overlap",
  "reason": "การเข้าถึงการศึกษาโดยไม่กีดกัน"
 },
 {
  "no": 6,
  "text": "ครู",
  "treaties": [
   "CRC",
   "ICESCR"
  ],
  "type": "overlap",
  "reason": "การศึกษาและการคุ้มครองเด็กในโรงเรียน"
 },
 {
  "no": 7,
  "text": "โรงเรียน",
  "treaties": [
   "CRC",
   "ICESCR"
  ],
  "type": "overlap",
  "reason": "สิทธิการศึกษา"
 },
 {
  "no": 8,
  "text": "นิทาน",
  "treaties": [
   "CRC"
  ],
  "type": "clear",
  "reason": "พัฒนาการและการเรียนรู้ของเด็ก"
 },
 {
  "no": 9,
  "text": "สูติบัตร",
  "treaties": [
   "CRC",
   "ICCPR"
  ],
  "type": "overlap",
  "reason": "สถานะบุคคลตั้งแต่เกิด"
 },
 {
  "no": 10,
  "text": "นามสกุล",
  "treaties": [
   "CRC",
   "ICCPR"
  ],
  "type": "overlap",
  "reason": "สิทธิในชื่อและสถานะบุคคล"
 },
 {
  "no": 11,
  "text": "สัญชาติ",
  "treaties": [
   "CRC",
   "ICCPR",
   "ICERD"
  ],
  "type": "overlap",
  "reason": "สถานะบุคคล + ไม่เลือกปฏิบัติด้วยเชื้อชาติ"
 },
 {
  "no": 12,
  "text": "ข้าว",
  "treaties": [
   "ICESCR"
  ],
  "type": "clear",
  "reason": "สิทธิอาหาร"
 },
 {
  "no": 13,
  "text": "น้ำประปา",
  "treaties": [
   "ICESCR"
  ],
  "type": "clear",
  "reason": "สิทธิน้ำสะอาด"
 },
 {
  "no": 14,
  "text": "ไฟฟ้า",
  "treaties": [
   "ICESCR"
  ],
  "type": "clear",
  "reason": "มาตรฐานการครองชีพ"
 },
 {
  "no": 15,
  "text": "บ้านเช่า",
  "treaties": [
   "ICESCR"
  ],
  "type": "clear",
  "reason": "สิทธิที่อยู่อาศัย"
 },
 {
  "no": 16,
  "text": "ยา",
  "treaties": [
   "ICESCR"
  ],
  "type": "clear",
  "reason": "สิทธิสุขภาพ"
 },
 {
  "no": 17,
  "text": "โรงพยาบาล",
  "treaties": [
   "ICESCR",
   "CRPD"
  ],
  "type": "overlap",
  "reason": "สิทธิสุขภาพ + การเข้าถึงของทุกคน"
 },
 {
  "no": 18,
  "text": "วัคซีน",
  "treaties": [
   "ICESCR",
   "CRC"
  ],
  "type": "overlap",
  "reason": "สุขภาพ + เด็ก"
 },
 {
  "no": 19,
  "text": "เงินเดือน",
  "treaties": [
   "ICESCR",
   "CEDAW"
  ],
  "type": "overlap",
  "reason": "ค่าจ้างเป็นธรรม + เท่าเทียมทางเพศ"
 },
 {
  "no": 20,
  "text": "วันหยุด",
  "treaties": [
   "ICESCR",
   "ICRMW"
  ],
  "type": "overlap",
  "reason": "สภาพการทำงานเป็นธรรมของแรงงานทุกคน"
 },
 {
  "no": 21,
  "text": "โรงงาน",
  "treaties": [
   "ICESCR",
   "ICRMW"
  ],
  "type": "overlap",
  "reason": "ความปลอดภัยในงาน + แรงงานข้ามชาติ"
 },
 {
  "no": 22,
  "text": "ค่าแรง",
  "treaties": [
   "ICESCR",
   "ICRMW"
  ],
  "type": "overlap",
  "reason": "ค่าตอบแทนเป็นธรรม"
 },
 {
  "no": 23,
  "text": "ลาคลอด",
  "treaties": [
   "CEDAW",
   "ICESCR"
  ],
  "type": "overlap",
  "reason": "สิทธิแม่ + สภาพการทำงาน"
 },
 {
  "no": 24,
  "text": "มรดก",
  "treaties": [
   "CEDAW",
   "ICESCR"
  ],
  "type": "overlap",
  "reason": "ความเท่าเทียมในทรัพย์สินและครอบครัว"
 },
 {
  "no": 25,
  "text": "ผ้าอนามัย",
  "treaties": [
   "CEDAW",
   "ICESCR"
  ],
  "type": "overlap",
  "reason": "สุขภาพผู้หญิง + การเข้าถึง"
 },
 {
  "no": 26,
  "text": "แม่ครัว",
  "treaties": [
   "CEDAW"
  ],
  "type": "borderline",
  "reason": "อาชีพทั่วไป แต่ถ้าถูกบังคับเพราะเพศ = บทบาททางเพศ"
 },
 {
  "no": 27,
  "text": "ฟุตบอล",
  "treaties": [
   "CEDAW",
   "CRC"
  ],
  "type": "borderline",
  "reason": "กีฬาทั่วไป แต่ถ้าห้ามเล่นเพราะเพศ = กีดกัน"
 },
 {
  "no": 28,
  "text": "ไมโครโฟน",
  "treaties": [
   "ICCPR"
  ],
  "type": "clear",
  "reason": "เสรีภาพการแสดงออก"
 },
 {
  "no": 29,
  "text": "โพสต์",
  "treaties": [
   "ICCPR"
  ],
  "type": "clear",
  "reason": "แสดงความเห็นออนไลน์"
 },
 {
  "no": 30,
  "text": "ข่าว",
  "treaties": [
   "ICCPR"
  ],
  "type": "clear",
  "reason": "สิทธิรับรู้ข้อมูลข่าวสาร"
 },
 {
  "no": 31,
  "text": "เลือกตั้ง",
  "treaties": [
   "ICCPR"
  ],
  "type": "clear",
  "reason": "สิทธิมีส่วนร่วมทางการเมือง"
 },
 {
  "no": 32,
  "text": "ม็อบ",
  "treaties": [
   "ICCPR"
  ],
  "type": "clear",
  "reason": "เสรีภาพการชุมนุมโดยสงบ"
 },
 {
  "no": 33,
  "text": "รหัสผ่าน",
  "treaties": [
   "ICCPR"
  ],
  "type": "clear",
  "reason": "ความเป็นส่วนตัว"
 },
 {
  "no": 34,
  "text": "แชท",
  "treaties": [
   "ICCPR"
  ],
  "type": "clear",
  "reason": "การสื่อสารส่วนตัว"
 },
 {
  "no": 35,
  "text": "มัสยิด",
  "treaties": [
   "ICCPR",
   "ICERD"
  ],
  "type": "overlap",
  "reason": "เสรีภาพศาสนา + ไม่เลือกปฏิบัติ"
 },
 {
  "no": 36,
  "text": "วัด",
  "treaties": [
   "ICCPR"
  ],
  "type": "clear",
  "reason": "เสรีภาพความเชื่อและศาสนกิจ"
 },
 {
  "no": 37,
  "text": "ฮิญาบ",
  "treaties": [
   "ICCPR",
   "ICERD",
   "CEDAW"
  ],
  "type": "overlap",
  "reason": "ศาสนา + ชาติพันธุ์ + เพศ"
 },
 {
  "no": 38,
  "text": "ทรงผม",
  "treaties": [
   "ICCPR",
   "CRC"
  ],
  "type": "borderline",
  "reason": "เรื่องส่วนตัว แต่ถ้าถูกบังคับ = สิทธิในร่างกาย/แสดงออก"
 },
 {
  "no": 39,
  "text": "กล้องวงจรปิด",
  "treaties": [
   "ICCPR"
  ],
  "type": "borderline",
  "reason": "ความปลอดภัยสาธารณะ vs ความเป็นส่วนตัว"
 },
 {
  "no": 40,
  "text": "กุญแจมือ",
  "treaties": [
   "ICCPR",
   "CAT"
  ],
  "type": "overlap",
  "reason": "การควบคุมตัวโดยชอบ + ห้ามปฏิบัติทารุณ"
 },
 {
  "no": 41,
  "text": "ห้องขัง",
  "treaties": [
   "CAT",
   "ICCPR"
  ],
  "type": "overlap",
  "reason": "สภาพการคุมขัง + เสรีภาพ"
 },
 {
  "no": 42,
  "text": "คำสารภาพ",
  "treaties": [
   "CAT",
   "ICCPR"
  ],
  "type": "overlap",
  "reason": "ห้ามบังคับให้รับสารภาพ"
 },
 {
  "no": 43,
  "text": "ไม้เรียว",
  "treaties": [
   "CAT",
   "CRC"
  ],
  "type": "overlap",
  "reason": "การลงโทษทางกายต่อเด็ก"
 },
 {
  "no": 44,
  "text": "รอยแผล",
  "treaties": [
   "CAT"
  ],
  "type": "clear",
  "reason": "หลักฐานการทำร้าย/ทรมาน"
 },
 {
  "no": 45,
  "text": "คนหาย",
  "treaties": [
   "CPED"
  ],
  "type": "clear",
  "reason": "การบังคับสูญหาย"
 },
 {
  "no": 46,
  "text": "แฟ้มคดี",
  "treaties": [
   "CPED",
   "ICCPR"
  ],
  "type": "overlap",
  "reason": "สิทธิรู้ความจริง + กระบวนการยุติธรรม"
 },
 {
  "no": 47,
  "text": "ญาติ",
  "treaties": [
   "CPED",
   "ICCPR"
  ],
  "type": "overlap",
  "reason": "ครอบครัวผู้สูญหายมีสิทธิรู้ชะตากรรม"
 },
 {
  "no": 48,
  "text": "สีผิว",
  "treaties": [
   "ICERD"
  ],
  "type": "clear",
  "reason": "ห้ามเลือกปฏิบัติด้วยเชื้อชาติ"
 },
 {
  "no": 49,
  "text": "ภาษาถิ่น",
  "treaties": [
   "ICERD",
   "ICESCR"
  ],
  "type": "overlap",
  "reason": "วัฒนธรรม + การศึกษาในภาษาแม่"
 },
 {
  "no": 50,
  "text": "ชาติพันธุ์",
  "treaties": [
   "ICERD"
  ],
  "type": "clear",
  "reason": "สิทธิกลุ่มชาติพันธุ์"
 },
 {
  "no": 51,
  "text": "ล้อเลียน",
  "treaties": [
   "ICERD",
   "CRC"
  ],
  "type": "borderline",
  "reason": "มุกตลกทั่วไป แต่ถ้าเหยียดเชื้อชาติ/รังแกเด็ก = ละเมิด"
 },
 {
  "no": 52,
  "text": "พาสปอร์ต",
  "treaties": [
   "ICRMW",
   "ICCPR"
  ],
  "type": "overlap",
  "reason": "เอกสารเดินทาง + เสรีภาพการเคลื่อนไหว"
 },
 {
  "no": 53,
  "text": "วีซ่า",
  "treaties": [
   "ICRMW"
  ],
  "type": "clear",
  "reason": "สถานะแรงงานข้ามชาติ"
 },
 {
  "no": 54,
  "text": "ชายแดน",
  "treaties": [
   "ICRMW",
   "ICERD"
  ],
  "type": "overlap",
  "reason": "การย้ายถิ่น + ไม่เลือกปฏิบัติ"
 },
 {
  "no": 55,
  "text": "เงินโอน",
  "treaties": [
   "ICRMW"
  ],
  "type": "clear",
  "reason": "สิทธิส่งรายได้กลับครอบครัว"
 },
 {
  "no": 56,
  "text": "ล่าม",
  "treaties": [
   "ICRMW",
   "CRPD",
   "ICCPR"
  ],
  "type": "overlap",
  "reason": "การเข้าถึงบริการและกระบวนการยุติธรรม"
 },
 {
  "no": 57,
  "text": "วีลแชร์",
  "treaties": [
   "CRPD"
  ],
  "type": "clear",
  "reason": "อุปกรณ์ช่วยการเคลื่อนไหว"
 },
 {
  "no": 58,
  "text": "ทางลาด",
  "treaties": [
   "CRPD",
   "ICESCR"
  ],
  "type": "overlap",
  "reason": "การเข้าถึงอาคารและบริการ"
 },
 {
  "no": 59,
  "text": "ลิฟต์",
  "treaties": [
   "CRPD",
   "ICESCR"
  ],
  "type": "overlap",
  "reason": "การเข้าถึงสำหรับทุกคน"
 },
 {
  "no": 60,
  "text": "อักษรเบรลล์",
  "treaties": [
   "CRPD",
   "ICESCR"
  ],
  "type": "overlap",
  "reason": "การเข้าถึงข้อมูลและการศึกษา"
 },
 {
  "no": 61,
  "text": "ภาษามือ",
  "treaties": [
   "CRPD",
   "ICCPR"
  ],
  "type": "overlap",
  "reason": "การสื่อสารและการแสดงออก"
 },
 {
  "no": 62,
  "text": "แว่นตา",
  "treaties": [
   "CRPD"
  ],
  "type": "borderline",
  "reason": "ของใช้ทั่วไป แต่โยงการเข้าถึง/อุปกรณ์ช่วยได้"
 }
];
