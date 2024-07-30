import { AbilityUnion } from "./AbilityClass"
import { ActualCardName, CardName } from "./CardNames"
import { ConditionName, ConditionSpecName } from "./ConditionNames"
import { DurationName } from "./DurationNames"
import { EffectUnion } from "./EffectClass"
import { GameActionUnion } from "./GameActionTypes"
import { AbilityTypeId, CardId, PlayerId, Timestamp } from "./IdCounter"
import { CastSpecification, InputKind, InputUnion } from "./InputTypes"
import { PhaseName } from "./PhaseNames"
import { TribeName } from "./TribeNames"
import { ColorVariableName, NumberVariableName } from "./VariableNames"
import { ZoneName } from "./ZoneNames"

export interface Controller
{
    cards:(Card | Player)[],
    active:PlayerId,
    active2:PlayerId,
    priorityPassed:number,
    hasCastOrPassed:boolean
    phase:PhaseName,
    turn:number,
    input?:InputUnion,
    stack:CardId[],
    fastStack:CardId[],
    actions:GameActionUnion[],
    currentTest?:ActualCardName,
    autoTapLoopCount:number,
}

export type GameActionName = 'None'|'InputAction'|'ChangeZoneAction'

export interface GameAction
{
    name:GameActionName,
    priority:number,
    cls:'GameAction'
}

export type InputName = 'NoneInput'|'CastInput'|'PayInput'|'NumberInput'|'BooleanInput'|'BucketInput'|'ChooseInput'|'CardNameInput'|'ModeInput'|'PairInput'|'ButtonChooseInput'

export interface InputType
{
    name:InputName,
    prompt:string,
    response:any,
    responded:boolean,
    playerId:PlayerId,
    purpose:InputKind

    source:CardId, //Player, spell or ability that requires the choice
    sourceEffectIndex?:number, //For that card, effect that requires card choice
    contextKey?:keyof ResolutionContext //For that effect, the context key to return the results to
    contextKeyIndex?:number  //For that context key, the array index to return the results to
}

export interface CardType
{
    name:CardName,
    options:Option[]
    cls:'CardType'
}

export type OptionType = 'Base'|'May'|'Must'|'ChooseOne'|'ChooseTwo'

export interface Option
{
    optionType:OptionType,
    cost:Cost,
    abilities:AbilityUnion[], //i.e. innate on the card,
    effects:EffectUnion[],
    cls:'Option',
}

export interface Cost
{
    cls:'Cost',
    elements:CostElement[]
}

export const ColorNames = ['White','Blue','Black','Red','Green','Colorless'] as const
export type Color = typeof ColorNames[number]
export type CostColor = Color|'Generic'|'X'|'W/U'

export type CostVar = Cost | string | EffectUnion | (string|EffectUnion)[]

export type CostElement = CostManaElement | EffectUnion

export interface CostManaElement
{
    color:CostColor
    condition:ConditionSpecification,
    cls:'CostManaElement'
}

export interface PoolManaElement
{
    color:Color
    condition:ConditionSpecification,
    cls:'CostManaElement'
}

export type Clause = Option | AbilityUnion | EffectUnion | TribeName | KeywordName

export interface NumberVariable
{
    name:NumberVariableName,
    fn: (card:Card,source:Card,context:Controller,x:ResolutionContext) => number
    cls:'NumberVariable',
}

export interface ColorVariable
{
    name:ColorVariableName,
    fn: (card:Card,source:Card,context:Controller,x:ResolutionContext) => Color
    cls:'ColorVariable',
}

export interface NumberSpecification
{
    conditions:ConditionSpecification|NumberVariableName,
    min:NumberDef,
    max:NumberDef,
    cls:'NumberSpecification',
}

export interface ConditionSpecification
{
    conditions:ConditionName[],
    min:NumberDef,
    max:NumberDef,
    all:boolean,
    doesTarget:boolean,
    context:ConditionContext
    cls:'ConditionSpecification'|'NoneCondition'|'SelfCondition'|'AbilitySourceCondition',
}

export const NoneCondition:ConditionSpecification = ({conditions:[], min:0, max:0, all:false, cls:'NoneCondition', doesTarget:false, context:{}})
export const SelfCondition:ConditionSpecification = ({conditions:["Self"], min:1, max:1, all:false, cls:'SelfCondition', doesTarget:false, context:{}})
export const AbilitySourceCondition:ConditionSpecification = ({conditions:["AbilitySource"], min:1, max:1, all:false, cls:'AbilitySourceCondition', doesTarget:false, context:{}})

export type TargetStatus = 'Pending'|'Complete'

export interface Target
{
    spec:ConditionSpecification
    targets:CardId[],
    status:TargetStatus
    cls:'Target',
}


export interface ResolutionContext
{
    targets:CardId[][],
    discardTargetIds?:CardId[][],
    linkedTargets?:CardId[][],
    mayInput?:boolean,
    chosenColor?:Color
}

export interface ConditionContext //i.e. unresolved?? is this needed????
{
    numberVariable?:NumberDef,
    tribeVariable?:TribeName,
    colorVariable?:ColorDef,
    keywordVariable?:KeywordName,
    cardIdsVariable?:ConditionSpecification
}

export interface ConditionConcreteContext extends ResolutionContext //i.e. unresolved?? is this needed????
{
    numberVariable?:number,
    tribeVariable?:TribeName,
    colorVariable?:Color,
    keywordVariable?:KeywordName,
} 

