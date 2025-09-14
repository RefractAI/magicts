import { CardType } from "../Types/CardTypes";
import { Creature } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { MakeTriggeredAbility, TargetGainsType } from "../CardHelpers/AbilityClassHelpers";
import { GainLife, AddCounters, ChooseTarget, MayPay } from "../CardHelpers/EffectClassHelpers";
import { OnAttack } from "../CardHelpers/TriggerAbilityHelpers";
import { C } from "../Types/ConditionHelpers";

// Guide of Souls
// Mana Cost: W
// Type: Creature — Human Cleric
// Power/Toughness: 1/2

// Whenever another creature you control enters, you gain 1 life and get {E} (an energy counter).
// Whenever you attack, you may pay {E}{E}{E}. When you do, put two +1/+1 counters and a flying counter on target attacking creature. It becomes an Angel in addition to its other types.

export const GuideofSouls: CardType = Creature("Guide of Souls", "W", 1, 2, "Human", "Cleric",
  // Whenever another creature you control enters, you gain 1 life and get {E} (an energy counter).
  MakeTriggeredAbility("ETB", C.Target("Other", "Friendly", "Creature"), 
    GainLife(1, "FriendlyPlayer"),
    AddCounters("Energy", 1, "FriendlyPlayer")
  ),
  // Whenever you attack, you may pay {E}{E}{E}. When you do, put two +1/+1 counters and a flying counter on target attacking creature. It becomes an Angel in addition to its other types.
  OnAttack(C.Target("Friendly", "Creature"),
    MayPay("EEE", "Pay {E}{E}{E} to put counters on an attacking creature?", [
        ChooseTarget(C.Target("Friendly","Attacking","Creature"),
          AddCounters("PlusOnePlusOne", 2, "ContextTarget"),
          AddCounters("Flying", 1, "ContextTarget"), 
          TargetGainsType("ContextTarget", "Angel")
        )
      ])
  )
);

export const GuideofSoulsTest: Test = {
  name: "Guide of Souls",
  description: "Guide of Souls gains life and energy when creatures enter, then powers up attacking creatures", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "GuideofSouls", cardName: "Guide of Souls", zone: "Hand", friendly: true },
    { id: "OtherCreature", cardName: "Bear", zone: "Hand", friendly: true },
    { id: "OtherCreature2", cardName: "Bear", zone: "Hand", friendly: true },
    { id: "OtherCreature3", cardName: "Bear", zone: "Hand", friendly: true },
    { id: "AttackingCreature", cardName: "Bear", zone: "Field", friendly: true }, // Start on field to avoid casting
    { id: "Plains1", cardName: "Plains", zone: "Field", friendly: true },
    { id: "Plains2", cardName: "Plains", zone: "Field", friendly: true },
    { id: "Plains3", cardName: "Plains", zone: "Field", friendly: true },
    { id: "Forest1", cardName: "Forest", zone: "Field", friendly: true },
    { id: "Forest2", cardName: "Forest", zone: "Field", friendly: true },
  ],
  steps: [
    // Verify Guide of Souls is on the field
    { type: "Input", name: "CastInput", targetCardId: "GuideofSouls" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    
    // Cast the other creature to trigger Guide of Souls and gain energy
    { type: "Input", name: "CastInput", targetCardId: "OtherCreature" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    //Triggered ability
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Cast the other creature to trigger Guide of Souls and gain energy
    { type: "Input", name: "CastInput", targetCardId: "OtherCreature2" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    //Triggered ability
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Cast the other creature to trigger Guide of Souls and gain energy
    { type: "Input", name: "CastInput", targetCardId: "OtherCreature3" },

    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    //Triggered ability
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Move to declare attackers phase to test attack trigger
    { type: "Input", name: "PassUntil", phase: "DeclareAttackers", friendly: true },
    
    // Declare AttackingCreature as attacker
    { type: "Input", name: "PairInput", pairs: [["AttackingCreature", "Opponent"]] },
    
    // Pass priority to let the triggered ability resolve
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // OnAttack trigger should fire - we have 3 energy from 3 creatures entering
    { type: "Input", name: "BooleanInput", response: true}, // Choose to pay EEE cost
    { type: "Input", name: "ChooseInput", targetCardId: "AttackingCreature" },
    // Pass priority for sub-effects to resolve
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    // Verify the attacking creature has +2/+2, is an Angel, and has flying
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "AttackingCreature", conditionName: "HasPower", expectedValue: 4 }, 
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "AttackingCreature", conditionName: "OfType", expectedValue: "Angel" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "AttackingCreature", conditionName: "HasKeyword", expectedValue:"Flying" }
  ]
};
