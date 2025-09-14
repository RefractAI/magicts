import { CardType } from "../Types/CardTypes";
import { Instant } from "../CardHelpers/CardTypesHelpers";
import { ChooseOneCastingOption } from "../CardHelpers/AbilityClassHelpers";
import { Damage, Destroy } from "../CardHelpers/EffectClassHelpers";
import { Test } from "../Testing/TestTypes";
import { C } from "../Types/ConditionHelpers";

export const Abrade: CardType = Instant("Abrade", "1R",
  ChooseOneCastingOption("", [], [Damage(3, C.Target("Creature"))]),
  ChooseOneCastingOption("", [], [Destroy("Artifact")])
);

export const AbradeTest: Test = {
  name: "Abrade",
  description: "Test Abrade's first mode - damage to creature", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "Abrade", cardName: "Abrade", zone: "Hand", friendly: true },
    { id: "TestCreature1", cardName: "Bear", zone: "Field", friendly: false },
    { id: "TestCreature2", cardName: "Bear", zone: "Field", friendly: false }
  ],
  steps: [
    { type: "Input", name: "CastInput", targetCardId: "Abrade", chosenMode: 0 },
    { type: "Input", name: "ChooseInput", targetCardId: "TestCreature1" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "TestCreature1", conditionName: "InZone", expectedValue: "Graveyard" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Abrade", conditionName: "InZone", expectedValue: "Graveyard" }
  ]
};
