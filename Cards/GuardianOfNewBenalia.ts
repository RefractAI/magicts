import { CardType } from "../Types/CardTypes";
import { SelfCondition, C } from "../Types/ConditionHelpers";
import { Creature } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { ChooseTarget, Discard, DoTrigger, Gains, May, Scry, Tap } from "../CardHelpers/EffectClassHelpers";
import { OnAttack } from "../CardHelpers/TriggerAbilityHelpers";
import { GainsPowerUntilEndOfTurn, IndestructibleUntilEndOfTurn, MakeActivatedAbility } from "../CardHelpers/AbilityClassHelpers";

// Guardian of New Benalia
// Mana Cost: {1}{W}
// Type: Creature — Human Soldier
// Power: 2
// Toughness: 2
// Rules Text: Enlist (As this creature attacks, you may tap a nonattacking creature you control without summoning sickness. When you do, add its power to this creature's until end of turn.)
// Whenever Guardian of New Benalia enlists a creature, scry 2.
// Discard a card: Guardian of New Benalia gains indestructible until end of turn. Tap it.

export const GuardianOfNewBenalia: CardType = Creature(
  "Guardian of New Benalia",
  "1W",
  2,
  2,
  "Human",
  "Soldier",  
  // Enlist: As this creature attacks, you may tap a nonattacking creature you control without summoning sickness. When you do, add its power to this creature's until end of turn.
  OnAttack(
    "Self",
    May(
      ChooseTarget(C.Target("Friendly", "Creature","NotAttackingAndNoSummoningSickness"),
        Tap("ContextTarget"),
        GainsPowerUntilEndOfTurn("ContextTargetPower", SelfCondition),
        DoTrigger("Enlist"),
        Scry(2)
      )
    )
  ),
  // Discard a card: Guardian of New Benalia gains indestructible until end of turn. Tap it.
  MakeActivatedAbility(
    [Discard("FriendlyPlayer")],
    Gains(IndestructibleUntilEndOfTurn()),
    Tap()
  )
);

export const GuardianOfNewBenaliaTest: Test = {
  name: "Guardian of New Benalia",
  description: "Guardian of New Benalia can enlist creatures when attacking and discard for indestructible",
  initialPhase: "FirstMain",
  initialCards: [
    { id: "Guardian", cardName: "Guardian of New Benalia", zone: "Field", friendly: true },
    { id: "Helper", cardName: "Bear", zone: "Field", friendly: true }, // For enlisting (2/2)
    //{ id: "Helper2", cardName: "Bear", zone: "Field", friendly: true }, // For enlisting (2/2)
    { id: "Card1", cardName: "Lightning Bolt", zone: "Hand", friendly: true }, // For discarding
    { id: "LibCard1", cardName: "Bear", zone: "Library", position: 0, friendly: true }, // For scrying
    { id: "LibCard2", cardName: "Plains", zone: "Library", position: 1, friendly: true },
  ],
  steps: [
    // Test base stats
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Guardian", conditionName: "HasPower", expectedValue: 2 },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Guardian", conditionName: "HasToughness", expectedValue: 2 },
    
    // Move to combat to test Enlist
    { type: "Input", name: "PassUntil", phase: "DeclareAttackers", friendly: true },
    
    // Declare Guardian as attacker
    { type: "Input", name: "PairInput", pairs: [["Guardian", "Opponent"]] },
    
    // Pass priority to move to trigger resolution phase
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Guardian's OnAttack trigger with Enlist - choose to enlist
    { type: "Input", name: "BooleanInput", response: true }, // Choose to enlist (May effect)
    
    // Choose Helper creature to tap for enlist
    { type: "Input", name: "ChooseInput", targetCardId: "Helper" },
    
    // Scry 2 - happens immediately as part of enlist ability - put both cards on bottom
    { type: "Input", name: "BucketInput", buckets: [[], ["LibCard1", "LibCard2"]] },
    
    // Pass priority to finish resolving enlist ability
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Verify Helper creature is now tapped
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Helper", conditionName: "IsTapped", expectedValue: true },
    
    // Verify Guardian now has enhanced power (2 base + 2 from Helper Bear)
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Guardian", conditionName: "HasPower", expectedValue: 4 },
    
    // Continue to end combat
    { type: "Input", name: "PassUntil", phase: "SecondMain", friendly: true },
    
    // After combat, Guardian should still have the power boost (until end of turn means until cleanup step)
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Guardian", conditionName: "HasPower", expectedValue: 4 },
    
    // Test activated ability - discard to gain indestructible and tap
    { type: "Input", name: "PassUntil", phase: "FirstMain", friendly: true },
    { type: "Input", name: "CastInput", targetCardId: "Guardian", abilityIndex: 0 }, // Activated ability
    { type: "Input", name: "ChooseInput", targetCardId: "Card1" }, // Choose card to discard
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Verify Guardian is tapped and indestructible
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Guardian", conditionName: "IsTapped", expectedValue: true },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Guardian", conditionName: "HasKeyword", expectedValue: "Indestructible" },
    
    // Verify card was discarded
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Card1", conditionName: "InZone", expectedValue: "Graveyard" },
  ]
};