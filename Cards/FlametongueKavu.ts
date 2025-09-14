import { CardType } from "../Types/CardTypes";
import { Creature } from "../CardHelpers/CardTypesHelpers";
import { Damage } from "../CardHelpers/EffectClassHelpers";
import { ETB } from "../CardHelpers/TriggerAbilityHelpers";

// Flametongue Kavu
// Mana Cost: {3}{R}
// Type: Creature — Kavu
// Power: 4
// Toughness: 2
// Rules Text: When Flametongue Kavu enters the battlefield, it deals 4 damage to target creature.

export const FlametongueKavu: CardType = Creature("Flametongue Kavu", "3R", 4, 2, "Kavu",
  // When Flametongue Kavu enters the battlefield, it deals 4 damage to target creature.
  ETB(
    Damage(4, "Creature")
  )
);