import { CardType } from "../Types/CardTypes";
import { Creature } from "../CardHelpers/CardTypesHelpers";
import { ChooseTarget, TargetGains, ChooseAnyColor } from "../CardHelpers/EffectClassHelpers";
import { MakeActivatedAbility, MakeProtectionFromAbility } from "../CardHelpers/AbilityClassHelpers";
import { C } from "../Types/ConditionHelpers";
import { Test } from "../Testing/TestTypes";

// Mother of Runes
// Mana Cost: W
// Type: Creature — Human Cleric
// Power/Toughness: 1/1

// {T}: Target creature you control gains protection from the color of your choice until end of turn.

export const MotherofRunes: CardType = Creature("Mother of Runes", "W", 1, 1, "Human", "Cleric",
  // {T}: Target creature you control gains protection from the color of your choice until end of turn.
  MakeActivatedAbility(
    "T",
    ChooseTarget(C.Target("Friendly", "Creature"),
      ChooseAnyColor("FriendlyPlayer",
        TargetGains("ContextTarget", MakeProtectionFromAbility(C.All(C.OfColor("ChosenColor"))))
      )
    )
  )
);

export const MotherofRunesTest: Test = {
  name: "Mother of Runes",
  description: "Mother of Runes can target itself and grant protection", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "MotherofRunes", cardName: "Mother of Runes", zone: "Field", friendly: true },
    { id: "Bear", cardName: "Bear", zone: "Field", friendly: true },
  ],
  steps: [
    // Verify initial state
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "MotherofRunes", conditionName: "InZone", expectedValue: "Field" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Bear", conditionName: "InZone", expectedValue: "Field" },
    
    // Activate Mother of Runes' ability targeting itself
    { type: "Input", name: "CastInput", targetCardId: "MotherofRunes", abilityIndex: 0 },
    { type: "Input", name: "ChooseInput", targetCardId: "MotherofRunes" },
    
    // Pass priority to let ability resolve
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Choose blue as the protection color
    { type: "Input", name: "ButtonChooseInput", buttonText: "Blue" },
    
    // Pass priority after color choice
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Verify Mother of Runes gained protection from blue
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "MotherofRunes", conditionName: "HasAbility", expectedValue: "ProtectionFromAbility" },
    
    // Verify Mother of Runes is tapped
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "MotherofRunes", conditionName: "IsTapped", expectedValue: true }
  ]
};
