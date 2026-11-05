---
status: implemented, awaiting owner review
source_base: Chief's supplied 16Personalities references, original nine characters and 2026-11-05 corrections
purpose: Maintain the approved scope and current visual implementation choices
---

# 27 Wizards of Learning — web design direction

## Intent and controlling correction

Thai-first creative learning reflection. Primary journey: landing → ten original questions → Wizard suggestion → read/refine understanding → explore nearby profiles or retake. Original `9-learning-angles/` remains unchanged.

Chief liked the playable V1, then requested a more modern 16Personalities-style interface and distinct character profiles. Chief rejected the compact generated result concept as cramped: use the **long-form INTP profile structure**, with generous scrolling rather than fitting all information in one viewport. The compact concept is superseded, not an approved target.

References inspected in a real in-app browser on desktop and at 390 px:

- https://www.16personalities.com/free-personality-test — open header, centered heading, pale gray/white bands, three illustrated step cards.
- https://www.16personalities.com/personality-types — families and browsable profile entries.
- https://www.16personalities.com/intp-personality — spacious split hero, prominent character, chapter navigation, sequential article sections; horizontal chapter navigation on mobile.
- Chief's supplied matrix image — keep all nine original cartoon characters, original angle colors and 3×3 relationships. Mobile must show the whole matrix without horizontal panning.

## System and runtime ownership

`style.css` owns all UI tokens, spacing, responsive layout and interaction states. Chief explicitly freed this app from the WoL palette in the current audit request. Current reading palette: ink `--ink` #26243b, iris `--accent` #5d4bc4, lilac `--bg` #f4f2fb, white `--surface`, apricot `--gold` #f0c080. The deliberate visual choice is to reserve iris for actions/navigation and preserve all nine original angle colors for score interpretation. Existing Family accents remain in `wizard-data.js`. Kanit carries headings and score numerals; locally bundled Bai Jamjuree 400/600 carries Thai body/UI text. Font notices are bundled in `assets/fonts/*-OFL.txt`; there is no font CDN dependency. Do not copy 16Personalities branding, text, type claims or artwork.

`ui.js` owns shared icon/emblem/hero/chapter rendering. The project-owned filled SVG icon sprite is `assets/icons.svg`; all chapter icons share one visual language. `wizard-pages.js` owns catalog/profile presentation from existing authored archetype content. The scoring formula and question source remain unchanged.

## Page anatomy

- Landing: open header, large title/subtitle, Start, three illustrated steps, five Families, responsible reading guidance.
- Result: airy hero with archetype visual and three original signature characters; chapter navigation; introduction, matrix, signature, strength, nearby Wizards and Growth Quest stacked vertically in one reading column.
- Catalog: all 27 entries grouped by five Families; native links filter to a Family; labeled search also matches names, descriptions and Thai signature angles, with count, Clear and empty-state recovery.
- Profile: distinct `#wizard/<id>` URL, shared hero, sequential introduction/signature/strength/quest/related chapters. Chapters use `#wizard/<id>/<chapter>` routes.
- Desktop reading width stays comfortable with a left chapter rail. Mobile uses document scrolling, a labeled native chapter selector listing every destination and a complete 3×3 score matrix. Do not impose a viewport-height panel on article content.

## Score matrix

Use the original nine PNGs unchanged. All raw scores are bold. Scores ≥4 are accented; all tied maxima (>1) also receive a highest-score badge and stronger treatment. Scores 0–1 have pale borders/backgrounds and grayscale/dimmed art, while names and numbers remain readable and each cell stays operable. Reading a cell changes detail/pressed state, without removing its score-based emphasis. Low score means little use in this answer set, not absence of ability.

## Behavior and accessibility

Use native buttons/links, keyboard focus, honest titles, startup recovery and selectable share fallback. All 27 direct profile routes and invalid-route recovery must work on static hosting without server rewrites. Browser Back and reload preserve the latest completed nine-score result through `history.state` on relevant entries, not analytics, cookies or persistent local storage. Retake clears this context. Profiles opened directly without an answer set do not invent personal scores.

## Artwork and Family communication — 2026-11-06

Chief approved the Necromancer style, requested all 27 portraits with names, then asked to put them on the website with the actual Wizards of Learning logo. All 27 portraits are complete and visually inspected by the author. Approval of the reference and generation scope is distinct from Chief individually reviewing every new companion.

Each result/profile hero combines its own portrait and the three untouched original Learning Angle characters. Directory and related-profile cards use the matching portrait. Full-body framing, readable silhouettes, angular cel shading and varied tools support recognition; names remain real HTML text. The Diviner specifically retains the card-holding hand and open palm after removing the magnifying glass and extra arm per Chief's mask. See ARTWORK.md and the prompt/hash manifest.

