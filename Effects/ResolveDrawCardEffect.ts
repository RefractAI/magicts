import { DrawCardEffect, ZoneChangeEffect } from "../Types/EffectClass";
import { Effect } from "../Types/Types";
import { ToCondition } from "../Types/ToCondition";
import { ZoneChange } from "../Types/EffectClassHelpers";
import { EvaluateNumber } from "../Logic/Evaluate";
import { GetController } from "../Logic/GetCard";
import { AddConcreteEffect } from "../Logic/Targeting";
import { ExecuteTrigger } from "../Logic/ExecuteTrigger";
import { PerformDrawCard } from "../Logic/MutateBoard";
import { PlayerId } from "../Types/IdCounter";

export const ResolveDrawCardEffect = (effect: Effect, type: DrawCardEffect) => {

    const {source,context} = effect;
    const {amount} = type;
    const targets = context.targets[0];

    targets.forEach(target => {

        const calculatedAmount = EvaluateNumber(target, source, amount, context);

        PerformDrawCard(target as PlayerId,calculatedAmount)
        
        return true;
    });

};
