import { GetAbilityType } from "./AbilityTypes";
import { CostGeneric } from "./CostTypes";
import { EffectUnion } from "./EffectTypes";
import { AbilityTypeId } from "./IdCounter";
import { IsTribe } from "./IsCard";
import { Card, Player } from "./CardTypes";
import { Cost } from "./CostTypes";
import { PoolManaElement } from "./CostTypes";
import { GetCostModificationAbilities } from "../Logic/GetCard";

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

    const displayCost = card.zone === 'Hand' ? GetActualCastingCost(card) : card.cost;
    
    return `${GetCardTitle(card)}
${powerLine}
${card.zone === 'Hand' && card.cost.elements.length > 0 ? GetCostText(displayCost) : ""}`
}

export const GetCardTitle = (card:Card):string =>
{
    if(card.name === 'Ability')
    {
        const abilityType = GetAbilityType(card.abilitySourceAbilityId!)
        if(abilityType.abilityCls === 'TriggeredAbility' || abilityType.abilityCls === 'ActivatedAbility' || abilityType.abilityCls === 'DelayedTriggeredAbility')
        {
            return GetAbilityText(card.abilitySourceAbilityId!)
        }
        return abilityType.abilityCls
    }
    else
    {
        return card.name
    }
}

export const GetAbilityText = (abilityTypeId:AbilityTypeId):string =>
{
    const ability = GetAbilityType(abilityTypeId)
    switch(ability.abilityCls)
    {
        case 'ActivatedAbility':
            return GetCostText(ability.cost)
            +': '
            +ability.abilities.map(a => GetAbilityText(a.id)).join(", ")
            +', '
            +ability.effects.map(e => GetEffectText(e)).join(", ")
        default:
            return ability.abilityCls
    }
}

export const GetEffectText = (effect:EffectUnion):string =>
{
    return effect.effectCls
}

export const GetActualCastingCost = (card:Card):Cost =>
{
    const baseCost = card.cost;
    
    // Use the same logic as the CastCost assertion - get cost modification abilities applied to this card
    const costModAbilities = GetCostModificationAbilities(card);
    const costIncreaseElements = costModAbilities.map(cma => cma[1].costIncrease).flatMap(c => c.elements);
    
    // Create the modified cost by adding the cost increase elements
    const elements = [...baseCost.elements, ...costIncreaseElements];
    
    return {cls:'Cost', elements};
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

export const GetPowerToughnessText = (card:Card):string =>
{
    if(!IsTribe(card,"Creature") && !IsTribe(card,"Vehicle")) return ""
    
    const effectiveToughness = card.toughness - card.damageMarked
    const damageText = card.damageMarked > 0 ? ` (${card.damageMarked} damage)` : ''
    
    return `${card.power}/${effectiveToughness}${damageText}`
}

export const GetKeywordsText = (card:Card):string =>
{
    return card.keywords.join(', ')
}

export const GetCountersText = (card:Card):string =>
{
    if(card.counters.length === 0) return ""
    
    const counterCounts = card.counters.reduce((acc, counter) => {
        acc[counter] = (acc[counter] || 0) + 1
        return acc
    }, {} as Record<string, number>)
    
    return Object.entries(counterCounts)
        .map(([counter, count]) => `${count}x ${counter.replace(/([A-Z])/g, ' $1').trim()}`)
        .join(', ')
}

export const GetStatusText = (card:Card):string =>
{
    const statusItems = []
    
    if(card.tapped) statusItems.push('Tapped')
    if(card.summoningSickness) statusItems.push('Summoning Sickness')
    if(card.attacking) statusItems.push('Attacking')
    if(card.blocking.length > 0) statusItems.push(`Blocking ${card.blocking.length} creature(s)`)
    
    return statusItems.join(', ')
}

export const GetBasicInfoText = (card:Card):string =>
{
    const lines = []
    lines.push(`Zone: ${card.zone}`)
    lines.push(`Controller: ${card.controller === 1 ? 'Player' : 'Opponent'}`)
    if(card.tribes.length > 0) lines.push(`Types: ${card.tribes.join(' ')}`)
    if(card.colors.length > 0) lines.push(`Colors: ${card.colors.join(', ')}`)
    if(card.cost.elements.length > 0) lines.push(`Cost: ${GetCostText(card.cost)}`)
    if(card.cmc > 0) lines.push(`CMC: ${card.cmc}`)
    
    return lines.join('\n')
}