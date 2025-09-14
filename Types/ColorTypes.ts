import { ColorVariableName } from "./ConditionTypes"

export const ColorNames = ['White','Blue','Black','Red','Green','Colorless'] as const
export type Color = typeof ColorNames[number]
export type ColorDef = Color | ColorVariableName