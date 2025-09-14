import { SearchEffect } from "../Types/EffectTypes";
import { Effect } from "../Types/EffectTypes";
import { EvaluateNumber, GetConditionCards } from "../Logic/Evaluate";
import { ExecuteTrigger } from "../Logic/ExecuteTrigger";
import { PlayerId } from "../Types/IdCounter";
import { AddChooseInputGameAction } from "../Types/InputTypesHelpers";
import { AddChangeZoneGameAction } from "../Types/GameActionHelpers";
import { PerformShuffle } from "../Logic/MutateBoard";

export const ResolveSearchEffect = ({source,effectIndex,context}: Effect, {searchTarget, toZone}: SearchEffect) => {

    var i=0
    const {targets,searchTargetIds} = context
    
    for(var target of targets[0])
    {
        i++
        
        if(!searchTargetIds || !searchTargetIds[i])
        {
            const allowed = GetConditionCards(source,searchTarget,context,false)
            const min = EvaluateNumber(target,target,searchTarget.min,context)
            const max = EvaluateNumber(target,target,searchTarget.max,context)
            if(allowed.length > max && !searchTarget.all)
            {
                AddChooseInputGameAction(target as PlayerId,"Search your library",source,min,max,allowed,effectIndex,'searchTargetIds',i)
                return false;
            }
            else
            {
                // Move found cards to specified zone and shuffle library
                const destinationZone = toZone || "Hand";
                AddChangeZoneGameAction(destinationZone, allowed, source, 'SearchEffect')
                PerformShuffle(target as PlayerId)
                ExecuteTrigger('Search', allowed)
                return true;
            }
        }
        else
        {
            // Move selected cards to specified zone and shuffle library
            const destinationZone = toZone || "Hand";
            AddChangeZoneGameAction(destinationZone, searchTargetIds[i], source, 'SearchEffect')
            PerformShuffle(target as PlayerId)
            ExecuteTrigger('Search', searchTargetIds[i])
            return true;
        }    
    }
    
    return true;
};