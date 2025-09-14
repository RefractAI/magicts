export const Selectables = ['None','Allowed','Selected','Source','Other','Paired'] as const
export type Selectable = typeof Selectables[number];