import { RemoveCountersEffect } from "../Types/EffectTypes";
import { Effect } from "../Types/EffectTypes";
import { GetCard } from "../Logic/GetCard";
import { CardId } from "../Types/IdCounter";
import { EvaluateNumber } from "../Logic/Evaluate";

export const ResolveRemoveCountersEffect = (effect: Effect, removeCountersEffect: RemoveCountersEffect) => {
    const { source, context } = effect;
    const targets = context.targets[0];

    if (!targets || targets.length === 0) {
        console.log(`RemoveCountersEffect: No targets to remove counters from`);
        return true;
    }

    // Evaluate the amount of counters to remove
    const amount = EvaluateNumber(GetCard(source), GetCard(source), removeCountersEffect.amount, context);

    targets.forEach(targetId => {
        const targetCard = GetCard(targetId as CardId);
        console.log(`Removing ${amount} ${removeCountersEffect.counterType} counter(s) from ${targetCard.name}`);
        
        // Remove the specified number of counters
        for (let i = 0; i < amount && targetCard.counters.length > 0; i++) {
            const counterIndex = targetCard.counters.findIndex(c => c === removeCountersEffect.counterType);
            if (counterIndex !== -1) {
                targetCard.counters.splice(counterIndex, 1);
            } else {
                console.log(`No ${removeCountersEffect.counterType} counters found on ${targetCard.name}`);
                break;
            }
        }
    });

    return true;
};