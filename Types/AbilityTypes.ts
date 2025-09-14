import { ResolutionContext } from "./CardTypes";
import { TribeName } from "./TribeNames";
import { TriggerName } from "./TriggerNames";
import { AbilityTypeId, CardId, Timestamp } from "./IdCounter";
import { EffectUnion } from "./EffectTypes";
import { DurationName } from "./DurationNames";
import { ConditionSpecification, NumberDef } from "./ConditionTypes";
import { KeywordName } from "./KeywordTypes";
import { Color } from "./ColorTypes";
import { Cost } from "./CostTypes";
import { ActualCardName } from "../Cards/Common/CardNames";
import { CounterType } from "./CounterTypes";

export type AbilityClass = 'PowerAbility'|'ToughnessAbility'|'PowerToughnessAbility'|'TribeAbility'|'BaseTribeAbility'|'KeywordAbility'|'ProtectionFromAbility'|'WardAbility'|'CantBeCounteredAbility'|'ColorAbility'|'BasePowerToughnessAbility'|'TriggeredAbility'|'ActivatedAbility'|'DelayedTriggeredAbility'|'TransformAbility'|'EntersWithCountersAbility'|'CastingOptionAbility'|'CostModificationAbility'|'ReplacementEffectAbility'|'HasAllAbilitiesOfAbility'

export type AbilitySuperClass = 'TriggeredAbility'|'StaticAbility'|'DelayedTriggeredAbility'|'ActivatedAbility'|'ReplacementEffectAbility'

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

export interface TribeAbility extends AbilityType
{
    tribe:TribeName,

    abilitySuperCls:'StaticAbility',
    abilityCls:'TribeAbility',
    cls:'AbilityType'
}

export interface BaseTribeAbility extends AbilityType
{
    tribe:TribeName,

    abilitySuperCls:'StaticAbility',
    abilityCls:'BaseTribeAbility',
    cls:'AbilityType'
}

export interface KeywordAbility extends AbilityType
{
    keyword:KeywordName,

    abilitySuperCls:'StaticAbility',
    abilityCls:'KeywordAbility'
}

export interface ProtectionFromAbility extends AbilityType
{
    from:ConditionSpecification

    abilitySuperCls:'StaticAbility',
    abilityCls:'ProtectionFromAbility'
}

export interface WardAbility extends AbilityType
{
    cost:Cost

    abilitySuperCls:'StaticAbility',
    abilityCls:'WardAbility'
}

export interface CantBeCounteredAbility extends AbilityType
{
    abilitySuperCls:'StaticAbility',
    abilityCls:'CantBeCounteredAbility'
}

export interface ColorAbility extends AbilityType
{
    color:Color,

    abilitySuperCls:'StaticAbility',
    abilityCls:'ColorAbility'
}

export interface BasePowerToughnessAbility extends AbilityType
{
    power:NumberDef,
    toughness:NumberDef,

    abilitySuperCls:'StaticAbility',
    abilityCls:'BasePowerToughnessAbility',
}

export interface PowerToughnessAbility extends AbilityType
{
    power:NumberDef,
    toughness:NumberDef,

    abilitySuperCls:'StaticAbility',
    abilityCls:'PowerToughnessAbility',
}

export interface PowerAbility extends AbilityType
{
    power:NumberDef,

    abilitySuperCls:'StaticAbility',
    abilityCls:'PowerAbility',
}

export interface ToughnessAbility extends AbilityType
{
    toughness:NumberDef,

    abilitySuperCls:'StaticAbility',
    abilityCls:'ToughnessAbility',
}

export interface TriggeredAbility extends AbilityType
{
    trigger:TriggerName,
    triggerSourceCondition:ConditionSpecification
    cost:Cost,
    abilities:AbilityUnion[],
    effects:EffectUnion[],
    //605.1b A triggered ability is a mana ability if it meets all of the following criteria: it doesn’t require a target (see rule 115.6), it triggers from the activation or resolution of an activated mana ability (see rule 605.1a) or from mana being added to a player’s mana pool, and it could add mana to a player’s mana pool when it resolves.*/
    isManaAbility:boolean

