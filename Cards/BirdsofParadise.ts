import { CardType } from "../Types/CardTypes";
import { Creature } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { MakeActivatedAbility } from "../CardHelpers/AbilityClassHelpers";
import { ChooseAnyColor, AddMana } from "../CardHelpers/EffectClassHelpers";

// Birds of Paradise
// Mana Cost: G
// Type: Creature — Bird
// Power/Toughness: 0/1

// Flying
// {T}: Add one mana of any color.

export const BirdsofParadise: CardType = Creature("Birds of Paradise", "G", 0, 1, "Bird", "Flying",
  // {T}: Add one mana of any color.
  MakeActivatedAbility("T", 
    ChooseAnyColor("FriendlyPlayer", 
      AddMana("ChosenColor")
    )
  )
);

export const BirdsofParadiseTest: Test = {
  name: "Birds of Paradise",
  description: "Cast Birds of Paradise, then tap it to add mana of any color", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "Birds", cardName: "Birds of Paradise", zone: "Hand", friendly: true },
  ],
  steps: [
    // Cast Birds of Paradise
    { type: "Input", name: "CastInput", targetCardId: "Birds" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Birds", conditionName: "InZone", expectedValue: "Field" },
    
    // Activate Birds of Paradise's mana ability - tap to add mana of any color
    { type: "Input", name: "CastInput", targetCardId: "Birds", abilityIndex: 0 },
    // Choose red mana (mana abilities resolve immediately)
    { type: "Input", name: "ButtonChooseInput", buttonText: "Red" },
    
    // Verify Birds is tapped and mana was added
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "Birds", conditionName: "IsTapped" },
    { type: "Assertion", name: "ManaPool", friendly: true, expectedMana: "R" }
  ]
};
