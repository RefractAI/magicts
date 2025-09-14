import { Effect, TransformEffect } from "../Types/EffectTypes";
import { GetAbilityType } from "../Types/AbilityTypes";
import { ExecuteTrigger } from "../Logic/ExecuteTrigger";
import { GetCard } from "../Logic/GetCard";
import { HandleCardNameChange } from "../Logic/NameChange";
import { CardId } from "../Types/IdCounter";

export const ResolveTransformEffect = (effect: Effect, _: TransformEffect): boolean => {
    // Find target cards that can transform
    const targets = effect.context.targets[0] || [];
    
    for (const targetId of targets) {
        const card = GetCard(targetId as CardId);
        if (!card) continue;
        
        // Find the transform casting option on this card
        const transformAbility = card.printedAbilities.find((at: any) => {
            const ability = GetAbilityType(at.type);
            return ability.abilityCls === 'CastingOptionAbility' && ability.optionType === 'Transform';
        });
        
        if (!transformAbility) continue;
        
        const ability = GetAbilityType(transformAbility.type);
        if (ability.abilityCls !== 'CastingOptionAbility' || ability.optionType !== 'Transform') continue;
        
        const newName = ability.cardName;
        if (!newName) continue;
        
        // Handle the transformation - this updates name, cost, and abilities
        HandleCardNameChange(targetId as CardId, newName);
        
        // Trigger the Transform event after the transformation is complete
        ExecuteTrigger('Transform', [card.id]);
    }
    
    return true;
};