import { DiscardEffect } from "../Types/EffectTypes";
import { Effect } from "../Types/EffectTypes";
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
            const allowed = GetConditionCards(source,discardTarget,context,false)
            const min = EvaluateNumber(target,target,discardTarget.min,context)
            const max = EvaluateNumber(target,target,discardTarget.min,context)
            if(allowed.length > max && !discardTarget.all)
            {
                AddChooseInputGameAction(target as PlayerId,"Select targets",source,min,max,allowed,effectIndex,'discardTargetIds',i)
                return false;
            }
            else
            {
                AddChangeZoneGameAction("Graveyard", allowed, source, 'DiscardEffect')
                ExecuteTrigger('Discard', allowed)
                return true;
            }
        }
        else
        {
            AddChangeZoneGameAction("Graveyard", discardTargetIds[i], source, 'DiscardEffect')
            ExecuteTrigger('Discard', [target])
            return true;
        }    
    }
};