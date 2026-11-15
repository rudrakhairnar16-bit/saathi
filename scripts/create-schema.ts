#!/usr/bin/env npx tsx
/**
 * Create Supabase Schema — Saathi
 * Runs the schema SQL directly via Supabase client
 * Run: npx tsx scripts/create-schema.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load env
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const sb = createClient(url, key);

const schema = readFileSync(resolve(__dirname, '../supabase-schema.sql'), 'utf-8');

// Split by semicolon and run each statement
const statements = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`📋 Running ${statements.length} SQL statements...\n`);

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  if (!stmt) continue;

  try {
    const { error } = await sb.rpc('exec_sql', { sql: stmt });
    if (error) {
      // Try direct query if rpc doesn't exist
      const { error: err2 } = await sb.from('_dummy').select('*').limit(0); // This won't work for DDL
      console.log(`  ⚠️  Statement ${i + 1}: ${error.message}`);
    } else {
      console.log(`  ✅ Statement ${i + 1} executed`);
    }
  } catch (e) {
    console.log(`  ⚠️  Statement ${i + 1} error: ${e instanceof Error ? e.message : 'Unknown'}`);
  }
}

console.log('\n⚠️  Note: DDL statements need to be run via Supabase Dashboard SQL Editor');
console.log('   Go to: https://supabase.com/dashboard/project/xbekvrwgilrmrtkggqpq/sql/new');
console.log('   Paste the contents of supabase-schema.sql and click Run');

process.exit(0);