import { AbilityClass, AbilitySuperClass, AbilityType, AbilityUnion, ActivatedAbility, BasePowerToughnessAbility, BaseTribeAbility, CantBeCounteredAbility, CastingOptionAbility, CastingOptionType, ColorAbility, CostModificationAbility, EntersWithCountersAbility, HasAllAbilitiesOfAbility, KeywordAbility, PowerAbility, PowerToughnessAbility, ProtectionFromAbility, ReplacementEffectAbility, ToughnessAbility, TransformAbility, TribeAbility, TriggeredAbility } from "../Types/AbilityTypes";
import { ToCondition, ToNumberSpec } from "../Types/ToCondition";
import { newAbilityTypeId } from "../Types/IdCounter";
import { TribeName } from "../Types/TribeNames";
import { TriggerName } from "../Types/TriggerNames";
import { AbilityEffect, AddManaEffect, EffectUnion } from "../Types/EffectTypes";
import { DurationName } from "../Types/DurationNames";
import { CostVar, EmptyCost, ToCost } from "../Types/CostTypes";
import { Gains, TargetGains, RemoveCounters } from "./EffectClassHelpers";
import { ConditionSpecification, NumberVar, TargetType } from "../Types/ConditionTypes";
import { C, NoneCondition, SelfCondition} from "../Types/ConditionHelpers";
import { AbilityTypeRegistry } from "../Types/AbilityTypes";
import { KeywordName } from "../Types/KeywordTypes";
import { Color } from "../Types/ColorTypes";
import { ActualCardName } from "../Cards/Common/CardNames";
import { CounterType } from "../Types/CounterTypes";

export const MakeTribeAbility = (tribe:TribeName):TribeAbility => 
{
    const base = MakeAbility(NoneCondition, SelfCondition, 'None', 'StaticAbility', 'TribeAbility')
    const ability:TribeAbility = ({...base, tribe, abilitySuperCls:'StaticAbility', abilityCls:'TribeAbility', condition:NoneCondition, affects:SelfCondition, duration:'None', cls:'AbilityType' })
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}

export const MakeBaseTribeAbility = (tribe:TribeName):BaseTribeAbility => 
{
    const base = MakeAbility(NoneCondition, SelfCondition, 'None', 'StaticAbility', 'BaseTribeAbility')
    const ability:BaseTribeAbility = ({...base, tribe, abilitySuperCls:'StaticAbility', abilityCls:'BaseTribeAbility', condition:NoneCondition, affects:SelfCondition, duration:'None', cls:'AbilityType' })
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}

export const MakeKeywordAbility = (keyword:KeywordName,affects:TargetType,duration:DurationName="Permanent"):KeywordAbility => 
{
    const base = MakeAbility(NoneCondition, SelfCondition, 'None', 'StaticAbility', 'KeywordAbility')
    const ability:KeywordAbility = ({...base, keyword, abilitySuperCls:'StaticAbility', abilityCls:'KeywordAbility', condition:NoneCondition, affects:ToCondition(affects), duration, cls:'AbilityType' })
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}

