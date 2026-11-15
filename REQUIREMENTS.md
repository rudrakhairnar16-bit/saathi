# Saathi — Elderly Medication Companion
## Complete Requirements & Specification Document

---

## 1. EXECUTIVE SUMMARY

**Product Name:** Saathi (Hindi for "companion")  
**Tagline:** Not an alarm. A companion.  
**Hackathon:** Catalyst Solo AI Hackathon  
**Repository:** https://github.com/rudrakhairnar16-bit/saathi  
**Production:** https://1-xi-swart.vercel.app  

**One-Liner:** Reminders solve forgetting. Saathi solves all the reasons elders miss medicines.

---

## 2. PROBLEM STATEMENT

### 2.1 Core Problem
Elders miss medicines for **7 distinct reasons** — not just forgetting:
1. **Forgot** — memory lapse
2. **Side effects** — felt unwell after taking
3. **Feels better** — "I'm fine now, don't need it"
4. **Cost / Stock** — medicine finished, too expensive
5. **Swallowing difficulty** — physical barrier
6. **Fear / Belief** — cultural myths, distrust
7. **Other** — travel, routine disruption, etc.

### 2.2 Current Solutions Fail Because
- **Pill alarms** only address Reason #1 (forgetting)
- **Pill boxes** don't capture *why* a dose was missed
- **Family calls** are reactive, not systematic
- **Apps** assume tech literacy (small text, swipe gestures, English-only)

### 2.3 Impact
- **50% non-adherence** in chronic disease (WHO)
- **$300B+ annual cost** in avoidable hospitalizations (US alone)
- **Caregiver burnout** from constant worry/checking

---

## 3. TARGET USERS

### Primary: Elders (65+)
| Segment | Characteristics |
|---------|----------------|
| Low-tech Hindi | 70-80, speaks Hindi/Devanagari, tremor, vision loss, never used smartphone |
| Mixed-tech bilingual | 65-75, understands English+Hindi, can tap but not type, needs large targets |
| Medium-tech | 65-70, comfortable with basics, wants simplicity |

**Accessibility needs:** 20px+ base text, 64px tap targets, AAA contrast, voice input, read-aloud, Hindi-first

### Secondary: Caregivers (25-50)
| Segment | Characteristics |
|---------|----------------|
| Adult child (high tech) | Wants dashboard, trends, alerts, one-tap call |
| Daughter-in-law (mixed) | Manages meds, needs doctor visit summaries |
| Nephew/niece (medium) | Occasional check-in, wants simplicity |

---

## 4. CORE FEATURES (THE "THREE PILLARS")

### 4.1 Kyun Chhoda? — Why Skipped? (Barrier Engine)
**Flow:** Elder taps "Skipped" → Selects reason (Voice / Text / 7 Tap Cards) → Saathi classifies → Takes specific action

| Reason | Elder Response (Hindi/EN) | Caregiver Alert | Doctor Note |
|--------|---------------------------|-----------------|-------------|
| Forgot | "Take it with morning chai" | Missed dose logged | — |
| Side effect | "Rest after medicine, tell doctor" | 🔴 URGENT: Side effect reported | Add to visit summary |
| Feels better | "Medicine keeps you well" | Adherence pattern noted | — |
| Cost/Stock | "Let's refill together" | 🟡 Refill needed | — |
| Swallowing | "Ask doctor for syrup/small pill" | Format issue flagged | Ask about alternatives |
| Fear/Belief | "Many take this safely" | Belief barrier logged | Discuss at visit |
| Other | "Tell me more" | Context captured | — |

**Tech:** Pure domain logic (zero I/O) + Gemini AI with deterministic fallbacks. Works offline.

### 4.2 Doctor Ki Baat — Memory Bridge (Doctor Note Parser)
**Flow:** Caregiver pastes/dictates doctor's words → Returns 5 plain lines + draft medicines + overlap warnings

