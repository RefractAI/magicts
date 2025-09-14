import { CardType } from "../Types/CardTypes";
import { Sorcery } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { Scry, Draw } from "../CardHelpers/EffectClassHelpers";

// Preordain
// Mana Cost: U
// Type: Sorcery


// Scry 2, then draw a card. (To scry 2, look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)

export const Preordain: CardType = Sorcery("Preordain", "U", Scry(2), Draw(1));

export const PreordainTest: Test = {
  name: "Preordain",
  description: "Test Preordain's scry 2 then draw a card effect", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "TestCard", cardName: "Preordain", zone: "Hand", friendly: true },
    { id: "Island", cardName: "Island", zone: "Field", friendly: true },
    { id: "LibCard1", cardName: "Lightning Bolt", zone: "Library", position: 0, friendly: true },
    { id: "LibCard2", cardName: "Bear", zone: "Library", position: 1, friendly: true },
    { id: "LibCard3", cardName: "Plains", zone: "Library", position: 2, friendly: true }
  ],
  steps: [
    { type: "Input", name: "CastInput", targetCardId: "TestCard" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "BucketInput", buckets: [
      ["LibCard1"], // Keep Lightning Bolt on top
      ["LibCard2"] // Put Bear on bottom
    ]},
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "TestCard", conditionName: "InZone", expectedValue: "Graveyard" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "LibCard1", conditionName: "InZone", expectedValue: "Hand" }
  ]
};
