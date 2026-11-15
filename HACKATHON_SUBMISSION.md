# Saathi — Catalyst Solo AI Hackathon Submission Checklist

**Project:** Saathi — Elderly Medication Companion  
**Repository:** https://github.com/rudrakhairnar16-bit/saathi  
**Production URL:** https://1-xi-swart.vercel.app  
**Hackathon:** Catalyst Solo AI Hackathon (Makers Need More × Google for Developers × Hack2Skill)  
**Submission Date:** 2026-11-15

---

## 1. Required Form Fields (Catalyst Solo AI Hackathon)

| Field | Value | Status |
|-------|-------|--------|
| **Project Name** | Saathi | ✅ |
| **Tagline** | Reminders solve forgetting. Saathi solves all the reasons elders miss medicines. | ✅ |
| **Team Name** | rudrakhairnar16-bit | ✅ |
| **Team Members** | Rudra Khairnar (Solo) | ✅ |
| **Problem Statement** | Elderly patients miss medications due to 7 distinct barriers (forgot, side effects, cost, confusion, fasting, no symptoms, access). Existing apps only provide alarms — they don't understand *why* doses are missed or adapt accordingly. | ✅ |
| **Solution Summary** | Saathi is an AI-powered medication companion that: (1) Classifies skip reasons via voice/text/tap into 7 barrier categories and takes cause-specific action; (2) Converts doctor visits into simple notes + draft medicines + overlap warnings; (3) Plans medicines around fasting days (Ekadashi, Navratri, Roza, Paryushan, Karva Chauth) with per-medicine guidance. Built accessibility-first for low-tech elders (Hindi/English, 20px+ text, 64px taps, AAA contrast, read-aloud, SOS button). | ✅ |
| **Tech Stack** | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Google Gemini API, Supabase (Postgres), Vitest, Zod 4 | ✅ |
| **AI/ML Usage** | Google Gemini 2.5 Flash for: (a) Doctor note → structured extraction (5-line summary + draft medicines); (b) Fasting planner → per-medicine timing guidance + doctor questions; (c) Barrier classification → voice/text → 7 categories. All AI outputs are drafts requiring human confirmation. Deterministic fallbacks work offline without API key. | ✅ |
| **Demo Video URL** | [PLACEHOLDER: Add YouTube/Loom link here before submission] | ⏳ PENDING |
| **Repository URL** | https://github.com/rudrakhairnar16-bit/saathi | ✅ |
| **Deployed URL** | https://1-xi-swart.vercel.app | ✅ |
| **License** | MIT | ✅ |
| **Category** | AI for Social Good / Healthcare / Accessibility | ✅ |

---

## 2. Demo Video Link Placeholder

**Action Required:** Record and upload a 2-3 minute demo video covering:

- [ ] **30s** — Problem & Persona (Kamla Ben, 72, Vadodara)
- [ ] **45s** — Elder Flow: Skip dose → Voice reason (Hindi) → Barrier action
- [ ] **30s** — Elder Flow: Doctor note photo → 5-line summary + draft medicines
- [ ] **30s** — Elder Flow: Fasting planner (Ekadashi) → per-medicine guidance
- [ ] **30s** — Caregiver Dashboard: Adherence %, barrier breakdown, alerts, call button
- [ ] **15s** — Accessibility: Text size toggle, high contrast, read-aloud, Hindi/English switch

**Suggested Platform:** Loom, YouTube (unlisted), or Google Drive  
**Deadline:** Before hackathon submission closes

---

## 3. Tech Stack Summary

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Framework** | Next.js | 16.4.6 | App Router, Server Components, API Routes |
| **UI Library** | React | 19.3.0 | Components, Hooks, Concurrent Features |
| **Language** | TypeScript | 5.x | Type safety across stack |
| **Styling** | Tailwind CSS | 4.3.3 | Utility-first, accessibility-first design |
| **AI/ML** | Google Gemini | 2.5 Flash | Structured extraction, classification, planning |
| **Database** | Supabase (Postgres) | 2.119.0 | Persistent storage, real-time sync |
| **Validation** | Zod | 4.6.7 | Schema validation on all API routes |
| **Testing** | Vitest | 5.1.0 | Unit, integration, accessibility tests |
| **Linting** | ESLint | 9.x | Code quality |
| **Formatting** | Prettier | 3.10.1 | Consistent formatting |
| **Date/Time** | date-fns | 4.4.0 | Fasting calendar, scheduling |
| **IDs** | uuid | 14.0.3 | Unique identifiers |

---

## 4. Key Features List

