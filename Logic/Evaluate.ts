import { controller } from "../Network/Server";
import { ConditionTypes } from "../Types/ConditionTypes";
import { ColorVariables, NumberVariables } from "../Types/EvaluationTypes";
import { CardId } from "../Types/IdCounter";
import { Card, Color, ColorDef, ColorNames, ConditionConcreteContext, ConditionSpecification, NumberDef, ResolutionContext } from "../Types/Types";
import { ColorVariableName } from "../Types/VariableNames";
import { GetCard } from "./GetCard";

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
            return GetConditionCards(c, n.conditions,context).length
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
    if(typeof n === 'number')
    {
        return n;
    }
    else
    {
        if(ColorNames.includes(n as Color))
        {
            return n as Color
        }
        else
        {
            const evaluation = ColorVariables[n as ColorVariableName]
            //todo add context?
            const result = evaluation.fn(typeof c === 'number' ? GetCard(c) : c, typeof s === 'number' ? GetCard(s) : s, controller, context)
            return result;
        }
    }
}

export const EvaluateCondition = (c:Card|CardId,s:Card|CardId,name:ConditionSpecification,liveContext:ResolutionContext):boolean =>
{
    const c2 = typeof c === 'number' ? GetCard(c) : c
    const s2 = typeof s === 'number' ? GetCard(s) : s

    if(name.cls === 'NoneCondition')
    {
        return false
    }
    if(name.cls === 'SelfCondition')
    {
        return c === s
    }

    const conditions = name.conditions.map(n => ConditionTypes[n]);

    //COMBINE passed-in context (static but from the live ability/effect?) and context stored on the condition (variable)
    const context:ConditionConcreteContext = {
        
        ...liveContext,
        numberVariable: name.context.numberVariable && EvaluateNumber(c2, s2, name.context.numberVariable, {targets:[]}),
        colorVariable: name.context.colorVariable && EvaluateColor(c2, s2, name.context.colorVariable, {targets:[]}),
        tribeVariable: name.context.tribeVariable,
        keywordVariable: name.context.keywordVariable
    }

    const result = conditions.every(condition => condition.fn(c2, s2, controller, context))
    
    //if(c2.id === 1 as PlayerId)
    //{
    //    console.log("EvaluateCondition", c2.id, s2.id, name, result, "AAA", conditions, conditions[0].fn(c2, s2, controller))
   //}


    return result;
}

export const GetConditionCards = (s:Card|CardId,spec:ConditionSpecification,x:ResolutionContext):CardId[] =>
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

    const cards = controller.cards.filter(c => EvaluateCondition(c,s2,spec,x)).map(c => c.id)

    //console.log("GetConditionCards", s, spec,cards)

    return cards;
}