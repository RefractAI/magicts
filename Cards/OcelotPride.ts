import { CardType } from "../Types/CardTypes";
import { Creature } from "../CardHelpers/CardTypesHelpers";
import { Create } from "../CardHelpers/EffectClassHelpers";
import { MakeConditionalTriggeredAbility } from "../CardHelpers/AbilityClassHelpers";
import { Test } from "../Testing/TestTypes";
import { C } from "../Types/ConditionHelpers";

// Ocelot Pride
// Mana Cost: W
// Type: Creature — Cat
// Power/Toughness: 1/1

// First strike, lifelink
// Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)
// At the beginning of your end step, if you gained life this turn, create a 1/1 white Cat creature token. Then if you have the city's blessing, for each token you control that entered this turn, create a token that's a copy of it.

export const OcelotPride: CardType = Creature("Ocelot Pride", "W", 1, 1, "Cat", "FirstStrike", "Lifelink", "Ascend",
  // At the beginning of your end step, if you gained life this turn, create a 1/1 white Cat creature token. Then if you have the city's blessing, for each token you control that entered this turn, create a token that's a copy of it.
  MakeConditionalTriggeredAbility("EndStep", "FriendlyPlayer", "GainedLifeThisTurn", C.Self, //Should be SelfCondition, verified
    Create("11WhiteCat", 1, "FriendlyPlayer", "None", undefined,
      // Then effect - copy tokens if you have city's blessing
      Create("11WhiteCat", 1, "FriendlyPlayer", C.ControlsCard("City's Blessing"), C.Target("IsToken","EnteredThisTurn")),
    )
  )
);

export const OcelotPrideTest: Test = {
  name: "Ocelot Pride",
  description: "Ocelot Pride creates Cat token at end step if life was gained this turn, and gets city's blessing with 10+ permanents", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "OcelotPride", cardName: "Ocelot Pride", zone: "Field", friendly: true },
    // Add 9 more permanents to trigger Ascend (10 total with Ocelot Pride)
    { id: "Permanent1", cardName: "Bear", zone: "Field", friendly: true },
    { id: "Permanent2", cardName: "Bear", zone: "Field", friendly: true },
    { id: "Permanent3", cardName: "Bear", zone: "Field", friendly: true },
    { id: "Permanent4", cardName: "Bear", zone: "Field", friendly: true },
    { id: "Permanent5", cardName: "Bear", zone: "Field", friendly: true },
    { id: "Permanent6", cardName: "Bear", zone: "Field", friendly: true },
    { id: "Permanent7", cardName: "Bear", zone: "Field", friendly: true },
    { id: "Permanent8", cardName: "Bear", zone: "Field", friendly: true },
    { id: "Permanent9", cardName: "Bear", zone: "Field", friendly: true },
  ],
  steps: [
    // Verify initial state
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "OcelotPride", conditionName: "InZone", expectedValue: "Field" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "OcelotPride", conditionName: "HasPower", expectedValue: 1 },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "OcelotPride", conditionName: "HasToughness", expectedValue: 1 },
    
    // Verify keywords including Ascend
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "OcelotPride", conditionName: "HasKeyword", expectedValue: "FirstStrike" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "OcelotPride", conditionName: "HasKeyword", expectedValue: "Lifelink" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "OcelotPride", conditionName: "HasKeyword", expectedValue: "Ascend" },
    
    // Verify city's blessing is created (state-based action should trigger immediately)
    { type: "Assertion", name: "EmblemExists", emblemTestCardIds: ["CitysBlessing1"], emblemCardName: "City's Blessing", zone: "Field", count: 1, friendly: true },
    
    // Make sure Ocelot Pride can attack and deal damage to trigger lifelink
    // Move to combat and attack
    { type: "Input", name: "PassUntil", phase: "DeclareAttackers", friendly: true },
    { type: "Input", name: "PairInput", pairs: [["OcelotPride", "Opponent"]] },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    // Pass through combat to resolve damage
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    // Combat damage should have triggered lifelink and gained life
    { type: "Assertion", name: "Life", targetCardId: "Player", expectedLife: 21 },
    
    // Pass to end step to trigger the ability
    { type: "Input", name: "PassUntil", phase: "EndStep", friendly: true },
    
    // Pass priority to let the triggered ability resolve (create Cat token, then copy if city's blessing)
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Verify 2 Cat tokens were created (original + copy due to city's blessing)
    { type: "Assertion", name: "TokenExists", tokenTestCardIds: ["CatToken1", "CatToken2"], tokenCardName: "11WhiteCat", zone: "Field", count: 2, friendly: true }
  ]
};
