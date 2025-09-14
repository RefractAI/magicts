import { CardType } from "../../Types/CardTypes";
import { Land, Generic, Artifact } from "../../CardHelpers/CardTypesHelpers";

// Basic Lands
export const Plains: CardType = Land("Plains", "Plains");
export const Island: CardType = Land("Island", "Island");
export const Swamp: CardType = Land("Swamp", "Swamp");
export const Mountain: CardType = Land("Mountain", "Mountain");
export const Forest: CardType = Land("Forest", "Forest");
export const RainbowLand: CardType = Land("RainbowLand", "Rainbow");

// Other basic cards
export const GruulSignet: CardType = Artifact("Gruul Signet", "2");

// Special cards for game mechanics
export const Player: CardType = Generic("Player", "Player");
export const Opponent: CardType = Generic("Opponent", "Player");
export const Ability: CardType = Generic("Ability", "Ability");
export const Option: CardType = Generic("Option", "Option");