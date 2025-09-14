import { Effect } from "../Types/EffectTypes";
import { TriggerEffect } from "../Types/EffectTypes";
import { ExecuteTrigger } from "../Logic/ExecuteTrigger";

export const ResolveTriggerEffect = (effect: Effect, type: TriggerEffect) => {

    const {trigger} = type;
    const {source} = effect

    ExecuteTrigger(trigger,[source])

    return true;
};
