import { CardType } from "../../Types/CardTypes";
import { Artifact, TokenArtifactCreature, TokenCreature } from "../../CardHelpers/CardTypesHelpers";
import { Explore, Sacrifice } from "../../CardHelpers/EffectClassHelpers";
import { MakeActivatedAbility } from "../../CardHelpers/AbilityClassHelpers";
import { C } from "../../Types/ConditionHelpers";

// Token creatures and artifacts

export const WhiteHumanToken: CardType = TokenCreature("11WhiteHuman", 1, 1, "Human");

export const WhiteSpiritToken: CardType = TokenCreature("11WhiteSpirit", 1, 1, "Spirit", "Flying");

export const WhiteCatToken: CardType = TokenCreature("11WhiteCat", 1, 1, "Cat");

export const PhyrexianGolemToken: CardType = TokenArtifactCreature("33ColorlessPhyrexianGolemArtifactCreature", 3, 3, "Phyrexian", "Golem");

export const MapToken: CardType = Artifact("MapToken", "",
  // {1}, {T}, Sacrifice this token: Target creature you control explores. Activate only as a sorcery.
  MakeActivatedAbility(
    ["1T", Sacrifice()],
    Explore(C.Target("Friendly", "Creature"))
  )
);