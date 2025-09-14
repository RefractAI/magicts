import { CardType } from "../Types/CardTypes";
import { Artifact } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { MakeActivatedAbility } from "../CardHelpers/AbilityClassHelpers";
import { Sacrifice, Return, Draw } from "../CardHelpers/EffectClassHelpers";

// Aether Spellbomb
// Mana Cost: 1
// Type: Artifact


// {U}, Sacrifice this artifact: Return target creature to its owner's hand.
// {1}, Sacrifice this artifact: Draw a card.

export const AetherSpellbomb: CardType = Artifact("Aether Spellbomb", "1",
  MakeActivatedAbility(["U", Sacrifice()], Return("Creature")),
  MakeActivatedAbility(["1", Sacrifice()], Draw(1))
);

export const AetherSpellbombTest: Test = {
  name: "Aether Spellbomb",
  description: "Tests both activated abilities of Aether Spellbomb", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "TestCard", cardName: "Aether Spellbomb", zone: "Hand", friendly: true },
    { id: "TestCard2", cardName: "Aether Spellbomb", zone: "Hand", friendly: true },
    { id: "Target", cardName: "Bear", zone: "Field", friendly: false },
    { id: "Island1", cardName: "Island", zone: "Field", friendly: true },
    { id: "Mountain1", cardName: "Mountain", zone: "Field", friendly: true }
  ],
  steps: [
    { type: "Input", name: "CastInput", targetCardId: "TestCard" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "TestCard", conditionName: "InZone", expectedValue: "Field" },
    
    { type: "Input", name: "CastInput", targetCardId: "TestCard", abilityIndex: 0 },
    { type: "Input", name: "ChooseInput", targetCardId: "Target" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Target", conditionName: "InZone", expectedValue: "Hand" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "TestCard", conditionName: "InZone", expectedValue: "Graveyard" },
    
    { type: "Input", name: "CastInput", targetCardId: "TestCard2" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "TestCard2", conditionName: "InZone", expectedValue: "Field" },
    
    { type: "Input", name: "CastInput", targetCardId: "TestCard2", abilityIndex: 1 },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "TestCard2", conditionName: "InZone", expectedValue: "Graveyard" }
  ]
};
