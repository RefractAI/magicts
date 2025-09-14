import { Effect } from "../Types/EffectTypes";
import { RevealEffect } from "../Types/EffectTypes";
import { GetCard } from "../Logic/GetCard";
import { PerformReveal } from "../Logic/MutateBoard";

export const ResolveRevealEffect = (effect: Effect, _: RevealEffect) => {
    const { context } = effect;
    const targets = context.targets[0];
    
    if (!targets || targets.length === 0) {
        console.log("RevealEffect: No valid targets found");
        return true;
    }
    
    // Reveal each targeted card
    targets.forEach(cardId => {
        const card = GetCard(cardId);
        console.log(`RevealEffect: Revealing ${card.name}`);
        PerformReveal(card.id);
    });
    
    return true;
};