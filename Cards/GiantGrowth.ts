import { CardType } from "../Types/CardTypes";
import { Instant } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { TargetGains } from "../CardHelpers/EffectClassHelpers";
import { MakePowerToughnessAbility } from "../CardHelpers/AbilityClassHelpers";

// Giant Growth
// Mana Cost: G
// Type: Instant


// Target creature gets +3/+3 until end of turn.

export const GiantGrowth: CardType = Instant("Giant Growth", "G",
  TargetGains("Creature", MakePowerToughnessAbility(3, 3, "UntilEndOfTurn"))
);

export const GiantGrowthTest: Test = {
  name: "Giant Growth",
  description: "Giant Growth gives target creature +3/+3 until end of turn", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "TestCard", cardName: "Giant Growth", zone: "Hand", friendly: true },
    { id: "Creature", cardName: "Benevolent Bodyguard", zone: "Field", friendly: true }
  ],
  steps: [
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Creature", conditionName: "HasPower", expectedValue: 1 },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Creature", conditionName: "HasToughness", expectedValue: 1 },
    { type: "Input", name: "CastInput", targetCardId: "TestCard" },
    { type: "Input", name: "ChooseInput", targetCardId: "Creature" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "TestCard", conditionName: "InZone", expectedValue: "Graveyard" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Creature", conditionName: "HasPower", expectedValue: 4 },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Creature", conditionName: "HasToughness", expectedValue: 4 }
  ]
};
