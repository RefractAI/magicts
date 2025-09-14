import { ConditionName, ConditionNames } from "./ConditionNames";
import { C, NoneCondition, SelfCondition } from "./ConditionHelpers";
import { TargetType, NumberVar, ConditionSpecification, NumberDef, NumberSpecification, NumberVariableNames, NumberVariableName } from "./ConditionTypes";

export const ToCondition = (t: TargetType): ConditionSpecification => {
    
    if(typeof t === 'string')
    {
        switch(t)
        {
            case 'None': return NoneCondition
            case 'Self': return SelfCondition
            case 'FriendlyPlayer': return C.All("FriendlyPlayer")
            case 'OpponentPlayer': return C.All("OpponentPlayer")
            case 'AllPlayers': return C.All("Player")
            case 'AnyPlayer': return C.Target("Player")
            //Should always return All for these, otherwise Any
            case 'AbilitySource': return C.All("AbilitySource")
            case 'ContextTarget': return C.All("ContextTarget") 
        }
        return C.Target(t)
    }
    else
    {
        return t
    }
    
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
        if(NumberVariableNames.includes(t as NumberVariableName))
        {
            spec.conditions = t as NumberVariableName
        }
        else if (ConditionNames.includes(t as ConditionName))
        {
            spec.conditions = ToCondition(t as ConditionName)
        }
        else
        {
            var e = new Error('Missing number spec - '+t)
            console.error(e.stack)
            throw e
        }
        return spec
    }
    else
    {
        switch(t.cls)
        {
            case 'ConditionSpecification':
                var spec:NumberSpecification = ({cls:'NumberSpecification',conditions:t,min:1,max:1})
            return spec
            case 'NumberSpecification':
                return t
            default:
                throw 'Not implemented'+t
        }
        
    }
}