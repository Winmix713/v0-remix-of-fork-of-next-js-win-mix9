Repository code review and static analysis summary

Scope and approach
- Reviewed the Next.js 14 App Router project under /home/engine/project using manual inspection and targeted static analysis (grep for common code smells, security-sensitive patterns, and type usages).
- Focused on code quality, performance, security, maintainability, and compatibility with modern Next.js conventions.
- The findings below include specific file paths and line numbers and are grouped by severity.

Critical issues (build blockers / crashes)
1) Broken imports in server-driven Matches page and tests
- File: app/(dashboard)/matches/page.tsx
  - Lines 5–7 import non-existent modules: 
    - import { FilterSection } from "@/components/features/filter-section"
    - import { StatsSection } from "@/components/features/stats-section"
    - import { ResultsSection } from "@/components/features/results-section"
  - Only components/filter-section.tsx, components/stats-section.tsx, components/results-section.tsx exist. This breaks typechecking/tests.
  - Fix (implemented): added re-export shims at components/features/* to forward to existing components.

2) Pagination bug in ResultsSection
- File: components/results-section.tsx
  - Prior code (around line 59) always did matches.slice(0, itemsPerPage), ignoring currentPage and causing wrong/empty results for server-paginated data.
  - Fix (implemented): 
    - Compute displayedMatches using a heuristic to support both server-paginated and client-paginated data:
      - isServerPaginated = totalCount > matches.length
      - displayedMatches = isServerPaginated ? matches : matches.slice(startIndex, endIndex)

Security vulnerabilities
1) Hardcoded Supabase credentials and logging of credentials
- File: lib/supabase/client.ts
  - Lines 4–12: Fallbacks hardcode NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY; console.log prints whether a key exists.
  - Impact: Accidentally shipping valid project URL/key; risk of credential leakage via console logs; encourages use of prod anon key in non-prod.
  - Action: Remove hardcoded fallbacks and credential logging; validate env at startup and gracefully fall back to sample data.

- File: public/scripts/winmix-app.js
  - Lines 23–26: Hardcoded Supabase URL and anon key for a specific project.
  - Impact: Exposes credentials in public bundle; any user can extract and abuse the key.
  - Action: Remove these from public JS; if this standalone is still needed, inject via runtime config (e.g., data-* attributes) or remove the script entirely.

2) Overly permissive Content Security Policy (CSP) and information leakage
- File: middleware.ts (Lines 68–79)
  - Allows 'unsafe-inline' and 'unsafe-eval' in script-src, and img-src includes http:.
  - Sets X-Powered-By: WinMix (line 91), leaking stack info.
  - Action: Tighten CSP (remove unsafe-*; prefer nonce/sha256), drop http: for img-src, and remove X-Powered-By.

3) Service role key handling in API
- File: app/api/matches/route.ts
  - Line 155: createServerClient(..., process.env.SUPABASE_SERVICE_ROLE_KEY!)
  - Risk: @supabase/ssr createServerClient is for anon-key + cookies/session management. For service role operations, use @supabase/supabase-js createClient with the service key on the server only; avoid cookie hooks here.
  - Action: Replace with import { createClient } from "@supabase/supabase-js" and instantiate with service key; never expose to client.

4) Missing/incorrect server-side filtering in API
- File: app/api/matches/route.ts
  - Lines 96–99: btts filter only applies when true (gt), does nothing when false. comeback filter is parsed but not applied at all.
  - Action: Handle both btts=true and btts=false, and compute comeback using SQL logic or a computed column/materialized view.

Performance issues and optimization opportunities
1) Heavy and blocking third-party scripts loaded beforeInteractive
- File: app/layout.tsx (Lines 34–36)
  - Loads Lucide, Chart.js, and Supabase via CDN beforeInteractive. This adds render-blocking JS and duplicates npm dependencies.
  - Action: Remove Supabase CDN (unused with @supabase/* packages). Load Chart.js via npm and dynamically import only where needed. Lucide can be used via lucide-react or rendered at mount.

2) Inefficient statistics loading on client
- File: app/page.tsx (around lines 447–465)
  - loadStats selects all columns for all rows then transforms on client.
  - Action: Aggregate on the server (e.g., SQL COUNTs and AVG), or provide a stats API route; select minimal columns if client-side processing is unavoidable.

3) Excessive sample data generation
- Files: app/page.tsx (generateSampleData), public/scripts/winmix-app.js
  - Generates 2,500–5,000 matches, executed on the client, with multiple loops and transforms.
  - Action: Gate behind development flag, reduce counts, or pre-generate; consider Web Worker for large datasets.

4) Duplicate chart initialization with timers and console chatter
- Files: components/chart-wrapper.tsx, components/stats-section.tsx
  - Uses setTimeout and retries; logs aggressively.
  - Action: Replace with dynamic import of Chart.js and guard on components’ mount; avoid noisy logs in production.

5) Redundant/duplicated security headers
- Files: next.config.mjs (headers()) and middleware.ts (security headers + CSP)
  - Duplication risks inconsistencies and extra overhead.
  - Action: Centralize header policy in one place (prefer middleware for CSP), and keep next.config for minimal static headers only.

Maintainability and technical debt
1) Inconsistent domain model across layers
- Files:
  - app/page.tsx: Match uses string flags (btts: "yes"|"no", comeback: "yes"|"no").
  - lib/data/matches.ts: Match uses boolean flags (btts: boolean, comeback: boolean) with a different shape.
  - components/results-section.tsx expects string flags.
  - Impact: Friction when sharing components / stores, subtle bugs in filtering/sorting.
  - Action: Normalize to a single domain model (prefer boolean for flags), add adapter mappers at the boundaries only.

2) Duplicated transformation logic
- Files: app/page.tsx (transformSupabaseMatch), lib/data/matches.ts (transformSupabaseMatch), public/scripts/winmix-app.js (transformSupabaseData)
  - Action: Create a shared transformer in lib/mappers/match.ts and reuse everywhere.

3) Overuse of any and weak types
- Examples:
  - components/chart-wrapper.tsx: data: any, options: any
  - components/stats-section.tsx: window.Chart: any, chart instance refs: any
  - lib/data/matches.ts: transformSupabaseMatch(match: any)
  - app/page.tsx: transformSupabaseMatch(match: any)
  - Action: Introduce explicit Chart.js types (or a minimal internal type), define Supabase row types, and type adapters.

4) Unused or legacy files
- File: components/winmix-react-app.tsx — comment says it’s no longer needed; remove to reduce confusion.
- File: utils/csv-export.ts — not used by main flows; either adopt consistently or remove.

5) Package management risks
- File: package.json
  - Many deps pinned to "latest"; risk of breakage on install/CI.
  - Action: Pin to known good versions (use ^ or exact), add dependabot or renovate for PR-based upgrades.

6) Minor correctness / polish
- File: app/layout.tsx (line 28): crossOrigin="" should be crossOrigin="anonymous" for fonts preconnect.
- Script logs throughout client code leak implementation details and hinder performance; guard behind NODE_ENV !== 'production'.

Compatibility with modern Next.js best practices
- Prefer npm-installed libraries and dynamic import over CDN Script tags.
- Use @supabase/ssr createServerClient only with anon key + cookies; use @supabase/supabase-js createClient for service role operations (server only).
- Keep API route logic minimal and typed; push heavy transforms to the data layer or DB.
- Avoid global window access outside effects and expose types via ambient declarations only when necessary.

Proposed fixes and priorities
Immediate (high impact, low effort)
- Add re-export shims for missing feature components (done):
  - components/features/filter-section.tsx → export { FilterSection } from "@/components/filter-section"
  - components/features/stats-section.tsx → export { StatsSection } from "@/components/stats-section"
  - components/features/results-section.tsx → export { ResultsSection } from "@/components/results-section"
- Fix ResultsSection pagination (done): switch to displayedMatches = isServerPaginated ? matches : matches.slice(startIndex, endIndex).

High priority (security and correctness)
- Remove hardcoded Supabase credentials and logging; require env vars and fall back to sample data without attempting network calls if unset.
- Tighten CSP and remove X-Powered-By; avoid 'unsafe-inline'/'unsafe-eval'. Add nonce/sha or component-level script loading.
- In API POST, switch to supabase-js createClient with service role key on the server; never pass it to SSR client helpers.
- Complete API filtering: implement btts=true/false and comeback using SQL or computed views; validate inputs with Zod as already started.

Medium priority (performance/maintainability)
- Centralize match transformation and statistics helpers under lib/.
- Replace CDN scripts with npm packages; dynamically import Chart.js in charts only.
- Replace any with explicit types where feasible; define Supabase row types.
- Remove duplicated headers config; keep a single source of truth.
- Pin dependency versions and set up automated dependency updates.

Lower priority
- Remove legacy/unused files (components/winmix-react-app.tsx) and unused utils or wire them up consistently.
- Reduce sample data or run its generation in a Web Worker during development.
- Add unit tests for pagination logic (both server- and client-paginated flows) and API filters.
- Add a small env validation module (e.g., env.mjs with Zod) and document required env vars in README.

Selected examples (with line references)
- lib/supabase/client.ts: 4–12 (hardcoded URL/key and console logging).
- public/scripts/winmix-app.js: 23–26 (hardcoded URL/key in public bundle).
- middleware.ts: 68–79 (permissive CSP), 91 (X-Powered-By leakage).
- app/api/matches/route.ts: 96–101 (incomplete btts/comeback filtering), 155 (service role with SSR client).
- components/results-section.tsx: 57–62 (fixed pagination logic).
- app/layout.tsx: 34–36 (heavy CDN scripts), 28 (crossOrigin value for fonts).

Closing notes
- The app architecture is solid overall (App Router, SSR/CSR split, Zod, Zustand). The biggest risks are security (hardcoded credentials, CSP) and correctness (broken imports, pagination). Addressing the items above will improve stability, performance, and maintainability while aligning with modern Next.js and Supabase best practices.
