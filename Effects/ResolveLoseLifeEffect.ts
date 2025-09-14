import { LoseLifeEffect } from "../Types/EffectTypes";
import { Effect } from "../Types/EffectTypes";
import { EvaluateNumber } from "../Logic/Evaluate";
import { PerformLoseLife } from "../Logic/MutateBoard";
import { PlayerId } from "../Types/IdCounter";

export const ResolveLoseLifeEffect = (effect: Effect, type: LoseLifeEffect):boolean => {

    const {amount} = type;
    const {source,context} = effect;
    const targets = context.targets[0]

    if (!targets) {
        console.error("LoseLifeEffect: No targets found in context.targets[0]");
        return false;
    }

    targets.forEach(target => {

        const calculatedAmount = EvaluateNumber(target, source, amount, context);
        PerformLoseLife(effect.source, target as PlayerId, calculatedAmount);
    });

    return true;
};