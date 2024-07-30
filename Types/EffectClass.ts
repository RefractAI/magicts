import { AbilityUnion } from "./AbilityClass";
import { TokenName } from "./CardNames";
import { LibrarySpecification } from "./GameActionTypes";
import { TriggerName } from "./TriggerNames";
import { AbilityType, Color, ConditionSpecification, EffectType, NumberDef } from "./Types";
import { ZoneName } from "./ZoneNames";

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
    tappedAndAttacking:boolean
}

export interface TapEffect extends EffectType
{
    effectCls:'TapEffect'
}

export interface AddManaEffect extends EffectType
{
    color:Color,
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
    effects:EffectUnion[],
    choices:string[]
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
    amount:NumberDef|'Rest',
    effects:EffectUnion[],
    toZone:ZoneName,
}

export interface DrawCardEffect extends EffectType
{
    amount:NumberDef,
    effectCls:'DrawCardEffect'
}

export interface ScryEffect extends EffectType
{
    amount:NumberDef,
    effectCls:'ScryEffect'
}

export interface SurveilEffect extends EffectType
{
    amount:NumberDef,
    effectCls:'SurveilEffect'
}

export interface DiscardEffect extends EffectType
{
    discardTarget:ConditionSpecification
    effectCls:'DiscardEffect'
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
    effectCls:'BucketEffect'
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

export type EffectUnion = DamageEffect | CreateEffect | TapEffect | AddManaEffect | MayEffect | ZoneChangeEffect | BucketEffect | AbilityEffect
| DrawCardEffect | ScryEffect | MillEffect | SurveilEffect | DestroyEffect | ExileEffect | ReturnEffect | SacrificeEffect 
| ColorChoiceEffect | ButtonChoiceEffect | TargetEffect | DiscardEffect | TriggerEffect
