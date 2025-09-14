import { CardType } from "../Types/CardTypes";
import { Instant } from "../CardHelpers/CardTypesHelpers";
import { Destroy } from "../CardHelpers/EffectClassHelpers";
import { MakeCantBeCounteredAbility } from "../CardHelpers/AbilityClassHelpers";
import { Test } from "../Testing/TestTypes";
import { C } from "../Types/ConditionHelpers";

export const AbruptDecay: CardType = Instant("Abrupt Decay", "BG",
  // This spell can't be countered
  MakeCantBeCounteredAbility(),
  // Destroy target nonland permanent with mana value 3 or less
  Destroy(C.Target("NonLand", C.CMCNOrLess(3)))
);

export const AbruptDecayTest: Test = {
  name: "Abrupt Decay",
  description: "Test Abrupt Decay destroying nonland permanent with CMC 3 or less", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "AbruptDecay", cardName: "Abrupt Decay", zone: "Hand", friendly: true },
    { id: "ValidTarget", cardName: "Bear", zone: "Field", friendly: false }, 
    { id: "ValidTarget2", cardName: "Bear", zone: "Field", friendly: false } 
  ],
  steps: [
    { type: "Input", name: "CastInput", targetCardId: "AbruptDecay" },
    { type: "Input", name: "ChooseInput", targetCardId: "ValidTarget" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "ValidTarget", conditionName: "InZone", expectedValue: "Graveyard" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "AbruptDecay", conditionName: "InZone", expectedValue: "Graveyard" }
  ]
};
