---
status: working
source_base: Chief's V1 task and existing app styles
purpose: Preserve V1 visual and interaction intent during debugging
---

# What Is Your Magic? V1

Thai-first creative learning reflection for WoL visitors. The single primary journey is landing → ten choices → Wizard suggestion → reflection, share or retake. Preserve the existing visual direction; this task is functional completion, not a redesign.

Runtime tokens live in `style.css`: teal `--teal`, orange `--gold`, charcoal `--ink`, white `--surface`, soft background `--bg`. Existing A–E accent values live in `wizard-data.js`. Use existing locally bundled Kanit regular/semibold for Thai and English; utility scores use the same readable font. Family symbols remain placeholders for all 27 archetypes; no new character artwork.

Keep native buttons, clear keyboard focus, disabled startup until initialization succeeds, visible recovery when scripts fail, focus on each question/result heading after transitions, a locally scrollable score matrix and no page-wide mobile overflow. Sharing must fall back to a selectable result message when native share/clipboard fails; retake clears all answers and share state.

Result narrative is an editorial suggestion, never a diagnosis or fixed personality. Raw scores total 19. Ties must be reproducible and explicitly presented as alternatives. Original `9-learning-angles/` files and route stay unchanged.
