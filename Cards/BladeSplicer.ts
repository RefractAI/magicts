import { CardType } from "../Types/CardTypes";
import { Creature } from "../CardHelpers/CardTypesHelpers";
import { Create } from "../CardHelpers/EffectClassHelpers";
import { ETB } from "../CardHelpers/TriggerAbilityHelpers";
import { XsYouControlHaveY } from "../CardHelpers/AbilityClassHelpers";
import { Test } from "../Testing/TestTypes";

// Blade Splicer
// Mana Cost: {2}{W}
// Type: Creature — Phyrexian Human Artificer
// Power: 2
// Toughness: 2
// Rules Text: When Blade Splicer enters the battlefield, create a 3/3 colorless Phyrexian Golem artifact creature token.
// Golems you control have first strike.

export const BladeSplicer: CardType = Creature("Blade Splicer", "2W", 2, 2, "Phyrexian", "Human", "Artificer",
  // When Blade Splicer enters the battlefield, create a 3/3 colorless Phyrexian Golem artifact creature token.
  ETB(
    Create("33ColorlessPhyrexianGolemArtifactCreature")
  ),
  // Golems you control have first strike.
  XsYouControlHaveY("Golem", "FirstStrike")
);

export const BladeSplicerTest: Test = {
  name: "Blade Splicer",
  description: "Blade Splicer creates a 3/3 Golem token when it enters the battlefield",
  initialPhase: "FirstMain",
  initialCards: [
    { id: "BladeSplicer", cardName: "Blade Splicer", zone: "Hand", friendly: true },
  ],
  steps: [
    // Cast Blade Splicer
    { type: "Input", name: "CastInput", targetCardId: "BladeSplicer" },
    // Pass priority for spell to resolve and ETB to trigger
    { type: "Input", name: "PassPriority" },

    // Pass priority for ETB ability to resolve
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    // Verify Blade Splicer is on the field
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "BladeSplicer", conditionName: "InZone", expectedValue: "Field" },
    // Verify the Golem token was created and is on the field
    { type: "Assertion", name: "TokenExists", tokenTestCardIds: ["Golem"], tokenCardName: "33ColorlessPhyrexianGolemArtifactCreature", zone: "Field", count: 1, friendly: true },
    // Verify Blade Splicer's stats
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "BladeSplicer", conditionName: "HasPower", expectedValue: 2 },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "BladeSplicer", conditionName: "HasToughness", expectedValue: 2 }
  ]
};