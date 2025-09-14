import { CardType } from "../../Types/CardTypes";
import { ActualCardName, TokenName, EmblemName } from "./CardNames";

// Import individual card implementations
import { Bear } from "./Bear";
import { FlametongueKavu } from "../FlametongueKavu";
import { LightningBolt } from "../LightningBolt";
import { AdelineResplendentCathar } from "../AdelineResplendentCathar";
import { BladeSplicer } from "../BladeSplicer";
import { BenevolentBodyguard } from "../BenevolentBodyguard";
import { BirdsofParadise } from "../BirdsofParadise";
import { CatharCommando } from "../CatharCommando";
import { GuardianOfNewBenalia } from "../GuardianOfNewBenalia";
import { SpyglassSiren } from "../SpyglassSiren";
import { FaerieMastermind } from "../FaerieMastermind";
import { DragonsRageChanneler } from "../DragonsRageChanneler";
import { ConcealingCurtains, RevealingEye } from "../ConcealingCurtains";
import { SimicSignet } from "../SimicSignet";
import { DemonicTutor } from "../DemonicTutor";
import { GoblinBombardment } from "../GoblinBombardment";
import { Thoughtseize } from "../Thoughtseize";
import { WalkingBallista } from "../WalkingBallista";
import { DescendantofStorms } from "../DescendantofStorms";
import { GiverofRunes } from "../GiverofRunes";
import { MotherofRunes } from "../MotherofRunes";
import { OcelotPride } from "../OcelotPride";
import { Nethergoyf } from "../Nethergoyf";
import { Fire, Ice, FireIce } from "../FireIce";
import { ToxicDeluge } from "../ToxicDeluge";
import { ThaliaGuardianofThraben } from "../ThaliaGuardianofThraben";
import { GuideofSouls } from "../GuideofSouls";
import { FloodpitsDrowner } from "../FloodpitsDrowner";
import { DarkConfidant } from "../DarkConfidant";
import { FactorFiction } from "../FactorFiction";
import { Abrade } from "../Abrade";
import { AbruptDecay } from "../AbruptDecay";
import { AdantoVanguard } from "../AdantoVanguard";
import { Plains, Island, Swamp, Mountain, Forest, RainbowLand, GruulSignet, Player, Opponent, Ability, Option } from "./BasicLands";
import { WhiteHumanToken, WhiteSpiritToken, WhiteCatToken, PhyrexianGolemToken, MapToken } from "./Tokens";
import { CitysBlessing } from "./Emblems";
import { GiantGrowth } from "../GiantGrowth";
import { AetherfluxReservoir } from "../AetherfluxReservoir";
import { Preordain } from "../Preordain";
import { AetherSpellbomb } from "../AetherSpellbomb";
import { AkalPakalFirstAmongEquals } from "../AkalPakalFirstAmongEquals";
import { AncestralRecall } from "../AncestralRecall";
import { SolRing } from "../SolRing";
import { AncientTomb } from "../AncientTomb";
import { AridMesa } from "../AridMesa";

export const CardTypes: Record<ActualCardName, CardType> = {
  "Bear": Bear,
  "Flametongue Kavu": FlametongueKavu,
  "Lightning Bolt": LightningBolt,
  "Adeline, Resplendent Cathar": AdelineResplendentCathar,
  "Blade Splicer": BladeSplicer,
  "Benevolent Bodyguard": BenevolentBodyguard,
  "Birds of Paradise": BirdsofParadise,
  "Cathar Commando": CatharCommando,
  "Guardian of New Benalia": GuardianOfNewBenalia,
  "Spyglass Siren": SpyglassSiren,
  "Faerie Mastermind": FaerieMastermind,
  "Dragon's Rage Channeler": DragonsRageChanneler,
  "Concealing Curtains": ConcealingCurtains,
  "Revealing Eye": RevealingEye,
  "Simic Signet": SimicSignet,
  "Demonic Tutor": DemonicTutor,
  "Goblin Bombardment": GoblinBombardment,
  "Thoughtseize": Thoughtseize,
  "Walking Ballista": WalkingBallista,
  "Descendant of Storms": DescendantofStorms,
  "Giver of Runes": GiverofRunes,
  "Mother of Runes": MotherofRunes,
  "Ocelot Pride": OcelotPride,
  "Nethergoyf": Nethergoyf,
  "Fire": Fire,
  "Ice": Ice,
  "Fire // Ice": FireIce,
  "Toxic Deluge": ToxicDeluge,
  "Thalia, Guardian of Thraben": ThaliaGuardianofThraben,
  "Guide of Souls": GuideofSouls,
  "Floodpits Drowner": FloodpitsDrowner,
  "Dark Confidant": DarkConfidant,
  "Fact or Fiction": FactorFiction,
  "Abrade": Abrade,
  "Abrupt Decay": AbruptDecay,
  "Adanto Vanguard": AdantoVanguard,
  Plains: Plains,
  Island: Island,
  Swamp: Swamp,
  Mountain: Mountain,
  Forest: Forest,
  RainbowLand: RainbowLand,
  "Gruul Signet": GruulSignet,
  Player: Player,
  Opponent: Opponent,
  Ability: Ability,
  Option: Option,
  "Giant Growth": GiantGrowth,
  "Aetherflux Reservoir": AetherfluxReservoir,
  "Preordain": Preordain,
  "Aether Spellbomb": AetherSpellbomb,
  "Akal Pakal, First Among Equals": AkalPakalFirstAmongEquals,
  "Ancestral Recall": AncestralRecall,
  "Sol Ring": SolRing,
  "Ancient Tomb": AncientTomb,
  "Arid Mesa": AridMesa,
}

export const TokenTypes: Record<TokenName, CardType> = {
  "11WhiteHuman": WhiteHumanToken,
  "11WhiteSpirit": WhiteSpiritToken,
  "11WhiteCat": WhiteCatToken,
  "33ColorlessPhyrexianGolemArtifactCreature": PhyrexianGolemToken,
  "MapToken": MapToken,
}

export const EmblemTypes: Record<EmblemName, CardType> = {
  "City's Blessing": CitysBlessing,
}