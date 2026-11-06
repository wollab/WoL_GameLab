# 27 Wizards of Learning — What Is Your Learning Magic?

A separate, standalone experience from [9 Learning Angles](../9-learning-angles/) by Wizards of Learning. Both tools coexist as distinct websites under the same GitHub Pages project. This app bundles a verified snapshot of the original quiz and existing assets; it has no runtime dependency on the original app directory.

## Public website

- [27 Wizards of Learning](https://wollab.github.io/WoL_GameLab/what-is-your-magic/)
- [Original 9 Learning Angles](https://wollab.github.io/WoL_GameLab/9-learning-angles/)

## Social sharing image

`assets/social/og-learning-magic-v1.jpg` is the 1200×630 JPEG cover (229,039 bytes). Five existing Wizards collaborate to turn book knowledge into a bridge and garden, alongside clear Thai introductory text. The static HTML includes Open Graph and Twitter large-image metadata, absolute public URLs, alt descriptions and canonical URL so crawlers can read it without JavaScript.

The unchanged generated PNG master and exact built-in Image Gen prompt/provenance are retained beside the web copy. `python what-is-your-magic/scripts/export-og.py` derives the JPEG using Pillow resize/format export only. Broad scene-composition cues come from the referenced 16Personalities profile illustrations; all five character identities come from this project's approved cast. Published and read back on 2026-11-06 via PR #4 / Pages run 42073657154. Actual public HTML and exact JPEG bytes pass the focused Chrome check, including Start → quiz with no errors. Social platforms may cache previously scraped cards; browser/source checks do not demonstrate their cache refresh.

## Play the feature branch locally

From the repository root (Python 3, no build/install step):

```sh
git switch feature/wizard-discovery-v1
git pull --ff-only origin feature/wizard-discovery-v1
python -m http.server 8000 --bind 127.0.0.1
```

Open [What Is Your Magic? local preview](http://127.0.0.1:8000/what-is-your-magic/) and [original local quiz](http://127.0.0.1:8000/9-learning-angles/). The server must stay running. In Codespaces, omit `--bind 127.0.0.1`, forward port 8000 in the Ports panel and open its forwarded URL with `/what-is-your-magic/` appended. If the port is private, sign in with the GitHub account allowed into that Codespace. Confirm the selected branch and stop any old server using that port first. A hard reload can refresh old assets, but cannot switch a server's branch or root.

Serving only this app also works: `python -m http.server 8001 --bind 127.0.0.1 --directory what-is-your-magic`, then open [isolated preview](http://127.0.0.1:8001/).

Production routes remain `/WoL_GameLab/9-learning-angles/` and `/WoL_GameLab/what-is-your-magic/`. GitHub Pages is configured for **main**, so the feature branch is not a hosted Pages preview. Chief authorized the V1 production release on 2026-11-05. PR #2 was merged for that release. Chief subsequently approved the full character set and requested the actual WoL logo, all portraits on the website and clearer Families. The current update uses a new PR because #2 is closed. The public path remains unchanged.

## Long-form UI and individual profiles — 2026-11-05 follow-up

Chief asked for the structure of the [16Personalities INTP profile](https://www.16personalities.com/intp-personality), with comfortable scrolling rather than a compact result dashboard. The app now uses a spacious hero, original signature-character triads, chapter navigation and sequential introduction/matrix/signature/strength/nearby/quest sections. The landing has three illustrated steps. Branding, text, scoring and assets are WoL's own; no 16Personalities character artwork or personality claims are copied.

- `#wizards`: directory of all 27 Wizards; `#wizards/B`: a Family filter.
- `#wizard/necromancer`: a direct, reloadable profile URL. Append `/signature`, `/strength`, `/quest` or `/related` for a chapter.
- `#result/matrix`: the completed quiz's matrix chapter. This route needs a completed answer set in that browser entry; a profile does not require one.
- Result alternatives and the main Wizard now link to profiles. Browser Back and reload preserve the completed scores with `history.state` across profile/directory/chapter entries. Retake clears current result context. No cookies, analytics, localStorage or server-side account is involved.
- Mobile 320/390 px shows all nine matrix cells as a complete 3×3 board without horizontal panning. Original angle PNGs are unchanged. Scores are bold; ≥4 is accented; every tied maximum is highlighted; 0–1 uses pale/grayscale artwork while remaining readable and clickable.
- `ui.js` provides shared SVG icons, hero compositions and chapter links; `wizard-pages.js` renders the catalog/profiles from existing archetype data. Invalid profile routes have catalog recovery.

**Artwork:** all 27 named portraits now appear in results, profiles and the directory. The approved Necromancer remains unchanged; 26 companions follow its semi-chibi 2D style. The Diviner uses Chief's corrected mask version, with cards and an open palm retained and the extra magnifying-glass arm removed. Original PNGs, exact generation prompts, hashes and lightweight WebP exports are retained. See [ARTWORK.md](ARTWORK.md) and the [named gallery](assets/archetypes/contact-sheet.html).

The actual WoL logo is used in the header, footer and favicon. Five spacious Family rows explain different ways of starting a new problem, with three named representative Wizards each and links to all members. Mobile stacks the explanation above the three portraits. These narrative groupings do not diagnose learning ability.

## Reproduced failure and fix — 2026-11-05

- Earlier literal `\\n` in `app.js` prevented parsing and all initialization; upstream commit `3202640` already fixed that. On that revision, a repository-root server successfully completed ten questions in Chrome.
- A server rooted at **only** `what-is-your-magic/` reproduced the reported symptom: `../9-learning-angles/data.js` returned 404, `MOVES is not defined` stopped initialization before both Family rendering and Start listener registration. The user's original preview URL/cache/root was unavailable, so this reproduction does not establish which preview setup they used.
- The new app now bundles `quiz-data.js`, nine existing angle images and two existing Thai fonts. `scripts/sync-quiz.cjs --check` checks source text (LF-normalized for Windows/Linux) and exact asset bytes against the read-only originals. Scoped `.gitattributes` pins the generated data to LF, preserving the checksum across platforms. Explicit refresh command: `node what-is-your-magic/scripts/sync-quiz.cjs` from repository root. Review and re-test any refreshed source; importing data does not approve new content.
- Ordered deferred scripts, versioned resource URLs, disabled-until-ready controls and visible startup recovery replace silent dead buttons. No service worker is involved; the later profile-navigation update uses browser history state as described above.
- Result strength, complete manual share fallback, retake cleanup, keyboard focus and narrow-screen signature layout are included. The original app's files are unchanged.

## Scope
- Original quiz: snapshot `../9-learning-angles/data.js` without changing the original site.
- The original 9 moves, 10 questions, and weight distribution remain the input source.
- Show 1 suggested Wizard from 27 Archetypes grouped into 5 Families.
- Explain the signature, show all 9 raw angle scores, display three alternatives, and suggest one Growth Quest.
- Show a clear note when the leading two archetypes are very close.
- All new assets and logic live under `what-is-your-magic/`. This prototype does **not** overwrite `9-learning-angles/`. The two routes, user interfaces, results, and brand names remain separate.
- `wizard-data.js`: all 5 Family descriptions, 27 archetypes, signatures, narrative copy, Growth Quests.
- `wizard-matching.js`: pure deterministic scoring and validations.
- `app.js`: UI and quiz flow.
- `style.css`: responsive standalone page.
- `index.html`: static HTML entry.
- `startup.js`: dependency failure feedback; `quiz-data.js` and `assets/`: self-contained source snapshot.
- `ui.js` / `wizard-pages.js`: consistent shared visuals and static-host-compatible catalog/profile routes.

## Scoring
- Keep each question's original weight (nine primary questions worth 2 points, the last preference question worth 1).
- Use raw totals for all nine learning angles.
- Each archetype has exactly three unique Learning Angles: primary, secondary, supporting.
- Matching score = 3 × primary score + 2 × secondary score + 1 × supporting score.
- Tie-break: higher primary score, then secondary score, then alphabetically by archetype name.
- If top two match scores differ by <= 2, state clearly that they are close alternatives.
- Legacy data IDs `meaningmaker` and `synthesizer` map to signature IDs `communicator` and `summarizer`. These renamed display labels must **not** change original data IDs.
- This matching is editorial and **not psychometrically validated**. Scores are neither clinical nor standardized. Do not describe them as a person's fixed traits or a percentage of accuracy.

## User journey
1. Read landing screen, 5 Families and disclaimers.
2. Answer the original 10 questions; select a choice then press Next, or use Previous to correct it. Final selections determine scores without double counting. Question order and options shuffle; preference question stays last.
3. Receive a main Wizard with family, motto and explanation.
4. See three signature angles and the original score matrix with all nine.
5. See next-best Wizards and Growth Quest; optionally retake or share.
6. Viewing an angle in the matrix displays the original description from `MOVES`.

## Five families
A — Arcane & Knowledge (7): knowledge, patterns, time, rules of the world.
B — Life & Nature (7): wellbeing, protection, relationships with life and matter.
C — Spirit & Occult (6): unseen stories, connecting with others, memory and ritual.
D — Mind & Expression (4): meaning, perception, artistic expression and communication.
E — Magic & Combat (3): tools, applied action and the costs of choices.

These families describe **fantasy methods of creating change**. They are not a statistical grouping of individuals.

## Art direction — completed 27-character set
Use the *visual language* shown in the existing 9 Learning Angles characters and the user-provided Wizards of Learning illustration moodboard:
- Original, friendly 2D wizard characters, expressive readable poses, energetic but simple silhouettes.
- Rounded/semi-chibi proportions (not hyperrealistic 3D, not dark cinematic fantasy).
- Crisp outlines, bright controlled color blocks, light cel-shading, restrained textures.
- White/neutral backgrounds for individual cards, accent outlines by class/family.
- Keep a coherent base design system while giving 27 archetypes recognizably different tools, hats, clothing, poses and magical effects.
- Accent groups: A purple-blue, B green, C violet, D warm orange/gold, E red. Overall UI uses the separately scoped iris/ink palette documented in DESIGN.md; this does not change global WoL branding.
- The 27 original raster portraits use a white background. High-resolution PNG masters and optimized WebP renders are retained; no layered/vector originals or transparency are claimed.
- Asset naming: `assets/archetypes/<id>.webp`, file names must match the stable IDs in `wizard-data.js`.
- Current masters are portrait, approximately 1123×1402 px, with safe full-body framing. Web copies are 512 px wide.
- Provide a visual QC sheet comparing all 27 characters for consistency, diversity of silhouettes and readability in 120 px cards.
- The full 27-character set was subsequently authorized and completed; see ARTWORK.md. Original nine Learning Angle images remain unchanged in signature rows and the matrix.

## Example Learning Adventure — separate future phase
**The Forgotten Library:** a fictional library is losing visitors. Three phases:
- Discover: Explorer surveys, Listener interviews, Experimenter runs a tiny test.
- Create: Connector relates clues, Communicator explains, Creator prototypes.
- Resolve: Decider chooses, Summarizer distills, Reflector reviews what worked.
Wizard identity offers one optional skill bonus in this fictional scenario; the user must also use at least one less-practiced Learning Angle. This adventure is not shipped in V1.

## Repeatable QA

From repository root:

```sh
node what-is-your-magic/scripts/sync-quiz.cjs --check
node --test what-is-your-magic/tests/scoring.test.cjs
```

For browser acceptance, run the two servers described above on ports 8000/8001. Use an existing Playwright installation, or install a test-only copy outside the repo (PowerShell):

```powershell
npm install --prefix "$env:TEMP/magic-v1-qa" playwright@1.62.1
$env:PLAYWRIGHT_MODULE = "$env:TEMP/magic-v1-qa/node_modules/playwright"
# Point to an installed Chrome/Edge executable; omit to use Playwright's installed Chromium.
$env:BROWSER_EXECUTABLE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
$env:MAGIC_BASE_URL = 'http://127.0.0.1:8000/'
$env:MAGIC_ISOLATED_URL = 'http://127.0.0.1:8001/'
$env:TEST_OUTPUT_DIR = "$env:TEMP/magic-v1-evidence"
node what-is-your-magic/tests/browser.cjs
node what-is-your-magic/tests/profiles.cjs
node what-is-your-magic/tests/audit.cjs
node what-is-your-magic/tests/artwork.cjs
```

Browser checks save `browser-results.json`, request statuses and desktop/mobile screenshots outside the repository. They use visible DOM controls and independent expected scores, including every Wizard's real answer path. Sharing API success/cancel/denial states are simulated; the operating system share sheet itself is not tested.

The UI follow-up also passes **10 profile/reading-flow groups** in `tests/profiles.cjs`: all 27 direct profiles, source content, three signature characters, Family filters, invalid-route recovery, chapter navigation including reselecting an active chapter, result/profile Back and reload persistence, full mobile 3×3 visibility, faded low scores and tied-high emphasis. `profile-results.json` and reference-comparison screenshots are saved alongside the core browser report. The core 12-group quiz/original-app regression and 5 scoring tests also pass after the UI changes. Author QA is not Chief design/art acceptance.

2026-11-05 validation: Chrome via Playwright 1.62.1, desktop 1440 px and mobile emulation 390/320 px. Complete quiz, keyboard, all 27 outcomes, exact/near ties, score details, retake, share fallbacks, missing-script recovery/reload, isolated-root hosting, and original quiz desktop/mobile regression passed. Healthy flows had zero console/runtime errors and zero missing assets/404s. The unchanged original's browser-generated favicon request is fulfilled with HTTP 204 in its regression test; it has no app favicon declaration. New app favicon requests resolve normally.

Exact enumeration of **all 177,147 legal answer paths** (3^9 × 9) reaches all 27 archetypes. This proves structural reachability only: unequal result frequencies, editorial signatures and unvalidated psychological interpretation remain. Real mobile devices, Safari/Firefox, real OS sharing and the user's former Codespaces URL have not been tested.


## UX audit refinements — 2026-11-05

- Deliberate answer selection, retained choices, Next/Previous and correct replacement scoring.
- Actual answer evidence distinguished from the authored Wizard signature, including zero-score components; tied/near matches linked in the result hero.
- Every reading chapter is discoverable through a labeled native selector on mobile, with one scroll offset and heading focus. Desktop retains the chapter rail.
- Original 3×3 images/colors retained; low labels darkened while artwork fades, and highest badges stay at least 10px.
- Catalog search supports Wizard names and Thai learning angles, canonical Family counts and clear/empty-state recovery.
- New scoped iris/ink palette and local Bai Jamjuree body type with Kanit headings/scores. Both font licenses are bundled.

The new audit regressions pass alongside the original quiz/profile tests. Full current-audit screenshots and six-step findings are delivered in chat; DESIGN.md records the decisions and evidence limits. Usability superiority over another site is a goal requiring real comparative user testing, not a claim established by these checks.

2026-11-06 artwork update: core 12/12 + profile 10/10 + UX 5/5 + artwork 4/4 browser groups passed locally. Artwork checks cover five differentiated Families, 15 named representative images, actual logo, no overflow at 1440/390/320 px and all 27 named gallery images.

Production artwork release verified 2026-11-06: [PR #3](https://github.com/wollab/WoL_GameLab/pull/3), merge `cefab292`, [Pages run 42070980949](https://github.com/wollab/WoL_GameLab/actions/runs/42070980949). Actual public URL: core 11/11, profiles 10/10, UX 5/5, artwork 4/4; zero healthy-flow console/runtime/asset failures. The isolated-localhost case is omitted from production checks. Original app desktop/mobile still passes.


## Sharing your Wizard — 2026-11-06

Share from the result hero or the bottom of the result. One modal previews the matching Wizard card and offers post 4:5 (1080×1350) or Story 9:16 (1080×1920), real PNG download and native file sharing where supported. Copy the caption separately; use the Wizard link with Facebook/LINE or paste it into an Instagram Story link sticker. An unavailable/denied clipboard exposes selectable text. Cancellation retains the prepared image.

`share/<id>/` is a static recipient page for each of the 27 Wizards, with unique crawler-visible title/image metadata and no JavaScript requirement. A recipient sees the Wizard that was shared and can read the full profile or start their own quiz. These links/images contain only the designed Wizard type/signature, with no personal answers or nine scores. No account, server storage or analytics is added.

- `share.js`: shared native dialog, readiness/failure/retry, copy/native/download and retake cleanup.
- `share-card.js`: raster export layout using untouched source PNG portraits and original signature characters; no new illustrations.
- `scripts/build-share-pages.cjs`: derives all 27 static HTML entries and 1200×630 JPEG previews from canonical data and the same card renderer. Use the existing Playwright test environment (`PLAYWRIGHT_MODULE`, optional `BROWSER_EXECUTABLE`), then run `node what-is-your-magic/scripts/build-share-pages.cjs` from the repository root. It opens an ephemeral localhost build server and closes it after generation. Rebuild after canonical copy/art changes; do not edit generated pages independently.
- `tests/sharing.cjs`: browser checks for real PNG downloads, all 27 exports/routes/OGs, file-share success/cancel/failure simulations, copy fallback, fresh recipient with JS disabled, stale renders, retake, keyboard, narrow screens and failed-art retry. Run alongside the existing core/profile/audit/artwork tests with `TEST_OUTPUT_DIR` outside the repo.

The in-app browser was disabled in Work settings for this follow-up. Chrome/Playwright uses the original task's explicitly permitted E2E fallback; Work settings were not changed. Tests do not post to social media or prove actual platform preview-cache appearance or real OS share-sheet behavior. The public 16Personalities profile was inspected for visual context; its personal-results sharing flow was not audited.
