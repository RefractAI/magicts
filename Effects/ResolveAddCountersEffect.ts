import { AddCountersEffect } from "../Types/EffectTypes";
import { Effect } from "../Types/EffectTypes";
import { GetCard } from "../Logic/GetCard";
import { PerformAddCounter } from "../Logic/MutateBoard";
import { CardId } from "../Types/IdCounter";
import { EvaluateNumber } from "../Logic/Evaluate";

export const ResolveAddCountersEffect = (effect: Effect, addCountersEffect: AddCountersEffect) => {
    const { source, context } = effect;
    const targets = context.targets[0];

    if (!targets || targets.length === 0) {
        console.log(`AddCountersEffect: No targets to add counters to`);
        return true;
    }

    // Evaluate the amount of counters to add
    const amount = EvaluateNumber(GetCard(source), GetCard(source), addCountersEffect.amount, context);

    targets.forEach(targetId => {
        const targetCard = GetCard(targetId as CardId);
        console.log(`Adding ${amount} ${addCountersEffect.counterType} counter(s) to ${targetCard.name}`);
        
        // Add the specified number of counters
        for (let i = 0; i < amount; i++) {
            PerformAddCounter(targetId as CardId, addCountersEffect.counterType);
        }
    });

    return true;
};