import { GainLifeEffect } from "../Types/EffectTypes";
import { Effect } from "../Types/EffectTypes";
import { EvaluateNumber } from "../Logic/Evaluate";
import { PerformGainLife } from "../Logic/MutateBoard";
import { PlayerId } from "../Types/IdCounter";

export const ResolveGainLifeEffect = (effect: Effect, type: GainLifeEffect):boolean => {

    const {amount} = type;
    const {source,context} = effect;
    const targets = context.targets[0]

    if (!targets) {
        console.error("GainLifeEffect: No targets found in context.targets[0]");
        return false;
    }

    targets.forEach(target => {

        const calculatedAmount = EvaluateNumber(target, source, amount, context);
        PerformGainLife(effect.source, target as PlayerId, calculatedAmount);
    });

    return true;
};