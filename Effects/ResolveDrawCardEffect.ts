import { DrawCardEffect } from "../Types/EffectTypes";
import { Effect } from "../Types/EffectTypes";
import { EvaluateNumber } from "../Logic/Evaluate";
import { PerformDrawCard } from "../Logic/MutateBoard";
import { PlayerId } from "../Types/IdCounter";

export const ResolveDrawCardEffect = (effect: Effect, type: DrawCardEffect) => {

    const {source,context} = effect;
    const {amount} = type;
    const targets = context.targets[0];

    targets.forEach(target => {

        const calculatedAmount = EvaluateNumber(target, source, amount, context);

        PerformDrawCard(target as PlayerId,calculatedAmount)
    });

    return true;
};
