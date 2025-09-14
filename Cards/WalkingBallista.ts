import { CardType } from "../Types/CardTypes";
import { Creature } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { MakeActivatedAbility, MakeEntersWithCountersAbility } from "../CardHelpers/AbilityClassHelpers";
import { Damage, AddCounters, RemoveCounters } from "../CardHelpers/EffectClassHelpers";
import { C } from "../Types/ConditionHelpers";

// Walking Ballista
// Mana Cost: XX
// Type: Artifact Creature — Construct
// Power/Toughness: 0/0

// This creature enters with X +1/+1 counters on it.
// {4}: Put a +1/+1 counter on this creature.
// Remove a +1/+1 counter from this creature: It deals 1 damage to any target.

export const WalkingBallista: CardType = Creature("Walking Ballista", "XX", 0, 0, "Artifact", "Construct",
  // This creature enters with X +1/+1 counters on it
  MakeEntersWithCountersAbility("PlusOnePlusOne", "SelectedX"),
  
  // {4}: Put a +1/+1 counter on this creature
  MakeActivatedAbility("4",
    AddCounters("PlusOnePlusOne", 1)
  ),
  
  // Remove a +1/+1 counter from this creature: It deals 1 damage to any target
  MakeActivatedAbility([RemoveCounters("PlusOnePlusOne", 1)],
    Damage(1, C.Target("AnyTarget"))
  )
);

export const WalkingBallistaTest: Test = {
  name: "Walking Ballista",
  description: "Walking Ballista enters with counters, can add counters for {4}, and can remove counters to deal damage", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "Ballista", cardName: "Walking Ballista", zone: "Hand", friendly: true },
    { id: "Bear", cardName: "Bear", zone: "Field", friendly: false },
    { id: "Mountain1", cardName: "Mountain", zone: "Field", friendly: true},
    { id: "Mountain2", cardName: "Mountain", zone: "Field", friendly: true },
    { id: "Mountain3", cardName: "Mountain", zone: "Field", friendly: true },
    { id: "Mountain4", cardName: "Mountain", zone: "Field", friendly: true },
    { id: "Mountain5", cardName: "Mountain", zone: "Field", friendly: true },
    { id: "Mountain6", cardName: "Mountain", zone: "Field", friendly: true },
    { id: "Mountain7", cardName: "Mountain", zone: "Field", friendly: true },
    { id: "Mountain8", cardName: "Mountain", zone: "Field", friendly: true },
    { id: "Mountain9", cardName: "Mountain", zone: "Field", friendly: true },
  ],
  steps: [
    { type: "Input", name: "CastInput", targetCardId: "Ballista" },
    { type: "Input", name: "NumberInput", value: 1 },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    { type: "Input", name: "CastInput", targetCardId: "Ballista", abilityIndex: 0 },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Ballista", conditionName: "HasPower", expectedValue: 2 },
    
   { type: "Input", name: "CastInput", targetCardId: "Ballista", abilityIndex: 1 },
    { type: "Input", name: "ChooseInput", targetCardId: "Bear" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Bear", conditionName: "HasDamageMarked", expectedValue: 1 },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Ballista", conditionName: "HasPower", expectedValue: 1 },

    { type: "Input", name: "CastInput", targetCardId: "Ballista", abilityIndex: 1 },
    { type: "Input", name: "ChooseInput", targetCardId: "Bear" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Bear", conditionName: "InZone", expectedValue: "Graveyard" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Ballista", conditionName: "InZone", expectedValue: "Graveyard" },
  ]
};
