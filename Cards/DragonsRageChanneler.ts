import { CardType } from "../Types/CardTypes";
import { Creature } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { Surveil } from "../CardHelpers/EffectClassHelpers";
import { MakeTriggeredAbility, MakeConditionalPowerToughnessAbility, MakeConditionalKeywordAbility } from "../CardHelpers/AbilityClassHelpers";
import { C } from "../Types/ConditionHelpers";

// Dragon's Rage Channeler
// Mana Cost: R
// Type: Creature — Human Shaman
// Power/Toughness: 1/1

// Whenever you cast a noncreature spell, surveil 1. (Look at the top card of your library. You may put that card into your graveyard.)
// Delirium — As long as there are four or more card types among cards in your graveyard, this creature gets +2/+2, has flying, and attacks each combat if able.

export const DragonsRageChanneler: CardType = Creature(
  "Dragon's Rage Channeler", 
  "R", 
  1, 
  1, 
  "Human", 
  "Shaman",
  // Whenever you cast a noncreature spell, surveil 1.
  MakeTriggeredAbility(
    "CastSpell",
    C.Target("Friendly","NonCreatureAnyZone"),
    Surveil()
  ),
  // Delirium — As long as there are four or more card types among cards in your graveyard, this creature gets +2/+2, has flying, and attacks each combat if able.
  MakeConditionalPowerToughnessAbility(2, 2, "Delirium"),
  MakeConditionalKeywordAbility("Flying", "Delirium", "Self"),
  MakeConditionalKeywordAbility("AttacksEachCombatIfAble", "Delirium", "Self")
);

export const DragonsRageChannelerTest: Test = {
  name: "Dragon's Rage Channeler",
  description: "Test Dragon's Rage Channeler surveil trigger and Delirium abilities", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "DRC", cardName: "Dragon's Rage Channeler", zone: "Hand", friendly: true },
    { id: "Bolt", cardName: "Lightning Bolt", zone: "Hand", friendly: true },
    { id: "Mountain", cardName: "Mountain", zone: "Hand", friendly: true },
    { id: "Forest", cardName: "Forest", zone: "Hand", friendly: true },
    { id: "Bear", cardName: "Bear", zone: "Hand", friendly: true },
    
    // Put diverse card types in graveyard for Delirium
    { id: "GraveyardCreature", cardName: "Bear", zone: "Graveyard", friendly: true },
    { id: "GraveyardInstant", cardName: "Lightning Bolt", zone: "Graveyard", friendly: true },
    { id: "GraveyardLand", cardName: "Mountain", zone: "Graveyard", friendly: true },
    { id: "GraveyardSorcery", cardName: "Demonic Tutor", zone: "Graveyard", friendly: true }, // Need 4th type for Delirium
    
    // Library cards for surveil
    { id: "TopCard", cardName: "Island", zone: "Library", friendly: true, position: 0 },
    { id: "SecondCard", cardName: "Forest", zone: "Library", friendly: true, position: 1 },
  ],
  steps: [
    // Cast Dragon's Rage Channeler (should have Delirium already - 4 types in graveyard)
    { type: "Input", name: "CastInput", targetCardId: "DRC" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "DRC", conditionName: "InZone", expectedValue: "Field" },
    
    // Verify Delirium is active - DRC should be 3/3 with flying (1/1 base + 2/2 from Delirium)
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "DRC", conditionName: "HasPower", expectedValue: 3 },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "DRC", conditionName: "HasToughness", expectedValue: 3 },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "DRC", conditionName: "HasKeyword", expectedValue: "Flying" },
    
    // Cast Lightning Bolt (noncreature spell) to trigger surveil
    { type: "Input", name: "CastInput", targetCardId: "Bolt" },
    { type: "Input", name: "ChooseInput", targetCardId: "Opponent" }, // Target opponent instead of DRC
    
    
    // Pass priority for Lightning Bolt to resolve  
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },

    // Surveil choice - put top card in graveyard
    { type: "Input", name: "BucketInput", buckets: [[], ["TopCard"]] },

    // Pass priority for DRC to resolve
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Verify surveil worked - Island should be in graveyard now
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "TopCard", conditionName: "InZone", expectedValue: "Graveyard" },
    
    // Verify Lightning Bolt resolved and went to graveyard
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Bolt", conditionName: "InZone", expectedValue: "Graveyard" },
    
    // DRC should still have Delirium (still 4+ card types in graveyard)
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "DRC", conditionName: "HasPower", expectedValue: 3 },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "DRC", conditionName: "HasToughness", expectedValue: 3 },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "DRC", conditionName: "HasKeyword", expectedValue: "AttacksEachCombatIfAble" },
    
    // Test AttacksEachCombatIfAble mechanic - the test framework will validate that DRC
    // is included as a required attacker in the PairInput when combat begins
  ]
};
