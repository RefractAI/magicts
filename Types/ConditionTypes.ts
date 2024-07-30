import { ConditionName, ConditionSpecName } from "./ConditionNames";
import { IsCreature, IsPlayer, IsPlaneswalker, IsLibrary, IsTribe, IsColor, IsKeyword, IsPowerN, IsCMCNOrGreater, IsCMCNOrLess, IsPowerNOrGreater, IsPowerNOrLess, IsToughnessN, IsToughnessNOrGreater, IsToughnessNOrLess, IsInstant, IsSorcery, IsArtifact, IsEnchantment, IsBattle } from "./IsCard";
import { TribeName } from "./TribeNames";
import { Card, ColorDef, Condition, ConditionConcreteContext, ConditionSpecification, Controller, KeywordName, NumberVar, Player } from "./Types";
import { ToCondition } from "./ToCondition";

const CN = (name:ConditionName,fn:(c:Card,s:Card,b:Controller,x:ConditionConcreteContext) => boolean,numberOfTargets:NumberVar=1):Condition => ({name,cls:'Condition',fn,numberOfTargets:numberOfTargets})

const IsFriendly = (c:Card,s:Card) => c.controller === s.controller
const IsOpponent = (c:Card,s:Card) => c.controller !== s.controller
const IsSelf = (c:Card,s:Card) => c.id === s.id
const IsOther = (c:Card,s:Card) => c.id !== s.id
const IsField = (c:Card) => c.zone === 'Field'
const IsHand = (c:Card) => c.zone === 'Hand'
const CardController = (c:Card,b:Controller):Player => b.cards.find(b => b.id === c.controller) as Player

export const ConditionTypes:Record<ConditionName,Condition> =
{
    None: CN("None", (_) => false),
    Self: CN("Self", (c, s) => IsSelf(c, s)),

    Friendly: CN("Friendly", (c, s) => IsFriendly(c, s)),
    Other: CN("Other", (c, s) => IsOther(c, s)),
    Opponent: CN("Opponent", (c, s) => IsOpponent(c, s)),

    Creature: CN("Creature", (c) => IsField(c) && IsCreature(c)),
    Instant: CN("Instant", (c) => IsField(c) && IsInstant(c)),
    Sorcery: CN("Sorcery", (c) => IsField(c) && IsSorcery(c)),
    Planeswalker: CN("Planeswalker", (c) => IsField(c) && IsPlaneswalker(c)),
    Battle: CN("Battle", (c) => IsField(c) && IsBattle(c)),
    Artifact: CN("Artifact", (c) => IsField(c) && IsArtifact(c)),
    Enchantment: CN("Enchantment", (c) => IsField(c) && IsEnchantment(c)),
    ArtifactOrEnchantment: CN("ArtifactOrEnchantment", (c) => IsField(c) && (IsArtifact(c) || IsEnchantment(c))),
    InstantOrSorcery: CN("InstantOrSorcery", (c) => IsField(c) && (IsInstant(c) || IsSorcery(c))),
    CreatureOrPlayer: CN("CreatureOrPlayer", (c) => IsField(c) && (IsCreature(c) || IsPlayer(c))),

    AnyTarget: CN("AnyTarget", (c) => (IsField(c) && IsCreature(c) || IsPlaneswalker(c)) || IsPlayer(c)),

    Player: CN("Player", (c) => IsPlayer(c)),

    AbilitySource: CN("Player", (c, s) => c.id === s.abilitySourceId),
    Library: CN("Library", (c) => IsLibrary(c)),
    Hand: CN("Library", (c) => IsHand(c)),
    TopNCardsOfLibrary: CN("Library", (c, _, b, x) => IsLibrary(c) && CardController(c, b).library.indexOf(c.id) < x.numberVariable!),

    OfType: CN("OfType", (c, _, __, x) => IsTribe(c, x.tribeVariable!)),
    OfColor: CN("OfColor", (c, _, __, x) => IsColor(c, x.colorVariable!)),
    OfKeyword: CN("OfKeyword", (c, _, __, x) => IsKeyword(c, x.keywordVariable!)),

    PowerN: CN("PowerN", (c, _, __, x) => IsPowerN(c, x.numberVariable!)),
    CMCN: CN("CMCN", (c, _, __, x) => IsPowerN(c, x.numberVariable!)),
    ToughnessN: CN("ToughnessN", (c, _, __, x) => IsToughnessN(c, x.numberVariable!)),
    PowerNOrGreater: CN("PowerNOrGreater", (c, _, __, x) => IsPowerNOrGreater(c, x.numberVariable!)),
    CMCNOrGreater: CN("CMCNOrGreater", (c, _, __, x) => IsCMCNOrGreater(c, x.numberVariable!)),
    ToughnessNOrGreater: CN("ToughnessNOrGreater", (c, _, __, x) => IsToughnessNOrGreater(c, x.numberVariable!)),
    PowerNOrLess: CN("PowerNOrLess", (c, _, __, x) => IsPowerNOrLess(c, x.numberVariable!)),
    CMCNOrLess: CN("CMCNOrLess", (c, _, __, x) => IsCMCNOrLess(c, x.numberVariable!)),
    ToughnessNOrLess: CN("ToughnessNOrLess", (c, _, __, x) => IsToughnessNOrLess(c, x.numberVariable!)),

    //Card specific
    AnyFriendlyCreatureNotAttackingAndNoSummoningSickness: CN("AnyFriendlyCreatureNotAttackingAndNoSummoningSickness", (c, s) => (IsFriendly(c, s) && !c.attacking && !c.summoningSickness)),
}

