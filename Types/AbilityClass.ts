import { AbilityType, Color, ConditionSpecification, Cost, EffectType, KeywordName, NumberDef, Option } from "./Types";
import { TribeName } from "./TribeNames";
import { TriggerName } from "./TriggerNames";

export interface TribeAbility extends AbilityType
{
    tribe:TribeName,

    abilitySuperCls:'StaticAbility',
    abilityCls:'TribeAbility',
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
    options:Option[],
    //605.1b A triggered ability is a mana ability if it meets all of the following criteria: it doesn’t require a target (see rule 115.6), it triggers from the activation or resolution of an activated mana ability (see rule 605.1a) or from mana being added to a player’s mana pool, and it could add mana to a player’s mana pool when it resolves.*/
    isManaAbility:boolean

    abilitySuperCls:'TriggeredAbility'
    abilityCls:'TriggeredAbility'
}

export interface DelayedTriggeredAbility extends AbilityType
{
    trigger:TriggerName,
    triggerSourceCondition:ConditionSpecification
    options:Option[]

    abilitySuperCls:'DelayedTriggeredAbility',
    abilityCls:'DelayedTriggeredAbility'
}

export type ActivationSpeed = 'Instant'|'Sorcery'

export interface ActivatedAbility extends AbilityType
{
    cost:Cost,
    options:Option[],
    speed:ActivationSpeed,
    /*
605.1a An activated ability is a mana ability if it meets all of the following criteria: it doesn’t require a target (see rule 115.6), it could add mana to a player’s mana pool when it resolves, and it’s not a loyalty ability. (See rule 606, “Loyalty Abilities.”)
*/
    isManaAbility:boolean,
    isLoyaltyAbility:boolean,
    couldAddMana:Color[]

    abilitySuperCls:'ActivatedAbility',
    abilityCls:'ActivatedAbility'
}

export type AbilityUnion = TribeAbility | ColorAbility | KeywordAbility | BasePowerToughnessAbility | PowerToughnessAbility | PowerAbility | ToughnessAbility | TriggeredAbility | ActivatedAbility | DelayedTriggeredAbility | ProtectionFromAbility | WardAbility