### Core AI Features
- ✅ **Barrier Engine** — 7-category classifier (forgot, side_effects, cost, confusion, fasting, no_symptoms, access) with cause-specific actions
- ✅ **Memory Bridge** — Doctor note (voice/text/photo) → 5-line summary + draft medicines + duplicate/interaction warnings
- ✅ **Vrat-Roza-Tyohar Planner** — 5 Indian fasting traditions, per-medicine guidance (with food / empty stomach OK / ask doctor) + doctor questions

### Accessibility Features (WCAG 2.1 AAA Target)
- ✅ **Text Size** — 3 levels: A (20px), A+ (24px), A++ (28px) — persistent toggle with labels
- ✅ **Tap Targets** — Minimum 64×64px with 16px spacing
- ✅ **Contrast** — AAA (7:1) + high-contrast mode toggle
- ✅ **Read-Aloud** — speechSynthesis on every screen (Hindi + English)
- ✅ **Voice Input** — Web Speech API with tap-card fallback
- ✅ **Bilingual** — Hindi (Devanagari) + English, instant switch
- ✅ **SOS Button** — Prominent, one-tap emergency contact
- ✅ **Semantic HTML** — Visible focus rings, ARIA live regions, no swipe-only actions

### Offline-First & Resilience
- ✅ **Deterministic Fallbacks** — All AI features work without API key via rule-based logic
- ✅ **In-Memory Store** — Seeded demo data, no external dependency required
- ✅ **Rate Limiting** — Per-IP (20/min global, 10/min AI) + abuse protection
- ✅ **Input Sanitization** — 500 char limit, control char stripping, Zod validation

### Safety & Trust
- ✅ **Human-in-the-Loop** — All AI outputs are drafts requiring confirmation
- ✅ **Deterministic High-Risk Rules** — Fasting guidance, interaction checks use pure functions
- ✅ **Emergency Messages** — Red-flag detection (chest pain, severe allergic reaction, etc.)
- ✅ **Fictional Data Only** — No real PII in seed data

---

## 5. Testing Evidence

| Test Artifact | Location | Status |
|---------------|----------|--------|
| **10-User Simulation Report** | `USER_TESTING_REPORT.md` | ✅ Complete |
| **Raw Test Data (JSON)** | `user-testing-results.json` | ✅ Complete |
| **Unit Tests** | `npm test` (Vitest) | ✅ Passing |
| **Type Checking** | `npm run typecheck` | ✅ Passing |
| **Linting** | `npm run lint` | ✅ Passing |
| **Accessibility Audit** | Lighthouse/axe on elder screens | ✅ ≥95 target |

### 10-User Simulation Results Summary
- **Overall Success Rate:** 88% (57/65 tasks)
- **Elder Success Rate:** 80% (28/35) — *Major issues FIXED*
- **Caregiver Success Rate:** 97% (29/30)
- **Critical Issues:** 0
- **Major Issues:** 2 (both fixed: voice fallback UX, text size discoverability)
- **Minor Issues:** 5 (documented for post-hackathon)

**Report Link:** `USER_TESTING_REPORT.md` (in repository root)

---

## 6. Screenshots Needed

| Screenshot | Description | Location in App | Status |
|------------|-------------|-----------------|--------|
| 1 | Elder Home — Medicine list with large cards | `/elder` | ⏳ PENDING |
| 2 | Why Skipped — Tap reason cards (Hindi) | `/elder/why-skipped` | ⏳ PENDING |
| 3 | Doctor Note — Voice input + extracted summary | `/elder/doctor-note` | ⏳ PENDING |
| 4 | Vrat Planner — Fasting day with per-medicine guidance | `/elder/vrat-plan` | ⏳ PENDING |
| 5 | Caregiver Dashboard — Adherence %, barriers, alerts | `/caregiver` | ⏳ PENDING |
| 6 | Accessibility — Text size A/A+/A++, high contrast | Header (all screens) | ⏳ PENDING |
| 7 | SOS Button — Prominent emergency contact | Header (elder screens) | ⏳ PENDING |
| 8 | Hindi/English Toggle | Header (all screens) | ⏳ PENDING |
| 9 | Read-Aloud in Action | Any elder screen | ⏳ PENDING |
| 10 | Mobile Responsive — All screens on phone viewport | All routes | ⏳ PENDING |

**Instructions:** Capture at 1280×720 minimum, save as PNG in `public/screenshots/` (create folder)

---

## 7. Submission Timeline

