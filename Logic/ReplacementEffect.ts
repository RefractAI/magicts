import { controller } from "../Network/Server";
import { CardId } from "../Types/IdCounter";
import { TriggerName } from "../Types/TriggerNames";
import { GetConditionCards, EvaluateCondition } from "./Evaluate";
import { GetReplacementEffectAbilities } from "./GetCard";
import { AddReplacementEffectGameAction } from "../Types/GameActionHelpers";

export const ReplacementEffect = (triggerName: TriggerName, triggerSources: CardId[]): boolean => {
    console.log(`ReplacementEffect called: ${triggerName}, triggerSources:`, triggerSources);
    
    const allReplacementAbilities = controller.cards.flatMap(c => {
        const replacementAbilities = GetReplacementEffectAbilities(c);
        return replacementAbilities.map(ra => ({card: c, ra}));
    });
    
    const relevantReplacements = allReplacementAbilities.filter(({ra}) => ra[1].trigger === triggerName);
    console.log(`Found ${relevantReplacements.length} replacement abilities with trigger ${triggerName}`);
    
    const replacements = relevantReplacements
        .filter(({card: c, ra}) => {
            // Check if the replacement effect condition is met (on the card with the ability)
            const conditionMet = ra[1].condition.cls === 'NoneCondition' || EvaluateCondition(c.id, c.id, ra[1].condition, ra[0].context);
            console.log(`Condition check for replacement ${ra[1].trigger} on card ${c.id} (${c.name}): ${conditionMet}`);
            return conditionMet;
        })
        .map(({card: c, ra}) => ({ra, sources: GetConditionCards(c, ra[1].triggerSourceCondition, ra[0].context).filter(ts => triggerSources.includes(ts))}))
        .filter(ra => ra.sources.length > 0)
        .map(ra => ({c: relevantReplacements.find(rt => rt.ra === ra.ra)!.card, ra: ra.ra, sources: ra.sources}));

    if (replacements.length === 0) {
        return false; // No replacement effect applies
    }

    // For now, apply the first applicable replacement effect
    // In the future, this could be enhanced to handle multiple replacement effects
    const replacement = replacements[0];
    console.log("Applying ReplacementEffect:", replacement.ra[1].trigger, replacement.c.id, replacement.sources);

    // Create a ReplacementEffectAction instead of the original action
    AddReplacementEffectGameAction(replacement.c.id, replacement.ra[1].effects);
    
    return true; // Replacement effect was applied
};