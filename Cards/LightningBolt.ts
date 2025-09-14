import { CardType } from "../Types/CardTypes";
import { Instant } from "../CardHelpers/CardTypesHelpers";
import { Damage } from "../CardHelpers/EffectClassHelpers";
import { Test } from "../Testing/TestTypes";
import { C } from "../Types/ConditionHelpers";

// Lightning Bolt
// Mana Cost: {R}
// Type: Instant
// Rules Text: Lightning Bolt deals 3 damage to any target.

export const LightningBolt: CardType = Instant("Lightning Bolt", "R",
  // Lightning Bolt deals 3 damage to any target.
  Damage(3, C.Target("AnyTarget"))
);

export const LightningBoltTest: Test = {
  name: "Lightning Bolt",
  description: "Lightning Bolt deals 3 damage to any target.",
  initialPhase: "FirstMain",
  initialCards: [
    { id: "Bolt", cardName: "Lightning Bolt", zone: "Hand", friendly: true },
    { id: "Bear1", cardName: "Bear", zone: "Field", friendly: true },
    { id: "Bear2", cardName: "Bear", zone: "Field", friendly: false },
    { id: "Bear3", cardName: "Bear", zone: "Field", friendly: false },
  ],
  steps: [
    { type: "Input", name: "CastInput", targetCardId: "Bolt" },
    { type: "Input", name: "ChooseInput", targetCardId: "Bear2" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Bear2", conditionName: "InZone", expectedValue: "Graveyard" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Bolt", conditionName: "InZone", expectedValue: "Graveyard" }
  ]
};