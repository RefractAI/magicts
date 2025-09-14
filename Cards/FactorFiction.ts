import { CardType } from "../Types/CardTypes";
import { Instant } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { ChooseTarget, Reveal, Bucket, BucketSpec, ButtonChoice, ZoneChange } from "../CardHelpers/EffectClassHelpers";
import { C } from "../Types/ConditionHelpers";

// Fact or Fiction
// Mana Cost: 3U
// Type: Instant

// Reveal the top five cards of your library. An opponent separates those cards into two piles. Put one pile into your hand and the other into your graveyard.

export const FactorFiction: CardType = Instant("Fact or Fiction", "3U",
  ChooseTarget(C.All("Friendly", C.TopNCardsOfLibrary(5)),
    Reveal("ContextTarget"),
    // BucketEffect needs to explicitly target the same cards that were revealed
    ChooseTarget("ContextTarget",
      Bucket(
        "OpponentPlayer",
        "ContextTarget", // Cards to bucket are the context target (revealed cards)
        "Separate these cards into two piles.",
        [
          BucketSpec("None", "None", undefined, [], "FirstPile"),     // Pile 1: Named FirstPile, no zone change yet
          BucketSpec("None", "None", undefined, [], "SecondPile")     // Pile 2: Named SecondPile, no zone change yet
        ],
        [
          ChooseTarget("FriendlyPlayer",
            ButtonChoice(["First pile to hand", "Second pile to hand"], 
              [ZoneChange(C.All(C.BucketTarget("FirstPile")), "Hand"), ZoneChange(C.All(C.BucketTarget("SecondPile")), "Graveyard")],
              [ZoneChange(C.All(C.BucketTarget("SecondPile")), "Hand"), ZoneChange(C.All(C.BucketTarget("FirstPile")), "Graveyard")]
            )
          )
        ]
      )
    )
  )
);

export const FactorFictionTest: Test = {
  name: "Fact or Fiction",
  description: "Tests Fact or Fiction's pile separation mechanic", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "FactOrFiction", cardName: "Fact or Fiction", zone: "Hand", friendly: true },
    { id: "Island", cardName: "Island", zone: "Field", friendly: true },
    { id: "Island2", cardName: "Island", zone: "Field", friendly: true },
    { id: "Island3", cardName: "Island", zone: "Field", friendly: true },
    { id: "Island4", cardName: "Island", zone: "Field", friendly: true },
    // Library cards - top 5 cards that will be revealed
    { id: "Card1", cardName: "Lightning Bolt", zone: "Library", friendly: true, position: 0 },
    { id: "Card2", cardName: "Bear", zone: "Library", friendly: true, position: 1 },
    { id: "Card3", cardName: "Plains", zone: "Library", friendly: true, position: 2 },
    { id: "Card4", cardName: "Mountain", zone: "Library", friendly: true, position: 3 },
    { id: "Card5", cardName: "Forest", zone: "Library", friendly: true, position: 4 },
    { id: "Card6", cardName: "Swamp", zone: "Library", friendly: true, position: 5 }, // Should stay in library
  ],
  steps: [
    // Cast Fact or Fiction
    { type: "Input", name: "CastInput", targetCardId: "FactOrFiction" },
    
    // Pass priority to resolve
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Opponent separates cards into two piles - put Lightning Bolt and Bear in hand pile, rest in graveyard pile
    { type: "Input", name: "BucketInput", buckets: [
      ["Card1", "Card2"], // Pile 1 (FirstPile)
      ["Card3", "Card4", "Card5"] // Pile 2 (SecondPile)
    ]},
    
    // Player chooses first pile to hand
    { type: "Input", name: "ButtonChooseInput", buttonText: "First pile to hand" },
    
    // Pass priority to let the zone change effects resolve and the spell finish
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Verify Fact or Fiction went to graveyard
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "FactOrFiction", conditionName: "InZone", expectedValue: "Graveyard" },
    
    // Verify pile 1 cards went to hand
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Card1", conditionName: "InZone", expectedValue: "Hand" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Card2", conditionName: "InZone", expectedValue: "Hand" },
    
    // Verify pile 2 cards went to graveyard
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Card3", conditionName: "InZone", expectedValue: "Graveyard" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Card4", conditionName: "InZone", expectedValue: "Graveyard" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Card5", conditionName: "InZone", expectedValue: "Graveyard" },
    
    // Verify the 6th card (position 5) stayed in library
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Card6", conditionName: "InZone", expectedValue: "Library" }
  ]
};
