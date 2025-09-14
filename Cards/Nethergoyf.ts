import { CardType } from "../Types/CardTypes";
import { Creature } from "../CardHelpers/CardTypesHelpers";
import { Escape } from "../CardHelpers/AbilityClassHelpers";
import { Exile } from "../CardHelpers/EffectClassHelpers";
import { Test } from "../Testing/TestTypes";
import { C } from "../Types/ConditionHelpers";

// Nethergoyf
// Mana Cost: B
// Type: Creature — Lhurgoyf
// Power/Toughness: */1+*

// Nethergoyf's power is equal to the number of card types among cards in your graveyard and its toughness is equal to that number plus 1.
// Escape—{2}{B}, Exile any number of other cards from your graveyard with four or more card types among them. (You may cast this card from your graveyard for its escape cost.)

export const Nethergoyf: CardType = Creature("Nethergoyf", "B", 
  "NumberOfCardTypesInGraveyard", 
  "NumberOfCardTypesInGraveyardPlusOne", 
  "Lhurgoyf",
  Escape(["2B", Exile(C.WithValidationFunction("NethergoyfEscapeCondition","Friendly","Graveyard"), "None")])
);

export const NethergoyfTest: Test = {
  name: "Nethergoyf",
  description: "Test Nethergoyf's power/toughness based on card types in graveyard and escape mechanic", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "Nethergoyf", cardName: "Nethergoyf", zone: "Hand", friendly: true },
    { id: "NethergoyfInGraveyard", cardName: "Nethergoyf", zone: "Graveyard", friendly: true },
    
    // Cards in graveyard to test different card types for escape
    { id: "GraveyardCreature", cardName: "Bear", zone: "Graveyard", friendly: true },
    { id: "GraveyardInstant", cardName: "Lightning Bolt", zone: "Graveyard", friendly: true },
    { id: "GraveyardLand", cardName: "Mountain", zone: "Graveyard", friendly: true },
    { id: "GraveyardSorcery", cardName: "Demonic Tutor", zone: "Graveyard", friendly: true },
    { id: "GraveyardArtifact", cardName: "Walking Ballista", zone: "Graveyard", friendly: true },
    { id: "GraveyardArtifact2", cardName: "Walking Ballista", zone: "Graveyard", friendly: true },
  ],
  steps: [
    // Cast Nethergoyf from hand - should be 5/6 (5 card types in graveyard including Nethergoyf)
    // No ModeInput needed since escape is conditional on being in graveyard
    { type: "Input", name: "CastInput", targetCardId: "Nethergoyf" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Verify Nethergoyf is on the field
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Nethergoyf", conditionName: "InZone", expectedValue: "Field" },
    
    // Verify power and toughness: 5 card types = 5/6
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Nethergoyf", conditionName: "HasPower", expectedValue: 5 },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Nethergoyf", conditionName: "HasToughness", expectedValue: 6 },
    
    // Test escape mechanic - cast Nethergoyf from graveyard with escape mode
    { type: "Input", name: "CastInput", targetCardId: "NethergoyfInGraveyard", chosenMode: 0 }, // Select escape option (index 0, since it should be the only available option in graveyard)
    
    // Choose which cards to exile for escape cost (select all 4 cards to meet the "four or more card types" requirement)
    { type: "Input", name: "ChooseInput", targetCardIds: ["GraveyardCreature", "GraveyardInstant", "GraveyardLand", "GraveyardSorcery"] },
    
    // Pass priority to resolve the escape spell
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Verify second Nethergoyf is on the field (from graveyard via escape)
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "NethergoyfInGraveyard", conditionName: "InZone", expectedValue: "Field" },
    
    // Verify that the exile cost was paid - check that exiled cards are in exile zone
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "GraveyardCreature", conditionName: "InZone", expectedValue: "Exile" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "GraveyardInstant", conditionName: "InZone", expectedValue: "Exile" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "GraveyardLand", conditionName: "InZone", expectedValue: "Exile" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "GraveyardSorcery", conditionName: "InZone", expectedValue: "Exile" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "GraveyardArtifact", conditionName: "InZone", expectedValue: "Graveyard" },
  ]
};