27 WebP exports total 951,130 bytes, with eager hero and lazy directory/Family portraits. Original PNG masters are preserved byte-for-byte. The canonical WoL logo PNG is copied unchanged from the local brand source; its aspect ratio is preserved in the header, footer and favicon.

Families now use five broad reading rows instead of five compact cards. Each has a distinct Thai action heading, the canonical description, an example under “เมื่อเจอโจทย์ใหม่”, three named representatives and a clear member-count link. On mobile the copy precedes a three-character strip. The explanation describes different approaches without ranking Families or claiming fixed abilities. The app retains the approved long-form reading structure and its scoped iris/ink/lilac palette.

## Visual comparison ledger

The social cover extends the same open illustration direction into a single narrative scene: Necromancer retrieves an idea, Mage connects it, Artificer builds a bridge, Healer nurtures growth and Bard supports the shared discovery. Strong left-aligned English/Thai copy introduces the learning-reflection tool at thumbnail size. Five character PNGs were supplied as identity references to built-in Image Gen; no 16Personalities character artwork or logo is incorporated. Keep the unchanged PNG master and exact prompt in `assets/social/`; the 1200×630 JPEG is a format/resize export. No global brand change is inferred.

| Reference evidence | Implemented treatment / deliberate adaptation |
| --- | --- |
| INTP wide tinted hero, large left title, right character | Same hierarchy and space; WoL typography, family tint and a portrait plus three source-angle characters |
| INTP persistent chapter navigation and long article | Left sticky rail on desktop, native chapter selector on mobile, six separate result chapters and five profile chapters |
| White sections with generous vertical rhythm | Open reading column, borders between chapters and natural page height; compact dashboard concept discarded |
| Original 3×3 image has nine character figures and row/column relations | Same source PNGs/colors; full 3×3 fits 320/390 px; bold score state overlays are the requested addition |
| 16Personalities test has three illustrated step cards | Same information sequence adapted to ten questions, Wizard reflection and Growth Quest; project-owned icons |
| Source site's original personality art/claims | Intentionally replaced by WoL assets/content and responsible learning-reflection language |

Author visual/browser checks are evidence of implementation, not Chief acceptance. Browser reports and screenshots stay outside the repository; the app tests reproduce them.


## Current UX audit — 2026-11-05

Fresh six-step desktop/mobile captures started from clean `ea68efa`, separate from earlier screenshot evidence. The current user requested Product Design audit and frontend-design refinement, allowing a new palette. Preserve the already accepted spacious reading structure and original source art; no additional character artwork is necessary for these usability fixes.

| Observed issue | Priority | Implemented correction |
| --- | --- | --- |
| Clicking an answer immediately advances; no way to correct it | P1 | Selection stays visible; explicit Next/Previous retains chosen options. Scores are reduced from final selections once, so correction replaces rather than adds points |
| Result says the learner uses all three Wizard angles even when one scored zero; close matches appear late | P1 | Separate template signature from actual positive contributions, explicitly explain any zero component, expose close/tied alternative at the hero and lead the intro with actual highest raw scores |
| Mobile horizontal strip hides later chapters; two scroll offsets leave previous content above the target | P2 | Labeled native selector exposes all chapters; a single scroll-padding offset lands the heading below the sticky header/nav and focuses it |
| Pale low-score labels measure 4.11:1 and highest badges shrink to 7–8px | P2 | Low labels are darker (5.67:1 on their rendered background), art remains pale/grayscale; shorter highest badge stays at least 10px, with 6.42:1 contrast |
| Catalog short English labels are ambiguous; no search or no-results recovery | P2 | Thai Family labels with canonical counts, local search, live result count, Clear and reset-to-all recovery |
| One typeface/color role across reading, labels and actions | P2 | Kanit headings/scores + Bai Jamjuree body, ink/lilac reading surface, iris actions and unchanged original data colors |

The visual risk is a fantasy field-guide reading palette independent of the corporate color system. It is scoped to this app; do not infer a new global WoL brand preference. Layout remains long-form, without a dense result dashboard, extra animation or new art batch.

Current validation: core Chrome browser 12/12, profile/reading 10/10, observed-issue regressions 5/5, scoring 5/5; all 27 outcomes through actual ten-answer journeys. Low-label contrast, chapter landing, input focus, score replacement and search recovery are measured in `tests/audit.cjs`. Screenshots and the full six-step report are external delivery artifacts under this audit's `audit3` folder. Current in-app browser journey also completed ten answers, profile exploration and search recovery with no console errors/warnings.

This is an expert audit and implementation check, not evidence that real users perform better than on 16Personalities. Physical-device testing, assistive-technology evaluation, comprehensive WCAG verification and comparative usability research remain outside the current evidence. The later full-character update supersedes the single-sample art status; the current cast is documented above.
