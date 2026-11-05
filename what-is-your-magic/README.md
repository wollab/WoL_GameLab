# What Is Your Magic? — 27 Wizard Archetypes (V1 Prototype)

A separate, standalone experience from [9 Learning Angles](../9-learning-angles/) by Wizards of Learning. Both tools coexist as distinct websites under the same GitHub Pages project. This app bundles a verified snapshot of the original quiz and existing assets; it has no runtime dependency on the original app directory.

## Play the feature branch locally

From the repository root (Python 3, no build/install step):

```sh
git switch feature/wizard-discovery-v1
git pull --ff-only origin feature/wizard-discovery-v1
python -m http.server 8000 --bind 127.0.0.1
```

Open [What Is Your Magic? local preview](http://127.0.0.1:8000/what-is-your-magic/) and [original local quiz](http://127.0.0.1:8000/9-learning-angles/). The server must stay running. In Codespaces, omit `--bind 127.0.0.1`, forward port 8000 in the Ports panel and open its forwarded URL with `/what-is-your-magic/` appended. If the port is private, sign in with the GitHub account allowed into that Codespace. Confirm the selected branch and stop any old server using that port first. A hard reload can refresh old assets, but cannot switch a server's branch or root.

Serving only this app also works: `python -m http.server 8001 --bind 127.0.0.1 --directory what-is-your-magic`, then open [isolated preview](http://127.0.0.1:8001/).

Production routes remain `/WoL_GameLab/9-learning-angles/` and `/WoL_GameLab/what-is-your-magic/`. GitHub Pages is configured for **main**, so the feature branch is not a hosted Pages preview. This PR stays Draft; no merge or production deployment is part of this fix.

## Reproduced failure and fix — 2026-11-05

- Earlier literal `\\n` in `app.js` prevented parsing and all initialization; upstream commit `3202640` already fixed that. On that revision, a repository-root server successfully completed ten questions in Chrome.
- A server rooted at **only** `what-is-your-magic/` reproduced the reported symptom: `../9-learning-angles/data.js` returned 404, `MOVES is not defined` stopped initialization before both Family rendering and Start listener registration. The user's original preview URL/cache/root was unavailable, so this reproduction does not establish which preview setup they used.
- The new app now bundles `quiz-data.js`, nine existing angle images and two existing Thai fonts. `scripts/sync-quiz.cjs --check` checks source text (LF-normalized for Windows/Linux) and exact asset bytes against the read-only originals. Scoped `.gitattributes` pins the generated data to LF, preserving the checksum across platforms. Explicit refresh command: `node what-is-your-magic/scripts/sync-quiz.cjs` from repository root. Review and re-test any refreshed source; importing data does not approve new content.
- Ordered deferred scripts, versioned resource URLs, disabled-until-ready controls and visible startup recovery replace silent dead buttons. No service worker or browser storage is involved.
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
2. Answer the original 10 questions; question order and options shuffle; tie-break question stays last.
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

## Art direction — Phase 2 (NOT included yet)
Use the *visual language* shown in the existing 9 Learning Angles characters and the user-provided Wizards of Learning illustration moodboard:
- Original, friendly 2D wizard characters, expressive readable poses, energetic but simple silhouettes.
- Rounded/semi-chibi proportions (not hyperrealistic 3D, not dark cinematic fantasy).
- Crisp outlines, bright controlled color blocks, light cel-shading, restrained textures.
- White/neutral backgrounds for individual cards, accent outlines by class/family.
- Keep a coherent base design system while giving 27 archetypes recognizably different tools, hats, clothing, poses and magical effects.
- Accent groups: A purple-blue, B green, C violet, D warm orange/gold, E red. Respect WoL's teal/orange/charcoal brand balance in overall UI.
- Produce **27 original character artworks**, ideally source files or layered vector, plus transparent PNG or WebP renders. Do not replicate existing artists' individual compositions or characters.
- Asset naming: `assets/archetypes/<id>.webp`, file names must match the stable IDs in `wizard-data.js`.
- Suggested crop: square 1024x1024 masters, with safe full-body character centered; export lightweight versions for web at 512 px or appropriate responsive srcset.
- Provide a visual QC sheet comparing all 27 characters for consistency, diversity of silhouettes and readability in 120 px cards.
- Do not attempt to synthesize 27 bespoke images as a prerequisite for V1. Until the approved art exists, the UI uses family-symbol placeholders and the original 9 Learning Angle images for signature rows.

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
```

Browser checks save `browser-results.json`, request statuses and desktop/mobile screenshots outside the repository. They use visible DOM controls and independent expected scores, including every Wizard's real answer path. Sharing API success/cancel/denial states are simulated; the operating system share sheet itself is not tested.

2026-11-05 validation: Chrome via Playwright 1.62.1, desktop 1440 px and mobile emulation 390/320 px. Complete quiz, keyboard, all 27 outcomes, exact/near ties, score details, retake, share fallbacks, missing-script recovery/reload, isolated-root hosting, and original quiz desktop/mobile regression passed. Healthy flows had zero console/runtime errors and zero missing assets/404s. The unchanged original's browser-generated favicon request is fulfilled with HTTP 204 in its regression test; it has no app favicon declaration. New app favicon requests resolve normally.

Exact enumeration of **all 177,147 legal answer paths** (3^9 × 9) reaches all 27 archetypes. This proves structural reachability only: unequal result frequencies, editorial signatures and unvalidated psychological interpretation remain. Real mobile devices, Safari/Firefox, real OS sharing and the user's former Codespaces URL have not been tested.