export type TargetType = ConditionSpecName | ConditionSpecification //assumed 0 or 1 target if name. only used in card constructors
export type PlayerTargetType = "FriendlyPlayer"|"OpponentPlayer"|"AnyPlayer"|'AllPlayers'

export type NumberVar = number | NumberVariableName | ConditionSpecName | NumberSpecification // only used in card constructors
export type NumberDef = number | NumberSpecification 

export type ColorDef = Color | ColorVariableName

export type ConditionExtraDataType = 'Number'|'Tribe'|'Color'

export interface Condition
{
    name:ConditionName,
    fn: (card:Card,source:Card,context:Controller,x:ResolutionContext) => boolean,
    numberOfTargets:NumberVar
    cls:'Condition',
}

export type EffectClass = 'DamageEffect'|'CreateEffect'|'TapEffect'|'AddManaEffect'|'MayEffect'|'ZoneChangeEffect'|'BucketEffect'
|'DrawCardEffect'|'ScryEffect'|'SurveilEffect'|'SacrificeEffect'|'DestroyEffect'|'ReturnEffect'|'MillEffect'|'DiscardEffect'|'ExileEffect'
|'ColorChoiceEffect'|'ButtonChoiceEffect'|'TargetEffect'|'AbilityEffect'|'TriggerEffect'

export interface EffectType //Line of text on instant, sorcery, activated or triggered ability
{
    effectCls:EffectClass,
    condition:ConditionSpecification,
    target:ConditionSpecification,
    thenEffects:EffectUnion[]
    cls:'EffectType',
}

export type EffectKind = 'Cost'|'Normal'
export type EffectStatus = 'Pending'|'In Progress'|'Subeffects'|'Complete'

export interface Effect //with targets
{
    type:EffectUnion,
    source:CardId,
    kind:EffectKind,
    status:EffectStatus,
    effectIndex:number,
    parentEffectIndex:number,

    context:ResolutionContext

    //storage?
    cls:'Effect'
}

export type AbilityClass = 'PowerAbility'|'ToughnessAbility'|'PowerToughnessAbility'|'TribeAbility'|'KeywordAbility'|'ProtectionFromAbility'|'WardAbility'|'ColorAbility'|'BasePowerToughnessAbility'|'PowerAbility'|'ToughnessAbility'|'PowerToughnessAbility'|'TriggeredAbility'|'ActivatedAbility'|'DelayedTriggeredAbility'

export type AbilitySuperClass = 'TriggeredAbility'|'StaticAbility'|'DelayedTriggeredAbility'|'ActivatedAbility'

export const KeywordNames = ['Flying','Menace','Deathtouch','Trample','Lifelink','Haste','Vigilance','Defender','FirstStrike','DoubleStrike','Hexproof','Flash','Indestructible'] as const
export type KeywordName = typeof KeywordNames[number]

export interface AbilityType //Line of text on permanent
{
    id:AbilityTypeId
    condition:ConditionSpecification,
    affects:ConditionSpecification,
    duration:DurationName,
    cls:'AbilityType'
    abilitySuperCls:AbilitySuperClass
    abilityCls:AbilityClass
}

export interface Ability //Actual
{
    type:AbilityTypeId
    source:CardId,
    name:AbilityClass,
    timestamp:Timestamp,
    context:ResolutionContext
    cls:'Ability'
}

export const CastPhaseNames = ['None','ChooseMode','ChooseX','ChooseTargets','DivideTargets','DetermineCost','DetermineCostChooseTargets','BeforePayCost','PayCost','PayCostDoEffects','BeforeResolve','ToResolve','ToResolveDoEffects','Resolved'] as const;
export type CastPhaseName = typeof CastPhaseNames[number];

export const CounterTypes = ['PlusOnePlusOne','MinusOneMinusOne','Poison'] as const;
export type CounterType = typeof CounterTypes[number];

export interface Card
{
    id:CardId,
    controller:PlayerId
    name:CardName,
    abilitySourceId?:CardId,
    abilitySourceSourceIds?:CardId[],
    abilitySourceAbilityId?:AbilityTypeId

    zone:ZoneName,
    previousZone:ZoneName
    tapped:boolean,
    counters:CounterType[],
    damageMarked:number,
    attacking?:CardId,
    blockOrder:CardId[],
    blocking:CardId[],
    abilityTypes:Ability[], //i.e. permanently on this from the card type and from other sources
    timestamp:Timestamp,
    summoningSickness:boolean

    castPhase:CastPhaseName,
    castSelectedOption?:Option[],
    castSelectedX:number,
    castSelectedCost?:Cost,
    effects:Effect[],

    //derived
    abilities:Ability[], //CALCULATED temp abilities, then sorted below (except activated/triggered)
    keywords:KeywordName[],
    canCast:CastSpecification[]
    power:number,
    toughness:number,
    tribes:TribeName[],
    colors:Color[]
    cmc:number,
    cost:Cost,

    cls:'Card'
}

export const Selectables = ['None','Allowed','Selected','Source','Other','Paired'] as const
export type Selectable = typeof Selectables[number];

export interface Player extends Card
{
    id:PlayerId,
    controller:PlayerId
    name:'Player'|'Opponent',

    zone:'Player'

    life:number,
    library:CardId[],
    manaPool:PoolManaElement[]
}
