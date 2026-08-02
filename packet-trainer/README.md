# Packet Trainer

ฝึกแปลงคำสั่งดิบเป็น **Task Packet** ที่ AI ทำงานต่อได้โดยไม่ต้องเดา และไม่เปิดไฟล์ที่ไม่เกี่ยว

เปิดที่ https://wollab.github.io/WoL_GameLab/packet-trainer/ (ออกแบบสำหรับมือถือ)

---

## 3 โหมด

| โหมด | ทำอะไร |
|---|---|
| **ฝึก** | สุ่มโจทย์ 3 ข้อ แต่ง packet แล้วได้คะแนน + เทียบ token กับ packet อ้างอิง |
| **แต่ง packet** | ใช้กับงานจริง กรอกแล้วกด copy ไปวางใน Codex/Claude |
| **พัฒนาการ** | เทรนด์รายแกน + token ratio + streak (เก็บใน localStorage ของเครื่องนี้เท่านั้น) |

---

## 6 แกนทักษะ

| แกน | ฝึกอะไร |
|---|---|
| `MODE` | เลือก Explore / Decide / Execute / Audit ให้ถูก |
| `SCOPE` | canonical source ไม่เกิน 3 path ไม่ลากไฟล์ที่ไม่เกี่ยวเข้ามา |
| `DONE` | เขียน DONE WHEN ที่ตรวจรับได้จริง |
| `DELTA` | รายงาน Current State + Delta แทนสรุปใหม่ทั้งชุด |
| `TOOL` | งาน deterministic เขียนสคริปต์ ไม่ใช่ให้โมเดลคิดใหม่ทุกรอบ |
| `CLOSE` | ปิดงานที่ค้าง ไม่สร้างชั้นควบคุมเพิ่ม |

---

## ไฟล์

| ไฟล์ | คืออะไร |
|---|---|
| `scenarios.js` | catalog ไฟล์ + โจทย์ทั้งหมด — **ไฟล์ที่จะแก้บ่อยที่สุด** |
| `rubric.js` | กติกาให้คะแนน + ตัวประมาณ token + คำคลุมเครือที่ห้ามใช้ |
| `app.js` | flow ทั้ง 3 โหมด |
| `style.css` | mobile-first, WoL CI |
| `check-scenarios.js` | ตรวจข้อมูลด้วย `node` ไม่ได้โหลดในหน้าเว็บ |

---

## เพิ่มโจทย์ใหม่

1. ถ้าโจทย์อ้างไฟล์ที่ยังไม่มีใน `FILES` ให้เพิ่มก่อน
   ```js
   "nhrc-venn/styles.css": { bytes: 16325 },
   "pm/pm-data.js":        { bytes: 21000, est: true },   // est = ยังไม่ยืนยันขนาดจริง
   "wizardhat/assets/index-BBA4LvYW.js": { bytes: 411740, banned: true, why: "build artifact" },
   ```
   หาขนาดจริงด้วย `stat -c%s <path>` — ตัวเลข token คำนวณจาก bytes ÷ 3

2. เพิ่ม object ใน `SCENARIOS` ให้ครบฟิลด์

   | ฟิลด์ | หมายเหตุ |
   |---|---|
   | `id` | ห้ามซ้ำ |
   | `source` | `wol-gamelab` (path จริง) หรือ `codex-audit` (ประมาณการ) |
   | `axes` | อย่างน้อย 1 แกนจากตารางข้างบน |
   | `ask` | คำสั่งดิบแบบที่คนพูดจริง — ต้องกำกวมพอให้ฝึกได้ |
   | `context` | บริบท 1-2 บรรทัด |
   | `expectedMode` / `acceptableModes` | โหมดที่ถูก / โหมดที่พอรับได้ |
   | `fileOptions` / `referenceFiles` | ตัวเลือกไฟล์ / ไฟล์ที่ควรเลือก (ต้องเป็นสับเซตของ fileOptions) |
   | `boundaryOptions` / `decisionOptions` | ต้องมีทั้งตัวถูกและตัวลวง |
   | `reference` | goal / currentState / deliverable / doneWhen |
   | `teaching` | อธิบายว่าโจทย์นี้สอนอะไร 1-2 บรรทัด |

3. รันตรวจก่อนเสมอ
   ```
   node check-scenarios.js
   ```

---

## ข้อจำกัดที่ต้องรู้

**เกณฑ์ตรวจ DONE WHEN เป็น heuristic และหลอกได้** — มันดูแค่ว่ามีตัวเลข มี path
มีคำที่สังเกตได้ ไม่มีคำคลุมเครือ และสั้นพอ **มันวัดโครงสร้าง ไม่ได้วัดความหมาย**
พิมพ์เลขมั่ว ๆ ก็ได้แต้ม ตัวที่สอนจริงคือ packet อ้างอิงที่เปิดให้เทียบทุกครั้ง

**โจทย์ที่ `source: "codex-audit"` มี path เป็นประมาณการ** — มาจากสรุปการ audit
workspace ใหญ่ ไม่ได้อ่านไฟล์จริง ถ้า path ไม่ตรงให้แก้ใน `scenarios.js` ได้เลย
ไม่ต้องแตะโค้ด

**ตัวเลข token เป็นค่าประมาณ** (bytes ÷ 3) ใช้เทียบกันเองได้ ไม่ใช่ค่าจริงจาก tokenizer

---

## ทำไมใช้ Google Fonts (ต่างจากโปรเจกต์อื่นในรีโป)

`nhrc-venn` และ `9-learning-angles` ฝังฟอนต์ local เพราะต้องใช้ในห้อง workshop
ที่เน็ตอาจไม่มี **ตัวนี้เป็นเครื่องมือส่วนตัวใช้บนมือถือที่มีเน็ต** เลยใช้ CDN
เพื่อไม่ต้องแบกไฟล์ฟอนต์ ~1MB — ถ้าเน็ตหลุด ตัวแอปยังเล่นได้ปกติ แค่ฟอนต์ fallback

**อย่าเปลี่ยน `nhrc-venn` / `9-learning-angles` มาใช้ CDN ตาม** เหตุผลคนละเรื่องกัน
