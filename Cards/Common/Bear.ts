import { CardType } from "../../Types/CardTypes";
import { Creature } from "../../CardHelpers/CardTypesHelpers";

// Bear
// Mana Cost: {1}{G}
// Type: Creature — Bear
// Power: 2
// Toughness: 2
// Rules Text: (No rules text)

export const Bear: CardType = Creature("Bear", "1G", 2, 2, "Bear");

// Note: Bear is a basic creature used in many tests, no specific test needed