import { AddManaEffect } from "../Types/EffectClass";
import { PlayerId } from "../Types/IdCounter";
import { Effect } from "../Types/Types";
import { EvaluateNumber } from "../Logic/Evaluate";
import { PerformAddMana } from "../Logic/MutateBoard";

export const ResolveAddManaEffect = ({source,context}: Effect, {color,amount}: AddManaEffect) => {

    const {targets} = context
    targets[0].forEach(target => {
        const calculatedAmount = EvaluateNumber(target, source, amount, context);
        PerformAddMana(target as PlayerId, color, calculatedAmount);
    });

    return true;
};
