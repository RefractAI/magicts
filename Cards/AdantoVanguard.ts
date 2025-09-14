import { CardType } from "../Types/CardTypes";
import { Creature } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { MakeActivatedAbility, MakeConditionalPowerToughnessAbility, IndestructibleUntilEndOfTurn } from "../CardHelpers/AbilityClassHelpers";
import { Gains, LoseLife } from "../CardHelpers/EffectClassHelpers";
import { C } from "../Types/ConditionHelpers";

// Adanto Vanguard
// Mana Cost: 1W
// Type: Creature — Vampire Soldier
// Power/Toughness: 1/1

// As long as this creature is attacking, it gets +2/+0.
// Pay 4 life: This creature gains indestructible until end of turn. (Damage and effects that say "destroy" don't destroy it.)

export const AdantoVanguard: CardType = Creature("Adanto Vanguard", "1W", 1, 1, "Vampire", "Soldier",
  // As long as this creature is attacking, it gets +2/+0.
  MakeConditionalPowerToughnessAbility(2, 0, C.Target("Attacking")),
  // Pay 4 life: This creature gains indestructible until end of turn.
  MakeActivatedAbility(LoseLife(4), Gains(IndestructibleUntilEndOfTurn()))
);

export const AdantoVanguardTest: Test = {
  name: "Adanto Vanguard",
  description: "Adanto Vanguard gets +2/+0 while attacking and can pay 4 life to gain indestructible", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "AdantoVanguard", cardName: "Adanto Vanguard", zone: "Field", friendly: true },
    { id: "Plains", cardName: "Plains", zone: "Field", friendly: true },
  ],
  steps: [
    // Test base stats
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "AdantoVanguard", conditionName: "HasPower", expectedValue: 1 },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "AdantoVanguard", conditionName: "HasToughness", expectedValue: 1 },
    
    // Test activated ability - pay 4 life for indestructible
    { type: "Input", name: "CastInput", targetCardId: "AdantoVanguard", abilityIndex: 0 },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Verify life loss and indestructible
    { type: "Assertion", name: "Life", targetCardId: "Player", expectedLife: 16 },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "AdantoVanguard", conditionName: "HasKeyword", expectedValue: "Indestructible" },
    
    // Move to declare attackers phase to test power bonus while attacking
    { type: "Input", name: "PassUntil", phase: "DeclareAttackers", friendly: true },
    
    // Declare AdantoVanguard as attacker
    { type: "Input", name: "PairInput", pairs: [["AdantoVanguard", "Opponent"]] },
    
    // Verify power increased while attacking
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "AdantoVanguard", conditionName: "HasPower", expectedValue: 3 },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "AdantoVanguard", conditionName: "HasToughness", expectedValue: 1 }
  ]
};
