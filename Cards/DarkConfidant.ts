import { CardType } from "../Types/CardTypes";
import { Creature } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { MakeTriggeredAbility } from "../CardHelpers/AbilityClassHelpers";
import { ChooseTarget, Reveal, ZoneChange, LoseLife } from "../CardHelpers/EffectClassHelpers";
import { C } from "../Types/ConditionHelpers";

// Dark Confidant
// Mana Cost: 1B
// Type: Creature — Human Wizard
// Power/Toughness: 2/1

// At the beginning of your upkeep, reveal the top card of your library and put that card into your hand. You lose life equal to its mana value.

export const DarkConfidant: CardType = Creature("Dark Confidant", "1B", 2, 1, "Human", "Wizard",
  MakeTriggeredAbility("Upkeep", "FriendlyPlayer",
    ChooseTarget(C.All("Friendly",C.TopNCardsOfLibrary(1)),
      Reveal("ContextTarget"),
      ZoneChange("ContextTarget", "Hand"),
      LoseLife("ContextTargetCMC", "FriendlyPlayer")
    )
  )
);

export const DarkConfidantTest: Test = {
  name: "Dark Confidant",
  description: "Tests Dark Confidant's upkeep trigger to draw and lose life", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "DarkConfidant", cardName: "Dark Confidant", zone: "Field", friendly: true },
    { id: "TopCard", cardName: "Lightning Bolt", zone: "Library", friendly: true, position: 0 },
    { id: "SecondCard", cardName: "Lightning Bolt", zone: "Library", friendly: true, position: 1 }
  ],
  steps: [
    // Pass to enemy turn
    { type: "Input", name: "PassUntil", phase: "FirstMain", friendly: false },
    // Pass to player turn
    { type: "Input", name: "PassUntil", phase: "FirstMain", friendly: true },
    //Start of turn draw
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "TopCard", conditionName: "InZone", expectedValue: "Hand" },

    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Verify card was drawn and life was lost during upkeep
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "SecondCard", conditionName: "InZone", expectedValue: "Hand" },
    { type: "Assertion", name: "Life", targetCardId: "Player", expectedLife: 19 } // Lost 1 life for Lightning Bolt's mana value
  ]
};
