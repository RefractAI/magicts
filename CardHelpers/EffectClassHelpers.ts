import { TargetType, NumberVar, PlayerTargetType, ConditionSpecification, NumberDef } from "../Types/ConditionTypes";
import { NoneCondition, SelfCondition, C } from "../Types/ConditionHelpers";
import { ToCondition, ToNumberSpec } from "../Types/ToCondition";
import { AbilityEffect, AddManaEffect, BucketEffect, BucketSpecification, ColorChoiceEffect, CreateEffect, DamageEffect, DestroyEffect, DiscardEffect, DrawCardEffect, EffectUnion, ExileEffect, ExploreEffect, MayEffect, SacrificeEffect, ScryEffect, SearchEffect, ShuffleIntoLibraryEffect, ShuffleEffect, SurveilEffect, TapEffect, TargetEffect, TransformEffect, ZoneChangeEffect, TriggerEffect, LoseLifeEffect, GainLifeEffect, AddCountersEffect, RemoveCountersEffect, PayEffect, ButtonChoiceEffect, CreateEmblemEffect, SelectXEffect, RevealEffect } from "../Types/EffectTypes";
import { TokenName, EmblemName } from "../Cards/Common/CardNames";
import { ZoneName } from "../Types/ZoneNames";
import { LibrarySpecification } from "../Types/GameActionTypes";
import { AbilityUnion } from "../Types/AbilityTypes";
import { TriggerName } from "../Types/TriggerNames";
import { MakeTriggeredAbility } from "./AbilityClassHelpers";
import { ColorDef } from "../Types/ColorTypes";
import { CounterType } from "../Types/CounterTypes";
import { CostVar, ToCost } from "../Types/CostTypes";

