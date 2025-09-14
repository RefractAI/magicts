import { CardType } from "../Types/CardTypes";
import { Artifact } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { MakeActivatedAbility } from "../CardHelpers/AbilityClassHelpers";
import { AddMana } from "../CardHelpers/EffectClassHelpers";

// Simic Signet
// Mana Cost: 2
// Type: Artifact


// {1}, {T}: Add {G}{U}.

export const SimicSignet: CardType = Artifact("Simic Signet", "2",
  // {1}, {T}: Add {G}{U}.
  MakeActivatedAbility("1T", 
    AddMana("Green"),
    AddMana("Blue")
  )
);

export const SimicSignetTest: Test = {
  name: "Simic Signet",
  description: "Simic Signet can be cast and tapped for {G}{U} mana", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "Signet", cardName: "Simic Signet", zone: "Hand", friendly: true },
    { id: "Island1", cardName: "Island", zone: "Field", friendly: true },
    { id: "Bear", cardName: "Bear", zone: "Hand", friendly: true },
    { id: "Bolt", cardName: "Lightning Bolt", zone: "Hand", friendly: true },
  ],
  steps: [
    // Cast Simic Signet
    { type: "Input", name: "CastInput", targetCardId: "Signet" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Signet", conditionName: "InZone", expectedValue: "Field" },
    
    // Activate Simic Signet's mana ability  
    { type: "Input", name: "CastInput", targetCardId: "Signet", abilityIndex: 0 },
    // Pay the {1} cost by tapping the Island
    { type: "Input", name: "PayInput", targetCardId: "Island1" },
    
    // Check that we now have {G}{U} in our mana pool
    { type: "Assertion", name: "ManaPool", friendly: true, expectedMana: "GU" }
  ]
};
