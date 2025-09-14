import { CardType } from "../Types/CardTypes";
import { Sorcery } from "../CardHelpers/CardTypesHelpers";
import { Search } from "../CardHelpers/EffectClassHelpers";
import { Test } from "../Testing/TestTypes";
import { C } from "../Types/ConditionHelpers";

// Demonic Tutor
// Mana Cost: 1B
// Type: Sorcery
// Search your library for a card, put that card into your hand, then shuffle.

export const DemonicTutor: CardType = Sorcery("Demonic Tutor", "1B",
  // Search your library for a card, put that card into your hand, then shuffle.
  Search("FriendlyPlayer", C.Target("Friendly", "Library"))
);

export const DemonicTutorTest: Test = {
  name: "Demonic Tutor",
  description: "Search library for any card and put it into hand",
  initialPhase: "FirstMain",
  initialCards: [
    { id: "Tutor", cardName: "Demonic Tutor", zone: "Hand", friendly: true },
    { id: "Swamp", cardName: "Swamp", zone: "Field", friendly: true },
    { id: "Mountain", cardName: "Mountain", zone: "Field", friendly: true },
    { id: "Lightning Bolt", cardName: "Lightning Bolt", zone: "Library", friendly: true, position: 1 },
    { id: "Bear", cardName: "Bear", zone: "Library", friendly: true, position: 2 },
  ],
  steps: [
    // Cast Demonic Tutor
    { type: "Input", name: "CastInput", targetCardId: "Tutor" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Choose a card from library to put in hand
    { type: "Input", name: "ChooseInput", targetCardId: "Lightning Bolt" },
    
    // Verify effects
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Tutor", conditionName: "InZone", expectedValue: "Graveyard" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Lightning Bolt", conditionName: "InZone", expectedValue: "Hand" },
  ]
};