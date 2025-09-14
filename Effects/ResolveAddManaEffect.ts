import { AddManaEffect } from "../Types/EffectTypes";
import { PlayerId } from "../Types/IdCounter";
import { Effect } from "../Types/EffectTypes";
import { EvaluateNumber, EvaluateColor } from "../Logic/Evaluate";
import { PerformAddMana } from "../Logic/MutateBoard";

export const ResolveAddManaEffect = ({source,context}: Effect, {color,amount}: AddManaEffect) => {

    const {targets} = context
    targets[0].forEach(target => {
        const calculatedAmount = EvaluateNumber(target, source, amount, context);
        const evaluatedColor = EvaluateColor(target, source, color, context);
        PerformAddMana(target as PlayerId, evaluatedColor, calculatedAmount);
    });

    return true;
};
