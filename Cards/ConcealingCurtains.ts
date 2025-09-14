import { CardType } from "../Types/CardTypes";
import { Creature } from "../CardHelpers/CardTypesHelpers";
import { MakeSorceryActivatedAbility, MakeTriggeredAbility, TransformCastingOption } from "../CardHelpers/AbilityClassHelpers";
import { Transform, ChooseTarget, Discard, Draw, May } from "../CardHelpers/EffectClassHelpers";
import { Test } from "../Testing/TestTypes";
import { C } from "../Types/ConditionHelpers";

// Concealing Curtains // Revealing Eye
// Mana Cost: {B}
// Type: Creature — Wall // Creature — Eye Horror
// Power/Toughness: 0/4 // 3/4
// Defender, {2}{B}: Transform this creature. Activate only as a sorcery.

export const ConcealingCurtains: CardType = Creature("Concealing Curtains", "B", 0, 4, "Wall",
  "Defender",
  TransformCastingOption("Revealing Eye"),
  MakeSorceryActivatedAbility("2B", Transform())
);

// Revealing Eye (back face of Concealing Curtains)
// Type: Creature — Eye Horror  
// Power/Toughness: 3/4
// Menace, When this creature transforms into Revealing Eye, target opponent reveals their hand. You may choose a nonland card from it. If you do, that player discards that card, then draws a card.

export const RevealingEye: CardType = Creature("Revealing Eye", "B", 3, 4, "Eye", "Horror",
  "Menace",
  MakeTriggeredAbility("Transform", "Self",
    // When this creature transforms into Revealing Eye, target opponent reveals their hand.
    // You may choose a nonland card from it. If you do, that player discards that card, then draws a card.
    ChooseTarget(C.Target("Opponent", "NonLandHand"),
      May(
        Discard("OpponentPlayer", "ContextTarget"),
        Draw(1, "OpponentPlayer")
      )
    )
  )
);

export const ConcealingCurtainsTest: Test = {
  name: "Concealing Curtains",
  description: "Test basic casting, defender ability, and transform ability functionality including transform trigger", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "Curtains", cardName: "Concealing Curtains", zone: "Hand", friendly: true },
    { id: "Land1", cardName: "Swamp", zone: "Field", friendly: true },
    { id: "Land2", cardName: "Swamp", zone: "Field", friendly: true },
    { id: "Land3", cardName: "Swamp", zone: "Field", friendly: true },
    { id: "Attacker", cardName: "Bear", zone: "Field", friendly: false },
    // Give opponent some hand cards to test the transform trigger
    { id: "OpponentCreatureCard", cardName: "Bear", zone: "Hand", friendly: false },
    { id: "OpponentLand", cardName: "Mountain", zone: "Hand", friendly: false },
  ],
  steps: [
    // Cast Concealing Curtains
    { type: "Input", name: "CastInput", targetCardId: "Curtains" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Curtains", conditionName: "InZone", expectedValue: "Field" },
    { type: "Assertion", name: "Name", targetCardId: "Curtains", cardName: "Concealing Curtains" },
    
    // Activate the transform ability 
    { type: "Input", name: "CastInput", targetCardId: "Curtains", abilityIndex: 0 },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Transform ability resolves, triggering the ETB ability immediately
    // The triggered ability is now on the stack and asking for targeting
    // Choose a card from opponent's hand
    { type: "Input", name: "ChooseInput", targetCardId: "OpponentCreatureCard" },
    
    // Pass priority to let the triggered ability resolve
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // May effect requires boolean input to choose whether to discard the card
    { type: "Input", name: "BooleanInput", response: true },
    
    // Verify transformation occurred and triggered ability resolved
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Curtains", conditionName: "InZone", expectedValue: "Field" },
    { type: "Assertion", name: "Name", targetCardId: "Curtains", cardName: "Revealing Eye" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "OpponentCreatureCard", conditionName: "InZone", expectedValue: "Graveyard" },
  
  ]
};