**Output Structure:**
```
1. [Plain language summary]
2. [Medicine changes]
3. [What to watch for]
4. [Next steps]
5. [When to come back]

Draft Medicines (need your confirmation):
- Metformin 500mg — 1-0-1 with food
- Amlodipine 5mg — 0-0-1 empty stomach OK

⚠️ Overlap Warning: Both affect kidneys — monitor creatinine
```

**Safety:** All AI outputs are DRAFTS. Human confirmation required. No auto-prescribing.

### 4.3 Vrat-Roza-Tyohar Planner (Fasting Planner)
**Flow:** Select occasion → See per-medicine guidance → Confirm with caregiver → Active during fast

**Occasions Supported:** Ekadashi, Navratri, Roza (Ramadan), Paryushan, Karva Chauth, Custom

**Guidance Levels:**
| Level | Meaning | Example |
|-------|---------|---------|
| `with_food` | Take with meal | Metformin, Iron |
| `empty_stomach_ok` | Can take fasting | Thyroxine, Amlodipine |
| `ask_doctor` | **High risk — must ask** | Insulin, Warfarin, Steroids |

**Drug Classes:** 8 classes × 6 occasions = curated rules. High-risk drugs **always** force `ask_doctor`.

---

## 5. ACCESSIBILITY FIRST (NON-NEGOTIABLE)

| Standard | Implementation |
|----------|----------------|
| **Text Size** | 20px base (A) → 24px (A+) → 28px (A++) — persisted in localStorage |
| **Contrast** | WCAG AAA (7:1) — High Contrast mode toggle |
| **Touch Targets** | Minimum 64×64px — all buttons, cards |
| **Font** | Atkinson Hyperlegible (dyslexia-friendly) |
| **Voice Input** | Web Speech API (Hindi `hi-IN`, English `en-IN`) |
| **Read-Aloud** | SpeechSynthesis on every screen |
| **Language** | Hindi (Devanagari) + English — instant switch, no reload |
| **Navigation** | Single column, one task/screen, no swipe/hover-only |
| **Labels** | Icon + text on every control, ARIA live regions |

---

## 6. TECHNICAL ARCHITECTURE

### 6.1 Stack
| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, React 19, TypeScript strict) |
| Styling | Tailwind CSS v4 (design tokens in CSS variables) |
| Validation | Zod (all API inputs/outputs) |
| AI | Google Gemini (`@google/genai`) — v1beta for JSON mode |
| Database | **Smart Factory** — Supabase (prod) / In-memory (dev/offline) |
| Testing | Vitest + React Testing Library (130 tests) |
| Deploy | Vercel (frontend) + Supabase (PostgreSQL) |

### 6.2 Repository Pattern (Smart Factory)
```typescript
// src/lib/db/index.ts
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  return new SupabaseRepository(); // Production
}
return new MemoryRepository(); // Development / Offline / CI
```

### 6.3 Pure Domain Logic (Zero I/O)
```
src/lib/barrier/     → classify, decide, redFlags (pure functions)
src/lib/fasting/     → rules, buildPlan (pure functions)
src/lib/overlap/     → normalize, findOverlaps (pure functions)
```
- 100% testable without mocks
- Deterministic fallbacks when AI unavailable
- No side effects, no network calls

### 6.4 API Routes (7 endpoints)
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/dose/skip` | POST | Classify barrier, decide action, persist SkipReport |
| `/api/doctor/note` | POST | Parse doctor note → 5 lines + draft meds + overlaps |
| `/api/fasting/plan` | POST | Build fasting plan for occasion |
| `/api/elder/[id]/schedule` | GET | Today's dose events |
| `/api/elder/[id]/alerts` | GET | Caregiver alerts |
| `/api/medicine/confirm` | POST | Confirm draft medicine |
| `/api/fasting/confirm` | POST | Confirm fasting plan |

### 6.5 Security
- Server-only secrets (Gemini API key never in browser)
- Rate limiting (consolidated `RateLimiter` class, `|` delimiter)
- Input sanitization + prompt injection defense
- Zod validation on every request

---

## 7. DATA MODEL (Core Entities)

### Person
```typescript
{ id, name, role: 'elder'|'caregiver', language: 'en'|'hi', 
  textSize: 'small'|'medium'|'large', highContrast: boolean }
