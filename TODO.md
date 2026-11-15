# Saathi - Autonomous Build Checklist

## Milestone 0: Project Scaffold & Config
- [ ] 0.1 Initialize Next.js 16 (App Router, TS strict, Tailwind v4, ESLint, src/, @/* alias)
- [ ] 0.2 Install dependencies: zod, @google/genai, date-fns, uuid, vitest, testing libs
- [ ] 0.3 Configure package.json scripts (dev, build, typecheck, test, lint, format)
- [ ] 0.4 Add .env.example, .gitignore, next.config.ts, tailwind.config.ts, tsconfig.json
- [ ] 0.5 Configure globals.css with design tokens (fonts, colors, spacing)
- [ ] 0.6 Verify: `npm run build` passes

## Milestone 1: Types & Data Layer (Pure)
- [ ] 1.1 Define all shared types in `src/types/index.ts` (Person, Medicine, DoseEvent, SkipReport, VisitNote, FastingPlan, Alert, Barrier, Action)
- [ ] 1.2 Create Repository interface in `src/lib/db/repo.ts`
- [ ] 1.3 Implement in-memory adapter in `src/lib/db/memory.ts` with seeded fictional data
- [ ] 1.4 Unit tests for repository CRUD operations

## Milestone 2: Domain Logic - Barrier Engine (Pure)
- [ ] 2.1 Barrier types & classify function in `src/lib/barrier/types.ts`
- [ ] 2.2 Fallback keyword classifier in `src/lib/barrier/classify.fallback.ts` (Hindi/English/mixed)
- [ ] 2.3 Gemini classifier in `src/lib/barrier/classify.gemini.ts` with Zod schema
- [ ] 2.4 Decide action logic in `src/lib/barrier/decide.ts` (pure)
- [ ] 2.5 Red-flag symptom detector in `src/lib/barrier/redFlags.ts`
- [ ] 2.6 Unit tests: all 7 categories, red flags, fallback accuracy

## Milestone 3: Domain Logic - Fasting Planner (Pure)
- [ ] 3.1 Fasting types & rules table in `src/lib/fasting/rules.ts`
- [ ] 3.2 Build plan function in `src/lib/fasting/buildPlan.ts` (pure, forces ask_doctor for high-risk)
- [ ] 3.3 Gemini enhancer in `src/lib/fasting/enhance.gemini.ts` (adds phrasing/questions, cannot lower risk)
- [ ] 3.4 Unit tests: all occasions, high-risk drugs force ask_doctor

## Milestone 4: Domain Logic - Overlap Checker (Pure)
- [ ] 4.1 Active ingredient normalization in `src/lib/overlap/normalize.ts`
- [ ] 4.2 Find overlaps function in `src/lib/overlap/checker.ts` (duplicates + curated risky pairs)
- [ ] 4.3 Unit tests: duplicate paracetamol, unrelated drugs ignored

## Milestone 5: AI Layer (Server-only)
- [ ] 5.1 Gemini client in `src/lib/ai/client.ts` (server-only, rate limited)
- [ ] 5.2 Prompts in `src/lib/ai/prompts.ts` (barrier, doctor note, fasting)
- [ ] 5.3 Zod response schemas in `src/lib/ai/schemas.ts`
- [ ] 5.4 Fallback implementations in `src/lib/ai/fallbacks.ts`
- [ ] 5.5 Sanitizer & rate limiter in `src/lib/security/`

## Milestone 6: API Routes
- [ ] 6.1 POST /api/dose/skip - classify barrier, decide action, persist SkipReport
- [ ] 6.2 POST /api/doctor/note - parse note, return 5 lines + draft medicines + overlaps
- [ ] 6.3 POST /api/fasting/plan - build fasting plan, return draft
- [ ] 6.4 GET /api/elder/[id]/schedule - today's doses
- [ ] 6.5 GET /api/elder/[id]/alerts - caregiver alerts
- [ ] 6.6 POST /api/medicine/confirm - confirm draft medicine
- [ ] 6.7 POST /api/fasting/confirm - confirm fasting plan

## Milestone 7: Elder UI (Accessibility-First)
- [ ] 7.1 Layout: (elder) route group with providers
- [ ] 7.2 Home: 3 big buttons (Take Medicine, Talk to Saathi, I Need Help) + sticky SOS
- [ ] 7.3 Medicine list: Big Taken/Skipped buttons, undo, read-aloud
- [ ] 7.4 Why-skipped flow: voice + text + 7 tap cards, shows action
- [ ] 7.5 Doctor note: paste/dictate -> 5 lines + draft medicines + overlap warnings
- [ ] 7.6 Vrat planner: select occasion -> see plan with draft banner -> confirm
- [ ] 7.7 Accessibility: TextSizeToggle (A/A+/A++), ContrastToggle, language switcher (EN/HI)
- [ ] 7.8 All screens: 20px+ body, 64px taps, AAA contrast, semantic HTML, aria-live

## Milestone 8: Caregiver UI
- [ ] 8.1 Layout: (caregiver) route group
- [ ] 8.2 Dashboard: adherence (7 days), barrier breakdown, active alerts, pending confirmations
- [ ] 8.3 Alert cards: reason in one sentence, Call + Mark handled buttons
- [ ] 8.4 Accessibility: 16px min, readable charts with text alternatives

## Milestone 9: Tests, CI, Build
- [ ] 9.1 Vitest config, unit tests for all pure modules
- [ ] 9.2 API route tests (validation, happy paths, rate limit)
- [ ] 9.3 GitHub Actions CI: typecheck, test, build
- [ ] 9.4 `npm run build` passes clean

## Milestone 10: Deploy & Security
- [ ] 10.1 Deploy to Vercel, set GEMINI_API_KEY, GEMINI_MODEL
- [ ] 10.2 Run Strix scan on preview URL
- [ ] 10.3 Lighthouse/axe accessibility audit (target 95+)
- [ ] 10.4 Graphify map for README architecture diagram
- [ ] 10.5 Fix findings, README polish
- [ ] 10.6 Submit attempt 1

---

## Completed Milestones
<!-- Updated after each commit -->