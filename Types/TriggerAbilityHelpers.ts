import { TriggeredAbility } from "./AbilityClass";
import { MakeTriggeredAbility } from "./AbilityClassHelpers";
import { EffectUnion } from "./EffectClass";
import { NoneCondition, SelfCondition, TargetType } from "./Types";
import { ToCondition } from "./ToCondition";

export const ETB = (...effects:EffectUnion[]):TriggeredAbility => MakeTriggeredAbility('ETB',SelfCondition,NoneCondition,SelfCondition,...effects)
export const OnAttack = (triggerSourceCondition:TargetType,...effects:EffectUnion[]):TriggeredAbility => MakeTriggeredAbility('OnAttack',ToCondition(triggerSourceCondition),...effects)