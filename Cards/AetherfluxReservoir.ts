import { CardType } from "../Types/CardTypes";
import { Artifact } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { MakeTriggeredAbility, MakeActivatedAbility } from "../CardHelpers/AbilityClassHelpers";
import { GainLife, Damage, LoseLife } from "../CardHelpers/EffectClassHelpers";
import { C } from "../Types/ConditionHelpers";

// Aetherflux Reservoir
// Mana Cost: 4
// Type: Artifact

// Whenever you cast a spell, you gain 1 life for each spell you've cast this turn.
// Pay 50 life: This artifact deals 50 damage to any target.

export const AetherfluxReservoir: CardType = Artifact(
  "Aetherflux Reservoir", 
  "4",
  // Whenever you cast a spell, you gain 1 life for each spell you've cast this turn.
  MakeTriggeredAbility(
    "CastSpell",
    C.Target("Friendly"),
    GainLife("SpellsCastThisTurn", "FriendlyPlayer")
  ),
  // Pay 50 life: This artifact deals 50 damage to any target.
  MakeActivatedAbility(
    LoseLife(50, "FriendlyPlayer"),
    Damage(50, "AnyTarget")
  )
);

export const AetherfluxReservoirTest: Test = {
  name: "Aetherflux Reservoir",
  description: "Test Aetherflux Reservoir life gain trigger and activated ability", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "Reservoir", cardName: "Aetherflux Reservoir", zone: "Field", friendly: true },
    { id: "Bolt1", cardName: "Lightning Bolt", zone: "Hand", friendly: true },
    { id: "Bolt2", cardName: "Lightning Bolt", zone: "Hand", friendly: true },
    { id: "Bolt3", cardName: "Lightning Bolt", zone: "Hand", friendly: true },
    { id: "Target", cardName: "Bear", zone: "Field", friendly: false },
  ],
  steps: [

    // Cast Lightning Bolt (second spell this turn)
    { type: "Input", name: "CastInput", targetCardId: "Bolt1" },
    { type: "Input", name: "ChooseInput", targetCardId: "Target" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Life gain from Aetherflux Reservoir trigger should resolve
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Assertion", name: "Life", targetCardId: "Player", expectedLife: 21 }, // Gained 1 life (1st spell this turn)
    
    // Cast Lightning Bolt (third spell this turn)
    { type: "Input", name: "CastInput", targetCardId: "Bolt2" },
    { type: "Input", name: "ChooseInput", targetCardId: "Opponent" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Life gain from Aetherflux Reservoir trigger should resolve
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Assertion", name: "Life", targetCardId: "Player", expectedLife: 23 }, // Gained 2 more life (2nd spell)
  ]
};
