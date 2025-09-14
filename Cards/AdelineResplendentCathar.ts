import { CardType } from "../Types/CardTypes";
import { Creature } from "../CardHelpers/CardTypesHelpers";
import { CreateTappedAndAttacking } from "../CardHelpers/EffectClassHelpers";
import { OnAttack } from "../CardHelpers/TriggerAbilityHelpers";
import { Test } from "../Testing/TestTypes";
import { C } from "../Types/ConditionHelpers";

// Adeline, Resplendent Cathar
// Mana Cost: {1}{W}{W}
// Type: Legendary Creature — Human Knight
// Power: * (equal to number of creatures you control)
// Toughness: 4
// Rules Text: Adeline, Resplendent Cathar's power is equal to the number of creatures you control.
// Whenever you attack, for each opponent, create a 1/1 white Human creature token that's tapped and attacking that player or a planeswalker they control.

export const AdelineResplendentCathar: CardType = Creature("Adeline, Resplendent Cathar", "1WW", 
  // Adeline, Resplendent Cathar's power is equal to the number of creatures you control. 
  C.All("Friendly","Creature"), 4,
  "Legendary", "Human", "Knight", 
  // Whenever you attack, for each opponent, create a 1/1 white Human creature token that's tapped and attacking that player or a planeswalker they control.
  OnAttack("Self", 
    CreateTappedAndAttacking("11WhiteHuman"))
);

export const AdelineResplendentCatharTest: Test = {
  name: "Adeline, Resplendent Cathar",
  description: "Adeline's power equals creatures you control, and she creates tokens when attacking.",
  initialPhase: "BeginCombat",
  initialCards: [
    { id: "Adeline", cardName: "Adeline, Resplendent Cathar", zone: "Field", friendly: true },
    { id: "Bear1", cardName: "Bear", zone: "Field", friendly: true },
    { id: "Bear2", cardName: "Bear", zone: "Field", friendly: true },
  ],
  steps: [
    // Pass priority to move from BeginCombat to DeclareAttackers phase
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    // Now declare Adeline as attacker
    { type: "Input", name: "PairInput", pairs: [["Adeline", "Opponent"]] },
    // Pass priority to allow Adeline's triggered ability to resolve
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    // Verify Adeline is still on the field
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Adeline", conditionName: "InZone", expectedValue: "Field" },
    // Verify the Human token was created and is on the field
    { type: "Assertion", name: "TokenExists", tokenTestCardIds: ["Token1"], tokenCardName: "11WhiteHuman", zone: "Field", count: 1, friendly: true },
    // Verify Adeline's power increased after token creation 
    // Should be: Adeline + Bear1 + Bear2 + Token = 4
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Adeline", conditionName: "HasPower", expectedValue: 4 },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Bear1", conditionName: "InZone", expectedValue: "Field" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Bear2", conditionName: "InZone", expectedValue: "Field" }
  ]
};