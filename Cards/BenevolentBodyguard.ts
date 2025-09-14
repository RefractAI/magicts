import { CardType } from "../Types/CardTypes";
import { Creature } from "../CardHelpers/CardTypesHelpers";
import { ChooseAnyColor, ChooseTarget, Sacrifice, TargetGains } from "../CardHelpers/EffectClassHelpers";
import { MakeActivatedAbility, MakeProtectionFromAbility } from "../CardHelpers/AbilityClassHelpers";
import { C } from "../Types/ConditionHelpers";
import { Test } from "../Testing/TestTypes";

// Benevolent Bodyguard
// Mana Cost: {W}
// Type: Creature — Human Cleric
// Power: 1
// Toughness: 1
// Rules Text: Sacrifice Benevolent Bodyguard: Target creature you control gains protection from the color of your choice until end of turn.

export const BenevolentBodyguard: CardType = Creature("Benevolent Bodyguard", "W", 1, 1, "Human", "Cleric",
  // Sacrifice Benevolent Bodyguard: Target creature you control gains protection from the color of your choice until end of turn.
  MakeActivatedAbility(
    Sacrifice(),
    ChooseTarget(C.Target("Friendly", "Creature"),
      ChooseAnyColor("FriendlyPlayer", 
        TargetGains("ContextTarget", MakeProtectionFromAbility(C.All(C.OfColor("ChosenColor"))))
      )
    )
  ) 
);

export const BenevolentBodyguardTest: Test = {
  name: "Benevolent Bodyguard",
  description: "Player casts Lightning Bolt, opponent activates Benevolent Bodyguard in response, bolt fizzles",
  initialPhase: "FirstMain",
  initialCards: [
    { id: "Bodyguard", cardName: "Benevolent Bodyguard", zone: "Field", friendly: false },
    { id: "Bear", cardName: "Bear", zone: "Field", friendly: false },
    { id: "Bear2", cardName: "Bear", zone: "Field", friendly: false }, // Required for a choice of protection target
    { id: "Bolt", cardName: "Lightning Bolt", zone: "Hand", friendly: true },
  ],
  steps: [
    // Player casts Lightning Bolt targeting the Bear
    { type: "Input", name: "CastInput", targetCardId: "Bolt" },
    { type: "Input", name: "ChooseInput", targetCardId: "Bear" },
    // Pass priority to opponent after targeting is complete
    { type: "Input", name: "PassPriority" },
    // Opponent gets priority and activates Benevolent Bodyguard's ability
    { type: "Input", name: "CastInput", targetCardId: "Bodyguard", abilityIndex: 0 },
    // Choose the target creature (Bear)
    { type: "Input", name: "ChooseInput", targetCardId: "Bear" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    // Choose red as the protection color (to protect from Lightning Bolt)  
    { type: "Input", name: "ButtonChooseInput", buttonText: "Red" },
    // Player passes priority
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    // Stack resolves: Bodyguard ability resolves first, then bolt fizzles
    // Verify Benevolent Bodyguard was sacrificed
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Bodyguard", conditionName: "InZone", expectedValue: "Graveyard" },
    // Verify Bear is still on the field (bolt fizzled)
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Bear", conditionName: "InZone", expectedValue: "Field" },
    // Verify Bear has protection from red
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Bear", conditionName: "HasAbility", expectedValue: "ProtectionFromAbility" },
    // Verify Lightning Bolt is in graveyard (fizzled)
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Bolt", conditionName: "InZone", expectedValue: "Graveyard" },
  ]
};