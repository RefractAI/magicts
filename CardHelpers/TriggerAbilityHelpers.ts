import { TriggeredAbility } from "../Types/AbilityTypes";
import { MakeTriggeredAbility } from "./AbilityClassHelpers";
import { EffectUnion } from "../Types/EffectTypes";
import { TargetType } from "../Types/ConditionTypes";
import { SelfCondition } from "../Types/ConditionHelpers";
import { ToCondition } from "../Types/ToCondition";

export const ETB = (...effects:EffectUnion[]):TriggeredAbility => MakeTriggeredAbility('ETB',SelfCondition,...effects)
export const OnAttack = (triggerSourceCondition:TargetType,...effects:EffectUnion[]):TriggeredAbility => MakeTriggeredAbility('OnAttack',ToCondition(triggerSourceCondition),...effects)