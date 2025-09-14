import { TapEffect } from "../Types/EffectTypes";
import { Effect } from "../Types/EffectTypes";
import { PerformTap } from "../Logic/MutateBoard";

export const ResolveTapEffect = (effect: Effect, _: TapEffect) => {

    const {context} = effect;
    const targets = context.targets[0];

    targets.forEach(target => {
        PerformTap(target);
    });

    return true;
};
