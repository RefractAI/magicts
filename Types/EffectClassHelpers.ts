import { TargetType, NumberVar, PlayerTargetType, Color, ConditionSpecification, NoneCondition, SelfCondition } from "./Types";
import { ToCondition, ToNumberSpec } from "./ToCondition";
import { AbilityEffect, AddManaEffect, BucketEffect, BucketSpecification, ColorChoiceEffect, CreateEffect, DamageEffect, DestroyEffect, DiscardEffect, DrawCardEffect, EffectUnion, ExileEffect, MayEffect, SacrificeEffect, ScryEffect, SurveilEffect, TapEffect, ZoneChangeEffect, TriggerEffect } from "./EffectClass";
import { TokenName } from "./CardNames";
import { ZoneName } from "./ZoneNames";
import { LibrarySpecification } from "./GameActionTypes";
import { AbilityUnion } from "./AbilityClass";
import { TriggerName } from "./TriggerNames";
import { MakeAbility, MakeTriggeredAbility } from "./AbilityClassHelpers";

export const Damage = (amount:NumberVar,target:TargetType,condition:TargetType="None"):DamageEffect => 
({amount: ToNumberSpec(amount), effectCls:'DamageEffect', target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType',thenEffects:[] })

export const Create = (token:TokenName,amount:NumberVar=1,target:PlayerTargetType = "FriendlyPlayer",condition:TargetType="None"):CreateEffect =>
({token, amount: ToNumberSpec(amount), effectCls:'CreateEffect', target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType', tappedAndAttacking:false,thenEffects:[] })

export const CreateTappedAndAttacking = (token:TokenName,amount:NumberVar=1,target:PlayerTargetType = "FriendlyPlayer",condition:TargetType="None"):CreateEffect => 
({token, amount: ToNumberSpec(amount), effectCls:'CreateEffect', target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType', tappedAndAttacking:true,thenEffects:[] })

export const Tap = (target:TargetType = "AbilitySource",condition:TargetType="None"):TapEffect =>
({effectCls:'TapEffect', target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType',thenEffects:[] })

export const Sacrifice = (target:PlayerTargetType = "FriendlyPlayer",sacrifices:TargetType="AbilitySource",amount:NumberVar=1,condition:TargetType="None"):SacrificeEffect =>
({effectCls:'SacrificeEffect', target: ToCondition(target), sacrifices: ToCondition(sacrifices,amount), condition:ToCondition(condition), cls:'EffectType',thenEffects:[] })

export const Destroy = (target:TargetType = "AbilitySource",condition:TargetType="None"):DestroyEffect =>
({effectCls:'DestroyEffect', target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType',thenEffects:[] })

export const Exile = (target:TargetType = "AbilitySource",condition:TargetType="None"):ExileEffect =>
({effectCls:'ExileEffect', target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType',thenEffects:[] })

export const Draw = (amount:NumberVar=1,target:PlayerTargetType = "FriendlyPlayer",condition:TargetType="None"):DrawCardEffect =>
({effectCls:'DrawCardEffect', amount: ToNumberSpec(amount), target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType',thenEffects:[] })

export const Discard = (amount:NumberVar=1,target:PlayerTargetType = "FriendlyPlayer",discardTarget:TargetType="AnyFriendlyHand",condition:TargetType="None"):DiscardEffect =>
({effectCls:'DiscardEffect',discardTarget: ToCondition(discardTarget,amount), target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType',thenEffects:[] })

export const Scry = (amount:NumberVar=1,target:PlayerTargetType = "FriendlyPlayer",condition:TargetType="None"):ScryEffect =>
({effectCls:'ScryEffect', amount: ToNumberSpec(amount), target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType',thenEffects:[] })

export const Surveil = (target:PlayerTargetType = "FriendlyPlayer",amount:NumberVar=1,condition:TargetType="None"):SurveilEffect =>
({effectCls:'SurveilEffect', amount: ToNumberSpec(amount), target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType',thenEffects:[] })

export const May = (...effects:EffectUnion[]):MayEffect =>
({effectCls:'MayEffect', condition:NoneCondition, target:NoneCondition, cls:'EffectType',thenEffects:effects })

export const ZoneChange = (target:TargetType,toZone:ZoneName,librarySpecification?:LibrarySpecification):ZoneChangeEffect =>
({toZone, librarySpecification, effectCls:'ZoneChangeEffect', condition:NoneCondition, target:ToCondition(target), cls:'EffectType',thenEffects:[] })

export const DoTrigger = (trigger:TriggerName):TriggerEffect =>
({trigger, effectCls:'TriggerEffect', condition:NoneCondition, target:NoneCondition, cls:'EffectType',thenEffects:[] })

export const Bucket = (...buckets:BucketSpecification[]):BucketEffect =>
({buckets, effectCls:'BucketEffect', condition:NoneCondition, target:NoneCondition, cls:'EffectType',thenEffects:[] })

export const TargetGains = (target:TargetType,...abilities:AbilityUnion[]):AbilityEffect =>
({effectCls:'AbilityEffect', target: ToCondition(target), abilities, condition:NoneCondition, cls:'EffectType',thenEffects:[] })

export const Gains = (...abilities:AbilityUnion[]):AbilityEffect =>
({effectCls:'AbilityEffect', target: SelfCondition, abilities, condition:NoneCondition, cls:'EffectType',thenEffects:[] })

export const IfYouDo = (effect:EffectUnion,...linkedEffects:EffectUnion[]):EffectUnion =>
{
    return {effect,thenEffects:[...effect.thenEffects, ...linkedEffects]} as any as EffectUnion
}

export const WhenYouDo = (effect:EffectUnion,...linkedEffects:EffectUnion[]):EffectUnion =>
{
    const ability = MakeTriggeredAbility("WhenYouDo","None",...linkedEffects)
    const abilityEffect = ({effectCls:'AbilityEffect', target: SelfCondition, abilities:[ability], condition:NoneCondition, cls:'EffectType',thenEffects:[] })
    return {effect,thenEffects:[...effect.thenEffects, abilityEffect]} as any as EffectUnion
}

export const ChooseAnyColor = (target:PlayerTargetType,...effects:EffectUnion[]):ColorChoiceEffect =>
({effectCls:'ColorChoiceEffect', choices:['White','Blue','Black','Red','Green'], target:ToCondition(target), condition:NoneCondition, cls:'EffectType',thenEffects:effects })

export const AddMana = (color:Color,amount:NumberVar=1, target:PlayerTargetType = "FriendlyPlayer",manaCondition:ConditionSpecification=NoneCondition,condition:TargetType="None"):AddManaEffect =>
({color,amount:ToNumberSpec(amount), manaCondition:ToCondition(manaCondition), effectCls:'AddManaEffect', target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType', thenEffects:[] })