| Date | Milestone | Status |
|------|-----------|--------|
| **2026-11-10** | Project kickoff | ✅ Done |
| **2026-11-12** | Core features complete (Barrier Engine, Memory Bridge, Fasting Planner) | ✅ Done |
| **2026-11-13** | Accessibility implementation (AAA, read-aloud, voice, SOS) | ✅ Done |
| **2026-11-14** | Production deploy to Vercel + Supabase integration | ✅ Done |
| **2026-11-15** | 10-user simulation testing | ✅ Done |
| **2026-11-15** | Major fixes applied (voice fallback, text size discoverability) | ✅ Done |
| **2026-11-15** | **Create submission artifacts (this file + submit.sh)** | 🔄 In Progress |
| **2026-11-15** | Record demo video | ⏳ PENDING |
| **2026-11-15** | Capture screenshots | ⏳ PENDING |
| **2026-11-15** | Final verification & submit | ⏳ PENDING |
| **Hackathon Deadline** | Submit before cutoff | ⏳ PENDING |

---

## 8. Pre-Submit Verification Checklist

Run `./scripts/submit.sh` to validate all requirements automatically.

### Manual Verification

#### Repository & Deployment
- [ ] Repository is public: https://github.com/rudrakhairnar16-bit/saathi
- [ ] Production URL works: https://1-xi-swart.vercel.app
- [ ] All elder routes accessible: `/elder`, `/elder/why-skipped`, `/elder/doctor-note`, `/elder/vrat-plan`
- [ ] Caregiver dashboard accessible: `/caregiver`
- [ ] API routes respond: `/api/dose/skip`, `/api/doctor/note`, `/api/fasting/plan`, `/api/elder/[id]/schedule`, `/api/elder/[id]/alerts`

#### Functionality
- [ ] Skip dose → voice reason (Hindi) → barrier classification → action
- [ ] Skip dose → tap reason card → barrier classification → action
- [ ] Doctor note (voice) → 5-line summary + draft medicines
- [ ] Doctor note (text) → overlap/interaction warnings
- [ ] Fasting planner (Ekadashi) → per-medicine timing guidance
- [ ] Fasting planner → doctor questions generated
- [ ] Caregiver dashboard shows adherence %, barrier breakdown, alerts
- [ ] Caregiver call button opens dialer

#### Accessibility
- [ ] Text size toggle: A / A+ / A++ works and persists
- [ ] High contrast mode toggle works
- [ ] Hindi/English toggle works instantly
- [ ] Read-aloud works on all elder screens (test Hindi + English)
- [ ] Voice input works + tap card fallback visible on error
- [ ] SOS button visible and functional
- [ ] All tap targets ≥ 64×64px
- [ ] Body text ≥ 20px at default (A)
- [ ] Focus rings visible on all interactive elements
- [ ] No horizontal scroll on mobile (375px width)

#### Code Quality
- [ ] `npm run typecheck` — passes with 0 errors
- [ ] `npm run lint` — passes with 0 errors
- [ ] `npm test` — all tests pass
- [ ] `npm run build` — production build succeeds

#### Security
- [ ] `GEMINI_API_KEY` not in repository (only in Vercel env)
- [ ] `.env.local` not committed (in `.gitignore`)
- [ ] Rate limiting active on API routes
- [ ] Zod validation on all API inputs
- [ ] Security headers present (check devtools Network tab)

#### Documentation
- [ ] `README.md` complete and accurate
- [ ] `HACKATHON_SUBMISSION.md` complete (this file)
- [ ] `USER_TESTING_REPORT.md` complete
- [ ] Demo video recorded and linked
- [ ] Screenshots captured and saved

---

## 9. Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server at localhost:3000

# Testing & Quality
npm run typecheck        # TypeScript check
npm run lint             # ESLint
npm test                 # Vitest tests
npm run test:watch       # Watch mode

# Production
npm run build            # Production build
npm start                # Start production server

# Submission Validation
./scripts/submit.sh      # Run full pre-submit checklist
```

---

## 10. Submission Script Usage

```bash
# Make executable (first time only)
chmod +x scripts/submit.sh

# Run validation
./scripts/submit.sh

# Output: PASS/FAIL for each check + summary
```

**Exit codes:**
- `0` — All checks passed, ready to submit
- `1` — One or more checks failed, review output

---

## 11. Post-Submission

- [ ] Share demo video link in hackathon submission form
- [ ] Share repository link
- [ ] Share deployed URL
- [ ] Monitor for judge questions/feedback
- [ ] Prepare for potential live demo/Q&A

---

**Last Updated:** 2026-11-15  
**Prepared by:** Rudra Khairnar (rudrakhairnar16-bit)  
**Status:** 🟡 Ready for final artifacts (video + screenshots) → Submit