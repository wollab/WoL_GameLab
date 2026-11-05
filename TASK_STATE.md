# 27 Wizards of Learning — task checkpoint

## Original goal and scope
Complete the separate `/WoL_GameLab/what-is-your-magic/` website: landing → ten original questions → one of 27 Wizards, preserving `/WoL_GameLab/9-learning-angles/`. Work on `feature/wizard-discovery-v1`. Original instruction held merge; Chief later explicitly authorized publishing the tested website. Do not infer blanket authorization for unrelated releases.

## Current status — 2026-11-06
All 27 portraits are generated, named, visually inspected and integrated locally. The actual WoL logo is in header/footer/favicon. Five spacious illustrated Family rows explain distinct approaches, show three named representative Wizards each and link to all members. Accepted product name is 27 Wizards of Learning, tagline What Is Your Learning Magic?; public directory/URL remain unchanged. Current update is ready for feature commit/new PR and the authorized production release, pending final static checks.

Chief approved the Necromancer style and all-27 scope, then explicitly asked to put each portrait onto the website, use the WoL logo and clarify Family differences. Asked whether the truncated “ถ้าวาง” implied another layout constraint; Chief answered “ไม่มีครับ”. Proceed with the spacious reading layout. This latest website-integration request and earlier explicit “Push ขึ้นเว็บเลยครับ :)” authorize publication of this scoped update.

## Completed work
- 26 new source-resolution PNGs in `what-is-your-magic/assets/archetypes/masters/`; approved `necromancer-sample.png` unchanged.
- Full exact prompt/provenance/hash registry in `assets/archetypes/artwork-manifest.json`. Named HTML gallery and PNG handoff ZIP created; delivery evidence stays outside the repo.
- 27 WebP portraits total 951,130 bytes. Format/resize export script preserves PNG masters byte-for-byte. Heroes load eagerly; directory/Family images lazily.
- Result/profile heroes include the matching portrait plus the three original signature characters. Directory and nearby cards show the correct character with real text names.
- Real WoL logo copied unchanged from the canonical local brand PNG. Five Family rows show Thai action heading, description, concrete starting approach, three portraits and member count.
- Product title, share title and description updated; versioned CSS/JS URLs refreshed. No question, scoring, canonical archetype content or original-app changes.

## Controlling correction and decisions
Diviner must REMOVE the magnifying glass and extra upper arm/hand, RETAIN lower hand holding three cards and raised open palm. Final accepted source `exec-8213d445-8c1c-476c-ba7e-fc11abded46c.png` is `masters/diviner.png`. Earlier `exec-8054439b` removed the wrong hand and is superseded. Exactly two hands. Do not regenerate finished artwork or undo this correction.

Keep long-form scrolling profiles, chapter navigation, complete mobile 3×3 matrix, all tied high scores and readable pale 0–1 states. Original nine images/colors stay intact. Keep original ten questions, 19-point raw totals, legacy meaningmaker/synthesizer mapping, 3/2/1 matching and deterministic ties. The tool is a creative learning reflection, not a personality diagnosis or validated assessment. No account, analytics, persistent storage, backend or schedule.

## Verification on current local artwork update
- Chrome/Playwright: core 12/12, profile/reading 10/10, UX regressions 5/5, artwork/Family/gallery 4/4. All 27 outcomes through real ten-answer journeys, all 27 direct profile routes and correct decoded portraits.
- Scoring 5/5: all 177,147 legal answer paths reach all 27 archetypes. Source snapshot and 11 original assets match; original-app diff against c836505 is empty.
- Desktop 1440 and mobile 390/320: all five Families, 15 named representatives, actual square logo, no horizontal overflow. Gallery decodes all 27 images. Healthy flows have zero console/runtime errors, failed requests or 404s.
- In-app browser separately inspected actual Family link → Healer profile, portrait/three-character hero, mobile landing/Family rows; error/warn console empty. Screenshots saved and inspected.
- Screenshot helper now makes lazy off-screen images eager only during capture so decoding cannot hang; production lazy loading remains intact. Local preview servers had stopped during long art generation; restarted and verified current index/version. Gallery favicon 404 found by the new test and fixed with the real logo icon.
- Evidence: this chat visualization `art27/` contains browser/profile/audit/artwork JSON, screenshots, named contact-sheet.png and 27-wizards-of-learning-png.zip.
- Physical-device/OS share-sheet, full screen-reader/WCAG and comparative user testing remain unverified. Author art QA is distinct from individual Chief review of every companion.

## Prior release and root cause (retained evidence)
PR #2 merged at 7469a84c7abb830a9560f0e738bce38a1664550d; verified Pages main/root release. Last pushed main/feature checkpoint 3b92cd09beeadb0ff5ccd609c9594140f77d2c1f. PR #2 is closed; use a new PR for this update.

Original failure: earlier literal backslash-n broke app.js parsing; upstream 3202640 fixed that syntax error. An app-only server still reproduced dead Start/missing Families because ../9-learning-angles/data.js returned 404 and MOVES was undefined before initialization. Fixed by a self-contained checked data/asset snapshot, ordered deferred scripts, explicit startup recovery and disabled-until-ready Start. The user's former preview root/cache was unavailable, so do not claim that precise preview environment was proven. Main/root GitHub Pages was verified; feature changes need main publication. Original site is preserved.

Prior public Chrome checks: core 11/11, profiles 10/10, audit 5/5; all outcomes, mobile matrix, correction/retake/share fallback, direct profile/reload/Back and original quiz desktop/mobile passed. A real in-app browser completed ten answers to Force Mage with clean console. This was a test fixture, not Chief's personal result.

## Files changed
New app index.html, app.js, style.css, ui.js, wizard-pages.js, tests/browser.cjs, tests/profiles.cjs, tests/artwork.cjs, scripts/export-artwork.py, assets/archetypes/ (26 masters, 27 exports, manifest/gallery), assets/brand/wol-logo.png, README.md, DESIGN.md, ARTWORK.md; project TASK_STATE.md. No original-app files, questions or matching edits.

## Preview and exact next action
Public: https://wollab.github.io/WoL_GameLab/what-is-your-magic/ (currently prior release until the authorized update deploys).
Local checked: http://127.0.0.1:4187/WoL_GameLab/what-is-your-magic/ ; isolated root http://127.0.0.1:4188/ . Portable commands are in README; Python servers must remain running.

Finish static/whitespace/source checks; inspect/stage only this repo's scoped files, commit and push feature, open a new PR (closed #2 cannot be updated). Validate changed paths preserve original app, merge exact tested head under the current publication authorization and wait for Pages. Re-run the browser suites and artwork/gallery checks on the actual public URL; inspect public site in the in-app browser. Then checkpoint actual release SHA/results, update existing PM records and usage evidence, and return public URL plus named art gallery/PNG ZIP. No technical blocker.
