import { GetAbilityType } from "./AbilityClassHelpers";
import { CostGeneric } from "./CostHelpers";
import { EffectUnion } from "./EffectClass";
import { AbilityTypeId } from "./IdCounter";
import { IsTribe } from "./IsCard";
import { Card,Cost,Option, Player, PoolManaElement } from "./Types";

export const GetCardShortText = (card:Card):string =>
{
    return GetCardText(card)
}

export const GetCardText = (card:Card):string =>
{
    var powerLine = ""

    if(IsTribe(card,"Creature") || IsTribe(card,"Vehicle"))
    {
        powerLine = `${card.power}/${card.toughness - card.damageMarked}`
    }
    if(IsTribe(card,"Player"))
    {
      powerLine = `${(card as Player).life}`
    }

    return `${GetCardTitle(card)}
${powerLine}
${card.zone === 'Hand' && card.cost.elements.length > 0 ? GetCostText(card.cost) : ""}`
}

export const GetCardTitle = (card:Card):string =>
{
    if(card.name === 'Ability')
    {
        const abilityType = GetAbilityType(card.abilitySourceAbilityId!)
        if(abilityType.abilityCls === 'TriggeredAbility' || abilityType.abilityCls === 'ActivatedAbility' || abilityType.abilityCls === 'DelayedTriggeredAbility')
        {
            return GetOptionsText(abilityType.options)
        }
        return abilityType.abilityCls
    }
    else
    {
        return card.name
    }
}

export const GetOptionsText = (options:Option[]):string =>
{
    return options.map(o => GetOptionText(o)).join(",")
}

export const GetOptionText = (option:Option):string =>
{
    return [...option.abilities.map(a => GetAbilityText(a.id))
        ,...option.effects.map(e => GetEffectText(e))].join(", ")
}

export const GetAbilityText = (abilityTypeId:AbilityTypeId):string =>
{
    const ability = GetAbilityType(abilityTypeId)
    switch(ability.abilityCls)
    {
        case 'ActivatedAbility':
            return GetCostText(ability.cost)+': '+GetOptionsText(ability.options)
        default:
            return ability.abilityCls
    }
}

export const GetEffectText = (effect:EffectUnion):string =>
{
    return effect.effectCls
}

export const GetCostText = (cost:Cost):string =>
{
    const generic = CostGeneric(cost)
    return (generic > 0 ? generic.toString() : "")+cost.elements.map(e => {

        if(e.cls === 'EffectType') {return GetEffectText(e)}
        switch(e.color)
        {
            case 'White': return 'W'
            case 'Blue': return 'U'
            case 'Black': return 'B'
            case 'Red': return 'R'
            case 'Green': return 'G'
            case 'Colorless': return 'C'
            case 'Generic': return ''
            default: throw 'not implemented'
        }


    }).join("")
}

export const GetManaPoolText = (pool:PoolManaElement[]):string =>
{
    return pool.map(e => {

        switch(e.color)
        {
            case 'White': return 'W'
            case 'Blue': return 'U'
            case 'Black': return 'B'
            case 'Red': return 'R'
            case 'Green': return 'G'
            case 'Colorless': return 'C'
            default: throw 'not implemented'
        }

    }).join("")
}