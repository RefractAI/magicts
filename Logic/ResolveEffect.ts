import { Effect, EffectKind } from "../Types/Types";
import { EvaluateCondition } from "./Evaluate";
import { ResolveAddManaEffect } from "../Effects/ResolveAddManaEffect";
import { ResolveCreateEffect } from "../Effects/ResolveCreateEffect";
import { ResolveDamageEffect } from "../Effects/ResolveDamageEffect";
import { ResolveTapEffect } from "../Effects/ResolveTapEffect";
import { ResolveZoneChangeEffect } from "../Effects/ResolveZoneChangeEffect";
import { ResolveAbilityEffect } from "../Effects/ResolveAbilityEffect";
import { AddConcreteEffect } from "./Targeting";
import { ResolveDiscardEffect } from "../Effects/ResolveDiscardEffect";
import { CardId } from "../Types/IdCounter";
import { GetCard } from "./GetCard";
import { ResolveColorChoiceEffect } from "../Effects/ResolveColorChoiceEffect";
import { EffectUnion } from "../Types/EffectClass";

export const TryResolveEffects = (cardId:CardId,kind:EffectKind,ofEffectParentIndex:number) =>
{
    const card = GetCard(cardId)
    const nextEffect = card.effects.find(e => e.status !== 'Complete' && e.kind === kind && e.parentEffectIndex === ofEffectParentIndex)
    if(nextEffect)
    {
        switch(nextEffect.status)
        {
            case 'Pending':
            case 'In Progress':
                nextEffect.status = 'In Progress'
                if(ResolveEffect(nextEffect))
                {
                     //Then create sub-effects of this effect
                    nextEffect.status = 'Subeffects'

                    switch(nextEffect.type.effectCls)
                    {
                        case 'MayEffect':
                            if(nextEffect.context.mayInput)
                            {
                                AddThenEffects(nextEffect,nextEffect.type.thenEffects)
                            }
                            break;

                        //choices, etc.
                        default: 
                            AddThenEffects(nextEffect,nextEffect.type.thenEffects)
                            break;

                    }
                    
                }
                break;
            case 'Subeffects':
                const subEffect = card.effects.find(e => e.status !== 'Complete' && e.kind === kind && e.parentEffectIndex === nextEffect.effectIndex)
                if(subEffect)
                {
                    ResolveEffect(subEffect)
                }
                else
                {
                    nextEffect.status = 'Complete'
                }
                break;
            default: throw 'not implemented'
        }
        
    }
}

export const AddThenEffects = (nextEffect:Effect,thenEffects:EffectUnion[]) =>
{
    thenEffects.forEach(thenEffect => AddConcreteEffect(nextEffect.source, thenEffect, nextEffect.kind, nextEffect.effectIndex, {...nextEffect.context}))
}

export const ResolveEffect = (effect:Effect) =>
{
    effect.status = "In Progress"

    console.log('Resolve Effect', effect, effect.context.targets.flatMap(t => t),effect.type.effectCls,effect.type.condition)
    
    if(effect.type.condition.cls !== 'NoneCondition')
    {
        const condition = EvaluateCondition(effect.source,effect.source,effect.type.condition, effect.context)
        if(!condition)
        {
            throw 'Not allowed'
        }
    }

    switch(effect.type.effectCls)
    {
        case 'ColorChoiceEffect': return ResolveColorChoiceEffect(effect,effect.type);
        case 'DamageEffect': return ResolveDamageEffect(effect,effect.type);
        case 'CreateEffect': return ResolveCreateEffect(effect,effect.type);
        case 'TapEffect': return ResolveTapEffect(effect,effect.type);
        case 'AddManaEffect': return ResolveAddManaEffect(effect,effect.type);
        case 'ZoneChangeEffect': return ResolveZoneChangeEffect(effect,effect.type);
        case 'AbilityEffect': return ResolveAbilityEffect(effect,effect.type);
        case 'DiscardEffect': return ResolveDiscardEffect(effect,effect.type);
        case 'AbilityEffect': return ResolveAbilityEffect(effect,effect.type);
        default: throw 'Effect not implemented'
    }
}