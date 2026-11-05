---
status: implemented
source_base: Chief-approved Necromancer reference, canonical archetype data and Diviner mask correction
purpose: Preserve the 27-character masters, names, generation provenance and web export procedure
---

# 27 Wizards of Learning — character artwork

All 27 portraits are complete. The original Necromancer is the approved style reference; the 26 companions were generated individually with built-in Image Gen and inspected for identity, proportions, props, anatomy and small-scale readability. Chief authorized the complete set and website integration. Author inspection does not imply individual owner approval of every companion.

## Files and reproduction

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
