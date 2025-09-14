import { EffectUnion } from "../Types/EffectTypes"
import { CardId } from "../Types/IdCounter"
import { AddChooseInputGameAction } from "../Types/InputTypesHelpers"
import { Card } from "../Types/CardTypes"
import { Effect, EffectKind } from "../Types/EffectTypes"
import { ResolutionContext } from "../Types/CardTypes"
import { GetConditionCards, EvaluateNumber } from "./Evaluate"
import { GetCard } from "./GetCard"

export const AddConcreteEffect = (source:CardId, effectType:EffectUnion, kind:EffectKind, parentEffectIndex:number,context:ResolutionContext) =>
{
    const card = GetCard(source)
    const index = card.effects.length
    const targets = TargetTypeToTargets(card, index, effectType, context)

    const newContext = {...context, targets}

    const effect:Effect = ({cls:'Effect'
        , type: effectType
        , source, kind
        , status:'Pending'
        , executionCount:0
        , effectIndex:index
        , parentEffectIndex
        , context:newContext
        , selectedThenEffects: [...effectType.thenEffects] 
    })
    card.effects.push(effect)
}

export const TargetTypeToTargets = (card:Card, sourceEffectIndex:number, effectType:EffectUnion, context:ResolutionContext):CardId[][] =>
{
    const allowed = GetConditionCards(card.id, effectType.target, context, effectType.target.doesTarget)

    const emin = EvaluateNumber(card.id, card.id, effectType.target.min, context)
    const emax = EvaluateNumber(card.id, card.id, effectType.target.max, context)

    console.log('Targeting',card.id,"Allowed:",allowed)

    if(allowed.length < emin)
    {
        throw 'No valid targets'+JSON.stringify(effectType)
    }

    //If condition is single
    if(!effectType.target.all)
    {
        console.log('Targeting',JSON.stringify(effectType.target))
        //Ask the client to select targets. If the number of targets is equal to the minimum, the client will auto-respond.
        AddChooseInputGameAction(card.controller,"Select targets",card.id,emin,emax,allowed,sourceEffectIndex,'targets',0,effectType.target.validationFunction)
        return [[]]
    }
    else
    {
        return [allowed]
    }
}

export const DetermineTargetLegality = (effect:Effect) =>
{
    const card = GetCard(effect.source)
    const targets = effect.context.targets
    //If the effect targets, we need to check protection from the source
    const allowed = GetConditionCards(card.id, effect.type.target, effect.context, effect.type.target.doesTarget)

    // Check each target group for legality - initialize even if empty
    effect.context.illegalTargets = targets.map(targetGroup => 
        targetGroup.filter(targetId => !allowed.includes(targetId))
    )
}

export const RemoveIllegalTargets = (effect:Effect) =>
{
    const targets = effect.context.targets
    const illegalTargets = effect.context.illegalTargets

    effect.context.targets = targets.map((targetGroup, groupIndex) => 
        targetGroup.filter(targetId => !illegalTargets![groupIndex]?.includes(targetId))
    )
    
    // Only log "Removed illegal targets" if the effect hasn't already completed successfully
    // Effects that completed successfully (including those with "Subeffects" status) shouldn't 
    // trigger this warning when their original targets are no longer in the same zones
    const hasTargets = targets.flatMap(targetGroup => targetGroup).length > 0;
    const hasRemainingTargets = effect.context.targets.flatMap(targetGroup => targetGroup).length > 0;
    const effectCompletedSuccessfully = effect.status === 'Complete' || effect.status === 'Subeffects';
    const shouldLogIllegalTargets = !effectCompletedSuccessfully && hasTargets && !hasRemainingTargets;
        
    if(shouldLogIllegalTargets)
    {
        console.log("Removed illegal targets",effect.context.illegalTargets)
    }
    
}