export const Damage = (amount:NumberVar,target:TargetType,condition:TargetType="None"):DamageEffect => 
({amount: ToNumberSpec(amount), effectCls:'DamageEffect', target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType',thenEffects:[] })

export const Create = (token:TokenName,amount:NumberVar=1,target:PlayerTargetType = "FriendlyPlayer",condition:TargetType="None",copyOf?:TargetType,...thenEffects:EffectUnion[]):CreateEffect =>
({token, amount: ToNumberSpec(amount), effectCls:'CreateEffect', target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType', tappedAndAttacking:false, copyOf: copyOf ? ToCondition(copyOf) : undefined, thenEffects })

export const CreateTappedAndAttacking = (token:TokenName,amount:NumberVar=1,target:PlayerTargetType = "FriendlyPlayer",condition:TargetType="None",copyOf?:TargetType):CreateEffect => 
({token, amount: ToNumberSpec(amount), effectCls:'CreateEffect', target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType', tappedAndAttacking:true, copyOf: copyOf ? ToCondition(copyOf) : undefined, thenEffects:[] })

export const CreateEmblem = (emblem:EmblemName, target:PlayerTargetType = "FriendlyPlayer", condition:TargetType="None"):CreateEmblemEffect =>
({emblem, effectCls:'CreateEmblemEffect', target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType', thenEffects:[] })

export const Tap = (target:TargetType = "AbilitySource",condition:TargetType="None"):TapEffect =>
({effectCls:'TapEffect', target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType',thenEffects:[] })

export const Sacrifice = (target:PlayerTargetType = "FriendlyPlayer",sacrifices:TargetType="AbilitySource",condition:TargetType="None"):SacrificeEffect =>
({effectCls:'SacrificeEffect', target: ToCondition(target), sacrifices: ToCondition(sacrifices), condition:ToCondition(condition), cls:'EffectType',thenEffects:[] })

export const Destroy = (target:TargetType = "AbilitySource",condition:TargetType="None"):DestroyEffect =>
({effectCls:'DestroyEffect', target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType',thenEffects:[] })

export const Exile = (target:TargetType = "AbilitySource",condition:TargetType="None"):ExileEffect =>
({effectCls:'ExileEffect', target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType',thenEffects:[] })

export const Draw = (amount:NumberVar=1,target:PlayerTargetType = "FriendlyPlayer",condition:TargetType="None"):DrawCardEffect =>
({effectCls:'DrawCardEffect', amount: ToNumberSpec(amount), target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType',thenEffects:[] })

export const Discard = (target:PlayerTargetType = "FriendlyPlayer",discardTarget:TargetType="Hand",condition:TargetType="None"):DiscardEffect =>
({effectCls:'DiscardEffect',discardTarget: ToCondition(discardTarget), target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType',thenEffects:[] })

export const Search = (target:PlayerTargetType = "FriendlyPlayer",searchTarget:TargetType,condition:TargetType="None",toZone:ZoneName="Hand"):SearchEffect =>
({effectCls:'SearchEffect',searchTarget: ToCondition(searchTarget), target: ToCondition(target), condition:ToCondition(condition), toZone, cls:'EffectType',thenEffects:[] })

export const Scry = (amount:NumberVar=1,target:PlayerTargetType = "FriendlyPlayer",condition:TargetType="None"):ScryEffect =>
({
    effectCls:'ScryEffect', 
    amount: ToNumberSpec(amount), 
    target: ToCondition(target), 
    condition:ToCondition(condition), 
    cls:'EffectType',
    thenEffects:[], 
    trigger: 'Scry',
    cardTarget: C.All(C.Friendly, C.TopNCardsOfLibrary(ToNumberSpec(amount))),
    prompt: "Look at the top cards and put any number on the bottom of your library and the rest on top in any order",
    requiresOrder: true,
    buckets: [
        {
            target: ToCondition(target),
            effects: [],
            toZone: 'Library',
            librarySpecification: { direction: 'Top', offset: 0 }
        },
        {
            target: ToCondition(target),
            effects: [],
            toZone: 'Library',
            librarySpecification: { direction: 'Bottom', offset: 0 }
        }
    ]
})

export const Surveil = (target:PlayerTargetType = "FriendlyPlayer",amount:NumberVar=1,condition:TargetType="None"):SurveilEffect =>
({
    effectCls:'SurveilEffect', 
    amount: ToNumberSpec(amount), 
    target: ToCondition(target), 
    condition:ToCondition(condition), 
    cls:'EffectType',
    thenEffects:[], 
    trigger: 'Surveil',
    cardTarget: C.All(C.Friendly, C.TopNCardsOfLibrary(ToNumberSpec(amount))),
    prompt: "Look at the top cards and put any number in your graveyard and the rest on top in any order",
    requiresOrder: true,
    buckets: [
        {
            target: ToCondition(target),
            effects: [],
            toZone: 'Library',
            librarySpecification: { direction: 'Top', offset: 0 }
        },
        {
            target: ToCondition(target),
            effects: [],
            toZone: 'Graveyard'
        }
    ]
})

export const May = (...effects:EffectUnion[]):MayEffect =>
({effectCls:'MayEffect', condition:NoneCondition, target:NoneCondition, cls:'EffectType',thenEffects:effects })

export const ZoneChange = (target:TargetType,toZone:ZoneName,librarySpecification?:LibrarySpecification):ZoneChangeEffect =>
({toZone, librarySpecification, effectCls:'ZoneChangeEffect', condition:NoneCondition, target:ToCondition(target), cls:'EffectType',thenEffects:[] })

export const Return = (target:TargetType = "AbilitySource", condition:TargetType="None"):ZoneChangeEffect =>
({toZone: "Hand", effectCls:'ZoneChangeEffect', condition:ToCondition(condition), target:ToCondition(target), cls:'EffectType',thenEffects:[] })

export const DoTrigger = (trigger:TriggerName):TriggerEffect =>
({trigger, effectCls:'TriggerEffect', condition:NoneCondition, target:NoneCondition, cls:'EffectType',thenEffects:[] })

export const Explore = (target:TargetType = "AbilitySource",condition:TargetType="None"):ExploreEffect =>
({effectCls:'ExploreEffect', target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType',thenEffects:[] })

export const BucketSpec = (toZone:ZoneName|"None", target:TargetType = "None", amount:NumberDef|undefined = undefined, effects:EffectUnion[] = [], name?:string):BucketSpecification =>
({target: ToCondition(target), amount, effects, toZone, name: name || toZone})

export const Bucket = (target:PlayerTargetType, cardTarget:TargetType, prompt:string, buckets:BucketSpecification[], thenEffects:EffectUnion[] = []):BucketEffect =>
({buckets, cardTarget: ToCondition(cardTarget), effectCls:'BucketEffect', condition:NoneCondition, target:ToCondition(target), cls:'EffectType',thenEffects, prompt })

export const TargetGains = (target:TargetType,...abilities:AbilityUnion[]):AbilityEffect =>
({effectCls:'AbilityEffect', target: ToCondition(target), abilities, condition:NoneCondition, cls:'EffectType',thenEffects:[] })

export const Gains = (...abilities:AbilityUnion[]):AbilityEffect =>
({effectCls:'AbilityEffect', target: ToCondition("AbilitySource"), abilities, condition:NoneCondition, cls:'EffectType',thenEffects:[] })

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

export const ChooseAnyColor = (target:PlayerTargetType,...thenEffects:EffectUnion[]):ColorChoiceEffect =>
({effectCls:'ColorChoiceEffect', choices:['White','Blue','Black','Red','Green'], target:ToCondition(target), condition:NoneCondition, cls:'EffectType',thenEffects })

export const AddMana = (color:ColorDef,amount:NumberVar=1, target:PlayerTargetType = "FriendlyPlayer",manaCondition:ConditionSpecification=NoneCondition,condition:TargetType="None"):AddManaEffect =>
({color,amount:ToNumberSpec(amount), manaCondition:ToCondition(manaCondition), effectCls:'AddManaEffect', target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType', thenEffects:[] })

export const Transform = (target:TargetType = "AbilitySource",condition:TargetType="None"):TransformEffect =>
({effectCls:'TransformEffect', target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType',thenEffects:[] })

export const ChooseTarget = (target:TargetType, ...thenEffects:EffectUnion[]):TargetEffect =>
({effectCls:'TargetEffect', target:ToCondition(target), condition:NoneCondition, cls:'EffectType', thenEffects })

export const LoseLife = (amount:NumberVar=1,target:PlayerTargetType = "FriendlyPlayer",condition:TargetType="None"):LoseLifeEffect =>
({effectCls:'LoseLifeEffect', amount:ToNumberSpec(amount), target:ToCondition(target), condition:ToCondition(condition), cls:'EffectType',thenEffects:[] })

export const GainLife = (amount:NumberVar=1,target:PlayerTargetType = "FriendlyPlayer",condition:TargetType="None"):GainLifeEffect =>
({effectCls:'GainLifeEffect', amount:ToNumberSpec(amount), target:ToCondition(target), condition:ToCondition(condition), cls:'EffectType',thenEffects:[] })

export const AddCounters = (counterType:CounterType, amount:NumberVar=1, target:TargetType = "AbilitySource", condition:TargetType="None"):AddCountersEffect =>
({counterType, amount:ToNumberSpec(amount), effectCls:'AddCountersEffect', target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType',thenEffects:[] })

export const RemoveCounters = (counterType:CounterType, amount:NumberVar=1, target:TargetType = "AbilitySource", condition:TargetType="None"):RemoveCountersEffect =>
({counterType, amount:ToNumberSpec(amount), effectCls:'RemoveCountersEffect', target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType',thenEffects:[] })


export const MayPay = (cost:CostVar, prompt:string, effectsIfPaid:EffectUnion[], effectsIfNotPaid:EffectUnion[] = []):PayEffect =>
({cost: ToCost(cost), prompt, effectsIfNotPaid, effectCls:'PayEffect', target: NoneCondition, condition: NoneCondition, cls:'EffectType', thenEffects: effectsIfPaid})

export const SelectX = (...thenEffects:EffectUnion[]):SelectXEffect =>
({effectCls:'SelectXEffect', target: NoneCondition, condition: NoneCondition, cls:'EffectType', thenEffects })

export const ButtonChoice = (choices:string[], ...effectGroups:EffectUnion[][]):ButtonChoiceEffect =>
{
    if(effectGroups.length !== choices.length)
    {
        throw new Error("ButtonChoice: number of effect groups must match number of choices");
    }
    return {choices, effectGroups, effectCls:'ButtonChoiceEffect', target: NoneCondition, condition: NoneCondition, cls:'EffectType', thenEffects: []}
}

export const Endures = (amount:NumberVar=1, target:TargetType = "AbilitySource"):ButtonChoiceEffect =>
ButtonChoice(
  ["Add +1/+1 counter", "Create Spirit token"],
  [AddCounters("PlusOnePlusOne", amount, target)],
  [Create("11WhiteSpirit")]
)

export const ShuffleIntoLibrary = (target:TargetType = "AbilitySource", condition:TargetType="None"):ShuffleIntoLibraryEffect =>
({effectCls:'ShuffleIntoLibraryEffect', target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType', thenEffects:[] })

export const Shuffle = (target:PlayerTargetType = "FriendlyPlayer", condition:TargetType="None"):ShuffleEffect =>
({effectCls:'ShuffleEffect', target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType', thenEffects:[] })

export const Reveal = (target:TargetType = "AbilitySource",condition:TargetType="None"):RevealEffect =>
({effectCls:'RevealEffect', target: ToCondition(target), condition:ToCondition(condition), cls:'EffectType', thenEffects:[] })
