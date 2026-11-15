-- Saathi Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- People table (elders, caregivers, doctors)
-- ============================================================================
CREATE TABLE IF NOT EXISTS people (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('elder', 'caregiver', 'doctor')),
  name TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('en', 'hi')),
  elder_id TEXT REFERENCES people(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Medicines table
-- ============================================================================
CREATE TABLE IF NOT EXISTS medicines (
  id TEXT PRIMARY KEY,
  elder_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  active_ingredient TEXT NOT NULL,
  drug_class TEXT NOT NULL,
  dose_text TEXT NOT NULL,
  times TEXT[] NOT NULL,
  with_food BOOLEAN NOT NULL,
  prescribed_by TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Dose Events table
-- ============================================================================
CREATE TABLE IF NOT EXISTS dose_events (
  id TEXT PRIMARY KEY,
  medicine_id TEXT NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  elder_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('taken', 'skipped', 'pending')),
  acted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Skip Reports table
-- ============================================================================
CREATE TABLE IF NOT EXISTS skip_reports (
  id TEXT PRIMARY KEY,
  dose_event_id TEXT NOT NULL REFERENCES dose_events(id) ON DELETE CASCADE,
  elder_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('en', 'hi')),
  category TEXT NOT NULL CHECK (category IN ('forgot', 'side_effect', 'feels_better', 'cost_or_stock', 'swallowing', 'fear_or_belief', 'other')),
  confidence NUMERIC(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  red_flag BOOLEAN NOT NULL DEFAULT FALSE,
  action JSONB NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('gemini', 'fallback')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Visit Notes table
-- ============================================================================
CREATE TABLE IF NOT EXISTS visit_notes (
  id TEXT PRIMARY KEY,
  elder_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  simple_lines TEXT[] NOT NULL,
  draft_medicines JSONB NOT NULL DEFAULT '[]',
  "overlaps" JSONB NOT NULL DEFAULT '[]',
  source TEXT NOT NULL CHECK (source IN ('gemini', 'fallback')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Fasting Plans table
-- ============================================================================
CREATE TABLE IF NOT EXISTS fasting_plans (
  id TEXT PRIMARY KEY,
  elder_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  occasion TEXT NOT NULL CHECK (occasion IN ('ekadashi', 'navratri', 'roza', 'paryushan', 'karva_chauth', 'custom')),
  date DATE NOT NULL,
  entries JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'confirmed')),
  source TEXT NOT NULL CHECK (source IN ('gemini', 'fallback')),
  confirmed_by TEXT REFERENCES people(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Alerts table
-- ============================================================================
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  elder_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'urgent')),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================================
-- Indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_people_elder_id ON people(elder_id);
CREATE INDEX IF NOT EXISTS idx_medicines_elder_id ON medicines(elder_id);
CREATE INDEX IF NOT EXISTS idx_dose_events_elder_id ON dose_events(elder_id);
CREATE INDEX IF NOT EXISTS idx_dose_events_scheduled_at ON dose_events(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_skip_reports_elder_id ON skip_reports(elder_id);
CREATE INDEX IF NOT EXISTS idx_visit_notes_elder_id ON visit_notes(elder_id);
CREATE INDEX IF NOT EXISTS idx_fasting_plans_elder_id ON fasting_plans(elder_id);
CREATE INDEX IF NOT EXISTS idx_alerts_elder_id ON alerts(elder_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);

-- ============================================================================
-- Row Level Security (RLS) - Optional but recommended for production
-- ============================================================================
-- ALTER TABLE people ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE dose_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE skip_reports ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE visit_notes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE fasting_plans ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;