import { AbilityUnion, ActivatedAbility, BasePowerToughnessAbility, ColorAbility, KeywordAbility, PowerAbility, PowerToughnessAbility, ProtectionFromAbility, ToughnessAbility, TribeAbility, TriggeredAbility } from "./AbilityClass";
import { ConditionSpecification, NoneCondition, NumberVar, SelfCondition, Option, AbilityType, AbilityClass, AbilitySuperClass, CostVar, Ability, Color, KeywordName, TargetType, ResolutionContext } from "./Types";
import { ToCondition, ToNumberSpec } from "./ToCondition";
import { AbilityTypeId, CardId, Timestamp, newAbilityTypeId } from "./IdCounter";
import { TribeName } from "./TribeNames";
import { TriggerName } from "./TriggerNames";
import { AbilityEffect, AddManaEffect, EffectUnion } from "./EffectClass";
import { DurationName } from "./DurationNames";
import { EmptyCost, ToCost } from "./CostHelpers";
import { IsOfType } from "./ConditionTypes";
import { Gains, TargetGains } from "./EffectClassHelpers";

export const MakeTribeAbility = (tribe:TribeName):TribeAbility => 
{
    const base = MakeAbility(NoneCondition, SelfCondition, 'None', 'StaticAbility', 'TribeAbility')
    const ability:TribeAbility = ({...base, tribe, abilitySuperCls:'StaticAbility', abilityCls:'TribeAbility', condition:NoneCondition, affects:SelfCondition, duration:'None', cls:'AbilityType' })
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}

export const MakeKeywordAbility = (keyword:KeywordName,affects:TargetType,duration:DurationName):KeywordAbility => 
{
    const base = MakeAbility(NoneCondition, SelfCondition, 'None', 'StaticAbility', 'KeywordAbility')
    const ability:KeywordAbility = ({...base, keyword, abilitySuperCls:'StaticAbility', abilityCls:'KeywordAbility', condition:NoneCondition, affects:ToCondition(affects), duration, cls:'AbilityType' })
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}

export const FirstStrikeUntilEndOfTurn = (affects:TargetType=SelfCondition) => MakeKeywordAbility("FirstStrike",affects,"UntilEndOfTurn")
export const FlyingUntilEndOfTurn = (affects:TargetType=SelfCondition) => MakeKeywordAbility("Flying",affects,"UntilEndOfTurn")
export const HasteUntilEndOfTurn = (affects:TargetType=SelfCondition) => MakeKeywordAbility("Haste",affects,"UntilEndOfTurn")
export const VigilanceUntilEndOfTurn = (affects:TargetType=SelfCondition) => MakeKeywordAbility("Vigilance",affects,"UntilEndOfTurn")
export const IndestructibleUntilEndOfTurn = (affects:TargetType=SelfCondition) => MakeKeywordAbility("Indestructible",affects,"UntilEndOfTurn")

export const GainsPowerUntilEndOfTurn = (power:NumberVar,affects:TargetType=SelfCondition):AbilityEffect => Gains(MakePowerAbility(power,affects,"UntilEndOfTurn"))
export const TargetGainsPowerUntilEndOfTurn = (target:TargetType,power:NumberVar,affects:TargetType=SelfCondition):AbilityEffect => TargetGains(target,MakePowerAbility(power,affects,"UntilEndOfTurn"))

export const MakeColorAbility = (color:Color,affects:TargetType):ColorAbility => 
{
    const base = MakeAbility(NoneCondition, SelfCondition, 'None', 'StaticAbility', 'ColorAbility')
    const ability:ColorAbility = ({...base, color, abilitySuperCls:'StaticAbility', abilityCls:'ColorAbility', condition:NoneCondition, affects:ToCondition(affects), duration:'None', cls:'AbilityType' })
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}

export const MakeBasePowerToughnessAbility = (power:NumberVar,toughness:NumberVar):BasePowerToughnessAbility => 
{
    const base = MakeAbility(NoneCondition, SelfCondition, 'None', 'StaticAbility', 'BasePowerToughnessAbility')
    const ability:BasePowerToughnessAbility = {...base, power:ToNumberSpec(power),toughness:ToNumberSpec(toughness),abilitySuperCls:'StaticAbility', abilityCls:'BasePowerToughnessAbility'}
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}

export const MakePowerToughnessAbility = (power:NumberVar,toughness:NumberVar,duration:DurationName="UntilEndOfTurn",affects:TargetType=SelfCondition):PowerToughnessAbility => 
{
    const base = MakeAbility(NoneCondition, ToCondition(affects), duration, 'StaticAbility', 'PowerToughnessAbility')
    const ability:PowerToughnessAbility = {...base, power:ToNumberSpec(power),toughness:ToNumberSpec(toughness),abilitySuperCls:'StaticAbility', abilityCls:'PowerToughnessAbility'}
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}

export const MakePowerAbility = (power:NumberVar,affects:TargetType=SelfCondition,duration:DurationName="UntilEndOfTurn"):PowerAbility => 
{
    const base = MakeAbility(NoneCondition, ToCondition(affects), duration, 'StaticAbility', 'PowerAbility')
    const ability:PowerAbility = {...base, power:ToNumberSpec(power),abilitySuperCls:'StaticAbility', abilityCls:'PowerAbility'}
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}


