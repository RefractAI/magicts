import { CardName } from "../Cards/Common/CardNames";
import { CardId } from "../Types/IdCounter";
import { GetCard, GetCardType } from "./GetCard";
import { ToAbility } from "../Types/AbilityTypes";
import { CalculateAbilities } from "./CalculateAbilities";

export const HandleCardNameChange = (cardId: CardId, newCardName: CardName) => {
    const card = GetCard(cardId);
    
    // Store the original name in case we need it for triggers
    const originalName = card.name;
    
    // Update the card's name
    card.name = newCardName;
    
    // Get the abilities for the new card type
    const newCardType = GetCardType(cardId);
    
    // Update cost
    card.cost = newCardType.cost;
    
    // Update abilities - only apply full abilities if the card is on the field
    let abilities = newCardType.abilities;
    if (card.zone !== 'Field') {
        // Only apply tribes, power/toughness, keywords, and casting options in other zones
        abilities = abilities.filter(a => 
            a.abilityCls === 'BaseTribeAbility' || 
            a.abilityCls === 'BasePowerToughnessAbility' || 
            a.abilityCls === 'KeywordAbility' ||
            a.abilityCls === 'CastingOptionAbility'
        );
    }
    
    // Apply the new abilities
    card.printedAbilities = abilities.map(a => ToAbility(a, card.id, card.timestamp, {targets: []}));
    
    // Recalculate all abilities since this card's transformation might affect other cards
    CalculateAbilities();
    
    return originalName;
};