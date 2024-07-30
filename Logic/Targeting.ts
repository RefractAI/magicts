import { EffectUnion } from "../Types/EffectClass"
import { CardId } from "../Types/IdCounter"
import { AddChooseInputGameAction } from "../Types/InputTypesHelpers"
import { Card, ConditionSpecification, Effect, EffectKind, ResolutionContext, Target } from "../Types/Types"
import { GetConditionCards, EvaluateNumber } from "./Evaluate"
import { GetCard } from "./GetCard"

export const AddConcreteEffect = (source:CardId, effectType:EffectUnion, kind:EffectKind, parentEffectIndex:number,context:ResolutionContext) =>
{
    const card = GetCard(source)
    const index = card.effects.length
    const targets = TargetTypeToTargets(card, index, effectType.target, context)

    const newContext = {...context, targets:[]}

    const effect:Effect = ({cls:'Effect',targets, type: effectType, source, kind, status:'Pending', effectIndex:index, parentEffectIndex, context:newContext })
    card.effects.push(effect)
}

export const TargetTypeToTargets = (card:Card, sourceEffectIndex:number, spec:ConditionSpecification, context:ResolutionContext):Target[] =>
{
    const allowed = GetConditionCards(card.id, spec, context)

    const emin = EvaluateNumber(card.id, card.id, spec.min, context)
    const emax = EvaluateNumber(card.id, card.id, spec.max, context)

    console.log('Targeting',card,emin,emax,spec,allowed)

    if(allowed.length < emin)
    {
        throw 'No valid targets'
    }

    if(allowed.length > emax && !spec.all)
    {
        //todo enemy choice e.g. discard
        AddChooseInputGameAction(card.controller,"Select targets",card.id,emin,emax,allowed,sourceEffectIndex,'targets',0)
        return [{spec, cls:'Target', status:'Pending', targets:[]}]
    }
    else
    {
        return [{spec, cls:'Target', status:'Complete', targets:allowed}]
    }
}