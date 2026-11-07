/* Wizard Discovery V1 — independently authored creative matching layer.
 * Learning Angles remain the source of truth in ../9-learning-angles/data.js.
 * This is not a psychometric diagnosis.
 */
const WIZARD_FAMILIES = {
  A: { title: "Arcane & Knowledge", thai: "ศาสตร์เวทและความรู้", motto: "เข้าใจโลก เพื่อเปลี่ยนแปลงโลก", description: "ใช้ความรู้ การสำรวจแบบแผน และการมองเห็นความเป็นไปได้เพื่อเข้าใจโลก", icon: "✦", color: "#6354b8" },
  B: { title: "Life & Nature", thai: "ชีวิต ธรรมชาติ และศรัทธา", motto: "ดูแลชีวิต และสร้างเงื่อนไขให้เติบโต", description: "เยียวยา ปกป้อง และสร้างความสมดุลเพื่อให้ชีวิตเติบโต", icon: "❀", color: "#31985c" },
  C: { title: "Spirit & Occult", thai: "วิญญาณและพลังลี้ลับ", motto: "เชื่อมโยงสิ่งที่มองไม่เห็น", description: "รับฟัง เชื่อมโยง และเปิดพื้นที่ให้เรื่องราวกับพลังที่ถูกมองข้าม", icon: "☾", color: "#8842ac" },
  D: { title: "Mind & Expression", thai: "จิตและการสื่อสาร", motto: "เปลี่ยนมุมมอง เพื่อเปลี่ยนความเป็นไปได้", description: "ใช้ศิลปะ ภาษา และการรับรู้เพื่อสร้างความหมายใหม่", icon: "✧", color: "#d57b28" },
  E: { title: "Magic & Combat", thai: "เวทประยุกต์และการลงมือทำ", motto: "เปลี่ยนพลังให้กลายเป็นการกระทำ", description: "สร้างเครื่องมือ ตัดสินใจ และนำความรู้ไปใช้ในสถานการณ์จริง", icon: "⚒", color: "#cb4b49" }
};
/* sig order = primary, secondary, supporting Learning Angle; signatures are
 * creative editorial choices, not empirically calibrated outcomes. */
