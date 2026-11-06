---
status: implemented
source_base: Chief-approved Necromancer reference, canonical archetype data and Diviner mask correction
purpose: Preserve the 27-character masters, names, generation provenance and web export procedure
---

# 27 Wizards of Learning — character artwork

All 27 portraits are complete. The original Necromancer is the approved style reference; the 26 companions were generated individually with built-in Image Gen and inspected for identity, proportions, props, anatomy and small-scale readability. Chief authorized the complete set and website integration. Author inspection does not imply individual owner approval of every companion.

## Transparent character PNGs and Family scenes — current 2026-11-06 revision

Chief explicitly requested background removal. The website now uses real RGBA PNG cutouts for all27 Wizards and all nine small Learning Angle characters. Built-in Image Gen performed extraction using each existing source image; original PNGs are retained unchanged. `assets/cutouts.json` records source/master hashes, dimensions, alpha coverage, delivery path and exact prompt. Per-image generation provenance is retained in `assets/cutout-provenance/`. These new extractions are not asserted to have pixel-identical foreground RGB values.

- Main transparent source-resolution masters: `assets/archetypes/cutouts/masters/`; web PNGs: `assets/archetypes/cutouts/<id>.png`.
- Nine transparent source-resolution masters: `assets/characters/cutouts/masters/`; web PNGs: `assets/characters/cutouts/<legacy-id>.png`.
- Summoner and Decider use the selected `-v2.png` masters listed in the manifest; initial extractions are retained for provenance.
- `scripts/export-cutouts.py` validates actual alpha/aspect/solid regions and exports36 PNGs (8,917,611 bytes), width at most512px. It does not remove backgrounds or overwrite source files.
- `artwork.js` resolves presentation paths, including communicator/meaningmaker and summarizer/synthesizer aliases. Canonical quiz data remains untouched.
- The named27-character gallery offers PNG downloads and a dark-background switch for edge inspection. `export-artwork.py` preserves this current gallery when historical WebPs are re-exported.
- Five Family scene masters, WebPs and exact prompts/hashes are in `assets/families/`; `scripts/export-family-scenes.py` only resizes/formats them. A library/observatory, healing garden, moonlit memory garden, art/story studio and maker courtyard express the five Families.

UI and card export use ordinary source-over compositing with the transparent PNGs; multiply compositing is removed. Main/miniatures preserve aspect with contain. Browser alpha checks cover all36 images; light/dark gallery and actual Family compositions were visually inspected. New artwork integration was explicitly approved and published through PR #7 / Pages42188947767, with58 actual-public Chrome groups passing; original27 portrait generation and old WebP derivatives below are retained history.

## Retained original files and reproduction

- `assets/archetypes/necromancer-sample.png`: unchanged approved original.
- `assets/archetypes/masters/<id>.png`: 26 retained source-resolution PNGs.
- `assets/archetypes/<id>.webp`: 27 web derivatives, 512 px wide, quality 88; 951,130 bytes total.
- `assets/archetypes/artwork-manifest.json`: exact prompts, source output basenames, canonical names/families, original dimensions, SHA-256 hashes and exports.
- `assets/archetypes/contact-sheet.html`: all 27 portraits with selectable names and Family labels.
- `scripts/export-artwork.py`: Pillow resize/format export only; asserts PNG source bytes remain unchanged. Run `python what-is-your-magic/scripts/export-artwork.py` from the repository root with Pillow installed. It does not generate or semantically alter artwork.

The Diviner final source is `exec-8213d445-8c1c-476c-ba7e-fc11abded46c.png`. Remove the magnifying glass and extra upper arm/hand, retain the lower hand holding three cards and raised open palm. The first correction removed the wrong hand and is superseded; only the user-mask correction is included in this release.

The actual WoL logo is `assets/brand/wol-logo.png`, an unchanged copy of the canonical local `WoL-logo-2019-01.png`. No original nine Learning Angle images were edited. Raw artwork contains no labels; HTML supplies names so they stay readable on mobile.

## Character index

| ID | Character | Family |
| --- | --- | --- |
| `necromancer` | Necromancer | C |
| `mage` | Mage / Generalist | A |
| `scholar` | Scholar | A |
| `elementalist` | Elementalist | A |
| `geomancer` | Geomancer | A |
| `chronomancer` | Chronomancer | A |
| `diviner` | Diviner | A |
| `force-mage` | Force Mage | A |
| `healer` | Healer | B |
| `priest` | Priest | B |
| `holy-knight` | Holy Knight | B |
| `warden` | Warden | B |
| `beastmaster` | Beastmaster | B |
| `transmuter` | Transmuter | B |
| `alchemist` | Alchemist | B |
| `warlock` | Warlock / Hexer | C |
| `summoner` | Summoner | C |
| `spirit-medium` | Spirit Medium | C |
| `shaman` | Shaman | C |
| `ritualist` | Ritualist | C |
| `illusionist` | Illusionist | D |
| `enchanter` | Enchanter | D |
| `bard` | Bard / Artist Mage | D |
| `mimic` | Mimic / Blue Mage | D |
| `artificer` | Artificer | E |
| `spellblade` | Spellblade | E |
| `blood-mage` | Blood Mage | E |
