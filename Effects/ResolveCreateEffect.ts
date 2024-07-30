import { CreateEffect } from "../Types/EffectClass";
import { PlayerId } from "../Types/IdCounter";
import { Effect } from "../Types/Types";
import { EvaluateNumber } from "../Logic/Evaluate";
import { PerformCreate } from "../Logic/MutateBoard";

export const ResolveCreateEffect = (effect: Effect, type: CreateEffect) => {

    const {token,amount} = type;
    const {source,context} = effect;
    const targets = context.targets[0]

    targets.forEach(target => {
        const calculatedAmount = EvaluateNumber(target, source, amount, context);
        PerformCreate(target as PlayerId, token, calculatedAmount);
    });

    return true;
};
