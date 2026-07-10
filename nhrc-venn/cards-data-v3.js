// ชุดคำ v3 — คำเดี่ยว draft สำหรับ simulation 2026-07-10
// เป้าหมาย: คำเห็นภาพเร็ว, ลดความกำกวม, ใช้กับ 2-3 ทีม / 7 ใบ / หลุดการป้องกัน 8
const WORD_CARDS_V3 = [
  { no: 1, text: "นม", treaties: ["CRC", "ICESCR"], type: "overlap", reason: "โภชนาการเด็ก + สิทธิอาหาร" },
  { no: 2, text: "การบ้าน", treaties: ["CRC", "ICESCR"], type: "overlap", reason: "เด็ก + สิทธิการศึกษา" },
  { no: 3, text: "โรงเรียน", treaties: ["CRC", "ICESCR"], type: "overlap", reason: "เด็ก + สิทธิการศึกษา" },
  { no: 4, text: "สนามเด็กเล่น", treaties: ["CRC", "ICESCR"], type: "overlap", reason: "พัฒนาการเด็ก + พื้นที่สาธารณะปลอดภัย" },
  { no: 5, text: "ของเล่น", treaties: ["CRC"], type: "clear", reason: "สิทธิการเล่นและพัฒนาการเด็ก" },
  { no: 6, text: "นิทาน", treaties: ["CRC"], type: "clear", reason: "การเรียนรู้และพัฒนาการเด็ก" },
  { no: 7, text: "สูติบัตร", treaties: ["CRC", "ICCPR"], type: "overlap", reason: "เด็ก + สิทธิในสถานะบุคคล" },
  { no: 8, text: "สัญชาติ", treaties: ["CRC", "ICCPR", "ICERD"], type: "borderline", reason: "สถานะบุคคล + เด็ก + ไม่เลือกปฏิบัติ" },

  { no: 9, text: "ข้าว", treaties: ["ICESCR"], type: "clear", reason: "สิทธิอาหาร" },
  { no: 10, text: "บ้าน", treaties: ["ICESCR"], type: "clear", reason: "สิทธิที่อยู่อาศัย" },
  { no: 11, text: "โรงพยาบาล", treaties: ["ICESCR"], type: "clear", reason: "สิทธิสุขภาพ" },
  { no: 12, text: "ค่าแรง", treaties: ["ICESCR", "ICRMW"], type: "overlap", reason: "สิทธิแรงงานและการดำรงชีวิต" },
  { no: 13, text: "ที่พักคนงาน", treaties: ["ICESCR", "ICRMW"], type: "overlap", reason: "ที่อยู่อาศัย + แรงงานข้ามชาติ" },

  { no: 14, text: "ไมโครโฟน", treaties: ["ICCPR"], type: "clear", reason: "เสรีภาพการแสดงออก" },
  { no: 15, text: "ศาสนา", treaties: ["ICCPR"], type: "clear", reason: "เสรีภาพความเชื่อและศาสนา" },
  { no: 16, text: "ชุมนุม", treaties: ["ICCPR"], type: "clear", reason: "เสรีภาพการรวมกลุ่มและชุมนุม" },
  { no: 17, text: "รหัสผ่าน", treaties: ["ICCPR"], type: "clear", reason: "ความเป็นส่วนตัว" },
  { no: 18, text: "ทนาย", treaties: ["ICCPR", "CAT", "CPED"], type: "borderline", reason: "กระบวนการยุติธรรม ป้องกันการทรมานและสูญหาย" },

  { no: 19, text: "เงินเดือนเท่ากัน", treaties: ["CEDAW", "ICESCR"], type: "overlap", reason: "ความเสมอภาคทางเพศ + สิทธิแรงงาน" },
  { no: 20, text: "แม่ท้อง", treaties: ["CEDAW", "ICESCR"], type: "overlap", reason: "ผู้หญิง + สุขภาพและการทำงาน" },
  { no: 21, text: "ประจำเดือน", treaties: ["CEDAW", "ICESCR"], type: "overlap", reason: "สุขภาพผู้หญิงและศักดิ์ศรี" },
  { no: 22, text: "กีดกันผู้หญิง", treaties: ["CEDAW"], type: "clear", reason: "การเลือกปฏิบัติต่อผู้หญิง" },

  { no: 23, text: "รถเข็น", treaties: ["CRPD"], type: "clear", reason: "สิทธิคนพิการและการเข้าถึง" },
  { no: 24, text: "ทางลาด", treaties: ["CRPD", "ICESCR"], type: "overlap", reason: "การเข้าถึงสถานที่และบริการสาธารณะ" },
  { no: 25, text: "เบรลล์", treaties: ["CRPD"], type: "clear", reason: "การเข้าถึงข้อมูลของคนตาบอด" },
  { no: 26, text: "ภาษามือ", treaties: ["CRPD", "ICCPR"], type: "overlap", reason: "การเข้าถึงการสื่อสารและการแสดงออก" },

  { no: 27, text: "สีผิว", treaties: ["ICERD"], type: "clear", reason: "ไม่ถูกเลือกปฏิบัติทางเชื้อชาติ" },
  { no: 28, text: "ภาษาแม่", treaties: ["ICERD", "ICCPR"], type: "overlap", reason: "อัตลักษณ์ทางภาษา + การแสดงออก" },
  { no: 29, text: "ชาติพันธุ์", treaties: ["ICERD"], type: "clear", reason: "ไม่ถูกเหยียดเชื้อชาติหรือชาติพันธุ์" },
  { no: 30, text: "สำเนียง", treaties: ["ICERD", "ICRMW"], type: "overlap", reason: "การเลือกปฏิบัติจากที่มา ภาษา หรือสถานะคนย้ายถิ่น" },

  { no: 31, text: "ห้องสอบสวน", treaties: ["CAT", "ICCPR"], type: "overlap", reason: "กระบวนการยุติธรรมและการป้องกันการทรมาน" },
  { no: 32, text: "คำสารภาพ", treaties: ["CAT", "ICCPR"], type: "overlap", reason: "ต้องไม่ถูกบังคับหรือทรมานให้รับสารภาพ" },
  { no: 33, text: "ขู่เข็ญ", treaties: ["CAT"], type: "clear", reason: "การป้องกันการทรมานและการปฏิบัติที่โหดร้าย" },
  { no: 34, text: "ห้องขัง", treaties: ["CAT", "CPED"], type: "overlap", reason: "พื้นที่เสี่ยงต่อการทรมานหรือสูญหาย" },

  { no: 35, text: "พาสปอร์ต", treaties: ["ICRMW"], type: "clear", reason: "เอกสารและสถานะแรงงานข้ามชาติ" },
  { no: 36, text: "ใบอนุญาตทำงาน", treaties: ["ICRMW"], type: "clear", reason: "สิทธิแรงงานข้ามชาติ" },
  { no: 37, text: "นายจ้าง", treaties: ["ICRMW", "ICESCR"], type: "overlap", reason: "ความสัมพันธ์การทำงานและสิทธิแรงงาน" },

  { no: 38, text: "อุ้มหาย", treaties: ["CPED"], type: "clear", reason: "การบังคับให้สูญหาย" },
  { no: 39, text: "รายชื่อผู้สูญหาย", treaties: ["CPED"], type: "clear", reason: "การติดตามและค้นหาผู้สูญหาย" },
  { no: 40, text: "กล้องวงจรปิด", treaties: ["CPED", "ICCPR"], type: "overlap", reason: "การตรวจสอบการสูญหายและสิทธิความเป็นส่วนตัว" },

  { no: 41, text: "ผู้หญิงพิการ", treaties: ["CEDAW", "CRPD"], type: "overlap", reason: "การเลือกปฏิบัติซ้อนระหว่างเพศและความพิการ" },
  { no: 42, text: "ผู้หญิงชาติพันธุ์", treaties: ["CEDAW", "ICERD"], type: "overlap", reason: "การเลือกปฏิบัติซ้อนระหว่างเพศและชาติพันธุ์" },
  { no: 43, text: "ตรวจค้นร่างกาย", treaties: ["CEDAW", "CAT", "ICCPR"], type: "borderline", reason: "ศักดิ์ศรี ความเป็นส่วนตัว และการปฏิบัติที่ไม่เหมาะสม" },
  { no: 44, text: "คนพิการในห้องขัง", treaties: ["CRPD", "CAT"], type: "overlap", reason: "คนพิการในพื้นที่ควบคุมตัวต้องได้รับการคุ้มครองเฉพาะ" },
  { no: 45, text: "หายตัวหลังถูกจับ", treaties: ["CAT", "CPED", "ICCPR"], type: "borderline", reason: "การควบคุมตัวที่เสี่ยงต่อการทรมานและการบังคับให้สูญหาย" },
  { no: 46, text: "เด็กชาติพันธุ์", treaties: ["CRC", "ICERD"], type: "overlap", reason: "เด็กที่ถูกเลือกปฏิบัติจากชาติพันธุ์ต้องได้รับการคุ้มครองซ้อน" },
  { no: 47, text: "หมู่บ้านชาติพันธุ์", treaties: ["ICESCR", "ICERD"], type: "overlap", reason: "ชุมชนชาติพันธุ์กับสิทธิที่อยู่ อาหาร สุขภาพ และบริการพื้นฐาน" },
  { no: 48, text: "คนพิการชาติพันธุ์", treaties: ["CRPD", "ICERD"], type: "overlap", reason: "ความพิการและชาติพันธุ์เป็นการเลือกปฏิบัติซ้อน" },
  { no: 49, text: "แรงงานชาติพันธุ์", treaties: ["ICRMW", "ICERD"], type: "overlap", reason: "แรงงานย้ายถิ่นอาจถูกเลือกปฏิบัติจากเชื้อชาติ ภาษา หรือที่มา" },
  { no: 50, text: "ค้นตัวชาติพันธุ์", treaties: ["CAT", "ICERD", "ICCPR"], type: "borderline", reason: "การควบคุมตัวหรือตรวจค้นที่เลือกปฏิบัติจากชาติพันธุ์" },
  { no: 51, text: "อุ้มหายชาติพันธุ์", treaties: ["CPED", "ICERD"], type: "overlap", reason: "การสูญหายที่เกิดกับกลุ่มชาติพันธุ์หรือชนกลุ่มน้อย" },
  { no: 52, text: "ป้ายเหยียด", treaties: ["ICERD"], type: "clear", reason: "ข้อความหรือสัญลักษณ์ที่เหยียดเชื้อชาติหรือชาติพันธุ์" },
  { no: 53, text: "เชื้อสาย", treaties: ["ICERD"], type: "clear", reason: "การเลือกปฏิบัติจากเชื้อสายหรือที่มาของบุคคล" },
];