```

### Medicine
```typescript
{ id, elderId, name, doseText, schedule: 'morning'|'noon'|'evening'|'night',
  withFood: boolean, activeIngredient, drugClass, status: 'active'|'draft' }
```

### DoseEvent
```typescript
{ id, medicineId, elderId, scheduledAt, status: 'pending'|'taken'|'skipped', actedAt }
```

### SkipReport
```typescript
{ id, doseEventId, elderId, reasonText, barrier: BarrierCategory, 
  action: Action, redFlag: boolean, createdAt }
```

### FastingPlan
```typescript
{ id, elderId, occasion, startDate, endDate, items: FastingPlanItem[],
  status: 'draft'|'active'|'completed' }
```

---

## 8. USER FLOWS (DETAILED)

### 8.1 Elder: Take Medicine
```
Home (/elder) 
  → "Take Medicine" big button
  → Medicines list (/elder/medicines)
  → Each card: Medicine name + dose + time + [Taken] [Skipped] [Read Aloud]
  → Tap "Taken" → Green check, undo for 5s
  → Tap "Skipped" → Why Skipped flow
```

### 8.2 Elder: Why Skipped (Kyun Chhoda?)
```
/elder/why-skipped
  Step 1: Choose input — Voice 🎤 | Type 📝 | Tap Cards (7 reasons)
  Step 2: Voice recognition (Hindi/English) → fallback prompt if fails
  Step 3: Submit → AI classifies → Returns action + red flag
  Step 4: Show elder message (Hindi/EN) anchored to routine
         Show caregiver alert / doctor note if applicable
```

### 8.3 Caregiver: Dashboard
```
/caregiver
  → Adherence % (7-day) + trend sparkline
  → Barrier breakdown (forgot: 3, side_effect: 1, etc.)
  → Active alerts (red/yellow/blue cards)
     Each: Reason in 1 line, [Call] [Mark Handled]
  → Pending confirmations (draft meds, fasting plans)
```

### 8.4 Caregiver: Doctor Note
```
/caregiver → "Doctor Visit" 
  → Paste/dictate text
  → Submit → 5 plain lines + draft medicines + overlap warnings
  → Confirm each draft medicine → Becomes active
```

### 8.5 Caregiver: Fasting Planner
```
/caregiver → "Fasting"
  → Select occasion (Navratri, Roza, etc.) + dates
  → Submit → Per-medicine guidance table
     | Medicine | Guidance | Questions for Doctor |
  → Confirm → Active during fast dates
```

---

## 9. TESTING & QUALITY

### 9.1 Test Coverage
- **130 unit/integration tests** (Vitest)
- Pure domain logic: 100% coverage
- API routes: validation, happy paths, rate limits
- UI components: accessibility, interactions

### 9.2 10-User Simulation Results
| Metric | Value |
|--------|-------|
| Overall Success Rate | 88% (57/65 tasks) |
| Elder Success Rate | 80% |
| Caregiver Success Rate | 97% |
| Critical Issues | 0 |
| Major Issues | 2 (both FIXED) |
| Minor Issues | 5 (3 in progress) |

**Fixed Major Issues:**
1. Voice fallback prompt on recognition failure
2. Text size toggle always visible with tooltips

**In-Progress Minor Issues:**
1. Alert reason expand-on-tap
2. 7-day trend sparkline
3. Loading skeletons for cold starts

---

## 10. DEPLOYMENT & OPERATIONS

### 10.1 Environments
| Env | URL | Database |
|-----|-----|----------|
| Production | https://1-xi-swart.vercel.app | Supabase (PostgreSQL) |
| Preview | Vercel preview deployments | Supabase (same) |
| Local Dev | `npm run dev` (localhost:3000) | In-memory |

### 10.2 Environment Variables
```bash
# Required for AI features
GEMINI_API_KEY=xxx
GEMINI_MODEL=gemini-2.5-flash

