export const CounterTypes = ['PlusOnePlusOne','MinusOneMinusOne','Poison','Energy','Flying','Stun'] as const;
export type CounterType = typeof CounterTypes[number];