import { Test } from "./TestTypes";

// Combat Test
// Tests the combat system with attackers, blockers, and damage resolution

export const CombatTest: Test = {
  name: "Combat Test",
  description: "Two attackers, one blocker, damage resolution",
  initialPhase: "BeginCombat",
  initialCards: [
    { id: "Attacker1", cardName: "Bear", zone: "Field", friendly: true },  // 2/2 Bear attacker
    { id: "Attacker2", cardName: "Bear", zone: "Field", friendly: true },  // 2/2 Bear attacker
    { id: "Blocker", cardName: "Bear", zone: "Field", friendly: false },   // 2/2 Bear blocker
  ],
  steps: [
    // Verify we start in BeginCombat phase
    { type: "Assertion", name: "Phase", expectedPhase: "BeginCombat" },
    // Pass priority to move from BeginCombat to DeclareAttackers phase
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    // Verify we've moved to DeclareAttackers phase
    { type:"Assertion", "name": "Phase", expectedPhase: "DeclareAttackers" },
    // Declare attackers - both Bears attack the opponent player
    { type: "Input", name: "PairInput", pairs: [["Attacker1", "Opponent"], ["Attacker2", "Opponent"]] },
    // Pass priority to move to DeclareBlockers
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    // Verify we've moved to DeclareBlockers phase
    { type: "Assertion", name: "Phase", expectedPhase: "DeclareBlockers" },
    // Declare blockers - opponent's Bear blocks Attacker1
    { type: "Input", name: "PairInput", pairs: [["Blocker", "Attacker1"]] },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    // Pass priority through combat phases to end combat
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    // Verify combat damage has been applied and creatures died
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Attacker1", conditionName: "InZone", expectedValue: "Graveyard" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Blocker", conditionName: "InZone", expectedValue: "Graveyard" },
    // Attacker2 should survive (unblocked, took no damage)
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Attacker2", conditionName: "InZone", expectedValue: "Field" },
    { type: "Assertion", name: "Life", targetCardId: "Opponent", expectedLife: 18 },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Attacker2", conditionName: "HasDamageMarked", expectedValue: 0 }
  ]
};