# What Is Your Magic? V1 — task checkpoint

## Original goal
Complete the separate `/WoL_GameLab/what-is-your-magic/` website: landing → ten original questions → one of 27 Wizards, preserving `/WoL_GameLab/9-learning-angles/`. Commit on `feature/wizard-discovery-v1`, update existing Draft PR #2, never merge automatically.

## Current status — 2026-11-05 follow-up
UI/profile implementation and technical delivery complete. Commit `825caf0cde2932fab08200ce2d7a0300d9011a49` is pushed to `feature/wizard-discovery-v1`; existing Draft PR #2 has been updated with the current long-form/mobile/profile evidence and remains unmerged. Chief played and liked the functional V1, then requested modern reference-based UI, stronger matrix scores, subdued low scores, nearby Wizard links, 27 profile routes and illustrated headings. Chief subsequently rejected the compact generated result concept as cramped and asked for the long-form INTP profile structure. That correction controls this implementation. Author QA is not Chief design/art acceptance.

## Important decisions and scope
- Reference: https://www.16personalities.com/intp-personality — generous scrolling, spacious hero, chapter navigation, sequential reading. Landing also adapts the supplied free-test screenshot's three illustrated steps. WoL branding, Thai copy and original character art remain owners; no 16Personalities artwork, branding or personality claims copied.
- Keep original ten questions, raw 19-point scores, legacy `meaningmaker`/`synthesizer` mapping, 3/2/1 matching and deterministic ties unchanged.
- Matrix stays visibly 3×3 on 320/390 px mobile without horizontal panning. Keep source nine images/colors; bold all scores; accent ≥4 and all tied maxima; gray/pale 0–1 while readable/clickable. Low scores do not imply missing ability.
- Hero supports archetype portrait plus the three original signature characters. One friendly Necromancer art sample was generated in this chat from the existing Reflector/Connector style references; it is review-only. Other 26 portraits remain family-symbol placeholders. A complete 27-character art set and production art direction are not approved or claimed complete.
- Distinct static-host-compatible `#wizard/<id>` profile URLs; `#wizards[/Family]` catalog and chapter links. Completed scores survive profile/catalog/chapter Back and reload via browser `history.state`; retake clears current context. No account, analytics, cookies, localStorage, backend or new schedule.
- Preserve separate original/new routes and all original-app files. No production deployment or automatic merge.

## Completed implementation
- Restyled landing with an open header, cool-gray/white bands, large heading, Start and three illustrated steps; all five Families link into a browsable catalog.
- Result is a long reading page: hero, introduction, complete matrix, signature, strength, nearby profiles and Growth Quest. Left sticky chapter rail on desktop; local horizontal chapter strip on mobile. Sections use shared project-owned filled SVG icons.
- Matrix has original character images, score-dependent emphasis, bold numeric scores, tied-maximum labels, pale 0–1 cards and retained interactive details/pressed state. Original narrow-screen overflow is removed; row labels remain readable.
- All 27 profiles render existing desc/gift/signature/quest from source; three related profiles use shared signature overlap. Direct reloads, invalid-route recovery and Family filters work.
- Main and alternative Wizards link to profiles. Fixed a real reload bug where native hash navigation dropped result history state; every relevant entry now retains it. Selecting an already-active chapter scrolls correctly.
- Source image/style sample at `what-is-your-magic/assets/archetypes/necromancer-sample.png` is bundled in the new app; the nine source PNGs are untouched.
- In-app browser verified the current profile preview, clean console and actual rendered hero/triad; a deliverable tab remains open. Preview servers restarted as hidden, on-demand local Python processes on 4187/4188, with no scheduler/service installation.

