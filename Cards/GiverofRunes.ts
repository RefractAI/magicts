import { CardType } from "../Types/CardTypes";
import { Creature } from "../CardHelpers/CardTypesHelpers";
import { ChooseTarget, TargetGains } from "../CardHelpers/EffectClassHelpers";
import { MakeActivatedAbility, MakeProtectionFromAbility } from "../CardHelpers/AbilityClassHelpers";
import { C } from "../Types/ConditionHelpers";
import { ColorChoiceEffect } from "../Types/EffectTypes";
import { ToCondition } from "../Types/ToCondition";
import { NoneCondition } from "../Types/ConditionHelpers";
import { Test } from "../Testing/TestTypes";

// Custom helper for color choice including colorless
const ChooseAnyColorIncludingColorless = (target: any, ...thenEffects: any[]): ColorChoiceEffect =>
  ({effectCls:'ColorChoiceEffect', choices:['White','Blue','Black','Red','Green','Colorless'], target:ToCondition(target), condition:NoneCondition, cls:'EffectType',thenEffects });

// Giver of Runes
// Mana Cost: W
// Type: Creature — Kor Cleric
// Power/Toughness: 1/2

// {T}: Another target creature you control gains protection from colorless or from the color of your choice until end of turn.

export const GiverofRunes: CardType = Creature("Giver of Runes", "W", 1, 2, "Kor", "Cleric",
  // {T}: Another target creature you control gains protection from colorless or from the color of your choice until end of turn.
  MakeActivatedAbility(
    "T",
    ChooseTarget(C.Target("Other", "Friendly", "Creature"),
      ChooseAnyColorIncludingColorless("FriendlyPlayer",
        TargetGains("ContextTarget", MakeProtectionFromAbility(C.All(C.OfColor("ChosenColor"))))
      )
    )
  )
);

export const GiverofRunesTest: Test = {
  name: "Giver of Runes",
  description: "Giver of Runes grants protection from chosen color to another creature", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "GiverofRunes", cardName: "Giver of Runes", zone: "Field", friendly: true },
    { id: "Bear", cardName: "Bear", zone: "Field", friendly: true },
  ],
  steps: [
    // Verify initial state
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "GiverofRunes", conditionName: "InZone", expectedValue: "Field" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Bear", conditionName: "InZone", expectedValue: "Field" },
    
    // Activate Giver of Runes' ability targeting Bear
    { type: "Input", name: "CastInput", targetCardId: "GiverofRunes", abilityIndex: 0 },
    { type: "Input", name: "ChooseInput", targetCardId: "Bear" },
    
    // Pass priority to let ability resolve
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Choose red as the protection color
    { type: "Input", name: "ButtonChooseInput", buttonText: "Red" },
    
    // Pass priority after color choice
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Verify Bear gained protection from red
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Bear", conditionName: "HasAbility", expectedValue: "ProtectionFromAbility" },
    
    // Verify Giver of Runes is tapped
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "GiverofRunes", conditionName: "IsTapped", expectedValue: true }
  ]
};