export const MakeConditionalKeywordAbility = (keyword:KeywordName, condition:TargetType, affects:TargetType, duration:DurationName="Permanent"):KeywordAbility => 
{
    const base = MakeAbility(ToCondition(condition), ToCondition(affects), duration, 'StaticAbility', 'KeywordAbility')
    const ability:KeywordAbility = ({...base, keyword, abilitySuperCls:'StaticAbility', abilityCls:'KeywordAbility', condition:ToCondition(condition), affects:ToCondition(affects), duration, cls:'AbilityType' })
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

export const TargetGainsType = (target:TargetType, tribe:TribeName):AbilityEffect => TargetGains(target, MakeTribeAbility(tribe))

export const MakeColorAbility = (color:Color,affects:TargetType):ColorAbility => 
{
    const base = MakeAbility(NoneCondition, SelfCondition, 'None', 'StaticAbility', 'ColorAbility')
    const ability:ColorAbility = ({...base, color, abilitySuperCls:'StaticAbility', abilityCls:'ColorAbility', condition:NoneCondition, affects:ToCondition(affects), duration:'None', cls:'AbilityType' })
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}

export const MakeHasAllAbilitiesOfAbility = (target:TargetType, affects:TargetType):HasAllAbilitiesOfAbility => 
{
    const base = MakeAbility(NoneCondition, SelfCondition, 'None', 'StaticAbility', 'HasAllAbilitiesOfAbility')
    const ability:HasAllAbilitiesOfAbility = ({...base, target:ToCondition(target), abilitySuperCls:'StaticAbility', abilityCls:'HasAllAbilitiesOfAbility', condition:NoneCondition, affects:ToCondition(affects), duration:'None', cls:'AbilityType' })
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

export const MakeConditionalPowerToughnessAbility = (power:NumberVar,toughness:NumberVar,condition:TargetType,duration:DurationName="Permanent",affects:TargetType=SelfCondition):PowerToughnessAbility => 
{
    const base = MakeAbility(ToCondition(condition), ToCondition(affects), duration, 'StaticAbility', 'PowerToughnessAbility')
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

export const MakeCantBeCounteredAbility = (affects:TargetType=SelfCondition,duration:DurationName="Permanent"):CantBeCounteredAbility => 
{
    const base = MakeAbility(NoneCondition, ToCondition(affects), duration, 'StaticAbility', 'CantBeCounteredAbility')
    const ability:CantBeCounteredAbility = ({...base, abilitySuperCls:'StaticAbility', abilityCls:'CantBeCounteredAbility', condition:NoneCondition, cls:'AbilityType' })
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}

export const MakeTriggeredAbility = (trigger:TriggerName,triggerSourceCondition:TargetType,...effects:EffectUnion[]):TriggeredAbility => MakeConditionalTriggeredAbility(trigger,triggerSourceCondition,NoneCondition,SelfCondition,...effects)


export const MakeConditionalTriggeredAbility = (trigger:TriggerName,triggerSourceCondition:TargetType,condition:TargetType,affects:TargetType,...effects:EffectUnion[]):TriggeredAbility => 
{
    const base = MakeAbility(ToCondition(condition), ToCondition(affects), 'None', 'TriggeredAbility', 'TriggeredAbility')
    const ability:TriggeredAbility = {...base,abilities:[],effects,trigger,triggerSourceCondition:ToCondition(triggerSourceCondition),cost:EmptyCost,abilitySuperCls:'TriggeredAbility',abilityCls:'TriggeredAbility',isManaAbility:IsManaAbility(trigger,false,effects)}
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}

export const MakeActivatedAbility = (cost:CostVar,...effects:EffectUnion[]):ActivatedAbility => MakeConditionalActivatedAbility(cost,NoneCondition,SelfCondition,...effects)

export const MakeSorceryActivatedAbility = (cost:CostVar,...effects:EffectUnion[]):ActivatedAbility => 
{
    const ability = MakeConditionalActivatedAbility(cost,NoneCondition,SelfCondition,...effects)
    ability.speed = 'Sorcery'
    return ability
}

export const MakeConditionalActivatedAbility = (cost:CostVar,condition:TargetType,affects:TargetType,...effects:EffectUnion[]):ActivatedAbility => 
{
    const base = MakeAbility(ToCondition(condition), ToCondition(affects), 'None', 'ActivatedAbility', 'ActivatedAbility')
    const newCost = ToCost(cost)
    const isLoyaltyAbility = false //CostEffects(newCost).filter(e => e.effectCls === 'RemoveCountersAbility')
    const isManaAbility = IsManaAbility(null,isLoyaltyAbility,effects)
    const couldAddMana = isManaAbility ? CouldAddMana(effects) : []
    const ability:ActivatedAbility = {...base,abilities:[],effects,cost:newCost,abilitySuperCls:'ActivatedAbility',abilityCls:'ActivatedAbility',speed:'Instant',isLoyaltyAbility,isManaAbility,couldAddMana}
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}

export const MakeAbility = (condition:ConditionSpecification,affects:ConditionSpecification,duration:DurationName,abilitySuperCls:AbilitySuperClass,abilityCls:AbilityClass):AbilityType =>
{
    const ability:AbilityType = ({condition,affects,duration,cls:'AbilityType',abilitySuperCls,abilityCls,id:newAbilityTypeId()})
    return ability;
}



function hasAddManaEffectRecursive(effects: EffectUnion[]): boolean {
    return effects.some(e => 
        e.effectCls === 'AddManaEffect' || 
        (e.thenEffects && e.thenEffects.length > 0 && hasAddManaEffectRecursive(e.thenEffects))
    );
}

function hasTargetingEffectRecursive(effects: EffectUnion[]): boolean {
    return effects.some(e => 
        e.target.doesTarget || 
        (e.thenEffects && e.thenEffects.length > 0 && hasTargetingEffectRecursive(e.thenEffects))
    );
}

function IsManaAbility(trigger:TriggerName|null,isLoyaltyAbility:boolean,effects: EffectUnion[]) 
{
    return (
        (trigger === null || ["OnAddMana"].includes(trigger))
        && !hasTargetingEffectRecursive(effects)
        && hasAddManaEffectRecursive(effects)
        && !isLoyaltyAbility
    )
}

function CouldAddMana(effects: EffectUnion[]) : Color[]
{
    const colors:Color[] = []
    
    // Helper function to recursively find AddManaEffect
    const findAddManaEffects = (effs: EffectUnion[]): AddManaEffect[] => {
        const result: AddManaEffect[] = [];
        effs.forEach(e => {
            if (e.effectCls === 'AddManaEffect') {
                result.push(e as AddManaEffect);
            }
            if (e.thenEffects && e.thenEffects.length > 0) {
                result.push(...findAddManaEffects(e.thenEffects));
            }
        });
        return result;
    };
    
    findAddManaEffects(effects)
    .filter(e => e.condition.cls === 'NoneCondition' 
    && e.target.conditions.length === 1 
    && e.target.conditions[0] === 'FriendlyPlayer'
    && typeof e.amount === 'number'
    && e.manaCondition.cls === 'NoneCondition'
    )
    .forEach(e => {
        for(var i=0;i<(e.amount as number);i++)
        {
            if (typeof e.color === 'string' && e.color !== 'ChosenColor') {
                colors.push(e.color as Color);
            } else if (e.color === 'ChosenColor') {
                // For ChosenColor, add all possible colors
                colors.push('White', 'Blue', 'Black', 'Red', 'Green');
            }
        }
    })
    return colors
}

export const XsYouControlHaveY = (x:TribeName,y:KeywordName) => MakeKeywordAbility(y,C.All("Friendly",C.OfTribe(x)),"None")

export const MakeTransformAbility = (transformsInto:ActualCardName):TransformAbility => 
{
    const base = MakeAbility(NoneCondition, SelfCondition, 'None', 'StaticAbility', 'TransformAbility')
    const ability:TransformAbility = ({...base, transformsInto, abilitySuperCls:'StaticAbility', abilityCls:'TransformAbility', condition:NoneCondition, affects:SelfCondition, duration:'None', cls:'AbilityType' })
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}

export const MakeEntersWithCountersAbility = (counterType:CounterType, amount:NumberVar):EntersWithCountersAbility => 
{
    const base = MakeAbility(NoneCondition, SelfCondition, 'None', 'StaticAbility', 'EntersWithCountersAbility')
    const ability:EntersWithCountersAbility = ({...base, counterType, amount:ToNumberSpec(amount), abilitySuperCls:'StaticAbility', abilityCls:'EntersWithCountersAbility', condition:NoneCondition, affects:SelfCondition, duration:'None', cls:'AbilityType' })
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}

export const MakeCastingOptionAbility = (optionType:CastingOptionType, cost?:CostVar, abilities?:AbilityUnion[], effects?:EffectUnion[], cardName?:ActualCardName):CastingOptionAbility => 
{
    const base = MakeAbility(NoneCondition, SelfCondition, 'None', 'StaticAbility', 'CastingOptionAbility')
    const ability:CastingOptionAbility = ({
        ...base, 
        optionType, 
        cost: cost ? ToCost(cost) : undefined, 
        abilities, 
        effects, 
        cardName, 
        abilitySuperCls:'StaticAbility', 
        abilityCls:'CastingOptionAbility', 
        condition:NoneCondition, 
        affects:SelfCondition, 
        duration:'None', 
        cls:'AbilityType' 
    })
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}

export const MakeConditionalCastingOptionAbility = (optionType:CastingOptionType, condition:TargetType, cost?:CostVar, abilities?:AbilityUnion[], effects?:EffectUnion[], cardName?:ActualCardName):CastingOptionAbility => 
{
    const base = MakeAbility(ToCondition(condition), SelfCondition, 'None', 'StaticAbility', 'CastingOptionAbility')
    const ability:CastingOptionAbility = ({
        ...base, 
        optionType, 
        cost: cost ? ToCost(cost) : undefined, 
        abilities, 
        effects, 
        cardName, 
        abilitySuperCls:'StaticAbility', 
        abilityCls:'CastingOptionAbility', 
        condition:ToCondition(condition), 
        affects:SelfCondition, 
        duration:'None', 
        cls:'AbilityType' 
    })
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}

export const Escape = (cost:CostVar):CastingOptionAbility => 
    MakeConditionalCastingOptionAbility('AlternateCost', "Graveyard", cost)

export const ChooseOneCastingOption = (cost:CostVar, abilities:AbilityUnion[], effects:EffectUnion[]):CastingOptionAbility => 
    MakeCastingOptionAbility('ChooseOne', cost, abilities, effects)

export const TransformCastingOption = (cardName:ActualCardName):CastingOptionAbility => 
    MakeCastingOptionAbility('Transform', undefined, undefined, undefined, cardName)

export const SplitCastingOption = (cardName:ActualCardName):CastingOptionAbility => 
    MakeCastingOptionAbility('Split', undefined, undefined, undefined, cardName)

export const AlternateCostCastingOption = (cost:CostVar):CastingOptionAbility => 
    MakeCastingOptionAbility('AlternateCost', cost)

export const MakeCostModificationAbility = (costIncrease:CostVar, affectedSpells:TargetType):CostModificationAbility => 
{
    const base = MakeAbility(NoneCondition, ToCondition(affectedSpells), 'None', 'StaticAbility', 'CostModificationAbility')
    const ability:CostModificationAbility = ({...base, costIncrease:ToCost(costIncrease), affectedSpells:ToCondition(affectedSpells), abilitySuperCls:'StaticAbility', abilityCls:'CostModificationAbility', condition:NoneCondition, affects:ToCondition(affectedSpells), duration:'None', cls:'AbilityType' })
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}

export const MakeReplacementEffectAbility = (trigger:TriggerName, triggerSourceCondition:TargetType, ...effects:EffectUnion[]):ReplacementEffectAbility => 
{
    const base = MakeAbility(NoneCondition, SelfCondition, 'None', 'ReplacementEffectAbility', 'ReplacementEffectAbility')
    const ability:ReplacementEffectAbility = ({...base, trigger, triggerSourceCondition:ToCondition(triggerSourceCondition), effects, abilitySuperCls:'ReplacementEffectAbility', abilityCls:'ReplacementEffectAbility', condition:NoneCondition, affects:SelfCondition, duration:'None', cls:'AbilityType' })
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}

// Stun Counter Replacement Effect: "If a permanent with a stun counter on it would become untapped, instead remove a stun counter from it."
export const MakeStunCounterReplacementEffect = ():ReplacementEffectAbility => 
{
    const base = MakeAbility(NoneCondition, SelfCondition, 'None', 'ReplacementEffectAbility', 'ReplacementEffectAbility')
    const ability:ReplacementEffectAbility = ({...base, trigger: "Untap", triggerSourceCondition:SelfCondition, effects: [RemoveCounters("Stun", 1, "Self")], abilitySuperCls:'ReplacementEffectAbility', abilityCls:'ReplacementEffectAbility', condition:NoneCondition, affects:SelfCondition, duration:'None', cls:'AbilityType' })
    AbilityTypeRegistry[ability.id] = ability
    return ability;
}