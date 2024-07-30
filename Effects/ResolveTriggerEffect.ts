import { Effect } from "../Types/Types";
import { TriggerEffect } from "../Types/EffectClass";
import { ExecuteTrigger } from "../Logic/ExecuteTrigger";

export const ResolveTriggerEffect = (effect: Effect, type: TriggerEffect) => {

    const {trigger} = type;
    const {source} = effect

    ExecuteTrigger(trigger,[source])

    return true;
};
