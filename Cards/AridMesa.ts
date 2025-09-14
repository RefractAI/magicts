import { CardType } from "../Types/CardTypes";
import { Land } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { MakeActivatedAbility } from "../CardHelpers/AbilityClassHelpers";
import { Search, Sacrifice, LoseLife } from "../CardHelpers/EffectClassHelpers";
import { C } from "../Types/ConditionHelpers";

// Arid Mesa
// Mana Cost: 
// Type: Land


// {T}, Pay 1 life, Sacrifice this land: Search your library for a Mountain or Plains card, put it onto the battlefield, then shuffle.

export const AridMesa: CardType = Land("Arid Mesa",
  MakeActivatedAbility(
    ["T", LoseLife(1), Sacrifice()],
    Search("FriendlyPlayer", C.Target("Friendly", "Library", C.Or(C.OfTribe("Mountain"), C.OfTribe("Plains"))), "None", "Field")
  )
);

export const AridMesaTest: Test = {
  name: "Arid Mesa",
  description: "Arid Mesa sacrifices for a Mountain or Plains from library", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "TestCard", cardName: "Arid Mesa", zone: "Field", friendly: true },
    { id: "Mountain1", cardName: "Mountain", zone: "Library", friendly: true, position: 0 },
    { id: "Plains1", cardName: "Plains", zone: "Library", friendly: true, position: 1 },
    { id: "Island1", cardName: "Island", zone: "Library", friendly: true, position: 2 }
  ],
  steps: [
    { type: "Assertion", name: "Life", targetCardId: "Player", expectedLife: 20 },
    { type: "Input", name: "CastInput", targetCardId: "TestCard", abilityIndex: 0 },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "ChooseInput", targetCardId: "Mountain1" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "TestCard", conditionName: "InZone", expectedValue: "Graveyard" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Mountain1", conditionName: "InZone", expectedValue: "Field" },
    { type: "Assertion", name: "Life", targetCardId: "Player", expectedLife: 19 },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Island1", conditionName: "InZone", expectedValue: "Library" }
  ]
};
