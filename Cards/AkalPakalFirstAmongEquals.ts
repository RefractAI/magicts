import { CardType } from "../Types/CardTypes";
import { Creature } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { MakeConditionalTriggeredAbility } from "../CardHelpers/AbilityClassHelpers";
import { Bucket, BucketSpec } from "../CardHelpers/EffectClassHelpers";
import { C } from "../Types/ConditionHelpers";

// Akal Pakal, First Among Equals
// Mana Cost: 2U
// Type: Legendary Creature — Human Advisor
// Power/Toughness: 1/5

// At the beginning of each player's end step, if an artifact entered the battlefield under your control this turn, look at the top two cards of your library. Put one of them into your hand and the other into your graveyard.

export const AkalPakalFirstAmongEquals: CardType = Creature("Akal Pakal, First Among Equals", "2U", 1, 5, "Human", "Advisor",
  MakeConditionalTriggeredAbility(
    "EndStep", 
    "AnyPlayer",
    "ArtifactEnteredThisTurn", 
    "FriendlyPlayer",
      Bucket(
        "FriendlyPlayer",
        C.All(C.Friendly, C.TopNCardsOfLibrary(2)),
        "Choose one card to put in your hand and one card to put in your graveyard",
        [
          BucketSpec("Hand", "None", 1),
          BucketSpec("Graveyard", "None", undefined)
        ]
      )
    )
);

export const AkalPakalFirstAmongEqualsTest: Test = {
  name: "Akal Pakal, First Among Equals",
  description: "Tests triggered ability when artifact enters battlefield", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "AkalPakal", cardName: "Akal Pakal, First Among Equals", zone: "Field", friendly: true },
    { id: "Artifact1", cardName: "Aether Spellbomb", zone: "Hand", friendly: true },
    { id: "LibCard1", cardName: "Lightning Bolt", zone: "Library", friendly: true, position: 0 },
    { id: "LibCard2", cardName: "Mountain", zone: "Library", friendly: true, position: 1 },
    { id: "Land1", cardName: "Island", zone: "Field", friendly: true },
    { id: "Land2", cardName: "Island", zone: "Field", friendly: true },
  ],
  steps: [
    // Verify initial state
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "AkalPakal", conditionName: "InZone", expectedValue: "Field" },
    
    // Cast the artifact to trigger the condition
    { type: "Input", name: "CastInput", targetCardId: "Artifact1" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Verify artifact is on battlefield
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Artifact1", conditionName: "InZone", expectedValue: "Field" },
    
    // Move to end step to trigger ability
    { type: "Input", name: "PassUntil", phase: "EndStep", friendly: true },
    
    // The triggered ability should be on the stack, pass priority to let it resolve
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Choose bucket arrangement: LibCard1 to hand, LibCard2 to graveyard
    { type: "Input", name: "BucketInput", buckets: [["LibCard1"], ["LibCard2"]] },
    
    // Verify the chosen card went to hand
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "LibCard1", conditionName: "InZone", expectedValue: "Hand" },
    
    // Verify the other card went to graveyard
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "LibCard2", conditionName: "InZone", expectedValue: "Graveyard" }
  ]
};
