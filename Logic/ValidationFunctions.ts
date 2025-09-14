import { CardId } from "../Types/IdCounter";
import { GetCard } from "./GetCard";
import { TribeName } from "../Types/TribeNames";

// Validation function registry
export const ValidationFunctions: Record<string, (cardIds: CardId[]) => boolean> = {};

// Default validation function that always returns true
ValidationFunctions["None"] = (_cardIds: CardId[]): boolean => true;

// Nethergoyf escape condition: exile any number of other cards from your graveyard with four or more card types among them
ValidationFunctions["NethergoyfEscapeCondition"] = (cardIds: CardId[]): boolean => {
    if (cardIds.length === 0) return false;
    
    // Get card types from selected cards
    const cardTypes = new Set<TribeName>();
    
    cardIds.forEach(cardId => {
        const card = GetCard(cardId);
        if (card.zone !== 'Graveyard') return false; // Must be from graveyard
        
        // Add all tribes of this card to our set
        card.tribes.forEach(tribe => cardTypes.add(tribe));
    });
    
    // Must have at least 4 different card types
    return cardTypes.size >= 4;
};