import { CardType } from "../Types/CardTypes";
import { Sorcery } from "../CardHelpers/CardTypesHelpers";
import { Test } from "../Testing/TestTypes";
import { SelectX, LoseLife, TargetGains } from "../CardHelpers/EffectClassHelpers";
import { MakePowerToughnessAbility } from "../CardHelpers/AbilityClassHelpers";
import { C } from "../Types/ConditionHelpers";

// Toxic Deluge
// Mana Cost: 2B
// Type: Sorcery


// As an additional cost to cast this spell, pay X life.
// All creatures get -X/-X until end of turn.

export const ToxicDeluge: CardType = Sorcery("Toxic Deluge"
  // As an additional cost to cast this spell, pay X life
  , ["2B",SelectX(
    LoseLife("SelectedX", "FriendlyPlayer"),
  )]
  // Then effect: All creatures get -X/-X until end of turn  
  ,TargetGains(C.All("Creature"), MakePowerToughnessAbility("NegativeSelectedX", "NegativeSelectedX", "UntilEndOfTurn"))
);


export const ToxicDelugeTest: Test = {
  name: "Toxic Deluge",
  description: "Toxic Deluge allows paying X life as additional cost and gives all creatures -X/-X until end of turn", 
  initialPhase: "FirstMain",
  initialCards: [
    { id: "ToxicDeluge", cardName: "Toxic Deluge", zone: "Hand", friendly: true },
    { id: "FriendlyCreature", cardName: "Bear", zone: "Field", friendly: true }, // 2/2 creature
    { id: "EnemyCreature", cardName: "Bear", zone: "Field", friendly: false }, // 2/2 creature
    { id: "Swamp1", cardName: "Swamp", zone: "Field", friendly: true },
    { id: "Swamp2", cardName: "Swamp", zone: "Field", friendly: true },
    { id: "Swamp3", cardName: "Swamp", zone: "Field", friendly: true },
  ],
  steps: [
    // Cast Toxic Deluge
    { type: "Input", name: "CastInput", targetCardId: "ToxicDeluge" },
    // Select X = 2 (pay 2 life)
    { type: "Input", name: "NumberInput", value: 2 },
    // Pass priority for spell to resolve
    { type: "Input", name: "PassPriority" },
    { type: "Input", name: "PassPriority" },
    // Verify Toxic Deluge went to graveyard
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "ToxicDeluge", conditionName: "InZone", expectedValue: "Graveyard" },
    // Both Bears should die due to 0 toughness state-based action
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "FriendlyCreature", conditionName: "InZone", expectedValue: "Graveyard" },
    { type: "Assertion", name: "ConditionAssertion", targetCardId: "EnemyCreature", conditionName: "InZone", expectedValue: "Graveyard" },
  ]
};
