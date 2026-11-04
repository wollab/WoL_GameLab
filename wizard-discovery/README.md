# Discover Your Wizard — V1 Prototype

A creative extension of [9 Learning Angles](../9-learning-angles/) by Wizards of Learning.

## Scope
- Original quiz: reuse `../9-learning-angles/data.js` without changing the original site.
- The original 9 moves, 10 questions, and weight distribution remain the input source.
- Show 1 suggested Wizard from 27 Archetypes grouped into 5 Families.
- Explain the signature, show all 9 raw angle scores, display three alternatives, and suggest one Growth Quest.
- Show a clear note when the leading two archetypes are very close.
- All new assets and logic live under `wizard-discovery/`. This prototype does **not** overwrite `9-learning-angles/`.
- `wizard-data.js`: all 5 Family descriptions, 27 archetypes, signatures, narrative copy, Growth Quests.
- `wizard-matching.js`: pure deterministic scoring and validations.
- `app.js`: UI and quiz flow.
- `style.css`: responsive standalone page.
- `index.html`: static HTML entry.

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

## QA and deployment
- Preview on the branch first; GitHub Pages from `main` will only show the new path after merging.
- Check desktop and mobile rendering, accessible labels, keyboard usage, and all 10 question transitions.
- Check scoring against `QUESTIONS`, especially `meaningmaker` / `synthesizer`.
- Verify 27 unique IDs and 27 unique valid signatures, with valid A–E family IDs.
- Check that alternative matches and close-match note reflect raw scores.
- Test zero, tied, and near-tied profiles; no claim of diagnosis or personality certainty.
- Open `/wizard-discovery/` only after review and merge to `main`.
- Do **not** replace `/9-learning-angles/`; preserve its inbound URLs.

## Important validation note
A seeded simulation of 60,000 randomly sampled answer sets over the original 9×3 core options and final one-point choice yielded all 27 archetypes at least once. This is only a structural reachability smoke check, not an estimate of real-world result distribution or psychometric validity. Unequal output frequencies remain possible and should be studied with real opt-in test data.
