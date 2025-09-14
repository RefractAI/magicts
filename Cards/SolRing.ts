import { CardType } from "../Types/CardTypes";
import { Artifact } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { MakeActivatedAbility } from "../CardHelpers/AbilityClassHelpers";
import { AddMana } from "../CardHelpers/EffectClassHelpers";

// Sol Ring
// Mana Cost: 1
// Type: Artifact


// {T}: Add {C}{C}.

export const SolRing: CardType = Artifact("Sol Ring", "1",
  MakeActivatedAbility("T", AddMana("Colorless", 2))
);

export const SolRingTest: Test = {
  name: "Sol Ring",
  description: "Sol Ring adds 2 colorless mana", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "TestCard", cardName: "Sol Ring", zone: "Field", friendly: true }
  ],
  steps: [
    { type: "Input", name: "CastInput", targetCardId: "TestCard", abilityIndex: 0 },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "TestCard", conditionName: "InZone", expectedValue: "Field" }
  ]
};
