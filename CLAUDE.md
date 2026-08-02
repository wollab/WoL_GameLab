# WoL_GameLab

เกมและเครื่องมือการเรียนรู้ภาษาไทย โดย Wizards of Learning (wizardsoflearning.com)

แต่ละโฟลเดอร์ = prototype แยกอิสระ **static ล้วน ไม่มี build step ไม่มี test ไม่มี CI**
เปิดไฟล์ `index.html` ในเบราว์เซอร์ได้เลย deploy ด้วยการ push ขึ้น `main`

---

## ⛔ ห้ามอ่าน / ห้ามแก้

**`wizardhat/assets/*` และ `wizardhat-v2/assets/*` เป็น build artifact ที่ minify แล้ว**

- `index-*.js` ไฟล์ละ ~410KB (≈140,000 tokens) — **ห้ามอ่านเข้า context เด็ดขาด**
- `index-*.css` เป็น Tailwind ที่ compile แล้ว บรรทัดเดียวยาวหลายหมื่นตัวอักษร
- เวลา grep/glob ทั้งรีโป **ต้องใส่ `--glob '!**/assets/index-*'` หรือเลี่ยงโฟลเดอร์ `wizardhat*/assets/` เสมอ**
- source (React + Vite + Tailwind) **ไม่ได้อยู่ในรีโปนี้** → แก้ wizardhat ที่นี่ไม่ได้ ให้บอกผู้ใช้ว่าต้องไปแก้ที่ source แล้ว build มาวางทับ
- แก้ได้อย่างเดียวคือ `wizardhat*/index.html` (ไฟล์ 19 บรรทัด — meta tag, ชื่อ title, link ฟอนต์)

ไฟล์ไบนารีที่ไม่ต้องอ่าน: `assets/**/*.png`, `assets/**/*.ttf`, `assets/**/*.woff2`

---

## โปรเจกต์

| โฟลเดอร์ | คืออะไร | ไฟล์ที่แก้จริง |
|---|---|---|
| `wishlist/` | บอร์ดเกมการเงิน (เวอร์ชันเว็บ) มี leaderboard ผ่าน Supabase | `index.html` ไฟล์เดียว 1,230 บรรทัด — CSS อยู่บรรทัด 7-172, JS อยู่ 196-1228 |
| `9-learning-angles/` | แบบประเมินตัวเอง 9 Learning Moves ผลลัพธ์เป็น matrix 3×3 + share card | `app.js` (logic + canvas), `data.js` (เนื้อหา 9 ตัวละคร), `style.css` |
| `nhrc-venn/` | เกมการ์ด Venn สนธิสัญญาสิทธิมนุษยชน (ลูกค้า: กสม.) | `app.js`, `cards-data-v3.js`, `styles.css`, `RULEBOOK-v3-th.md` |
| `wizardhat/`, `wizardhat-v2/` | เครื่องมือคิดไอเดียเกม (React build) | ดูหัวข้อ "ห้ามแก้" ด้านบน |
| `packet-trainer/` | เครื่องมือส่วนตัวฝึกจัด context ให้ AI (ไม่ใช่งานลูกค้า) | `scenarios.js` (โจทย์ด่าน 4), `lessons.js` (ศัพท์ + ด่าน 2), `rubric.js` (เกณฑ์), `app.js`, `style.css` |

### หมายเหตุ `nhrc-venn`

- `index.html` โหลด `cards-data.js` + `cards-data-v2.js` + `cards-data-v3.js` ทั้งสามไฟล์
  **สำรับที่ใช้เล่นจริงคือ v3 (53 ใบ)** — v1/v2 เก็บไว้ให้ `simulate-variants.js` เทียบสมดุล ห้ามลบ
