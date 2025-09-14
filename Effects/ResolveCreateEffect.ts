import { CreateEffect } from "../Types/EffectTypes";
import { PlayerId, CardId } from "../Types/IdCounter";
import { Effect } from "../Types/EffectTypes";
import { EvaluateNumber, GetConditionCards } from "../Logic/Evaluate";
import { PerformCreate, PerformCreateCopy } from "../Logic/MutateBoard";
import { GetCard } from "../Logic/GetCard";

export const ResolveCreateEffect = (effect: Effect, type: CreateEffect) => {

    const {token,amount,copyOf} = type;
    const {source,context} = effect;
    const targets = context.targets[0]

    targets.forEach(target => {
        const calculatedAmount = EvaluateNumber(target, source, amount, context);
        
        if (copyOf) {
            // Find cards that match the copyOf condition
            const copyTargets = GetConditionCards(GetCard(source), copyOf, context, false);
            
            copyTargets.forEach((copyTargetId: CardId) => {
                PerformCreateCopy(target as PlayerId, copyTargetId, calculatedAmount);
            });
        } else {
            // Normal token creation
            PerformCreate(target as PlayerId, token, calculatedAmount);
        }
    });

    return true;
};
