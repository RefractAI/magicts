import { CardType } from "../Types/CardTypes";
import { Creature } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { OnAttack } from "../CardHelpers/TriggerAbilityHelpers";
import { Endures, MayPay } from "../CardHelpers/EffectClassHelpers";

// Descendant of Storms
// Mana Cost: W
// Type: Creature — Human Soldier
// Power/Toughness: 2/1

// Whenever this creature attacks, you may pay {1}{W}. If you do, it endures 1. (Put a +1/+1 counter on it or create a 1/1 white Spirit creature token.)

export const DescendantofStorms: CardType = Creature("Descendant of Storms", "W", 2, 1, "Human", "Soldier",
  // Whenever this creature attacks, you may pay {1}{W}. If you do, it endures 1.
  OnAttack("Self",
    MayPay("1W", "Pay {1}{W} to endure 1?",
      [Endures(1, "Self")]
    )
  )
);

export const DescendantofStormsTest: Test = {
  name: "Descendant of Storms",
  description: "Test OnAttack trigger with Endures, choosing Spirit mode", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "Descendant", cardName: "Descendant of Storms", zone: "Field", friendly: true },
    { id: "Plains1", cardName: "Plains", zone: "Field", friendly: true },
    { id: "Plains2", cardName: "Plains", zone: "Field", friendly: true },
    { id: "Plains3", cardName: "Plains", zone: "Field", friendly: true },
  ],
  steps: [
    // Verify initial state
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Descendant", conditionName: "InZone", expectedValue: "Field" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Descendant", conditionName: "HasPower", expectedValue: 2 },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Descendant", conditionName: "HasToughness", expectedValue: 1 },
    
    // Move to declare attackers phase
    { type: "Input", name: "PassUntil", phase: "DeclareAttackers", friendly: true },

    // Declare Attackers - attack with Descendant of Storms
    { type: "Input", name: "PairInput", pairs: [["Descendant", "Opponent"]] },


    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    
    // OnAttack trigger - choose to pay {1}{W}
    { type: "Input", name: "BooleanInput", response: true }, // Choose to pay for endures
    
    // Endures choice - choose Spirit mode (create token)
    { type: "Input", name: "ButtonChooseInput", buttonText: "Create Spirit token" }, // Choose Spirit option (1/1 white Spirit token)
    
    // Pass priority after trigger resolves
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Verify Spirit token was created
    { type: "Assertion", name: "TokenExists", tokenTestCardIds: ["SpiritToken1"], tokenCardName: "11WhiteSpirit", zone: "Field", count: 1, friendly: true },
    
    // Verify Descendant still has original power/toughness (didn't get +1/+1 counter)
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Descendant", conditionName: "HasPower", expectedValue: 2 },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Descendant", conditionName: "HasToughness", expectedValue: 1 }
  ]
};
