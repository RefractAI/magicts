import { TargetEffect } from "../Types/EffectTypes";
import { Effect } from "../Types/EffectTypes";

export const ResolveTargetEffect = (effect: Effect, _type: TargetEffect) => {
    const {context} = effect;

    // The targets have already been chosen during casting, so we just need to store them in context
    // for subsequent effects to reference via ContextTarget
    if (context.targets && context.targets.length > 0 && context.targets[0].length > 0) {
        context.chosenTargets = context.targets[0];
    }
    
    return true;
};