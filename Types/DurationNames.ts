export const DurationNames = ['None','Permanent','UntilEndOfTurn'] as const;
export type DurationName = typeof DurationNames[number];