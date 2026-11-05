---
status: working
source_base: Chief's supplied 16Personalities references, original nine characters and 2026-11-05 corrections
purpose: Maintain the approved scope and current visual implementation choices
---

# What Is Your Magic? — web design direction

## Intent and controlling correction

Thai-first creative learning reflection. Primary journey: landing → ten original questions → Wizard suggestion → read/refine understanding → explore nearby profiles or retake. Original `9-learning-angles/` remains unchanged.

Chief liked the playable V1, then requested a more modern 16Personalities-style interface and distinct character profiles. Chief rejected the compact generated result concept as cramped: use the **long-form INTP profile structure**, with generous scrolling rather than fitting all information in one viewport. The compact concept is superseded, not an approved target.

References inspected in a real in-app browser on desktop and at 390 px:

- https://www.16personalities.com/free-personality-test — open header, centered heading, pale gray/white bands, three illustrated step cards.
- https://www.16personalities.com/personality-types — families and browsable profile entries.
- https://www.16personalities.com/intp-personality — spacious split hero, prominent character, chapter navigation, sequential article sections; horizontal chapter navigation on mobile.
- Chief's supplied matrix image — keep all nine original cartoon characters, original angle colors and 3×3 relationships. Mobile must show the whole matrix without horizontal panning.

## System and runtime ownership

`style.css` owns all UI tokens, spacing, responsive layout and interaction states. Current palette: teal `--teal` #167c85, orange `--gold` #ef9a46, charcoal `--ink` #343b4b, white `--surface`, cool gray `--bg` #f6f7f8. Existing family accents remain in `wizard-data.js`. Locally bundled Kanit regular/semibold handles Thai and English. Do not copy 16Personalities branding, text, type claims or artwork.

`ui.js` owns shared icon/emblem/hero/chapter rendering. The project-owned filled SVG icon sprite is `assets/icons.svg`; all chapter icons share one visual language. `wizard-pages.js` owns catalog/profile presentation from existing authored archetype content. The scoring formula and question source remain unchanged.

## Page anatomy

- Landing: open header, large title/subtitle, Start, three illustrated steps, five Families, responsible reading guidance.
- Result: airy hero with archetype visual and three original signature characters; chapter navigation; introduction, matrix, signature, strength, nearby Wizards and Growth Quest stacked vertically in one reading column.
- Catalog: all 27 entries grouped by five Families; native links filter to a Family.
- Profile: distinct `#wizard/<id>` URL, shared hero, sequential introduction/signature/strength/quest/related chapters. Chapters use `#wizard/<id>/<chapter>` routes.
- Desktop reading width stays comfortable with a left chapter rail. Mobile uses document scrolling, a horizontally scrollable chapter strip and a complete 3×3 score matrix. Do not impose a viewport-height panel on article content.

## Score matrix

Use the original nine PNGs unchanged. All raw scores are bold. Scores ≥4 are accented; all tied maxima (>1) also receive a highest-score badge and stronger treatment. Scores 0–1 have pale borders/backgrounds and grayscale/dimmed art, while names and numbers remain readable and each cell stays operable. Reading a cell changes detail/pressed state, without removing its score-based emphasis. Low score means little use in this answer set, not absence of ability.

## Behavior and accessibility

Use native buttons/links, keyboard focus, honest titles, startup recovery and selectable share fallback. All 27 direct profile routes and invalid-route recovery must work on static hosting without server rewrites. Browser Back and reload preserve the latest completed nine-score result through `history.state` on relevant entries, not analytics, cookies or persistent local storage. Retake clears this context. Profiles opened directly without an answer set do not invent personal scores.

## Artwork status

The nine source character images remain untouched and are used in the matrix, signatures and hero triads. The archetype portrait slot supports a review sample for Necromancer at `assets/archetypes/necromancer-sample.png`; the other 26 archetypes retain family-symbol placeholders. This is one style trial generated in this chat using the existing Reflector/Connector images as references, not approval of a complete 27-character set.

Sample brief: friendly full-body semi-chibi learner retrieving forgotten knowledge, charcoal/plum wizard clothes, lantern and old storybook, crisp clean 2D angular cel shading and expressive face, white background, no horror or skulls. Built-in Image Gen; no source character edited. Review the sample with Chief before inferring an approved production art direction or generating the full set.

## Visual comparison ledger

| Reference evidence | Implemented treatment / deliberate adaptation |
| --- | --- |
| INTP wide tinted hero, large left title, right character | Same hierarchy and space; WoL typography, family tint and a portrait plus three source-angle characters |
| INTP persistent chapter navigation and long article | Left sticky rail on desktop, local chapter strip on mobile, six separate result chapters and five profile chapters |
| White sections with generous vertical rhythm | Open reading column, borders between chapters and natural page height; compact dashboard concept discarded |
| Original 3×3 image has nine character figures and row/column relations | Same source PNGs/colors; full 3×3 fits 320/390 px; bold score state overlays are the requested addition |
| 16Personalities test has three illustrated step cards | Same information sequence adapted to ten questions, Wizard reflection and Growth Quest; project-owned icons |
| Source site's original personality art/claims | Intentionally replaced by WoL assets/content and responsible learning-reflection language |

Author visual/browser checks are evidence of implementation, not Chief acceptance. Browser reports and screenshots stay outside the repository; the app tests reproduce them.
