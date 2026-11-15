/**
 * Unit Tests — Barrier Decide Action
 * Tests the pure decision logic
 */

import { describe, it, expect } from 'vitest';
import { decideAction, decideRedFlagAction, makeDecision } from './decide';
import type { Barrier, Language } from '@/types';
import type { DecisionContext } from './types';

const mockContext: DecisionContext = {
  elderId: 'elder1',
  medicineId: 'med1',
  doseTime: '08:00',
  previousSkips: 0,
  barrierHistory: [],
  language: 'en',
};

describe('decideAction', () => {
  it('returns appropriate action for "forgot" category', () => {
    const action = decideAction('forgot', mockContext);
    expect(action.elderMessage).toContain('morning tea');
    expect(action.reminderShiftMinutes).toBe(15);
    expect(action.caregiverAlert).toContain('forgetting');
  });

  it('returns appropriate action for "side_effect" category', () => {
    const action = decideAction('side_effect', mockContext);
    expect(action.elderMessage).toContain('doctor');
    expect(action.elderMessage).toContain('NOT stop');
    expect(action.caregiverAlert).toContain('side effect');
    expect(action.doctorNote).toBeDefined();
  });

  it('returns appropriate action for "feels_better" category', () => {
    const action = decideAction('feels_better', mockContext);
    expect(action.elderMessage).toContain('better');
    expect(action.elderMessage).toContain('doctor');
    expect(action.caregiverAlert).toContain('chronic');
  });

  it('returns appropriate action for "cost_or_stock" category', () => {
    const action = decideAction('cost_or_stock', mockContext);
    expect(action.elderMessage).toContain('caregiver');
    expect(action.refillAlert).toBeDefined();
    expect(action.doctorNote).toContain('generic');
  });

  it('returns appropriate action for "swallowing" category', () => {
    const action = decideAction('swallowing', mockContext);
    expect(action.elderMessage).toContain('syrup');
    expect(action.doctorNote).toContain('alternative formulation');
  });

  it('returns appropriate action for "fear_or_belief" category', () => {
    const action = decideAction('fear_or_belief', mockContext);
    expect(action.elderMessage).toContain('understand');
    expect(action.caregiverAlert).toContain('Fear or belief');
  });

  it('returns appropriate action for "other" category', () => {
    const action = decideAction('other', mockContext);
    expect(action.elderMessage).toContain('sharing');
    expect(action.caregiverAlert).toContain('Follow-up');
  });

  it('anchors to correct routine for morning dose', () => {
    const morningContext = { ...mockContext, doseTime: '07:30' };
    const action = decideAction('forgot', morningContext);
    expect(action.elderMessage).toContain('morning tea');
  });

  it('anchors to correct routine for evening dose', () => {
    const eveningContext = { ...mockContext, doseTime: '19:00' };
    const action = decideAction('forgot', eveningContext);
    // 19:00 falls in dinner range (17-20)
    expect(action.elderMessage).toContain('dinner');
  });

  it('anchors to correct routine for night dose', () => {
    const nightContext = { ...mockContext, doseTime: '22:00' };
    const action = decideAction('forgot', nightContext);
    expect(action.elderMessage).toContain('bedtime');
  });

  it('escalates caregiver alert for recurring same barrier', () => {
    const recurringContext = {
      ...mockContext,
      barrierHistory: ['side_effect', 'side_effect', 'side_effect'] as Barrier[],
    };
    const action = decideAction('side_effect', recurringContext);
    expect(action.caregiverAlert).toContain('RECURRING');
    expect(action.caregiverAlert).toContain('4 instances');
  });

  it('adds adherence concern for many previous skips', () => {
    const manySkipsContext = { ...mockContext, previousSkips: 5 };
    const action = decideAction('forgot', manySkipsContext);
    expect(action.caregiverAlert).toContain('adherence concern');
    expect(action.caregiverAlert).toContain('5 skips');
  });

  it('returns Hindi messages for Hindi language', () => {
    const hindiContext = { ...mockContext, language: 'hi' as Language };
    const action = decideAction('forgot', hindiContext);
    expect(action.elderMessage).toContain('दैनिक');
  });
});

describe('decideRedFlagAction', () => {
  it('returns emergency message in English', () => {
    const action = decideRedFlagAction('en');
    expect(action.elderMessage).toContain('EMERGENCY');
    expect(action.elderMessage).toContain('Call your doctor');
    expect(action.caregiverAlert).toContain('URGENT');
    expect(action.doctorNote).toContain('Urgent clinical review');
  });

  it('returns emergency message in Hindi', () => {
    const action = decideRedFlagAction('hi');
    expect(action.elderMessage).toContain('आपातकाल');
    expect(action.elderMessage).toContain('डॉक्टर');
  });
});

describe('makeDecision', () => {
  it('returns red flag action when redFlag is true', () => {
    const result = makeDecision('forgot', true, mockContext);
    expect(result.redFlag).toBe(true);
    expect(result.action.elderMessage).toContain('EMERGENCY');
  });

  it('returns normal action when redFlag is false', () => {
    const result = makeDecision('forgot', false, mockContext);
    expect(result.redFlag).toBe(false);
    expect(result.action.elderMessage).toContain('morning tea');
  });
});