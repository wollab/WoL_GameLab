# What Is Your Magic? V1 — task checkpoint

## Original goal
Complete a playable, separate `/WoL_GameLab/what-is-your-magic/` experience: landing → ten original questions → one of 27 Wizards; preserve `/WoL_GameLab/9-learning-angles/`. Commit to `feature/wizard-discovery-v1`, update Draft PR #2, never merge automatically.

## Status — 2026-11-05
Implementation and technical delivery complete. Fix commit `5721e755214861876f4ef2ac2affd3b2ca56fee1` is pushed to `feature/wizard-discovery-v1`; existing [PR #2](https://github.com/wollab/WoL_GameLab/pull/2) is updated, open, Draft, unmerged and conflict-free on readback. This is review-ready work, not Chief acceptance or production approval. Started from clean feature head `320264096d088b1ff887d698c93d1102d4f93cf2`. Previous local branch was `ux/wol-visual-faithful-2026-08-27`; its clean files/history are preserved.

## Completed / evidence
- Inspected all tracked paths and new app scripts, source questions, scoring, legacy keys, dependency order and original quiz flow.
- Real Chrome/Playwright baseline at repository-parent server: five families, Start, all ten answers and result work on `3202640`. One incidental `/favicon.ico` 404; no app runtime exception.
- Commit `3202640` removes the earlier literal `\\n` syntax error before listener registration. Latest corrected revision does not reproduce the reported dead button in the tested environment.
- GitHub Pages API: legacy build from `main`, root `/`; latest production deployment `c836505d358f79d4c9fdba0737b4cee5fd395b25`. Feature branch is not production. User's earlier Codespaces URL/root/cache state is unavailable; do not claim a proven cause there.
- Reproduced the dead Start + missing Families on an isolated app-root server: original sibling data request 404 → `MOVES is not defined` → initialization stops before Family rendering/listeners. Fixed by bundling a verified source snapshot and existing assets locally. Re-tested isolated root successfully.
- Added visible startup recovery/reload behavior, ordered versioned scripts, local favicon/fonts, result strength, complete share fallback, retake state reset and heading focus. Screenshot review caught narrow signature text at 320 px; fixed with a mobile grid and a browser width assertion.
- Original `9-learning-angles/` has no changed files against production base `c836505`; no changes to any other app, URL, Pages settings or production.

## Decisions / assumptions
- Keep matching formula 3×primary + 2×secondary + supporting, deterministic tie breaks, near-match threshold ≤2. Preserve raw 19-point scoring and source legacy IDs.
- Use a generated, verified copy of original quiz data and required existing assets inside the new app. Source stays read-only; an explicit script refresh/check prevents silent drift. No new artwork.
- Keep established teal/orange/charcoal UI and family symbols. Add startup recovery, result strength, usable share fallback and mobile/keyboard fixes within V1 scope.
- No public production deployment, merge, new analytics, automation or personality-diagnosis claims.

## Work in progress / remaining
No implementation work remains for this requested V1. PR description now records root-cause evidence/limits, checks and repeatable preview commands. Remote head and full PR file scope were verified; only this checkpoint and the new app differ from production. Final checkpoint/PM handoff is being persisted. Chief can play the preview and review PR #2; do not merge automatically.

## Files changed
`TASK_STATE.md`; new app `.gitattributes`, `README.md`, `DESIGN.md`, `index.html`, `app.js`, `style.css`, `startup.js`, `favicon.svg`, generated `quiz-data.js`, eleven copied existing assets, `scripts/sync-quiz.cjs`, and three `tests/*.cjs` files. No original app files changed. Tests/screenshots/JSON outputs stay outside committed source.

## Tests / verification
- `node .../sync-quiz.cjs --check`: LF-normalized source text SHA-256 `3fbd82c9b241ce2e8c83992de915e13cb9f9aa8ba18a613ea6b59ff4024e05fa` and all eleven existing asset bytes match. Generated data is pinned LF so Windows/Linux checkouts agree; original files are untouched.
- `node --test .../tests/scoring.test.cjs`: 5/5 passed. All 177,147 legal answer paths enumerated; all 27 reachable, legacy aliases, exact/near ties and deterministic ordering verified.
- Chrome / Playwright 1.62.1 acceptance: 12/12 groups passed, 54 unique successful URL/status responses, zero console/runtime errors and zero failed/missing requests in healthy flows. Deliberately aborted dependency is separately recorded as an expected failure; reload recovers. Original app's undeclared browser-generated favicon request alone is stubbed HTTP 204 in regression tests.
- Desktop 1440 px, mobile emulation 390/320 px, keyboard full journey, all 27 results through real answer clicks, exact ties (12 witnesses) / near ties (14), signature/9 scores/alternatives/quest, retake/quit, native-share branches and clipboard/manual fallbacks passed. Real OS share sheet not exercised; APIs stubbed for deterministic success/cancel/denial.
- Original quiz: ten questions → results → restart at 1440/390 px passed. New app passed both repository-prefixed and isolated-root servers. Static UI audit and `git diff --check` passed. Screenshots inspected after mobile fix.
- Browser plugin unavailable; regular Playwright uses installed Chrome. Evidence is outside repo in this chat's Codex visualization directory (`browser-results.json`, 13 PNGs, `premium-audit.json`). Real iOS/Android, Safari/Firefox and the original Codespaces URL remain untested.

## Blockers / questions
No required product question. No existing feature-branch hosted preview. Local verified preview is allowed by the delivery fallback and runs at `http://127.0.0.1:4187/WoL_GameLab/what-is-your-magic/` while its Python process remains running. Companion isolated-root preview: `http://127.0.0.1:4188/`. Portable launch commands for repository-root and Codespaces are in the app README. No public hosted-preview claim.

## Exact next action
Chief opens the local preview, completes the quiz and reviews PR #2. If this Python preview process is no longer running, use the README's verified local/Codespaces commands on `feature/wizard-discovery-v1`. Capture actual Chief feedback before further changes. Merge/production publication requires Chief's next instruction; no automatic merge/deploy or additional feature work is pending.
