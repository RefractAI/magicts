import { Effect, EffectKind } from "../Types/EffectTypes";
import { EvaluateCondition } from "./Evaluate";
import { ResolveAddManaEffect } from "../Effects/ResolveAddManaEffect";
import { ResolveCreateEffect } from "../Effects/ResolveCreateEffect";
import { ResolveDamageEffect } from "../Effects/ResolveDamageEffect";
import { ResolveTapEffect } from "../Effects/ResolveTapEffect";
import { ResolveZoneChangeEffect } from "../Effects/ResolveZoneChangeEffect";
import { ResolveAbilityEffect } from "../Effects/ResolveAbilityEffect";
import { AddConcreteEffect } from "./Targeting";
import { ResolveDiscardEffect } from "../Effects/ResolveDiscardEffect";
import { ResolveSearchEffect } from "../Effects/ResolveSearchEffect";
import { ResolveSacrificeEffect } from "../Effects/ResolveSacrificeEffect";
import { CardId } from "../Types/IdCounter";
import { GetCard } from "./GetCard";
import { ResolveColorChoiceEffect } from "../Effects/ResolveColorChoiceEffect";
import { ResolveButtonChoiceEffect } from "../Effects/ResolveButtonChoiceEffect";
import { ResolveTargetEffect } from "../Effects/ResolveTargetEffect";
import { ResolveExploreEffect } from "../Effects/ResolveExploreEffect";
import { ResolveDrawCardEffect } from "../Effects/ResolveDrawCardEffect";
import { ResolveBucketEffect } from "../Effects/ResolveBucketEffect";
import { ResolveTransformEffect } from "../Effects/ResolveTransformEffect";
import { ResolveMayEffect } from "../Effects/ResolveMayEffect";
import { ResolveLoseLifeEffect } from "../Effects/ResolveLoseLifeEffect";
import { ResolveGainLifeEffect } from "../Effects/ResolveGainLifeEffect";
import { ResolveAddCountersEffect } from "../Effects/ResolveAddCountersEffect";
import { ResolveRemoveCountersEffect } from "../Effects/ResolveRemoveCountersEffect";
import { ResolvePayEffect } from "../Effects/ResolvePayEffect";
import { ResolveCreateEmblemEffect } from "../Effects/ResolveCreateEmblemEffect";
import { ResolveExileEffect } from "../Effects/ResolveExileEffect";
import { ResolveSelectXEffect } from "../Effects/ResolveSelectXEffect";
import { ResolveRevealEffect } from "../Effects/ResolveRevealEffect";
import { ResolveShuffleIntoLibraryEffect } from "../Effects/ResolveShuffleIntoLibraryEffect";
import { ResolveShuffleEffect } from "../Effects/ResolveShuffleEffect";
import { ResolveDestroyEffect } from "../Effects/ResolveDestroyEffect";
import { ResolveTriggerEffect } from "../Effects/ResolveTriggerEffect";

export const TryResolveEffects = (cardId:CardId,kind:EffectKind,ofEffectParentIndex:number):boolean =>
{
    const card = GetCard(cardId)
    const nextEffect = card.effects.find(e => e.status !== 'Complete' && e.kind === kind && e.parentEffectIndex === ofEffectParentIndex)
    if(nextEffect)
    {
        //console.log("Try Resolve Effect: ",nextEffect.effectIndex,nextEffect.type.effectCls, nextEffect.status)
        switch(nextEffect.status)
        {
            case 'Pending':
            case 'In Progress':
                nextEffect.status = 'In Progress'
                nextEffect.executionCount++
                if(ResolveEffect(nextEffect))
                {    
                    if(nextEffect.selectedThenEffects.length > 0)
                    {
                        //Then create sub-effects of this effect
                        nextEffect.status = 'Subeffects'
                        console.log("Add ThenEffects from: ",nextEffect.type.effectCls, "of", nextEffect.selectedThenEffects.map(e => e.effectCls))
                        nextEffect.selectedThenEffects.forEach(thenEffect => AddConcreteEffect(nextEffect.source, thenEffect, nextEffect.kind, nextEffect.effectIndex, {...nextEffect.context}))
                    }
                    else
                    {
                        nextEffect.status = 'Complete'
                    }
                }
                else
                {
                    console.log(`Effect ${nextEffect.type.effectCls} not yet resolved`)
                }
                break;
            case 'Subeffects':
                //Now try to resolve the effects with this effect as the parent
                if(TryResolveEffects(cardId,kind,nextEffect.effectIndex))
                {
                    nextEffect.status = 'Complete'
                }
                break;
        }
        return false
    }
    return true
}

export const ResolveEffect = (effect:Effect) =>
{
    effect.status = "In Progress"

    console.log(`Resolve ${effect.type.effectCls}: source: ${effect.source} targets: ${effect.context.targets.flatMap(t => t)}`)
    
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
        case 'ButtonChoiceEffect': return ResolveButtonChoiceEffect(effect,effect.type);
        case 'SelectXEffect': return ResolveSelectXEffect(effect,effect.type);
        case 'TargetEffect': return ResolveTargetEffect(effect,effect.type);

        case 'MayEffect': return ResolveMayEffect(effect,effect.type);
        case 'PayEffect': return ResolvePayEffect(effect,effect.type);

        case 'DamageEffect': return ResolveDamageEffect(effect,effect.type);
        case 'CreateEffect': return ResolveCreateEffect(effect,effect.type);
        case 'TapEffect': return ResolveTapEffect(effect,effect.type);
        case 'AddManaEffect': return ResolveAddManaEffect(effect,effect.type);
        case 'ZoneChangeEffect': return ResolveZoneChangeEffect(effect,effect.type);
        case 'AbilityEffect': return ResolveAbilityEffect(effect,effect.type);
        case 'DiscardEffect': return ResolveDiscardEffect(effect,effect.type);
        case 'SearchEffect': return ResolveSearchEffect(effect,effect.type);
        case 'SacrificeEffect': return ResolveSacrificeEffect(effect,effect.type);
        case 'ExploreEffect': return ResolveExploreEffect(effect,effect.type);
        case 'DrawCardEffect': return ResolveDrawCardEffect(effect,effect.type);
        case 'ScryEffect': return ResolveBucketEffect(effect,effect.type);
        case 'SurveilEffect': return ResolveBucketEffect(effect,effect.type);
        case 'TransformEffect': return ResolveTransformEffect(effect, effect.type);
        case 'LoseLifeEffect': return ResolveLoseLifeEffect(effect,effect.type);
        case 'GainLifeEffect': return ResolveGainLifeEffect(effect,effect.type);
        case 'AddCountersEffect': return ResolveAddCountersEffect(effect,effect.type);
        case 'RemoveCountersEffect': return ResolveRemoveCountersEffect(effect,effect.type);
        case 'CreateEmblemEffect': return ResolveCreateEmblemEffect(effect,effect.type);
        case 'ExileEffect': return ResolveExileEffect(effect,effect.type);
        case 'ShuffleIntoLibraryEffect': return ResolveShuffleIntoLibraryEffect(effect,effect.type);
        case 'ShuffleEffect': return ResolveShuffleEffect(effect,effect.type);
        case 'RevealEffect': return ResolveRevealEffect(effect,effect.type);
        case 'BucketEffect': return ResolveBucketEffect(effect,effect.type);
        case 'DestroyEffect': return ResolveDestroyEffect(effect,effect.type);
        case 'TriggerEffect': return ResolveTriggerEffect(effect,effect.type);
        
        default: throw 'Effect not implemented:'+effect.type.effectCls
    }
}