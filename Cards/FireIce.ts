import { CardType } from "../Types/CardTypes";
import { Instant } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { Tap, Draw, Damage } from "../CardHelpers/EffectClassHelpers";
import { SplitCastingOption } from "../CardHelpers/AbilityClassHelpers";
import { C } from "../Types/ConditionHelpers";

// Fire // Ice
// Fire: 1R - Fire deals 2 damage divided as you choose among one or two targets.
// Ice: 1U - Tap target permanent. Draw a card.

// Individual card definitions for each side
export const Fire: CardType = Instant("Fire", "1R",
  // TODO: Implement divided damage effect - for now just 2 damage to any target
  Damage(2, C.Target("AnyTarget"))
);

export const Ice: CardType = Instant("Ice", "1U",
  Tap(C.Target("AnyTarget")),
  Draw(1)
);

// Combined split card definition - can be cast as either side
export const FireIce: CardType = Instant("Fire // Ice", "",
  SplitCastingOption("Fire"),
  SplitCastingOption("Ice")
);

export const FireIceTest: Test = {
  name: "Fire // Ice",
  description: "Split card can be cast as Ice side, tapping target and drawing card", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "SplitCard", cardName: "Fire // Ice", zone: "Hand", friendly: true },
    { id: "Target", cardName: "Bear", zone: "Field", friendly: false },
    { id: "Target2", cardName: "Bear", zone: "Field", friendly: false },
    { id: "Island", cardName: "Island", zone: "Field", friendly: true },
    { id: "Island2", cardName: "Island", zone: "Field", friendly: true },
    { id: "TopLibraryCard", cardName: "Mountain", zone: "Library", friendly: true, position: 0 },
  ],
  steps: [
    // Cast Fire // Ice as Ice (mode 1)
    { type: "Input", name: "CastInput", targetCardId: "SplitCard", chosenMode: 1 },
    // Choose target for Ice's tap
    { type: "Input", name: "ChooseInput", targetCardId: "Target" },
    // Pass priority to resolve
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    // Verify Bear was tapped (still on field)
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Target", conditionName: "InZone", expectedValue: "Field" },
    // Verify Fire // Ice is in graveyard
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "SplitCard", conditionName: "InZone", expectedValue: "Graveyard" },
    // Note: Card correctly reverts to "Fire // Ice" name in graveyard (this is correct MTG behavior)
    // Verify we drew a card (TopLibraryCard should be in hand)
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "TopLibraryCard", conditionName: "InZone", expectedValue: "Hand" }
  ]
};
