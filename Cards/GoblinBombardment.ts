import { CardType } from "../Types/CardTypes";
import { Enchantment } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { MakeActivatedAbility } from "../CardHelpers/AbilityClassHelpers";
import { Sacrifice, Damage } from "../CardHelpers/EffectClassHelpers";
import { C } from "../Types/ConditionHelpers";

// Goblin Bombardment
// Mana Cost: 1R
// Type: Enchantment
// Sacrifice a creature: Goblin Bombardment deals 1 damage to any target.

export const GoblinBombardment: CardType = Enchantment("Goblin Bombardment", "1R",
  // Sacrifice a creature. Goblin Bombardment deals 1 damage to any target.
  MakeActivatedAbility(
    Sacrifice("FriendlyPlayer", C.Target("Friendly", "Creature")),
    Damage(1, C.Target("AnyTarget"))
  )
);

export const GoblinBombardmentTest: Test = {
  name: "Goblin Bombardment",
  description: "Test Goblin Bombardment's sacrifice ability",
  initialPhase: "FirstMain",
  initialCards: [
    { id: "Bombardment", cardName: "Goblin Bombardment", zone: "Field", friendly: true },
    { id: "Mountain", cardName: "Mountain", zone: "Field", friendly: true },
    { id: "Plains", cardName: "Plains", zone: "Field", friendly: true },
    { id: "Bear", cardName: "Bear", zone: "Field", friendly: true },
    { id: "Bear2", cardName: "Bear", zone: "Field", friendly: true },
    { id: "Target", cardName: "Bear", zone: "Field", friendly: false },
  ],
  steps: [
    // Activate Goblin Bombardment's ability - sacrifice Bear then deal 1 damage to target
    { type: "Input", name: "CastInput", targetCardId: "Bombardment", abilityIndex: 0 },
   
    { type: "Input", name: "ChooseInput", targetCardId: "Target" }, // Choose target for damage
    { type: "Input", name: "ChooseInput", targetCardId: "Bear" }, // Choose Bear to sacrifice (costs are paid after targets are chosen)
    { type: "Input", name: "PassPriority" }, // Both players pass, ability resolves
    { type: "Input", name: "PassPriority" },
    
    // Bear should be in graveyard after sacrifice
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Bear", conditionName: "InZone", expectedValue: "Graveyard" },
    
    // Target should have 1 damage marked
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Target", conditionName: "HasDamageMarked", expectedValue: 1 }
  ]
};