const WIZARD_ARCHETYPES = [
  { id:"mage", name:"Mage / Generalist", family:"A", sig:["connector","creator","experimenter"], desc:"นักเวทสารพัดศาสตร์ที่ยืดหยุ่นและเลือกวิธีเรียนรู้ตามโจทย์", gift:"เปลี่ยนวิธีเรียนรู้ได้ตามสถานการณ์", quest:"ลองใช้มุมที่คะแนนน้อยที่สุดในการสำรวจปัญหาเดียวกัน" },
  { id:"scholar", name:"Scholar", family:"A", sig:["summarizer","connector","reflector"], desc:"ผู้เชื่อมและกลั่นความรู้ให้เป็นหลักการที่เข้าใจได้", gift:"สกัดแก่นจากข้อมูลที่กระจัดกระจาย", quest:"ลองออกสำรวจข้อมูลจริง ก่อนสรุปเรื่องที่กำลังสนใจ" },
  { id:"elementalist", name:"Elementalist", family:"A", sig:["explorer","experimenter","creator"], desc:"ผู้สังเกตพลังของโลกและเรียนรู้จากการทดลอง", gift:"เปลี่ยนสิ่งที่พบให้กลายเป็นบททดลอง", quest:"ลองอธิบายการค้นพบของคุณให้คนอื่นเข้าใจ" },
  { id:"geomancer", name:"Geomancer", family:"A", sig:["explorer","connector","reflector"], desc:"ผู้เข้าใจพื้นที่และความสัมพันธ์ของสิ่งรอบตัว", gift:"มองเห็นระบบจากบริบทจริง", quest:"ลองฟังคนที่ใช้พื้นที่นั้น ก่อนวาดแผนผังความสัมพันธ์" },
  { id:"chronomancer", name:"Chronomancer", family:"A", sig:["decider","reflector","connector"], desc:"ผู้เรียนรู้จากเวลา ลำดับเหตุการณ์ และจังหวะตัดสินใจ", gift:"เลือกจังหวะที่เหมาะสมและเรียนรู้จากอดีต", quest:"ลองกำหนดช่วงสั้น ๆ เพื่อทดลองทางเลือกก่อนตัดสินใจ" },
  { id:"diviner", name:"Diviner", family:"A", sig:["connector","decider","reflector"], desc:"ผู้เชื่อมข้อมูลเพื่อมองเห็นแนวโน้มและความเป็นไปได้", gift:"ตั้งข้อสังเกตจากหลักฐานหลายด้าน", quest:"ลองพูดคุยกับคนที่เห็นต่างก่อนคาดการณ์เรื่องสำคัญ" },
  { id:"force-mage", name:"Force Mage", family:"A", sig:["experimenter","connector","decider"], desc:"ผู้ทดลองเพื่อเข้าใจแรงและกลไกที่ขับเคลื่อนระบบ", gift:"ทดสอบผลของการเปลี่ยนเงื่อนไข", quest:"ลองบันทึกผลทดลองแล้วสรุปเป็นหลักการสั้น ๆ" },
  { id:"healer", name:"Healer", family:"B", sig:["listener","reflector","experimenter"], desc:"ผู้รับฟังความต้องการและค้นหาวิธีเยียวยา", gift:"เข้าใจผู้คนก่อนเสนอวิธีช่วยเหลือ", quest:"ลองสร้างทางเลือกใหม่ร่วมกับคนที่คุณรับฟัง" },
  { id:"priest", name:"Priest", family:"B", sig:["communicator","listener","reflector"], desc:"ผู้ใช้การฟังและสื่อสารเพื่อสร้างความหมายร่วม", gift:"ถ่ายทอดคุณค่าอย่างมีความหมาย", quest:"ลองสำรวจความต้องการจริงก่อนสื่อสารกับชุมชน" },
  { id:"holy-knight", name:"Holy Knight", family:"B", sig:["decider","communicator","reflector"], desc:"ผู้เปลี่ยนหลักการที่เชื่อให้เป็นการกระทำ", gift:"ยืนหยัดเลือกสิ่งสำคัญท่ามกลางความไม่แน่นอน", quest:"ลองถามและฟังมุมมองอีกฝ่ายก่อนตัดสินใจ" },
  { id:"warden", name:"Warden", family:"B", sig:["decider","connector","listener"], desc:"ผู้ประเมินความเสี่ยงและสร้างเงื่อนไขที่ปลอดภัย", gift:"ป้องกันปัญหาก่อนเกิดความเสียหาย", quest:"ลองทดลองต้นแบบการป้องกันเล็ก ๆ และทบทวนผล" },
  { id:"beastmaster", name:"Beastmaster", family:"B", sig:["explorer","listener","experimenter"], desc:"ผู้เรียนรู้จากสิ่งมีชีวิตผ่านการสังเกตและร่วมมือ", gift:"จับสัญญาณจากโลกและผู้ร่วมทาง", quest:"ลองสรุปสิ่งที่สังเกตเป็นข้อค้นพบ 3 ข้อ" },
  { id:"transmuter", name:"Transmuter", family:"B", sig:["creator","experimenter","reflector"], desc:"ผู้มองเห็นรูปแบบใหม่และทดลองสร้างการเปลี่ยนแปลง", gift:"เปลี่ยนสิ่งเดิมให้เกิดหน้าที่ใหม่", quest:"ลองอธิบายว่าการเปลี่ยนแปลงช่วยใคร และอย่างไร" },
  { id:"alchemist", name:"Alchemist", family:"B", sig:["experimenter","creator","connector"], desc:"นักทดลองที่นำสิ่งต่าง ๆ มาผสมจนเกิดสูตรใหม่", gift:"กล้าลอง ปรับสูตร และใช้ข้อมูลจากความผิดพลาด", quest:"ลองรับฟังผู้ใช้งานจริงก่อนเริ่มการทดลองครั้งต่อไป" },
  { id:"necromancer", name:"Necromancer", family:"C", sig:["reflector","connector","explorer"], desc:"ผู้ค้นความรู้จากอดีตและสิ่งที่เคยถูกลืม", gift:"มองเห็นบทเรียนจากเรื่องที่ผ่านไปแล้ว", quest:"ลองนำบทเรียนเก่ามาเล่าให้คนอื่นเข้าใจ" },
  { id:"warlock", name:"Warlock / Hexer", family:"C", sig:["decider","reflector","creator"], desc:"ผู้ตั้งคำถามต่อสิ่งที่ต้องแลกและผลของการตัดสินใจ", gift:"ชั่งน้ำหนักผลได้และต้นทุนที่มองไม่เห็น", quest:"ลองฟังความเห็นของผู้อื่นก่อนเลือกข้อตกลงสำคัญ" },
  { id:"summoner", name:"Summoner", family:"C", sig:["connector","summarizer","communicator"], desc:"ผู้รวบรวมความสามารถหลายด้านให้ร่วมแก้ปัญหา", gift:"เชื่อมคน ความรู้ และทรัพยากร", quest:"ลองสำรวจว่ามีใครหรือแหล่งเรียนรู้อะไรที่ยังไม่ถูกชวน" },
  { id:"spirit-medium", name:"Spirit Medium", family:"C", sig:["listener","reflector","summarizer"], desc:"ผู้รับฟังและถอดความหมายจากเรื่องราวที่ถูกมองข้าม", gift:"จับสิ่งที่ไม่ได้ถูกพูดตรง ๆ", quest:"ลองกลั่นสิ่งที่ฟังเป็นคำถามหนึ่งข้อเพื่อชวนสนทนา" },
  { id:"shaman", name:"Shaman", family:"C", sig:["listener","connector","explorer"], desc:"ผู้สร้างความเข้าใจระหว่างคน ธรรมชาติ และชุมชน", gift:"เชื่อมความสัมพันธ์จากหลายมุมมอง", quest:"ลองทดลองกิจกรรมเล็ก ๆ ที่สร้างความร่วมมือใหม่" },
  { id:"ritualist", name:"Ritualist", family:"C", sig:["summarizer","experimenter","reflector"], desc:"ผู้กลั่นความรู้เป็นขั้นตอนที่ทำซ้ำและทบทวนได้", gift:"ออกแบบกระบวนการที่ทุกคนทำตามได้", quest:"ลองสื่อสารคู่มือให้คนไม่รู้เรื่องได้ทดลองทำ" },
  { id:"illusionist", name:"Illusionist", family:"D", sig:["creator","communicator","experimenter"], desc:"ผู้สร้างประสบการณ์ใหม่เพื่อชวนเปลี่ยนมุมมอง", gift:"ทำแนวคิดนามธรรมให้สัมผัสได้", quest:"ลองถามผู้ชมว่าพวกเขาเข้าใจสิ่งที่คุณสื่ออย่างไร" },
  { id:"enchanter", name:"Enchanter", family:"D", sig:["communicator","listener","decider"], desc:"ผู้เข้าใจผู้ฟังและเลือกวิธีสื่อสารให้เหมาะกับบริบท", gift:"เปลี่ยนเรื่องยากเป็นบทสนทนาที่เข้าถึงคน", quest:"ลองสื่อสารโดยตั้งคำถามแทนการชักจูง" },
  { id:"bard", name:"Bard / Artist Mage", family:"D", sig:["communicator","creator","summarizer"], desc:"ผู้ถ่ายทอดความเข้าใจผ่านการเล่าเรื่องและศิลปะ", gift:"กลั่นเรื่องซับซ้อนให้เป็นเรื่องเล่าที่มีพลัง", quest:"ลองฟังเรื่องเล่าของคนอื่นแล้วสร้างงานสั้น ๆ จากสิ่งที่ได้ยิน" },
  { id:"mimic", name:"Mimic / Blue Mage", family:"D", sig:["explorer","experimenter","listener"], desc:"ผู้สังเกตและเรียนรู้ความสามารถจากคนอื่น", gift:"เรียนรู้รวดเร็วผ่านตัวอย่างและการฝึกใช้จริง", quest:"ลองอธิบายให้คนอื่นฟังว่าทักษะนี้ทำงานอย่างไร" },
  { id:"artificer", name:"Artificer", family:"E", sig:["creator","experimenter","summarizer"], desc:"ผู้สร้างเครื่องมือและพัฒนาต้นแบบจากการทดลอง", gift:"เปลี่ยนความคิดเป็นสิ่งประดิษฐ์ที่ใช้งานได้", quest:"ลองสังเกตคนใช้ต้นแบบโดยไม่รีบอธิบาย" },
  { id:"spellblade", name:"Spellblade", family:"E", sig:["experimenter","decider","reflector"], desc:"ผู้เรียนรู้จากการฝึกและเลือกใช้ทักษะตามสถานการณ์", gift:"นำทักษะที่ฝึกฝนไปใช้ในจังหวะจริง", quest:"ลองฟังเสียงสะท้อนจากเพื่อนร่วมทีมหลังลงมือ" },
  { id:"blood-mage", name:"Blood Mage", family:"E", sig:["decider","reflector","experimenter"], desc:"ผู้ชั่งน้ำหนักต้นทุนและผลของทุกการตัดสินใจ", gift:"ตัดสินใจบนความเข้าใจข้อแลกเปลี่ยน", quest:"ลองสร้างทางเลือกใหม่ที่ลดต้นทุนลง" }
];
const WIZARD_ANGLE_NAMES = {
 explorer:"นักสำรวจ",listener:"นักฟัง",experimenter:"นักทดลอง",
 connector:"นักเชื่อมโยง",communicator:"นักสื่อสาร",creator:"นักสร้างสรรค์",
 decider:"นักตัดสินใจ",summarizer:"นักสรุป",reflector:"นักทบทวน"
};
// Editorial quotations describe each learning story, not a diagnosis.
const WIZARD_QUOTES = {
  mage:"เข้าใจโลก เพื่อเปลี่ยนโลก",
  scholar:"กลั่นความซับซ้อน ให้กลายเป็นความเข้าใจ",
  elementalist:"ทุกสิ่งรอบตัว คือคำชวนให้ทดลอง",
  geomancer:"เมื่อเห็นความเชื่อมโยง เราจะเข้าใจทั้งระบบ",
  chronomancer:"เรียนรู้จากเมื่อวาน เพื่อเลือกจังหวะของวันนี้",
  diviner:"เชื่อมเบาะแสวันนี้ เพื่อมองความเป็นไปได้ข้างหน้า",
  "force-mage":"เปลี่ยนเงื่อนไขทีละนิด แล้วค้นพบแรงที่ขับเคลื่อนโลก",
  healer:"การเยียวยา เริ่มจากการฟังให้เข้าใจ",
  priest:"ความหมายที่แบ่งปัน ทำให้เราเดินไปด้วยกัน",
  "holy-knight":"ให้สิ่งที่เชื่อ ส่องทางสิ่งที่ทำ",
  warden:"มองให้รอบด้าน เพื่อให้ทุกคนก้าวต่อได้อย่างมั่นใจ",
  beastmaster:"สังเกตให้ลึก ฟังให้เป็น แล้วเติบโตไปด้วยกัน",
  transmuter:"สิ่งเดิมอาจเป็นจุดเริ่มต้นของสิ่งใหม่",
  alchemist:"ทุกสูตรที่ยังไม่สำเร็จ มีคำตอบให้ทดลองต่อ",
  necromancer:"ไม่มีบทเรียนใดสูญหาย หากเรากลับไปฟัง",
  warlock:"มองให้เห็นสิ่งที่ต้องแลก ก่อนเลือกทางของตัวเอง",
  summoner:"พลังที่ต่างกัน สร้างสิ่งที่ลำพังทำไม่ได้",
  "spirit-medium":"ฟังสิ่งที่ไม่ได้พูด แล้วค้นพบความหมายที่ซ่อนอยู่",
  shaman:"เมื่อเชื่อมคนกับโลก ความเข้าใจใหม่จะเติบโต",
  ritualist:"เปลี่ยนประสบการณ์ให้เป็นขั้นตอน แล้วเรียนรู้จากการทำซ้ำ",
  illusionist:"เปลี่ยนสิ่งที่มองเห็น แล้วเปิดสิ่งที่เป็นไปได้",
  enchanter:"เข้าใจคนตรงหน้า ก่อนเลือกถ้อยคำที่ส่งไป",
  bard:"เล่าให้รู้สึก แล้วความเข้าใจจะเดินทางต่อ",
  mimic:"เรียนรู้จากผู้อื่น แล้วฝึกให้เป็นภาษาของตัวเอง",
  artificer:"ทำความคิดให้จับต้องได้ แล้วปล่อยให้การใช้งานสอนเรา",
  spellblade:"ฝึกจนเข้าใจ แล้วเลือกใช้ให้ตรงจังหวะ",
  "blood-mage":"เข้าใจต้นทุนของทางเลือก แล้วลงมืออย่างมีความหมาย"
};
const WIZARD_THAI_ROLES = {
  mage:"นักเวทสารพัดศาสตร์", scholar:"นักปราชญ์", elementalist:"นักเวทธาตุ",
  geomancer:"นักเวทภูมิศาสตร์", chronomancer:"นักเวทกาลเวลา", diviner:"นักพยากรณ์",
  "force-mage":"นักเวทพลัง", healer:"นักเยียวยา", priest:"นักบวช",
  "holy-knight":"อัศวินศักดิ์สิทธิ์", warden:"ผู้พิทักษ์", beastmaster:"ผู้ผูกมิตรกับสัตว์",
  transmuter:"นักเล่นแร่แปรธาตุ", alchemist:"นักปรุงสูตรเวท",
  necromancer:"นักเวทปลุกวิญญาณ", warlock:"นักเวทพันธสัญญา", summoner:"นักอัญเชิญ",
  "spirit-medium":"ผู้สื่อสารกับวิญญาณ", shaman:"หมอผี", ritualist:"นักประกอบพิธี",
  illusionist:"นักสร้างภาพลวงตา", enchanter:"นักร่ายมนตร์", bard:"นักขับขาน",
  mimic:"นักเวทเลียนแบบ", artificer:"นักประดิษฐ์เวท", spellblade:"นักดาบเวท",
  "blood-mage":"นักเวทโลหิต"
};
WIZARD_ARCHETYPES.forEach(type=>{
  type.quote=WIZARD_QUOTES[type.id];
  type.thaiRole=WIZARD_THAI_ROLES[type.id];
  type.roleDescription=type.desc.startsWith(type.thaiRole)?type.desc:type.thaiRole+' '+type.desc;
});
