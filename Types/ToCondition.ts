import { ConditionSpecName } from "./ConditionNames";
import { ConditionSpecTypes } from "./ConditionTypes";
import { TribeName, TribeNames } from "./TribeNames";
import { TargetType, NumberVar, KeywordName, ColorDef, ConditionSpecification, NoneCondition, SelfCondition, ColorNames, Color, KeywordNames, NumberDef, NumberSpecification } from "./Types";
import { NumberVariableNames, NumberVariableName } from "./VariableNames";


export const ToCondition = (t: TargetType, min?: NumberVar, max?: NumberVar, data?: NumberVar | TribeName | KeywordName | ColorDef): ConditionSpecification => {
    var t2: ConditionSpecification;
    if (min !== undefined && max === undefined) {
        max = min;
    }
    if (typeof t === 'string') {
        if (t === 'None') {
            t2 = NoneCondition;
            return t2;
        }
        else if (t == 'Self') {
            t2 = SelfCondition;
            return t2;
        }
        t2 = ConditionSpecTypes[t]!;
        if(!t2)
        {
            throw 'Missing condition - '+t
        }
    }

    else {
        t2 = t;
    }

    t2.min = ToNumberSpec(min || 0);
    t2.max = ToNumberSpec(max || 0);

    if (typeof data === 'string') {
        if (TribeNames.includes(data as TribeName)) {
            t2.context.tribeVariable = data as TribeName;
        }
        else if (ColorNames.includes(data as Color)) {
            t2.context.colorVariable = data as Color;
        }
        else if (KeywordNames.includes(data as KeywordName)) {
            t2.context.keywordVariable = data as KeywordName;
        }

    }
    else if (data) {
        if (typeof data === 'number' || data.cls === 'NumberSpecification') {
            t2.context.numberVariable = ToNumberSpec(data || 0);
        }
    }

    return t2;
};

export const ToNumberSpec = (t:NumberVar):NumberDef =>
{ 
   
    if(typeof t == 'number')
    {
        return t
    }
    else if(typeof t === 'string')
    {
        var spec:NumberSpecification = ({cls:'NumberSpecification',conditions:NoneCondition,min:1,max:1})
        if(t in NumberVariableNames)
        {
            spec.conditions = t as NumberVariableName
        }
        else
        {
            spec.conditions = ToCondition(t as ConditionSpecName)
        }
        return spec
    }
    else
    {
        return t
    }
    
}