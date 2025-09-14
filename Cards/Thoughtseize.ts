import { CardType } from "../Types/CardTypes";
import { Sorcery } from "../CardHelpers/CardTypesHelpers";
import { ChooseTarget, Discard, LoseLife, May } from "../CardHelpers/EffectClassHelpers";
import { C } from "../Types/ConditionHelpers";
import { Test } from "../Testing/TestTypes";

// Thoughtseize
// Mana Cost: B
// Type: Sorcery

// Target player reveals their hand. You choose a nonland card from it. That player discards that card. You lose 2 life.

export const Thoughtseize: CardType = Sorcery("Thoughtseize", "B",
  // Target opponent reveals their hand. You choose a nonland card from it. That player discards that card. You lose 2 life.
  ChooseTarget(C.Target("Opponent", "NonLandHand"), 
    May(
      Discard("OpponentPlayer", "ContextTarget"),
      LoseLife(2, "FriendlyPlayer")
    )
  )
);

export const ThoughtseizeTest: Test = {
  name: "Thoughtseize",
  description: "Target opponent reveals their hand. You choose a nonland card from it. That player discards that card. You lose 2 life.", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "Thoughtseize", cardName: "Thoughtseize", zone: "Hand", friendly: true },
    { id: "Swamp", cardName: "Swamp", zone: "Field", friendly: true },
    // Give opponent some cards in hand to target
    { id: "OpponentCreature", cardName: "Bear", zone: "Hand", friendly: false },
    { id: "OpponentLand", cardName: "Mountain", zone: "Hand", friendly: false },
    { id: "OpponentInstant", cardName: "Lightning Bolt", zone: "Hand", friendly: false },
  ],
  steps: [
    // Cast Thoughtseize
    { type: "Input", name: "CastInput", targetCardId: "Thoughtseize" },
    
    // Choose a nonland card from opponent's hand during casting (should exclude the Mountain)
    { type: "Input", name: "ChooseInput", targetCardId: "OpponentCreature" },
    
    // Pass priority to put spell on stack and let it resolve
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Let's see what input the game is actually asking for
    { type: "Input", name: "BooleanInput", response: true },
    
    
    // Verify Thoughtseize went to graveyard and opponent discarded the chosen card
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Thoughtseize", conditionName: "InZone", expectedValue: "Graveyard" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "OpponentCreature", conditionName: "InZone", expectedValue: "Graveyard" },
    // Verify opponent still has land in hand (should not have been targetable)
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "OpponentLand", conditionName: "InZone", expectedValue: "Hand" },
    
    // Verify life loss effect
    { type: "Assertion", name: "Life", targetCardId: "Player", expectedLife: 18 },
  ]
};
