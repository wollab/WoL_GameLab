# Aggregate result statistics

Chief approved7November2026: collect completed-quiz results and show distribution on results and all27archetype profiles. Later added nine-angle aggregate points and approved one mental-simulation option wording change. Original9-learning-angles remains unchanged.

## Data and interpretation

- Archetype percentage = count of this type / completed results recorded for current version. These are attempts, not unique people or population prevalence.
- Angle percentage = total points for that angle / sum of all nine angle points. Each completed quiz contributes19points. Its coverage count is shown separately; earlier datasets without angle coverage must not use the archetype denominator.
- No historical results can be recovered. Production starts empty. Test fixtures use separate dataset=test and never seed production.
- Recorded application rows: dataset, version, run UUID, archetype, completed timestamp. Angle counters retain only aggregate points per dataset/version/angle. Scores travel over HTTPS to validate/recompute the winner and increment counters, but are not stored per attempt. No name, email, user account, answer text, persistent browser identity or IP is added to the application tables. Platform operational logs are separate.
- A new intentional retake counts as another result. Refresh/profile/share viewing do not count. Signed24hour tickets and database primary keys make retry idempotent. Anonymous valid submissions remain susceptible to deliberate repeated play or bots; these are exploratory statistics, not a representative survey.

## Implementation

api/result-stats.js uses server/statistics.mjs. Node built-ins only. The handler validates same-origin writes, a signed run ticket, all9legacy score keys and an actually reachable19point vector, then reruns the canonical matching implementation. No browser-provided archetype is trusted.

Vercel environments hold YOURMAGIC_SUPABASE_URL, YOURMAGIC_SUPABASE_KEY (publishable), YOURMAGIC_STATS_SECRET (dedicated high-entropy credential). No Supabase service-role key is used. Credentials are never embedded in browser code or repository. Existing WoL Supabase project is reused with isolated yourmagic_stats schema. SQL files define additive migrations; provision the credential hash separately, never hardcode a secret in migrations.

Tables use RLS and grant no access to anon/authenticated. Only public.yourmagic_statistics RPC is reachable by anon, with a mandatory dedicated secret check before any read/write; search_path is empty and all application tables schema-qualified. Supabase's generic anon SECURITY DEFINER advisory for this guarded RPC is expected and reviewed; it must not be changed to an unguarded public function. Unrelated pre-existing project advisories are outside this change.

RPC transaction inserts run once, and increments9aggregate counters only if that insert succeeds. Different results for the same run reject. Public API returns totals only. Production/test dataset chosen server-side by VERCEL_ENV; the client cannot override it.

result-stats.js renders one shared card. GETs can cache30seconds on CDN; the just-completed result uses the fresh POST response. Failure/retry, zero-data and optional-JavaScript states are explicit. Quiz/share keep working if statistics are unavailable. Dynamic profiles and all generated static pages load this same read-only renderer.

## Verification and operation

node --test tests/statistics.test.mjs tests/scoring.test.cjs covers signatures/all27witnesses, all177147legacy paths, invalid vectors, ticket tampering/expiry, origin/method controls, aggregate integrity and outage behavior.

server/dev.mjs reads credentials from runtime environment and serves4193. npm run dev:statistics always uses test dataset unless explicitly configured with VERCEL_ENV=production. tests/statistics-integration.mjs writes only to this development server and asserts12simultaneous retries yield one result and19points.

Browser evidence is outside repository in the chat visualization: stats-local-browser-qa.json, stats-nine-angles-qa.json and screenshots. Real local journeys cover320/390/1440, reload, profile viewing, retake, sharing, all27staticprofiles, unavailable backend and approved question wording. Public post-release checks read production without creating synthetic live results.

To disable collection, roll back the Vercel deployment or disable the route; retain aggregate data. Remove/rotate the dedicated key only as part of a coordinated change. Do not delete unrelated Supabase tables. Current version v1-20261107 includes the wording override; future scoring changes must intentionally version the stored cohort.
