#!/usr/bin/env bash
# Saathi — Hackathon Pre-Submission Validation Script
# Run: ./scripts/submit.sh
# Exit codes: 0 = all pass, 1 = failures detected

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
WARN=0

# Helper functions
check_pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    ((PASS++))
}

check_fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    ((FAIL++))
}

check_warn() {
    echo -e "${YELLOW}⚠ WARN${NC}: $1"
    ((WARN++))
}

check_info() {
    echo -e "${BLUE}ℹ INFO${NC}: $1"
}

section() {
    echo ""
    echo -e "${BLUE}═══ $1 ═══${NC}"
}

# Start validation
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  Saathi — Catalyst Solo AI Hackathon Pre-Submit Validation  ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================================
# SECTION 1: Repository & Files
# ============================================================
section "1. Repository & Required Files"

REQUIRED_FILES=(
    "README.md"
    "HACKATHON_SUBMISSION.md"
    "USER_TESTING_REPORT.md"
    "user-testing-results.json"
    "package.json"
    "tsconfig.json"
    "next.config.ts"
    ".env.example"
    ".gitignore"
    "supabase-schema.sql"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        check_pass "Required file exists: $file"
    else
        check_fail "Missing required file: $file"
    fi
done

# Check scripts directory
if [[ -d "scripts" ]]; then
    check_pass "scripts/ directory exists"
else
    check_fail "scripts/ directory missing"
fi

# Check source structure
if [[ -d "src/app" && -d "src/lib" && -d "src/components" ]]; then
    check_pass "Source structure: src/app, src/lib, src/components present"
else
    check_fail "Source structure incomplete"
fi

# ============================================================
# SECTION 2: Package.json & Dependencies
# ============================================================
section "2. Package.json & Key Dependencies"

if [[ -f "package.json" ]]; then
    # Check key dependencies
    DEPS=(
        "next"
        "react"
        "react-dom"
        "typescript"
        "@google/genai"
        "@supabase/supabase-js"
        "zod"
        "date-fns"
        "uuid"
        "vitest"
        "eslint"
        "prettier"
        "tailwindcss"
    )

    for dep in "${DEPS[@]}"; do
        if grep -q "\"$dep\"" package.json; then
            check_pass "Dependency present: $dep"
        else
            check_fail "Missing dependency: $dep"
        fi
    done

    # Check scripts
    SCRIPTS=("dev" "build" "start" "lint" "typecheck" "test" "format")
    for script in "${SCRIPTS[@]}"; do
        if grep -q "\"$script\"" package.json; then
            check_pass "npm script exists: $script"
        else
            check_fail "Missing npm script: $script"
        fi
    done
else
    check_fail "package.json not found"
fi

# ============================================================
# SECTION 3: Environment & Configuration
# ============================================================
section "3. Environment & Configuration"

# Check .env.example exists and has required vars
if [[ -f ".env.example" ]]; then
    check_pass ".env.example exists"

    REQUIRED_ENV=(
        "GEMINI_API_KEY"
        "GEMINI_MODEL"
        "NEXT_PUBLIC_APP_URL"
        "SUPABASE_URL"
        "SUPABASE_ANON_KEY"
    )

    for var in "${REQUIRED_ENV[@]}"; do
        if grep -q "$var" .env.example; then
            check_pass "Env var documented: $var"
        else
            check_warn "Env var not in .env.example: $var"
        fi
    done
else
    check_fail ".env.example missing"
fi

# Check .env.local is gitignored
if [[ -f ".gitignore" ]] && (grep -q "^\.env\.local$" .gitignore || grep -q "^\.env\*" .gitignore || grep -q "^\.env" .gitignore); then
    check_pass ".env.local is gitignored"
else
    check_fail ".env.local NOT gitignored (security risk)"
fi

# Check .env.local exists locally (for dev)
if [[ -f ".env.local" ]]; then
    check_info ".env.local exists locally (good for dev)"
else
    check_warn ".env.local not found locally (create from .env.example for dev)"
fi

# ============================================================
# SECTION 4: Code Quality Checks
# ============================================================
section "4. Code Quality Checks (TypeScript, Lint, Tests)"

check_info "Running typecheck..."
if npm run typecheck > /dev/null 2>&1; then
    check_pass "TypeScript: 0 errors"
else
    check_fail "TypeScript: errors found (run 'npm run typecheck' for details)"
fi

check_info "Running lint..."
if npm run lint > /dev/null 2>&1; then
    check_pass "ESLint: 0 errors"
else
    check_warn "ESLint: warnings/errors found (non-blocking for hackathon - run 'npm run lint' for details)"
fi

check_info "Running tests..."
if npm test > /dev/null 2>&1; then
    check_pass "Vitest: all tests pass"
else
    check_fail "Vitest: test failures (run 'npm test' for details)"
fi

# ============================================================
# SECTION 5: Build Verification
# ============================================================
section "5. Production Build"

check_info "Running production build..."
if npm run build > /dev/null 2>&1; then
    check_pass "Production build: SUCCESS"
else
    check_fail "Production build: FAILED (run 'npm run build' for details)"
fi

# ============================================================
# SECTION 6: Key Source Files Exist
# ============================================================
section "6. Core Feature Implementation Files"

CORE_FILES=(
    # Barrier Engine
    "src/lib/barrier/classify.fallback.ts"
    "src/lib/barrier/decide.ts"
    "src/lib/barrier/types.ts"

    # Fasting Planner
    "src/lib/fasting/rules.ts"
    "src/lib/fasting/buildPlan.ts"

    # AI Layer
    "src/lib/ai/client.ts"
    "src/lib/ai/schemas.ts"
    "src/lib/ai/fallbacks.ts"

    # Database
    "src/lib/db/repo.ts"
    "src/lib/db/memory.ts"

    # Security
    "src/lib/security/env.ts"
    "src/lib/security/rateLimit.ts"
    "src/lib/security/sanitize.ts"

    # Overlap/Interaction
    "src/lib/overlap/checker.ts"

    # API Routes
    "src/app/api/dose/skip/route.ts"
    "src/app/api/doctor/note/route.ts"
    "src/app/api/fasting/plan/route.ts"
    "src/app/api/elder/[id]/schedule/route.ts"
    "src/app/api/elder/[id]/alerts/route.ts"

    # Elder Screens
    "src/app/elder/page.tsx"
    "src/app/elder/why-skipped/page.tsx"
    "src/app/elder/medicines/page.tsx"

    # Caregiver Screen
    "src/app/caregiver/page.tsx"

    # Accessibility Components
    "src/components/ui/BigButton.tsx"
    "src/components/ui/TextSizeToggle.tsx"
    "src/components/ui/SOSButton.tsx"
    "src/components/ui/SkipReasonCards.tsx"
    "src/components/ui/LanguageSwitcher.tsx"
    "src/components/ui/ContrastToggle.tsx"
)

for file in "${CORE_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        check_pass "Core file exists: $file"
    else
        check_fail "Missing core file: $file"
    fi
done

# ============================================================
# SECTION 7: Accessibility Features Verification
# ============================================================
section "7. Accessibility Features (Code-Level Checks)"

# Check for accessibility patterns in code
A11Y_CHECKS=(
    "TextSizeToggle" "src/components/ui/TextSizeToggle.tsx"
    "SOSButton" "src/components/ui/SOSButton.tsx"
    "SkipReasonCards" "src/components/ui/SkipReasonCards.tsx"
    "LanguageSwitcher" "src/components/ui/LanguageSwitcher.tsx"
    "ContrastToggle" "src/components/ui/ContrastToggle.tsx"
    "speechSynthesis" "src/components/ui/TextSizeToggle.tsx"
    "webkitSpeechRecognition" "src/app/elder/why-skipped/page.tsx"
    "role=\"button\"" "src/components/ui/BigButton.tsx"
    "aria-live" "src/components/ui/BigButton.tsx"
    "min-h-\[64px\]" "src/components/ui/BigButton.tsx"
    "min-w-\[64px\]" "src/components/ui/BigButton.tsx"
)

for i in $(seq 0 2 $((${#A11Y_CHECKS[@]} - 1))); do
    pattern="${A11Y_CHECKS[i]}"
    file="${A11Y_CHECKS[i+1]}"

    if [[ -f "$file" ]] && grep -q "$pattern" "$file"; then
        check_pass "A11y pattern '$pattern' found in $file"
    elif [[ ! -f "$file" ]]; then
        check_warn "A11y file missing: $file"
    else
        check_warn "A11y pattern '$pattern' not found in $file"
    fi
done

# ============================================================
# SECTION 8: Security Checks
# ============================================================
section "8. Security Checks"

# Check for hardcoded secrets
if grep -r "GEMINI_API_KEY\s*=" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | grep -v ".env" | grep -v "process.env" | grep -v "// " | grep -v "validateEnv"; then
    check_fail "Potential hardcoded GEMINI_API_KEY found in source"
else
    check_pass "No hardcoded GEMINI_API_KEY in source"
fi

# Check rate limiting middleware
if [[ -f "src/middleware.ts" ]] && grep -q "rate.limit" src/middleware.ts; then
    check_pass "Rate limiting middleware present"
else
    check_warn "Rate limiting middleware not found or incomplete"
fi

# Check Zod validation on API routes
API_ROUTES=$(find src/app/api -name "route.ts" 2>/dev/null | wc -l)
if [[ $API_ROUTES -gt 0 ]]; then
    ZOD_ROUTES=$(grep -r "zod\|Zod\|parse\|safeParse" src/app/api --include="route.ts" | cut -d: -f1 | sort -u | wc -l)
    if [[ $ZOD_ROUTES -eq $API_ROUTES ]]; then
        check_pass "All $API_ROUTES API routes have Zod validation"
    else
        check_warn "$ZOD_ROUTES/$API_ROUTES API routes have Zod validation"
    fi
else
    check_fail "No API routes found"
fi

# ============================================================
# SECTION 9: Demo & Production URLs
# ============================================================
section "9. URLs & Deployment References"

# Check README has correct URLs
if [[ -f "README.md" ]]; then
    if grep -q "rudrakhairnar16-bit/saathi" README.md; then
        check_pass "README references correct GitHub repo"
    else
        check_fail "README missing GitHub repo reference"
    fi

    if grep -q "1-xi-swart.vercel.app" README.md; then
        check_pass "README references production URL"
    else
        check_warn "README missing production URL reference"
    fi
else
    check_fail "README.md not found"
fi

# Check HACKATHON_SUBMISSION.md exists
if [[ -f "HACKATHON_SUBMISSION.md" ]]; then
    check_pass "HACKATHON_SUBMISSION.md exists"
else
    check_fail "HACKATHON_SUBMISSION.md missing"
fi

# ============================================================
# SECTION 10: Testing Evidence
# ============================================================
section "10. Testing Evidence"

if [[ -f "USER_TESTING_REPORT.md" ]]; then
    check_pass "USER_TESTING_REPORT.md exists"

    # Check for key metrics
    if grep -q "88%" USER_TESTING_REPORT.md; then
        check_pass "Test report contains overall success rate (88%)"
    else
        check_warn "Test report missing overall success rate"
    fi

    if grep -q "FIXED" USER_TESTING_REPORT.md; then
        check_pass "Test report documents fixed issues"
    else
        check_warn "Test report missing fix documentation"
    fi
else
    check_fail "USER_TESTING_REPORT.md missing"
fi

if [[ -f "user-testing-results.json" ]]; then
    check_pass "Raw test data (user-testing-results.json) exists"

    # Validate JSON
    if node -e "JSON.parse(require('fs').readFileSync('user-testing-results.json'))" 2>/dev/null; then
        check_pass "user-testing-results.json is valid JSON"
    else
        check_fail "user-testing-results.json is invalid JSON"
    fi
else
    check_fail "user-testing-results.json missing"
fi

# ============================================================
# SECTION 11: Screenshots Directory
# ============================================================
section "11. Screenshots"

if [[ -d "public/screenshots" ]]; then
    SCREENSHOT_COUNT=$(find public/screenshots -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" 2>/dev/null | wc -l)
    check_pass "Screenshots directory exists with $SCREENSHOT_COUNT images"

    if [[ $SCREENSHOT_COUNT -ge 8 ]]; then
        check_pass "Sufficient screenshots captured ($SCREENSHOT_COUNT/10)"
    else
        check_warn "Only $SCREENSHOT_COUNT screenshots (target: 10)"
    fi
else
    check_warn "public/screenshots/ directory not created yet"
    check_info "Create it and add 10 screenshots per HACKATHON_SUBMISSION.md"
fi

# ============================================================
# SECTION 12: Demo Video
# ============================================================
section "12. Demo Video"

check_warn "MANUAL CHECK REQUIRED: Demo video recorded and uploaded?"
check_info "Add YouTube/Loom/Drive link to HACKATHON_SUBMISSION.md Section 2"

# ============================================================
# SUMMARY
# ============================================================
section "VALIDATION SUMMARY"

echo -e "${GREEN}Passed:${NC} $PASS"
echo -e "${YELLOW}Warnings:${NC} $WARN"
echo -e "${RED}Failed:${NC} $FAIL"
echo ""

if [[ $FAIL -eq 0 ]]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ ALL CHECKS PASSED — READY FOR SUBMISSION                 ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Record demo video (2-3 min) → add link to HACKATHON_SUBMISSION.md"
    echo "  2. Capture 10 screenshots → save to public/screenshots/"
    echo "  3. Submit before hackathon deadline"
    exit 0
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ $FAIL CHECK(S) FAILED — FIX BEFORE SUBMISSION              ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Run individual commands for details:"
    echo "  npm run typecheck"
    echo "  npm run lint"
    echo "  npm test"
    echo "  npm run build"
    exit 1
fi