## Prior functional baseline — retained evidence
- Started from clean feature head `3202640`; previous clean local branch was `ux/wol-visual-faithful-2026-08-27`, preserved.
- Earlier literal escaped newline prevented all initialization; `3202640` already fixed it. That revision played under repository-root hosting.
- Reproduced dead Start + missing Families when only the new app folder was served: sibling data 404 → MOVES undefined → initialization stops before rendering/listeners. Fixed by a verified local source snapshot and existing assets, ordered deferred scripts, startup recovery and versioned URLs. Original user Codespaces/cache state was unavailable; no exact claim about that earlier setup.
- Fix `5721e75` and checkpoint `dc5dda6` were pushed and PR #2 updated, Draft/open/unmerged. Pages was verified as serving main at `c836505`; no feature-branch hosted preview was created.

## Files changed in this follow-up
`TASK_STATE.md`; new app `index.html`, `style.css`, `app.js`, `README.md`, `DESIGN.md`, `ui.js`, `wizard-pages.js`, `assets/icons.svg`, `assets/archetypes/necromancer-sample.png`, `tests/browser.cjs`, `tests/profiles.cjs`. No changes to original questions, matching formula or any `9-learning-angles/` file. Evidence images/JSON remain outside committed source.

## Tests and verification
- `tests/browser.cjs`: 12/12 groups passed on Chrome / Playwright 1.62.1. Desktop 1440 px, mobile emulation 390/320 px, full ten-question journey, all 27 outcomes through real clicks, independent expected scores, legacy keys, exact/near ties, retake/quit, sharing fallbacks, startup failure/reload, prefixed/isolated hosting and original quiz desktop/mobile regression.
- `tests/profiles.cjs`: 10/10 groups passed. All 27 direct profile routes and source copy; hero portrait plus three signature characters; Family filters; invalid-route recovery; sequential chapters and same-chapter re-selection; Browser Back/reload preservation; complete 3×3 mobile matrix with all nine cells visible together, low-state fading and all tied highs.
- `tests/scoring.test.cjs`: 5/5 passed. All 177,147 legal answer paths reach all 27 archetypes; formula unchanged. This is structural reachability, not psychometric validation or equal real-world result frequency.
- Healthy browser/profile flows: zero console/runtime errors, 404s or failed requests. Original app's undeclared browser-generated favicon alone is stubbed HTTP 204 in regression. New assets resolve normally. Native-share APIs are simulated for deterministic success/cancel/denial; real OS share sheet not exercised.
- Source snapshot check passed: LF-normalized source SHA-256 `3fbd82c9b241ce2e8c83992de915e13cb9f9aa8ba18a613ea6b59ff4024e05fa`, eleven original assets exact. Original-app diff against `c836505` remains empty.
- Static UI audit, syntax checks and `git diff --check` passed. Workspace health before/after: 30 passed, 1 existing `tmp` warning, 0 failures. No cleanup/deletion performed.
- Source references and actual screenshots inspected; comparison ledger in DESIGN.md. User's rejected compact concept is explicitly superseded. Evidence outside repo under this chat's visualization `ui2/`: browser-results.json, profile-results.json, premium-audit.json, desktop/mobile screenshots, matrix detail crops.
- Real iOS/Android, Safari/Firefox, production and the former user Codespaces preview remain untested. Chief's current UI/art acceptance remains open.

## Remaining work / blockers
No technical blocker or remaining UI implementation step. Chief review of the actual page and one art sample is next. Full 27-character artwork is a separate pending design decision after the single sample; do not silently batch remaining portraits.

## Preview
- Main: http://127.0.0.1:4187/WoL_GameLab/what-is-your-magic/
- Profile sample: http://127.0.0.1:4187/WoL_GameLab/what-is-your-magic/#wizard/necromancer
- Catalog: http://127.0.0.1:4187/WoL_GameLab/what-is-your-magic/#wizards
- Isolated root: http://127.0.0.1:4188/
Local Python processes must remain running. Portable local/Codespaces commands are in the app README. No public hosted-preview claim.

## Exact next action
Chief opens the profile/catalog/quiz preview and reviews the actual long-form layout, mobile matrix and one Necromancer style sample. Record specific feedback before further UI/art changes. If the local server has stopped, use the README launch commands on `feature/wizard-discovery-v1`. Keep PR #2 Draft/unmerged until Chief's next release instruction. No automatic merge/deploy or remaining-art batch.
