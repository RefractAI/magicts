import { DamageEffect } from "../Types/EffectClass";
import { Effect } from "../Types/Types";
import { EvaluateNumber } from "../Logic/Evaluate";
import { PerformDamage } from "../Logic/MutateBoard";

export const ResolveDamageEffect = (effect: Effect, type: DamageEffect):boolean => {

    const {amount} = type;
    const {source,context} = effect;
    const targets = context.targets[0]

    targets.forEach(target => {

        const calculatedAmount = EvaluateNumber(target, source, amount, context);
        PerformDamage(effect.source, target, calculatedAmount);
    });

    return true;
};
