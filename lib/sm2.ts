/**
 * SM-2 Algorithm Implementation
 * Based on SuperMemo 2 algorithm for Spaced Repetition.
 */

interface SM2Input {
  quality: number; // 0-5 rating (we use 1-4 in UI, mapping internal: 1=>0, 2=>3, 3=>4, 4=>5)
  lastInterval: number;
  lastRepetition: number;
  lastEfactor: number;
}

interface SM2Output {
  interval: number;
  repetition: number;
  efactor: number;
  nextReviewDate: Date;
}

export function calculateSM2({ quality, lastInterval, lastRepetition, lastEfactor }: SM2Input): SM2Output {
  let newInterval: number = 0;
  let newRepetition: number = 0;
  let newEfactor: number = lastEfactor; // Unused in FSRS-lite but kept
  let nextReviewDate = new Date();

  // --- Constants ---
  const STEP_1_MIN = 1;
  const STEP_2_MIN = 10;
  const GRADUATE_INTERVAL = 1; // 1 Day
  const EASY_INTERVAL = 4; // 4 Days

  // --- Logic ---

  // 1. Learning Phase (Interval < 1 day)
  if (lastInterval < 1) {
    if (quality === 0) {
      // Again: Reset to Step 1 (1 min)
      newInterval = 0;
      newRepetition = 0;
      nextReviewDate.setMinutes(nextReviewDate.getMinutes() + STEP_1_MIN);
    } else if (quality === 3) { // Hard (UI 2)
      // Hard in learning: Repeat current step avg? Or just repeat step?
      // Let's repeat the current delay but explicitly.
      // If rep=0 (1m step), do 1m. If rep=1 (10m step), do 10m.
      newInterval = 0;
      newRepetition = lastRepetition;
      const delay = lastRepetition === 0 ? STEP_1_MIN : STEP_2_MIN;
      nextReviewDate.setMinutes(nextReviewDate.getMinutes() + delay);
    } else if (quality === 4) { // Good (UI 3)
      if (lastRepetition === 0) {
        // Step 1 -> Step 2 (10 min)
        newInterval = 0;
        newRepetition = 1;
        nextReviewDate.setMinutes(nextReviewDate.getMinutes() + STEP_2_MIN);
      } else {
        // Step 2 -> Graduate (1 Day)
        newInterval = GRADUATE_INTERVAL;
        newRepetition = 1; // Reset rep count for Review phase counting? Or keep growing? FSRS uses explicit logic. Let's keep 1 to signify "Just Graduated".
        nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
      }
    } else if (quality >= 5) { // Easy (UI 4)
      // Immediate Graduation
      newInterval = EASY_INTERVAL;
      newRepetition = 1;
      nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
    }

    return { interval: newInterval, repetition: newRepetition, efactor: 2.5, nextReviewDate };
  }

  // 2. Review Phase (Interval >= 1 day)

  if (quality === 0) { // Again
    // LAPSE: Back to Learning Step 0
    newInterval = 0;
    newRepetition = 0;
    nextReviewDate.setMinutes(nextReviewDate.getMinutes() + STEP_1_MIN);
  } else {
    // Continuing Review
    let multiplier = 2.5; // Default Good
    if (quality === 3) multiplier = 1.2; // Hard
    if (quality === 4) multiplier = 2.5; // Good
    if (quality >= 5) multiplier = 3.5; // Easy

    const computedNew = Math.round(lastInterval * multiplier);
    // Ensure strict progress (at least +1 day) unless Hard? 
    // Hard (1.2) on 1 day = 1.2 -> 1. User complained about stagnation maybe?
    // Let's ensure strict > lastInterval for Good/Easy.
    // For Hard, allow same interval if low.

    newInterval = Math.max(quality === 3 ? lastInterval : lastInterval + 1, computedNew);

    newRepetition = lastRepetition + 1;
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
  }

  return {
    interval: newInterval,
    repetition: newRepetition,
    efactor: newEfactor,
    nextReviewDate
  };
}

// Helper to map UI rating (1-4) to SM-2 quality (0-5)
export function mapRatingToQuality(uiRating: number): number {
  switch (uiRating) {
    case 1: return 0; // Forgot / Fail -> 0
    case 2: return 3; // Hard -> 3 (Pass but difficult)
    case 3: return 4; // Good -> 4
    case 4: return 5; // Easy -> 5
    default: return 0;
  }
}
