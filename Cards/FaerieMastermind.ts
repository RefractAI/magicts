import { CardType } from "../Types/CardTypes";
import { Creature } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { Draw } from "../CardHelpers/EffectClassHelpers";
import { MakeActivatedAbility, MakeTriggeredAbility } from "../CardHelpers/AbilityClassHelpers";

// Faerie Mastermind
// Mana Cost: {1}{U}
// Type: Creature — Faerie Rogue
// Power/Toughness: 2/1

// Flash
// Flying  
// Whenever an opponent draws their second card each turn, you draw a card.
// {3}{U}: Each player draws a card.

export const FaerieMastermind: CardType = Creature(
  "Faerie Mastermind", 
  "1U", 
  2, 
  1, 
  "Faerie", 
  "Rogue",
  "Flash",
  "Flying",
  // Whenever an opponent draws their second card each turn, you draw a card.
  MakeTriggeredAbility(
    "DrawSecondCard",
    "OpponentPlayer",
    Draw(1, "FriendlyPlayer")
  ),
  // {3}{U}: Each player draws a card.
  MakeActivatedAbility(
    "3U",
    Draw(1, "AllPlayers")
  )
);

export const FaerieMastermindTest: Test = {
  name: "Faerie Mastermind",
  description: "Test Faerie Mastermind triggered ability and activated ability",
  initialPhase: "FirstMain",
  initialCards: [
    { id: "FaerieMastermind", cardName: "Faerie Mastermind", zone: "Hand", friendly: true },
    { id: "Island3", cardName: "Island", zone: "Field", friendly: true },
    { id: "Island4", cardName: "Island", zone: "Field", friendly: true },
    { id: "Lightning1", cardName: "Lightning Bolt", zone: "Library", friendly: true, position: 1 },
    { id: "Lightning2", cardName: "Lightning Bolt", zone: "Library", friendly: false, position: 1 }
  ],
  steps: [
    // Cast Faerie Mastermind (Player 1 starts with 7+1=8 cards, goes to 7 after casting)
    { type: "Input", name: "CastInput", targetCardId: "FaerieMastermind" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "FaerieMastermind", conditionName: "InZone", expectedValue: "Field" },
    { type: "Assertion", name: "CardsInZone", friendly: true, zone: "Hand", expectedCount: 7 },
    
    // Navigate to opponent's first main phase (after their draw step - opponent now has 7+1=8 cards)
    { type: "Input", name: "PassUntil", phase: "FirstMain", friendly: false },
    { type: "Assertion", name: "CardsInZone", friendly: false, zone: "Hand", expectedCount: 8 },
    
    // Pass priority so player can activate ability
    { type: "Input", name: "PassPriority" },
    
    // Activate Faerie Mastermind's ability: Each player draws a card
    // This causes opponent to draw their second card, triggering Faerie Mastermind
    // Final result: Player 1 = 7+1+1=9 cards (1 from ability + 1 from trigger), Player 2 = 8+1=9 cards (1 from ability)
    { type: "Input", name: "CastInput", targetCardId: "FaerieMastermind", abilityIndex: 0 },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    // Additional pass priority to let the DrawSecondCard triggered ability resolve
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Assert final card counts - both players should have 9 cards
    { type: "Assertion", name: "CardsInZone", friendly: true, zone: "Hand", expectedCount: 9 },
    { type: "Assertion", name: "CardsInZone", friendly: false, zone: "Hand", expectedCount: 9 }
  ]
};
