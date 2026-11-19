export interface CaseFile {
  id: string;
  title: string;
  difficulty: 1 | 2 | 3;
  brief: string;
  dataset: string[];
  hint: string;
  unlocks: string;
}

export const CASE_FILES: CaseFile[] = [
  {
    id: 'ghost-market',
    title: 'Case 1 — The Ghost Market',
    difficulty: 1,
    brief: 'Kajasa County awarded KSh 84M for an Eastleigh market upgrade. The site is still mud. You have 3 audit days.',
    dataset: ['tenders', 'vendors', 'payments', 'geotagged photos', 'matatu trip counts'],
    hint: 'JOIN tenders to vendors to payments. GROUP BY director to find shell firms. Beware the seasonal rain spike.',
    unlocks: 'Whistleblower perk — reduces heat on exposure.',
  },
  {
    id: 'duplicate-payroll',
    title: 'Case 2 — Duplicate Payroll',
    difficulty: 2,
    brief: 'A county department pays 312 staff but 29 names appear twice with different phone numbers. Clean the mess before accusing anyone.',
    dataset: ['payroll', 'staff registry', 'bank transfers'],
    hint: 'Normalise phone formats first; then find duplicate national-ID fragments, not duplicate names.',
    unlocks: 'Analyst skill track.',
  },
  {
    id: 'influencer-loop',
    title: 'Case 3 — The Narrative Laundry',
    difficulty: 3,
    brief: 'Two influencers are driving a smear campaign against a rival vendor. Trace the payments without tipping them off.',
    dataset: ['campaigns', 'payments', 'sentiment time series', 'follower graph'],
    hint: 'Correlate payment timestamps with sentiment inflections; allow for a 2–3 tick lag.',
    unlocks: 'Fixer skill track + access to Dr. Gaucho.',
  },
];
