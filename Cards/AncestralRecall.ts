import { CardType } from "../Types/CardTypes";
import { Instant } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { Draw } from "../CardHelpers/EffectClassHelpers";

// Ancestral Recall
// Mana Cost: U
// Type: Instant

// Target player draws three cards.

export const AncestralRecall: CardType = Instant("Ancestral Recall", "U", 
  Draw(3, "AnyPlayer")
);

export const AncestralRecallTest: Test = {
  name: "Ancestral Recall",
  description: "Target player draws three cards", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "TestCard", cardName: "Ancestral Recall", zone: "Hand", friendly: true },
    { id: "Library1", cardName: "Plains", zone: "Library", friendly: true, position: 0 },
    { id: "Library2", cardName: "Island", zone: "Library", friendly: true, position: 1 },
    { id: "Library3", cardName: "Swamp", zone: "Library", friendly: true, position: 2 }
  ],
  steps: [
    { type: "Input", name: "CastInput", targetCardId: "TestCard" },
    { type: "Input", name: "ChooseInput", targetCardId: "Player" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "TestCard", conditionName: "InZone", expectedValue: "Graveyard" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Library1", conditionName: "InZone", expectedValue: "Hand" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Library2", conditionName: "InZone", expectedValue: "Hand" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Library3", conditionName: "InZone", expectedValue: "Hand" }
  ]
};
