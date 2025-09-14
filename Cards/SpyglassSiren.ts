import { CardType } from "../Types/CardTypes";
import { Creature } from "../CardHelpers/CardTypesHelpers";
import { Create } from "../CardHelpers/EffectClassHelpers";
import { ETB } from "../CardHelpers/TriggerAbilityHelpers";
import { Test } from "../Testing/TestTypes";

// Spyglass Siren
// Mana Cost: {U}
// Type: Creature — Siren Pirate
// Power: 1
// Toughness: 1
// Rules Text: Flying
// When this creature enters, create a Map token. (It's an artifact with "{1}, {T}, Sacrifice this token: Target creature you control explores. Activate only as a sorcery.")

export const SpyglassSiren: CardType = Creature("Spyglass Siren", "U", 1, 1, "Siren", "Pirate", "Flying",
  // When this creature enters, create a Map token.
  ETB(
    Create("MapToken")
  )
);

export const SpyglassSirenTest: Test = {
  name: "Spyglass Siren",
  description: "Spyglass Siren creates a Map token when it enters the battlefield, and the Map token can make a creature explore",
  initialPhase: "FirstMain",
  initialCards: [
    { id: "SpyglassSiren", cardName: "Spyglass Siren", zone: "Hand", friendly: true },
    { id: "TestCard", cardName: "Bear", zone: "Library", friendly: true, position: 0 }, // Top of library - will be revealed by explore
  ],
  steps: [
    // Cast Spyglass Siren
    { type: "Input", name: "CastInput", targetCardId: "SpyglassSiren" },
    // Pass priority for spell to resolve and ETB to trigger
    { type: "Input", name: "PassPriority" },
    // Pass priority for ETB ability to resolve (active player)
    { type: "Input", name: "PassPriority" },
    // Pass priority for ETB ability to resolve (opponent)
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    // We now have priority in main phase - verify Spyglass Siren is on the field
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "SpyglassSiren", conditionName: "InZone", expectedValue: "Field" },
    // Verify the Map token was created and is on the field (this maps MapToken1 to cardIdMap)
    { type: "Assertion", name: "TokenExists", tokenTestCardIds: ["MapToken1"], tokenCardName: "MapToken", zone: "Field", count: 1, friendly: true },
    // Activate the Map token's ability to make Spyglass Siren explore (auto-pays mana from Island)
    { type: "Input", name: "CastInput", targetCardId: "MapToken1", abilityIndex: 0 }, // Map token's activated ability
    // Choose Spyglass Siren as the target for explore
    { type: "Input", name: "ChooseInput", targetCardId: "SpyglassSiren" },
    // Pass priority to let opponent respond to ability
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    // Since TestCard (Bear) is a non-land, Spyglass Siren gets a +1/+1 counter
    // and we're immediately asked if we want to put the card in graveyard
    { type: "Input", name: "BooleanInput", response: true }, // Choose to put the card in graveyard
    // Verify Map token was sacrificed
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "MapToken1", conditionName: "InZone", expectedValue: "Graveyard" },
    // Verify Spyglass Siren got a +1/+1 counter (power should be 2, toughness should be 2)
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "SpyglassSiren", conditionName: "HasPower", expectedValue: 2 },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "SpyglassSiren", conditionName: "HasToughness", expectedValue: 2 },
    // Verify TestCard was put in graveyard
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "TestCard", conditionName: "InZone", expectedValue: "Graveyard" }
  ]
};