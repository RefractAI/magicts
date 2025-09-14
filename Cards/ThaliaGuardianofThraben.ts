import { CardType } from "../Types/CardTypes";
import { Creature } from "../CardHelpers/CardTypesHelpers";
import { MakeCostModificationAbility } from "../CardHelpers/AbilityClassHelpers";
import { Test } from "../Testing/TestTypes";
import { C } from "../Types/ConditionHelpers";

// Thalia, Guardian of Thraben
// Mana Cost: 1W
// Type: Legendary Creature — Human Soldier
// Power/Toughness: 2/1

// First strike
// Noncreature spells cost {1} more to cast.

export const ThaliaGuardianofThraben: CardType = Creature("Thalia, Guardian of Thraben", "1W", 2, 1, "Human", "Soldier", "FirstStrike",
  // Noncreature spells cost {1} more to cast.
  MakeCostModificationAbility("1", C.Target("NonCreatureAnyZone"))
);

export const ThaliaGuardianofThrabenTest: Test = {
  name: "Thalia, Guardian of Thraben",
  description: "Thalia has first strike and makes noncreature spells cost {1} more to cast", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "Thalia", cardName: "Thalia, Guardian of Thraben", zone: "Hand", friendly: true },
    { id: "LightningBolt", cardName: "Lightning Bolt", zone: "Hand", friendly: true },
    { id: "Bear", cardName: "Bear", zone: "Field", friendly: false },
    { id: "Plains", cardName: "Plains", zone: "Field", friendly: true },
    { id: "Mountain1", cardName: "Mountain", zone: "Field", friendly: true },
    { id: "Mountain2", cardName: "Mountain", zone: "Field", friendly: true },
  ],
  steps: [
    // Cast Thalia
    { type: "Input", name: "CastInput", targetCardId: "Thalia" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Verify Thalia is on the field with first strike
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Thalia", conditionName: "InZone", expectedValue: "Field" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Thalia", conditionName: "HasKeyword", expectedValue: "FirstStrike" },
    
    { type: "Assertion", name: "CastCost", targetCardId: "LightningBolt", expectedCost: "1R" },
    
    { type: "Input", name: "CastInput", targetCardId: "LightningBolt" },
    { type: "Input", name: "ChooseInput", targetCardId: "Bear" },

    { type: "Assertion", name: "CastCost", targetCardId: "LightningBolt", expectedCost: "1R" },
  ]
};