    abilitySuperCls:'TriggeredAbility'
    abilityCls:'TriggeredAbility'
}

export interface DelayedTriggeredAbility extends AbilityType
{
    trigger:TriggerName,
    triggerSourceCondition:ConditionSpecification,
    cost:Cost,
    abilities:AbilityUnion[],
    effects:EffectUnion[],

    abilitySuperCls:'DelayedTriggeredAbility',
    abilityCls:'DelayedTriggeredAbility'
}

export type ActivationSpeed = 'Instant'|'Sorcery'

export interface ActivatedAbility extends AbilityType
{
    cost:Cost,
    abilities:AbilityUnion[],
    effects:EffectUnion[],
    speed:ActivationSpeed,
    /*
605.1a An activated ability is a mana ability if it meets all of the following criteria: it doesn't require a target (see rule 115.6), it could add mana to a player's mana pool when it resolves, and it's not a loyalty ability. (See rule 606, "Loyalty Abilities.")
*/
    isManaAbility:boolean,
    isLoyaltyAbility:boolean,
    couldAddMana:Color[]

    abilitySuperCls:'ActivatedAbility',
    abilityCls:'ActivatedAbility'
}

export interface TransformAbility extends AbilityType
{
    transformsInto:ActualCardName,

    abilitySuperCls:'StaticAbility',
    abilityCls:'TransformAbility'
}

export interface EntersWithCountersAbility extends AbilityType
{
    counterType:CounterType,
    amount:NumberDef,

    abilitySuperCls:'StaticAbility',
    abilityCls:'EntersWithCountersAbility'
}

export type CastingOptionType = 'ChooseOne'|'Transform'|'Split'|'AlternateCost'

export interface CastingOptionAbility extends AbilityType
{
    optionType:CastingOptionType,
    cost?:Cost,
    abilities?:AbilityUnion[],
    effects?:EffectUnion[],
    cardName?:ActualCardName,

    abilitySuperCls:'StaticAbility',
    abilityCls:'CastingOptionAbility'
}

export interface CostModificationAbility extends AbilityType
{
    costIncrease:Cost,
    affectedSpells:ConditionSpecification,

    abilitySuperCls:'StaticAbility',
    abilityCls:'CostModificationAbility'
}

export interface ReplacementEffectAbility extends AbilityType
{
    trigger:TriggerName,
    triggerSourceCondition:ConditionSpecification,
    effects:EffectUnion[],

    abilitySuperCls:'ReplacementEffectAbility',
    abilityCls:'ReplacementEffectAbility'
}

export interface HasAllAbilitiesOfAbility extends AbilityType
{
    target:ConditionSpecification,

    abilitySuperCls:'StaticAbility',
    abilityCls:'HasAllAbilitiesOfAbility'
}

export type AbilityUnion = TribeAbility | BaseTribeAbility | ColorAbility | KeywordAbility | BasePowerToughnessAbility | PowerToughnessAbility | PowerAbility | ToughnessAbility | TriggeredAbility | ActivatedAbility | DelayedTriggeredAbility | ProtectionFromAbility | WardAbility | CantBeCounteredAbility | TransformAbility | EntersWithCountersAbility | CastingOptionAbility | CostModificationAbility | ReplacementEffectAbility | HasAllAbilitiesOfAbility

export const AbilityTypeRegistry:Record<AbilityTypeId,AbilityUnion> = {};
if (typeof window !== 'undefined') {
    (window as any).AbilityTypeRegistry = AbilityTypeRegistry;
} 


export const GetAbilityType = (abilityTypeId:AbilityTypeId):AbilityUnion =>
{
    const a = AbilityTypeRegistry[abilityTypeId]
    if(!a)
    {
        throw 'does not exist - '+abilityTypeId
    }
    return a
}

export const ToAbility = (at:AbilityUnion,source:CardId,timestamp:Timestamp,context:ResolutionContext):Ability =>
{
    return ({cls:'Ability',type:at.id,source,name:at.abilityCls,timestamp,context})
}