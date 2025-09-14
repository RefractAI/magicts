import { Ability, AbilityClass, AbilityUnion, CastingOptionAbility } from "./AbilityTypes"
import { ActualCardName, CardName } from "../Cards/Common/CardNames"
import { Effect, EffectUnion } from "./EffectTypes"
import { GameActionUnion } from "./GameActionTypes"
import { AbilityTypeId, CardId, PlayerId, Timestamp } from "./IdCounter"
import { CastSpecification, InputUnion } from "./InputTypes"
import { PhaseName } from "./PhaseNames"
import { TribeName } from "./TribeNames"
import { ZoneName } from "./ZoneNames"
import { Cost, PoolManaElement } from "./CostTypes"
import { KeywordName } from "./KeywordTypes"
import { CastPhaseName } from "./CastPhaseTypes"
import { CounterType } from "./CounterTypes"
import { Color, ColorDef } from "./ColorTypes"
import { NumberDef } from "./ConditionTypes"
import { TriggerName } from "./TriggerNames"

export interface QueuedTriggeredAbility
{
    triggerName: TriggerName,
    triggerSources: CardId[],
    controller: PlayerId,
    sourceCard: CardId,
    abilityTypeId: AbilityTypeId,
    timestamp: Timestamp
}

export interface Controller
{
    cards:(Card | Player)[],
    active:PlayerId,
    active2:PlayerId,
    activePlayerPassed:boolean, // Whether the active player has passed priority
    nonActivePlayerPassed:boolean, // Whether the non-active player has passed priority
    phase:PhaseName,
    turnNumber:number,
    input?:InputUnion,
    stack:CardId[],
    fastStack:CardId[],
    actions:GameActionUnion[],
    currentTest?:ActualCardName,
    autoTapLoopCount:number,
    triggeredAbilityQueue:QueuedTriggeredAbility[], // Triggered abilities waiting to be put on stack
}

export interface CardType
{
    name:CardName,
    cost:Cost,
    abilities:AbilityUnion[], //i.e. innate on the card,
    effects:EffectUnion[],
    cls:'CardType'
}

export type Clause = AbilityUnion | EffectUnion | TribeName | KeywordName

export interface ResolutionContext
{
    targets:CardId[][],
    linkedTargets?:CardId[][],
    illegalTargets?:CardId[][]

    discardTargetIds?:CardId[][],
    sacrificeTargetIds?:CardId[][],
    searchTargetIds?:CardId[][],
    mayInput?:boolean,
    booleanChoice?:boolean,
    buttonChoice?:string,
    bucketResponse?:CardId[][],
    bucketTargetIds?:Record<string, CardId[]>,
    chosenColor?:Color,
    chosenTargets?:CardId[],
    exploreChoice?:boolean,
    surveilChoice?:boolean,
    selectedX?:number,
    
}

export interface ConditionContext
{
    numberVariable?:NumberDef,
    tribeVariable?:TribeName,
    colorVariable?:ColorDef,
    keywordVariable?:KeywordName,
    cardNameVariable?:CardName,
    zoneVariable?:ZoneName,
    stringVariable?:string,
} 

export interface ConditionConcreteContext extends ResolutionContext
{
    numberVariable?:number,
    stringVariable?:string,
    tribeVariable?:TribeName,
    colorVariable?:Color,
    keywordVariable?:KeywordName,
    zoneVariable?:ZoneName,
    abilityVariable?:AbilityClass,
    cardNameVariable?:CardName,
} 

export interface Card
{
    id:CardId,
    controller:PlayerId
    originalName:CardName,
    name:CardName,
    abilitySourceId?:CardId,
    abilitySourceSourceIds?:CardId[],
    abilitySourceAbilityId?:AbilityTypeId

    zone:ZoneName,
    previousZone:ZoneName
    tapped:boolean,
    revealed:boolean,
    counters:CounterType[],
    damageMarked:number,
    attacking?:CardId,
    blockOrder:CardId[],
    blocking:CardId[],
    printedAbilities:Ability[], //i.e. permanently on this from the card type (reset on zone change or name change) and from other sources (e.g. +2/+2 until end of turn)
    timestamp:Timestamp,
    summoningSickness:boolean
    enteredThisTurn:boolean

    castPhase:CastPhaseName,
    castSelectedAbilities:AbilityUnion[],
    castSelectedEffects:EffectUnion[],
    castSelectedX:number,
    castSelectedCost:Cost,
    castSelectedName:CardName,
    selectedOptions:CastingOptionAbility[],
    effects:Effect[],

    //derived
    abilities:Ability[], //CALCULATED temp abilities from the printedAbilities or auras from other cards, then sorted below (except activated/triggered)
    keywords:KeywordName[],
    canCast:CastSpecification[]
    options:CastingOptionAbility[][], //CALCULATED valid casting option combinations (empty array means normal cast only)
    power:number,
    toughness:number,
    tribes:TribeName[],
    colors:Color[],
    cmc:number,
    cost:Cost,

    cls:'Card'
}

export interface Player extends Card
{
    id:PlayerId,
    controller:PlayerId
    name:'Player'|'Opponent',

    zone:'Player'

    life:number,
    library:CardId[],
    manaPool:PoolManaElement[]

    cardsDrawnThisTurn:number,
    spellsCastThisTurn:number,
    gainedLifeThisTurn:number,
    lostLifeThisTurn:number,
    cardsEnteredThisTurn:CardId[],
}