- `simulate-variants.js` รันด้วย `node` เพื่อทดสอบสมดุลสำรับ ไม่ได้โหลดในหน้าเว็บ
- ค่าคงที่ที่กติกาผูกไว้ (อยู่หัว `app.js`): `MIN_PLAYABLE_FOR_PAIR = 10`, `MIN_SIDE_CARDS_FOR_PAIR = 3`, `MIN_CENTER_CARDS_FOR_PAIR = 1`, `MATCH_ROUNDS = 3`
  **แก้ตัวเลขพวกนี้ต้องอัปเดต `RULEBOOK-v3-th.md` ให้ตรงกันเสมอ**
- การ์ดทุกใบต้องมีครบ: `no`, `text`, `treaties[]`, `type` (`clear`/`overlap`/`borderline`), `reason`

### หมายเหตุ `packet-trainer`

- แก้ `scenarios.js` หรือ `lessons.js` แล้ว **ต้องรัน `node packet-trainer/check-scenarios.js` เสมอ** ก่อน commit
- ด่าน 1-3 ไม่มีการพิมพ์เลย แตะอย่างเดียว — **ถ้าจะเพิ่มฟีเจอร์ อย่าใส่ช่องพิมพ์ลงในด่านพวกนี้**
- ตัวลวงในด่าน 1/3 มาจาก `confusedWith` ใน `lessons.js` ไม่ได้สุ่ม — แก้ที่นั่นถ้าอยากเปลี่ยนความยาก
- ตัวเลข `bytes` ใน catalog ต้องเป็นขนาดจริง (`stat -c%s`) ยกเว้นที่ติด `est: true`
- โจทย์ที่ `source: "codex-audit"` อ้าง path ใน workspace นอกรีโปนี้ — เป็นค่าประมาณ ห้ามไป "แก้ให้ตรง" กับไฟล์ในรีโป
- **โฟลเดอร์นี้ใช้ Google Fonts CDN โดยตั้งใจ** (เครื่องมือส่วนตัวบนมือถือ ไม่ใช่ของใช้ในห้อง workshop) อย่าแก้ให้เหมือนโปรเจกต์อื่น

---

## แบรนด์ / CI

**WoL CI (ใช้กับ `9-learning-angles`, `nhrc-venn`, `wizardhat`)**

| สี | ค่า |
|---|---|
| teal หลัก | `#50C2C0` (บางที่เขียน `#4FC2C0`) |
| teal เข้ม | `#168A88` / `#2F9C97` |
| orange/gold | `#FEC566` |
| gold เข้ม | `#E0A73E` |
| ink (ตัวหนังสือ) | `#414141` |

ฟอนต์: **Kanit** (หัวข้อ) + **Bai Jamjuree** (เนื้อความ)

**ข้อยกเว้น: `wishlist/` ใช้ชุดสีเก่า** — navy `#16244d` / gold `#e7b53c` / cream `#f6f1e4` และฟอนต์ Segoe UI + Sarabun
ทำก่อนมี CI และยังไม่ได้ย้าย **อย่าเปลี่ยนสี wishlist ให้เป็น CI เองโดยไม่ถาม** — เป็นการตัดสินใจเรื่องแบรนด์ ไม่ใช่บั๊ก

---

## ฟอนต์ — แต่ละโปรเจกต์ทำไม่เหมือนกัน (ตั้งใจ)

| โปรเจกต์ | วิธี | เหตุผล |
|---|---|---|
| `nhrc-venn` | woff2 local ผ่าน `assets/fonts/fonts.css` | ต้องใช้ในห้อง workshop ที่เน็ตอาจไม่มี |
| `9-learning-angles` | ttf local ผ่าน `@font-face` ใน `style.css` | เหมือนกัน + ต้องใช้ใน canvas |
| `wizardhat*` | Google Fonts CDN | build มาแบบนั้น |
| `wishlist` | system font | ไม่ได้ฝังฟอนต์ |

**ห้ามเปลี่ยน `nhrc-venn` / `9-learning-angles` ไปใช้ Google Fonts** จะพังเวลาใช้ในห้องอบรม

