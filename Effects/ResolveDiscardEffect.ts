import { DiscardEffect } from "../Types/EffectClass";
import { Effect } from "../Types/Types";
import { EvaluateNumber, GetConditionCards } from "../Logic/Evaluate";
import { ExecuteTrigger } from "../Logic/ExecuteTrigger";
import { PlayerId } from "../Types/IdCounter";
import { AddChooseInputGameAction } from "../Types/InputTypesHelpers";
import { AddChangeZoneGameAction } from "../Types/GameActionHelpers";

export const ResolveDiscardEffect = ({source,effectIndex,context}: Effect, {discardTarget}: DiscardEffect) => {

    var i=0
    const {targets,discardTargetIds} = context
    for(var target of targets[0])
    {
        i++
        
        if(!discardTargetIds || !discardTargetIds[i])
        {
            const allowed = GetConditionCards(target as PlayerId,discardTarget,context)
            const min = EvaluateNumber(target,target,discardTarget.min,context)
            const max = EvaluateNumber(target,target,discardTarget.min,context)
            AddChooseInputGameAction(target as PlayerId,"Select targets",source,min,max,allowed,effectIndex,'discardTargetIds',i)
            return false;
        }
        else
        {
            AddChangeZoneGameAction("Graveyard", discardTargetIds[i], source)
            ExecuteTrigger('Discard', [target])
            return true;
        }    
    }
};