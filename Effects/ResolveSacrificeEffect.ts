import { SacrificeEffect } from "../Types/EffectTypes";
import { Effect } from "../Types/EffectTypes";
import { EvaluateNumber, GetConditionCards } from "../Logic/Evaluate";
import { ExecuteTrigger } from "../Logic/ExecuteTrigger";
import { PlayerId } from "../Types/IdCounter";
import { AddChooseInputGameAction } from "../Types/InputTypesHelpers";
import { AddChangeZoneGameAction } from "../Types/GameActionHelpers";

export const ResolveSacrificeEffect = ({source, effectIndex, context}: Effect, {sacrifices}: SacrificeEffect) => {

    var i = 0;
    const {targets, sacrificeTargetIds} = context;
    
    for(var target of targets[0]) {
        i++;
        
        if(!sacrificeTargetIds || !sacrificeTargetIds[i]) {
            // Player needs to choose what to sacrifice
            const allowed = GetConditionCards(source, sacrifices, context, false);
            const min = EvaluateNumber(source, source, sacrifices.min, context);
            const max = EvaluateNumber(source, source, sacrifices.max, context);
            if(allowed.length > max && !sacrifices.all)
            {
                AddChooseInputGameAction(target as PlayerId, "Select targets to sacrifice", source, min, max, allowed, effectIndex, 'sacrificeTargetIds', i);
                return false;
            }
            else
            {
                AddChangeZoneGameAction("Graveyard", allowed, source, 'SacrificeEffect');
                ExecuteTrigger('Sacrifice', allowed);
                return true;
            }
            
        }
        else {
            // Sacrifice the chosen targets
            AddChangeZoneGameAction("Graveyard", sacrificeTargetIds[i], source, 'SacrificeEffect');
            ExecuteTrigger('Sacrifice', sacrificeTargetIds[i]);
            return true;
        }    
    }
    
    return true;
};