import { CardType } from "../Types/CardTypes";
import { Creature } from "../CardHelpers/CardTypesHelpers";
import { Destroy, Sacrifice } from "../CardHelpers/EffectClassHelpers";
import { MakeActivatedAbility } from "../CardHelpers/AbilityClassHelpers";
import { Test } from "../Testing/TestTypes";
import { C } from "../Types/ConditionHelpers";

export const CatharCommando: CardType = Creature("Cathar Commando", "1W", 2, 2, "Human", "Soldier", "Flash",
  // {1}, Sacrifice Cathar Commando: Destroy target artifact or enchantment.
  MakeActivatedAbility(
    ["1", Sacrifice()],
    Destroy(C.Target("ArtifactOrEnchantment"))
  )
);

export const CatharCommandoTest: Test = {
  name: "Cathar Commando",
  description: "Test Cathar Commando's activated ability to destroy artifact or enchantment",
  initialPhase: "FirstMain",
  initialCards: [
    { id: "CatharCommando", cardName: "Cathar Commando", zone: "Hand", friendly: true },
    { id: "ArtifactTarget", cardName: "Gruul Signet", zone: "Field", friendly: false },
    { id: "ArtifactTarget2", cardName: "Gruul Signet", zone: "Field", friendly: false },
    { id: "Plains1", cardName: "Plains", zone: "Field", friendly: true },
    { id: "Plains2", cardName: "Plains", zone: "Field", friendly: true }
  ],
  steps: [
    // Cast Cathar Commando
    { type: "Input", name: "CastInput", targetCardId: "CatharCommando" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Verify Cathar Commando is on the battlefield
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "CatharCommando", conditionName: "InZone", expectedValue: "Field" },
    
    // Activate the ability to destroy the artifact
    { type: "Input", name: "CastInput", targetCardId: "CatharCommando", abilityIndex: 0 },
    { type: "Input", name: "ChooseInput", targetCardId: "ArtifactTarget" },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    
    // Verify both Cathar Commando was sacrificed and artifact was destroyed
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "CatharCommando", conditionName: "InZone", expectedValue: "Graveyard" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "ArtifactTarget", conditionName: "InZone", expectedValue: "Graveyard" }
  ]
};