---

## 🔥 กฎ canvas — บั๊กที่เคยเกิดซ้ำ 2 รอบ

ก่อนวาดข้อความไทยลง canvas (share card, PNG export) **ต้อง `await document.fonts.ready` ก่อนเสมอ**
ไม่งั้นฟอนต์ยังโหลดไม่เสร็จ ข้อความจะออกมาเป็นฟอนต์ fallback หรือหาย

ตัวอย่างที่ถูก — `9-learning-angles/app.js` ~บรรทัด 314:

```js
const [, logoImg, ...charImgArr] = await Promise.all([
  document.fonts.ready,
  loadImg("assets/wol-logo.png"),
  ...moveIds.map((id) => loadImg(MOVES[id].img)),
]);
```

รูปทุกใบต้อง `await` ให้โหลดเสร็จก่อนวาดเช่นกัน

**ประวัติ:** commit `43d771b` (ฝังฟอนต์ไทยใน PNG export) และ `1127589` (ฟอนต์ Kanit โหลดไม่ทันก่อนวาด canvas) เป็นบั๊กตัวเดียวกันที่กลับมาอีกครั้ง

---

## เนื้อหาภาษาไทย

- UI และเนื้อหาทั้งหมดเป็นภาษาไทย (`<html lang="th">`) — โค้ด/ตัวแปร/commit เป็นอังกฤษได้
- โทน: เรียกผู้อ่านว่า **"คุณ"** ไม่ใช้ศัพท์วิชาการ ไม่ใช้ภาษาราชการ ประโยคสั้นอ่านออกทันที
  ดูตัวอย่างมาตรฐานได้ที่ field `guide` / `detail` / `activity` ใน `9-learning-angles/data.js`
- เนื้อหาสิทธิมนุษยชนใน `nhrc-venn` เป็นงานลูกค้าองค์กร — **ถ้อยคำต้องถูกต้องตามสนธิสัญญา**
  ห้ามแต่งชื่อ/ขอบเขตสิทธิเอาเอง ถ้าไม่แน่ใจให้ถามก่อน
- อธิบายให้เด็กและครูเข้าใจได้ แต่ห้ามลดทอนจนความหมายเพี้ยน

---

## Deploy

GitHub Pages จาก branch `main` → `https://wollab.github.io/WoL_GameLab/<โฟลเดอร์>/`

path ทุกที่ต้องเป็น **relative** (`./assets/...`) เพราะไซต์อยู่ใต้ subpath — absolute path (`/assets/...`) จะพัง

---

## Secrets

`wishlist/index.html` มี Supabase URL + **anon key** ฝังอยู่ (บรรทัด ~1105) — อันนี้ปกติ anon key ออกแบบมาให้อยู่ฝั่ง client ได้ โดยมี RLS คุมที่ฝั่งฐานข้อมูล

**ห้ามใส่ `service_role` key หรือ secret อื่นลงในไฟล์ในรีโปนี้เด็ดขาด** ทุกอย่างที่นี่เป็น static ที่ผู้ใช้เปิดดูได้หมด

---

## แนวทางการทำงาน

- แก้แล้วบอกวิธีตรวจด้วยตา (เปิดหน้าไหน กดอะไร ดูตรงไหน) — ไม่มี test ให้รัน
- ระวัง regression กับ share card / canvas เป็นพิเศษ เพราะบั๊กมองไม่เห็นจากโค้ด
- commit message: อังกฤษ ใช้ `feat:` / `fix:` / `polish:` หรือขึ้นต้นด้วยชื่อโปรเจกต์ก็ได้ (รีโปนี้ใช้ทั้งสองแบบ)
- `wizardhat/` เก่ากับ `wizardhat-v2/` ใหม่ **ต้องแยกกันอยู่** — v2 เป็น path ใหม่ที่ไม่แตะของเดิม
