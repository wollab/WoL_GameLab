---
status: proposed
owner: Chief / Wizards of Learning
purpose: Review the optional profile and learning-result collection scope before backend implementation
---

# Learning Profile — implementation plan

## สรุปแผนสำหรับ Chief

1. เล่นโดยไม่สมัคร → เห็นผล → กด “เก็บ Wizard นี้ไว้ในโปรไฟล์ของฉัน” → login และกรอกฟอร์มสั้น → เข้าโปรไฟล์ส่วนตัวที่แก้ข้อมูลได้
2. หน้าสมัครมีข้อมูลหลัก 3 dropdown: ช่วงอายุ บทบาท/อาชีพ และเพศ พร้อม “ไม่ประสงค์ระบุ” ทั้งสามช่อง ไม่เก็บวันเกิดเต็ม ชื่อบริษัท หรือเบอร์โทรในรอบแรก ชื่อแสดงผลแก้ได้ และอีเมลมาจากระบบยืนยันบัญชี
3. คำอธิบายการเก็บข้อมูลอยู่หน้าสมัครเดียวกันตามที่ Chief ต้องการ: บัญชีและผลที่ต้องเก็บเพื่อสร้างโปรไฟล์อธิบายสั้น ๆ พร้อมเปิดอ่านรายละเอียดได้ ส่วนการใช้ข้อมูลวิเคราะห์รองหรือส่งข่าวให้มีตัวเลือกเฉพาะ ไม่บังคับรวมเป็นเงื่อนไขเดียวกับการสร้างบัญชี
4. หน้าโปรไฟล์แสดง Wizard ล่าสุด คะแนน 9 มุม และประวัติผล มีส่วนแก้ข้อมูลพื้นฐาน และเพิ่ม “เป้าหมายการเรียนรู้ / ความสนใจ / แนะนำตัวสั้น ๆ” ภายหลังได้ แนะนำเก็บเป้าหมายการเรียนรู้เป็นข้อมูลเสริมก่อนข้อมูลระบุตัวอื่น
5. ช่วงงาน: ออกแบบหน้าจอและข้อกำหนดข้อมูล → ระบบบัญชี/ฐานข้อมูล/สิทธิ์ → เชื่อมหน้าโปรไฟล์และประวัติ → ทดสอบข้ามบัญชี การลบ/ส่งออก/ถอนความยินยอม และมือถือก่อนเปิดใช้จริง ยังไม่สร้างฐานข้อมูลหรือเปิดเก็บข้อมูลจากแผนฉบับนี้

ข้อเสนอช่วงอายุ: ต่ำกว่า18,18–24,25–34,35–44,45–54,55–64,65ขึ้นไป โดยเส้นทางต่ำกว่า18ต้องพิจารณาวิธีสมัครและเงื่อนไขผู้เยาว์ก่อนเปิดจริง อาชีพใช้กลุ่มใหญ่ตามตารางด้านล่าง เพศมีหญิง/ชาย/นอนไบนารีหรือหลากหลายทางเพศ/ระบุภายหลัง/ไม่ประสงค์ระบุ ข้อมูลประชากรที่แก้ภายหลังไม่ควรย้อนเปลี่ยนประวัติผลเก่าโดยเงียบ ๆ

Owner direction: play without login → see result → optionally save/create profile with short data notice on the same screen → return to editable personal profile. This plan does not activate data collection or provision services.

## Fast registration

Result stays visible and shareable before registration. CTA: “เก็บ Wizard นี้ไว้ในโปรไฟล์ของฉัน”. Prefer one sign-in method initially (Google or email OTP after checking project/provider readiness), then one compact form. No password form to design/store ourselves. A failed/cancelled login must preserve the completed local result; repeat save must not duplicate an attempt.

| Field | Proposed choices | Required? |
| --- | --- | --- |
| Display name | Short editable name, provider suggestion if available | Yes for profile; no legal name needed |
| Age range | Under18 /18–24 /25–34 /35–44 /45–54 /55–64 /65+ /prefer not to say | Optional; under18 requires a reviewed minor flow before collection |
| Occupation / current role | Student /employee /self-employed or business owner /teacher or trainer /public or nonprofit sector /not currently working /retired /other /prefer not to say | Optional; broad role categories, not exact employer |
| Gender | Woman /man /non-binary or gender diverse /self-describe later /prefer not to say | Optional; never infer from account/photo |

