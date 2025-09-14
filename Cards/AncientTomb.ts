import { CardType } from "../Types/CardTypes";
import { Land } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { MakeActivatedAbility } from "../CardHelpers/AbilityClassHelpers";
import { AddMana, Damage } from "../CardHelpers/EffectClassHelpers";

// Ancient Tomb
// Type: Land
// {T}: Add {C}{C}. Ancient Tomb deals 2 damage to you.

export const AncientTomb: CardType = Land("Ancient Tomb", 
  MakeActivatedAbility("T", AddMana("Colorless", 2), Damage(2, "FriendlyPlayer"))
);

export const AncientTombTest: Test = {
  name: "Ancient Tomb",
  description: "Ancient Tomb adds 2 colorless mana and deals 2 damage to you", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "TestCard", cardName: "Ancient Tomb", zone: "Field", friendly: true }
  ],
  steps: [
    { type: "Assertion", name: "Life", targetCardId: "Player", expectedLife: 20 },
    { type: "Input", name: "CastInput", targetCardId: "TestCard", abilityIndex: 0 },
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    { type: "Assertion", name: "Life", targetCardId: "Player", expectedLife: 18 }
  ]
};