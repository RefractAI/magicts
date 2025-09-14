import { AbilityUnion } from "./AbilityTypes";
import { TokenName, EmblemName } from "../Cards/Common/CardNames";
import { LibrarySpecification } from "./GameActionTypes";
import { TriggerName } from "./TriggerNames";
import { ResolutionContext } from "./CardTypes";
import { Color, ColorDef } from "./ColorTypes";
import { ConditionSpecification } from "./ConditionTypes";
import { NumberDef } from "./ConditionTypes";
import { ZoneName } from "./ZoneNames";
import { CardId } from "./IdCounter";
import { CounterType } from "./CounterTypes";
import { Cost } from "./CostTypes";

export type EffectClass = 'DamageEffect'|'CreateEffect'|'TapEffect'|'AddManaEffect'|'MayEffect'|'ZoneChangeEffect'|'BucketEffect'
|'DrawCardEffect'|'ScryEffect'|'SurveilEffect'|'SacrificeEffect'|'DestroyEffect'|'ReturnEffect'|'MillEffect'|'DiscardEffect'|'ExileEffect'
|'ColorChoiceEffect'|'ButtonChoiceEffect'|'TargetEffect'|'AbilityEffect'|'TriggerEffect'|'ExploreEffect'|'SearchEffect'|'TransformEffect'|'LoseLifeEffect'|'GainLifeEffect'
|'AddCountersEffect'|'RemoveCountersEffect'|'PayEffect'|'CreateEmblemEffect'|'SelectXEffect'|'ShuffleIntoLibraryEffect'|'ShuffleEffect'|'RevealEffect'

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
    executionCount:number,
    effectIndex:number,
    parentEffectIndex:number,
    context:ResolutionContext,
    selectedThenEffects:EffectUnion[]
    cls:'Effect'
}

export interface DamageEffect extends EffectType
{
    amount:NumberDef,
    effectCls:'DamageEffect',
}

export interface CreateEffect extends EffectType
{
    token:TokenName,
    amount:NumberDef,
    effectCls:'CreateEffect',
    tappedAndAttacking:boolean,
    copyOf?:ConditionSpecification
}

export interface CreateEmblemEffect extends EffectType
{
    emblem:EmblemName,
    effectCls:'CreateEmblemEffect'
}

export interface TapEffect extends EffectType
{
    effectCls:'TapEffect'
}

export interface AddManaEffect extends EffectType
{
    color:ColorDef,
    amount:NumberDef,
    manaCondition:ConditionSpecification
    effectCls:'AddManaEffect'
}

export interface MayEffect extends EffectType
{
    effectCls:'MayEffect'
}

export interface ButtonChoiceEffect extends EffectType 
{
    choices:string[]
    effectGroups:EffectUnion[][],
    effectCls:'ButtonChoiceEffect'
}

export interface ColorChoiceEffect extends EffectType 
{
    choices:Color[]
    effectCls:'ColorChoiceEffect'
}

export interface TargetEffect extends EffectType //like choice of target, then the sub-effects can refer to it
{
    effectCls:'TargetEffect'
}


export interface BucketSpecification
{
    target:ConditionSpecification,
    amount?:NumberDef,
    effects:EffectUnion[],
    toZone?:ZoneName|"None",
    prompt?:string,
    librarySpecification?:LibrarySpecification,
    name?:string,
}

export interface DrawCardEffect extends EffectType
{
    amount:NumberDef,
    effectCls:'DrawCardEffect'
}

export interface ScryEffect extends BucketEffect
{
    amount:NumberDef,
    effectCls:'ScryEffect'
}

export interface SurveilEffect extends BucketEffect
{
    amount:NumberDef,
    effectCls:'SurveilEffect'
}

export interface DiscardEffect extends EffectType
{
    discardTarget:ConditionSpecification
    effectCls:'DiscardEffect'
}

export interface SearchEffect extends EffectType
{
    searchTarget:ConditionSpecification
    toZone?:ZoneName
    effectCls:'SearchEffect'
}

export interface SacrificeEffect extends EffectType
{
    sacrifices:ConditionSpecification
    effectCls:'SacrificeEffect'
}

export interface MillEffect extends EffectType
{
    amount:NumberDef,
    effectCls:'MillEffect'
}

export interface ExileEffect extends EffectType
{
    effectCls:'ExileEffect'
}

export interface DestroyEffect extends EffectType
{
    effectCls:'DestroyEffect'
}

export interface ReturnEffect extends EffectType
{
    amount:NumberDef,
    target:ConditionSpecification,
    effectCls:'ReturnEffect'
}

export interface ZoneChangeEffect extends EffectType
{
    toZone:ZoneName,
    librarySpecification?:LibrarySpecification,
    effectCls:'ZoneChangeEffect'
}

export interface BucketEffect extends EffectType
{
    buckets:BucketSpecification[]
    trigger?:TriggerName
    cardTarget:ConditionSpecification
    prompt:string
    requiresOrder?:boolean
    effectCls:'BucketEffect'|'ScryEffect'|'SurveilEffect'
}

export interface AbilityEffect extends EffectType
{
    abilities:AbilityUnion[]
    effectCls:'AbilityEffect'
}

export interface TriggerEffect extends EffectType
{
    trigger:TriggerName
    effectCls:'TriggerEffect'
}

export interface ExploreEffect extends EffectType
{
    effectCls:'ExploreEffect'
}

export interface TransformEffect extends EffectType
{
    effectCls:'TransformEffect'
}

export interface LoseLifeEffect extends EffectType
{
    amount:NumberDef,
    effectCls:'LoseLifeEffect'
}

export interface GainLifeEffect extends EffectType
{
    amount:NumberDef,
    effectCls:'GainLifeEffect'
}

export interface AddCountersEffect extends EffectType
{
    counterType:CounterType,
    amount:NumberDef,
    effectCls:'AddCountersEffect'
}

export interface RemoveCountersEffect extends EffectType
{
    counterType:CounterType,
    amount:NumberDef,
    effectCls:'RemoveCountersEffect'
}

export interface PayEffect extends EffectType
{
    cost:Cost,
    prompt:string,
    effectsIfNotPaid:EffectUnion[],
    effectCls:'PayEffect'
}

export interface SelectXEffect extends EffectType
{
    effectCls:'SelectXEffect'
}

export interface ShuffleIntoLibraryEffect extends EffectType
{
    effectCls:'ShuffleIntoLibraryEffect'
}

export interface ShuffleEffect extends EffectType
{
    effectCls:'ShuffleEffect'
}

export interface RevealEffect extends EffectType
{
    effectCls:'RevealEffect'
}


export type EffectUnion = DamageEffect | CreateEffect | TapEffect | AddManaEffect | MayEffect | ZoneChangeEffect | BucketEffect | AbilityEffect
| DrawCardEffect | ScryEffect | MillEffect | SurveilEffect | DestroyEffect | ExileEffect | ReturnEffect | SacrificeEffect 
| ColorChoiceEffect | ButtonChoiceEffect | TargetEffect | DiscardEffect | TriggerEffect | ExploreEffect | SearchEffect | TransformEffect | LoseLifeEffect | GainLifeEffect
| AddCountersEffect | RemoveCountersEffect | PayEffect | CreateEmblemEffect | SelectXEffect | ShuffleIntoLibraryEffect | ShuffleEffect | RevealEffect
