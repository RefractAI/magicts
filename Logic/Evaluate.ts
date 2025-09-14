import { controller } from "../Network/Server";
import { GetAbilityType } from "../Types/AbilityTypes";
import { ColorVariables, NumberVariables } from "../Types/EvaluationTypes";
import { CardId } from "../Types/IdCounter";
import { Card, ConditionConcreteContext, ResolutionContext } from "../Types/CardTypes";
import { Color } from "../Types/ColorTypes";
import { ConditionSpecification, NumberDef, ColorVariableName } from "../Types/ConditionTypes";
import { ConditionTypes } from "../Types/ConditionHelpers";
import { GetCard } from "./GetCard";
import { ColorNames, ColorDef } from "../Types/ColorTypes";

export const EvaluateNumber = (c:Card|CardId,s:Card|CardId,n:NumberDef,context:ResolutionContext):number =>
{
    if(typeof n === 'number')
    {
        return n;
    }
    else
    {
        if(typeof n.conditions === 'object')
        {
            return GetConditionCards(c, n.conditions,context,false).length
        }
        else
        {
            const evaluation = NumberVariables[n.conditions]
            //todo add context?
            const result = evaluation.fn(typeof c === 'number' ? GetCard(c) : c, typeof s === 'number' ? GetCard(s) : s, controller, context)
            return result;
        }
    }
}

export const EvaluateColor = (c:Card|CardId,s:Card|CardId,n:ColorDef,context:ResolutionContext):Color =>
{
    if(ColorNames.includes(n as Color))
    {
        return n as Color
    }
    else
    {
        const evaluation = ColorVariables[n as ColorVariableName]
        const result = evaluation.fn(typeof c === 'number' ? GetCard(c) : c, typeof s === 'number' ? GetCard(s) : s, controller, context)
        return result;
    }
}

export const EvaluateCondition = (c:Card|CardId,s:Card|CardId,name:ConditionSpecification,liveContext:ResolutionContext):boolean =>
{
    const c2 = typeof c === 'number' ? GetCard(c) : c
    const s2 = typeof s === 'number' ? GetCard(s) : s

    if(name.cls === 'NoneCondition')
    {
        return true
    }
    if(name.cls === 'SelfCondition')
    {
        return c === s
    }

    //COMBINE passed-in context (static but from the live ability/effect?) and context stored on the condition (variable)
    const context:ConditionConcreteContext = {
        
        ...liveContext,
        numberVariable: name.context.numberVariable && EvaluateNumber(c2, s2, name.context.numberVariable, liveContext),
        colorVariable: name.context.colorVariable && EvaluateColor(c2, s2, name.context.colorVariable, liveContext),
        tribeVariable: name.context.tribeVariable,
        keywordVariable: name.context.keywordVariable,
        cardNameVariable: name.context.cardNameVariable,
        stringVariable: name.context.stringVariable
    }

    let result: boolean;
    
    if (name.andOr === 'AND') {
        result = name.conditions.every(condition => {
            if (typeof condition === 'string') {
                return ConditionTypes[condition].fn(c2, s2, controller, context);
            } else {
                return EvaluateCondition(c2, s2, condition, liveContext);
            }
        });
    } else {
        result = name.conditions.some(condition => {
            if (typeof condition === 'string') {
                return ConditionTypes[condition].fn(c2, s2, controller, context);
            } else {
                return EvaluateCondition(c2, s2, condition, liveContext);
            }
        });
    }
    
    return result;
}

export const GetConditionCards = (s:Card|CardId,spec:ConditionSpecification,x:ResolutionContext,checkProtection:boolean=false):CardId[] =>
{
    const s2 = typeof s === 'number' ? GetCard(s) : s

    if(spec.cls === 'NoneCondition')
    {
        return []
    }
    if(spec.cls === 'SelfCondition')
    {
        return [s2.id]
    }

    let cards = controller.cards.filter(c => EvaluateCondition(c,s2,spec,x)).map(c => c.id)

    if(checkProtection)
    {
        cards = cards.filter(c => !HasProtectionFrom(GetCard(c), s2))
    }

    return cards;
}

export const HasProtectionFrom = (target:Card, source:Card):boolean =>
{
    // Check if target has any protection abilities that protect from the source
    return target.printedAbilities.some(ability => {
        const abilityType = GetAbilityType(ability.type)
        if (abilityType.abilityCls === 'ProtectionFromAbility') {
            // Check if source matches the protection condition
            return EvaluateCondition(source, target, abilityType.from, ability.context)
        }
        return false
    })
}