export const MakeToughnessAbility = (toughness:NumberVar,affects:TargetType=SelfCondition,duration:DurationName="UntilEndOfTurn"):ToughnessAbility => 
{
    const base = MakeAbility(NoneCondition, ToCondition(affects), duration, 'StaticAbility', 'ToughnessAbility')
    const ability:ToughnessAbility = {...base,toughness:ToNumberSpec(toughness),abilitySuperCls:'StaticAbility', abilityCls:'ToughnessAbility'}
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}

export const MakeProtectionFromAbility = (from:ConditionSpecification,affects:TargetType=SelfCondition,duration:DurationName="UntilEndOfTurn"):ProtectionFromAbility => 
{
    const base = MakeAbility(NoneCondition, ToCondition(affects), duration, 'StaticAbility', 'ProtectionFromAbility')
    const ability:ProtectionFromAbility = ({...base, from, abilitySuperCls:'StaticAbility', abilityCls:'ProtectionFromAbility', condition:NoneCondition, cls:'AbilityType' })
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}

export const MakeTriggeredAbility = (trigger:TriggerName,triggerSourceCondition:TargetType,...effects:EffectUnion[]):TriggeredAbility => MakeConditionalTriggeredAbility(trigger,triggerSourceCondition,NoneCondition,SelfCondition,...effects)


export const MakeConditionalTriggeredAbility = (trigger:TriggerName,triggerSourceCondition:TargetType,condition:TargetType,affects:ConditionSpecification,...effects:EffectUnion[]):TriggeredAbility => 
{
    const base = MakeAbility(ToCondition(condition), ToCondition(affects), 'None', 'TriggeredAbility', 'TriggeredAbility')
    const options:Option[] = [({optionType:'Base',abilities:[],effects,cost:EmptyCost,cls:'Option'})]
    const ability:TriggeredAbility = {...base,options,trigger,triggerSourceCondition:ToCondition(triggerSourceCondition),cost:EmptyCost,abilitySuperCls:'TriggeredAbility',abilityCls:'TriggeredAbility',isManaAbility:IsManaAbility(trigger,false,effects)}
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}

export const MakeActivatedAbility = (cost:CostVar,...effects:EffectUnion[]):ActivatedAbility => MakeConditionalActivatedAbility(cost,NoneCondition,SelfCondition,...effects)

export const MakeConditionalActivatedAbility = (cost:CostVar,condition:TargetType,affects:TargetType,...effects:EffectUnion[]):ActivatedAbility => 
{
    const base = MakeAbility(ToCondition(condition), ToCondition(affects), 'None', 'ActivatedAbility', 'ActivatedAbility')
    const options:Option[] = [({optionType:'Base',abilities:[],effects,cost:ToCost(cost),cls:'Option'})]
    const newCost = ToCost(cost)
    const isLoyaltyAbility = false //CostEffects(newCost).filter(e => e.effectCls === 'RemoveCountersAbility')
    const isManaAbility = IsManaAbility(null,isLoyaltyAbility,effects)
    const couldAddMana = isManaAbility ? CouldAddMana(effects) : []
    const ability:ActivatedAbility = {...base,options,cost:newCost,abilitySuperCls:'ActivatedAbility',abilityCls:'ActivatedAbility',speed:'Instant',isLoyaltyAbility,isManaAbility,couldAddMana}
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}


export const AbilityTypeRegistry:Record<AbilityTypeId,AbilityUnion> = {};
(window as any).AbilityTypeRegistry = AbilityTypeRegistry 


export const GetAbilityType = (abilityTypeId:AbilityTypeId):AbilityUnion =>
{
    const a = AbilityTypeRegistry[abilityTypeId]
    if(!a)
    {
        throw 'does not exist - '+abilityTypeId
    }
    return a
}

export const MakeAbility = (condition:ConditionSpecification,affects:ConditionSpecification,duration:DurationName,abilitySuperCls:AbilitySuperClass,abilityCls:AbilityClass):AbilityType =>
{
    const ability:AbilityType = ({condition,affects,duration,cls:'AbilityType',abilitySuperCls,abilityCls,id:newAbilityTypeId()})
    return ability;
}

export const ToAbility = (at:AbilityUnion,source:CardId,timestamp:Timestamp,context:ResolutionContext):Ability =>
{
    return ({cls:'Ability',type:at.id,source,name:at.abilityCls,timestamp,context})
}

function IsManaAbility(trigger:TriggerName|null,isLoyaltyAbility:boolean,effects: EffectUnion[]) 
{
    return (
        (trigger === null || ["OnAddMana"].includes(trigger))
        && !effects.some(e => e.target.doesTarget)
        && effects.some(e => e.effectCls === 'AddManaEffect')
        && !isLoyaltyAbility
    )
}

function CouldAddMana(effects: EffectUnion[]) : Color[]
{
    const colors:Color[] = []
    effects.filter(e => e.effectCls === 'AddManaEffect' 
    && e.condition.cls === 'NoneCondition' 
    && e.target.conditions.length === 2 
    && e.target.conditions[0] === 'Friendly'
    && e.target.conditions[1] === 'Player'
    && typeof e.color === 'string'
    && typeof e.amount === 'number'
    && e.manaCondition.cls === 'NoneCondition'
    )
    .forEach(e => {
        const me = (e as AddManaEffect)
        for(var i=0;i<(me.amount as number);i++)
        {
            colors.push(me.color)
        }
    })
    return colors
}

export const XsYouControlHaveY = (x:TribeName,y:KeywordName) => MakeKeywordAbility(y,IsOfType("AllFriendlyOfType",x),"None")