export const CS = (doesTarget:boolean,all:"All"|"Any",...conditions:ConditionName[]):ConditionSpecification => 
{
    return ({all:all==='All',conditions,min:1,max:1,cls:'ConditionSpecification',doesTarget,context:{}})
}

export const ConditionSpecTypes:Partial<Record<ConditionSpecName,ConditionSpecification>> =
{
    None: CS(false, "Any", "None"),
    Self: CS(false, "Any", "Self"),
    AbilitySource: CS(false, "Any", "AbilitySource"),

    AnyPlayer: CS(true, "Any", "Player"),
    AllPlayers: CS(false, "All", "Player"),

    AnyTarget: CS(true, "Any", "AnyTarget"),
    AllTargets: CS(false, "All", "AnyTarget"),

    AnyCreature: CS(true, "Any", "Creature"),

    FriendlyPlayer: CS(false, "Any", "Friendly", "Player"),
    OpponentPlayer: CS(true, "Any", "Opponent", "Player"),

    AllCreatures: CS(false, "All", "Opponent", "Player"),

    AnyOtherCreature: CS(true, "Any", "Other", "Friendly", "Creature"),
    AnyOtherFriendlyCreature: CS(true, "Any", "Other", "Friendly", "Creature"),

    AllOtherCreatures: CS(false, "All", "Other", "Creature"),
    AllOtherFriendlyCreatures: CS(false, "All", "Other", "Friendly", "Creature"),

    AnyCreatureOrPlayer: CS(true, "Any", "CreatureOrPlayer"),
    OpponentCreatureOrPlayer: CS(true, "Any", "Opponent", "CreatureOrPlayer"),

    AnyFriendlyCreature: CS(true, "Any", "Friendly", "Creature"),
    AllFriendlyCreatures: CS(false, "All", "Friendly", "Creature"),
    AnyOpponentCreature: CS(true, "Any", "Opponent", "Creature"),
    AllOpponentCreatures: CS(false, "All", "Opponent", "Creature"),

    AnyTopNCardsOfFriendlyLibrary: CS(false, "Any", "Friendly", "TopNCardsOfLibrary"),
    AllTopNCardsOfFriendlyLibrary: CS(false, "All", "Friendly", "TopNCardsOfLibrary"),
    AnyTopNCardsOfOpponentLibrary: CS(false, "Any", "Opponent", "TopNCardsOfLibrary"),
    AllTopNCardsOfOpponentLibrary: CS(false, "All", "Opponent", "TopNCardsOfLibrary"),

    AnyOfType: CS(true, "Any", "OfType"),
    AnyFriendlyOfType: CS(true, "Any", "Friendly", "OfType"),
    AnyOpponentOfType: CS(true, "Any", "Opponent", "OfType"),
    AllOfType: CS(false, "All", "OfType"),
    AllFriendlyOfType: CS(false, "All", "Friendly", "OfType"),
    AllOpponentOfType: CS(false, "All", "Opponent", "OfType"),

    AnyOfColor: CS(true, "Any", "OfColor"),
    AnyFriendlyOfColor: CS(true, "Any", "Friendly", "OfColor"),
    AnyOpponentOfColor: CS(true, "Any", "Opponent", "OfColor"),
    AllOfColor: CS(false, "All", "OfColor"),
    AllFriendlyOfColor: CS(false, "All", "Friendly", "OfColor"),
    AllOpponentOfColor: CS(false, "All", "Opponent", "OfColor"),

    AnyOfKeyword: CS(true, "Any", "OfKeyword"),
    AnyFriendlyOfKeyword: CS(true, "Any", "Friendly", "OfKeyword"),
    AnyOpponentOfKeyword: CS(true, "Any", "Opponent", "OfKeyword"),
    AllOfKeyword: CS(false, "All", "OfKeyword"),
    AllFriendlyOfKeyword: CS(false, "All", "Friendly", "OfKeyword"),
    AllOpponentOfKeyword: CS(false, "All", "Opponent", "OfKeyword"),

    AnyFriendlyHand: CS(true, "Any", "Friendly", "Hand"),

    AnyFriendlyCreatureNotAttackingAndNoSummoningSickness:CS(false,"Any","AnyFriendlyCreatureNotAttackingAndNoSummoningSickness")
}

export const IsOfColor = (condition:"AnyOfColor"|"AnyFriendlyOfColor"|"AllOfColor"|"AllFriendlyOfColor",color:ColorDef) => ToCondition(condition, undefined, undefined, color)
export const IsOfType = (condition:"AnyOfType"|"AnyFriendlyOfType"|"AllOfType"|"AllFriendlyOfType",tribe:TribeName) => ToCondition(condition, undefined, undefined, tribe)
export const IsOfKeyword = (condition:"AnyOfKeyword"|"AnyFriendlyOfKeyword"|"AllOfKeyword"|"AllFriendlyOfType",keyword:KeywordName) => ToCondition(condition, undefined, undefined, keyword)