Use three native selects with unselected placeholders; choosing “prefer not to say” is a real response, not missing data. No birth date, address, phone, school or employer at signup. Additional profile fields can include learning goal (work/study/self-development), interests, and a short self-introduction; keep these optional and available after signup. Recommend learning goal before collecting more demographics because it helps interpret why people use the tool. Age is a stated range at time of collection; do not automatically increment it later.

## Notice on the same signup screen

Short main copy, with full details behind an expandable link: “เพื่อสร้างโปรไฟล์และเก็บผลของคุณ เราจะบันทึกบัญชี คำตอบ คะแนน และข้อมูลที่คุณเลือกกรอก คุณกลับมาดู แก้ไข ดาวน์โหลด หรือลบข้อมูลได้”. Record notice version and acceptance time. Review exact purposes, retention, controller/contact and minor handling before launch.

Necessary account/result storage may be explained alongside creation. Keep optional secondary analysis/marketing purposes distinct; do not force unrelated research or newsletter consent to create a profile. Suggested optional checkbox: “ยินยอมให้ WoL ใช้คำตอบและข้อมูลที่เลือกกรอกเพื่อวิเคราะห์ภาพรวมและปรับปรุงแบบสอบถาม”. Default unchecked. No analysis opt-in means the member can still save/use their own profile. Consent scope and legal basis require review before production; this wording is a design proposal, not a legal determination.

## Editable private profile

Default private: current Wizard and nine scores, result date, history, demographics and optional learning goals. An Edit button updates the member's profile with immediate saved/error feedback. Do not change existing historical questionnaire answers when demographic/profile fields change. Save a demographic snapshot/version with each attempt only for the disclosed analysis purpose, so past age/occupation groups are not silently rewritten. Decide how withdrawal/deletion affects these records and aggregates before launch. The existing share action is explicit, shares selected result, and does not expose age/gender/occupation by default. A public profile is separate optional future scope.

## Data and analysis

Store account identity separately from analysis exports. Proposed records: private profile; attempt (question/algorithm version,10 answer IDs,9 recomputed scores, matched/nearby types, timestamp); notice/consent record; optional event record. Recompute scores on a trusted endpoint, validate legal answers and prevent cross-account access, duplicate submissions and abuse. Avoid IP/device fingerprinting in the analysis dataset. Infrastructure auth/security logs are separate and have defined retention.

Metrics: starts/completions where appropriately disclosed, outcomes by family/type, score/answer distributions, optional demographic breakdown and voluntarily reported fit. Distinguish attempts from unique members, repeat attempts and guest sessions. Never claim a guest ID proves a unique person; report opt-in coverage and missing data. Small demographic groups must be suppressed or combined. No public individual answer table. Questionnaire choices are self-report, not observed learning performance or validated personality traits. A “ตรงแค่ไหน” rating measures perceived fit, not test validity. Add voluntary follow-up about using a Growth Quest only after the core is stable.

## Delivery milestones

1. UX review: signup/save/profile/edit sketches, field choices, notice and analysis opt-in; choose account provider and retention rules. Deliver reviewable prototype and data dictionary.
2. Backend/auth: inspect existing owned infrastructure, choose scoped storage, implement migrations and ownership policies, trusted scoring/save endpoint, deletion/export/withdrawal. Do not provision paid services before reviewing their concrete setup/cost. Keep secrets server-side; no privileged key in static frontend.
3. Integration: login after result, short form, private profile/history/edit, retake/share continuity. Keep original9 Learning Angles isolated.
4. Acceptance and limited launch: verify two different accounts cannot read/change each other's data; guest/cancel/error flows; retry without duplication; correct demographic/history behavior; delete/export/withdrawal;320/390/1440px keyboard and browser flows; aggregate counts and test-data exclusion. Review production setup and exact release before activation.

Initial scope excludes public profiles, social feed, teacher/group administration and psychometric validity claims. No production data collection is enabled by this plan.