# Required for Supabase (production)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# Optional: Google Translate (fallback)
GOOGLE_TRANSLATE_API_KEY=xxx
```

### 10.3 CI/CD
- GitHub Actions: typecheck → test → build
- Vercel auto-deploy on push to main
- No manual steps

---

## 11. HACKATHON SUBMISSION CHECKLIST

### Required Deliverables
- [ ] **Demo Video** (90 seconds) — 4 flows recorded
- [ ] **Repository** — https://github.com/rudrakhairnar16-bit/saathi
- [ ] **Live Demo** — https://1-xi-swart.vercel.app
- [ ] **README** — Architecture, setup, features
- [ ] **License** — MIT

### Demo Video Script (90s)
| Time | Scene |
|------|-------|
| 0-10s | "Saathi — medication companion for elders" |
| 10-30s | Elder flow: Home → Medicines → Skipped → Voice "bhool gayi" → Hindi response "सुबह की चाय के साथ लें" |
| 30-50s | Caregiver Dashboard: 87% adherence, barrier breakdown, red alert, one-tap call |
| 50-70s | Doctor Note: Paste text → 5 lines + draft meds + "⚠️ Overlap: Both affect kidneys" |
| 70-90s | Fasting: Navratri → Per-medicine guidance with ask_doctor flags |

### Judging Criteria Alignment
| Criterion | How Saathi Scores |
|-----------|-------------------|
| **AI Innovation** | Barrier classification + doctor parsing + fasting rules — all with deterministic fallbacks |
| **Accessibility** | AAA contrast, 3 text sizes, voice I/O, Hindi-first, 64px targets — built-in, not bolted-on |
| **Real-World Impact** | Solves 7 skip reasons, not just 1; works offline; human-in-the-loop safety |
| **Technical Excellence** | Pure domain logic, smart factory, 130 tests, zero TypeScript errors |
| **Completeness** | End-to-end flows, real Supabase data, production deployed |

---

## 12. FUTURE ROADMAP (POST-HACKATHON)

| Phase | Features |
|-------|----------|
| **v1.1** | WhatsApp integration for caregivers, PDF visit summary export |
| **v1.2** | Multiple elders per caregiver, medicine photo OCR |
| **v2.0** | Caregiver collaboration (shared dashboard), pharmacy integration |
| **v2.1** | AI adherence predictions, personalized nudge timing |
| **v3.0** | Clinical trial mode, doctor portal, insurance reporting |

---

## 13. TEAM & CREDITS

**Built by:** [Your Name] — Solo developer  
**Motivation:** "My mom forgot her BP meds 3 times last month. Alarms didn't help — she needed to tell me *why*."  
**Time Invested:** ~3 weeks (autonomous build-and-iterate)  
**Commits:** 15+ milestones with CI verification  

---

## 14. APPENDICES

### A. Barrier Categories (7)
1. `forgot` — Memory lapse
2. `side_effect` — Adverse reaction
3. `feels_better` — Perceived recovery
4. `cost_or_stock` — Financial/availability
5. `swallowing` — Physical difficulty
6. `fear_or_belief` — Psychological/cultural
7. `other` — Catch-all

### B. Drug Classes (8)
`statin`, `metformin`, `insulin`, `anticoagulant`, `steroid`, `thyroid`, `antihypertensive`, `other`

### C. Fasting Occasions (6)
`ekadashi`, `navratri`, `ramadan`, `paryushan`, `karva_chauth`, `custom`

### D. Red-Flag Symptoms (Auto-escalate)
Chest pain, difficulty breathing, fainting, severe allergic reaction, uncontrolled bleeding, stroke signs

---

**Document Version:** 1.0  
**Last Updated:** 2026-11-15  
**Status:** Production-ready for hackathon submission