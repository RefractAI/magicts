import { TapEffect } from "../Types/EffectClass";
import { Effect } from "../Types/Types";
import { PerformTap } from "../Logic/MutateBoard";

export const ResolveTapEffect = (effect: Effect, _: TapEffect) => {

    const {context} = effect;
    const targets = context.targets[0];

    targets.forEach(target => {
        PerformTap(target);
    });

    return true;
};
