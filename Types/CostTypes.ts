import { Color } from "./ColorTypes";
import { EffectUnion } from "./EffectTypes";
import { ToCondition, ToNumberSpec } from "./ToCondition";
import { ConditionSpecification } from "./ConditionTypes";
import { NoneCondition } from "./ConditionHelpers";
import { Player } from "./CardTypes";
import { CounterType } from "./CounterTypes";

export interface Cost
{
    cls:'Cost',
    elements:CostElement[]
}

export type CostColor = Color|'Generic'|'X'|'W/U'

export type CostVar = Cost | string | EffectUnion | (string|EffectUnion)[]

export type CostElement = CostManaElement | EffectUnion

export interface CostManaElement
{
    color:CostColor
    condition:ConditionSpecification,
    cls:'CostManaElement'
}

export interface PoolManaElement
{
    color:Color
    condition:ConditionSpecification,
    cls:'CostManaElement'
}

export const EmptyCost:Cost = ({cls:'Cost',elements:[]})

export const ToCost = (cost:CostVar):Cost =>
{
    const elements:CostElement[] = [];

    if(Array.isArray(cost))
    {
        elements.push(...cost.flatMap(ce => ToCost(ce).elements))
    }
    else if(typeof cost === 'object')
    {
        if(cost.cls === 'Cost')
        {
            return cost
        }
        else
        {
            elements.push(cost)
        }
    }
    else
    {

    for(var i=0;i<cost.length;i++)
    {
        const el = cost[i]
        switch(el)
        {
            case 'W': elements.push({cls:'CostManaElement', color:'White', condition:NoneCondition}); break;
            case 'U': elements.push({cls:'CostManaElement', color:'Blue', condition:NoneCondition}); break;
            case 'B': elements.push({cls:'CostManaElement', color:'Black', condition:NoneCondition}); break;
            case 'R': elements.push({cls:'CostManaElement', color:'Red', condition:NoneCondition}); break;
            case 'G': elements.push({cls:'CostManaElement', color:'Green', condition:NoneCondition}); break;
            case 'T': elements.push({cls:'EffectType', effectCls:'TapEffect', target:ToCondition("AbilitySource"), condition:ToCondition("None"),thenEffects:[] }); break;
            case 'E': elements.push({cls:'EffectType', effectCls:'RemoveCountersEffect', counterType:'Energy' as CounterType, amount:ToNumberSpec(1), target:ToCondition("FriendlyPlayer"), condition:ToCondition("None"),thenEffects:[] }); break;
            case 'X': elements.push({cls:'CostManaElement', color:'X', condition:NoneCondition}); break;
            default:
                const n = parseInt(el)
                if(n >= 0)
                {
                    
                    for(var j=0;j<n;j++)
                    {
                        elements.push({cls:'CostManaElement', color:'Generic', condition:NoneCondition});
                    }
                    break;
                }
                else
                {
                    throw 'Cost not implemented: '+el
                }
            }
        }
    }

    //console.log("ToCost",cost,elements)
    return ({cls:'Cost', elements})
}

export const CostX = (cost:Cost):number =>
{
    return cost.elements.filter(e => e.cls === 'CostManaElement' && e.color === 'X').length
}
export const CostGeneric = (cost:Cost):number =>
{
    return cost.elements.filter(e => e.cls === 'CostManaElement' && e.color === 'Generic').length
}
export const CostEffects = (cost:Cost):EffectUnion[] =>
{
    return cost.elements.filter(e => e.cls === 'EffectType').map(e => e as EffectUnion)
}
export const CostTap = (cost:Cost):boolean =>
{
    return CostEffects(cost).some(c => c.effectCls === 'TapEffect' && c.target.conditions.length === 1 && c.target.conditions[0] === 'AbilitySource')
}
export const CostMana = (cost:Cost):CostManaElement[] =>
{
    return cost.elements.filter(e => e.cls === 'CostManaElement').map(e => e as CostManaElement)
}

export const CMC = (cost:Cost):number =>
{
    return cost.elements.filter(e => e.cls === 'CostManaElement' && e.color !== 'X').length
}

export const CanPayFor = (player:Player,cost:Cost,perform:boolean,spellCard?:any):boolean =>
{
    const {manaPool} = player

    const manaPoolCopy = perform ? manaPool : [...manaPool]
    var canPay = true

    //Check mana
    CostMana(cost).forEach(c => {

        const firstCompatibleIndex = ManaCanPayFor(c,manaPoolCopy, spellCard)
        if(firstCompatibleIndex === -1)
        {
            canPay = false
        }
        else
        {
            manaPoolCopy.splice(firstCompatibleIndex,1)
        }
    })

    return canPay

}

export const ManaCanPayFor = (el:CostManaElement,pool:PoolManaElement[], spellCardId?: any) =>
{
    //todo check conditions / order by condition first

    // Check if this is for a spell with MaySpendManaAsThoughItWereManaOfAnyColorToCastThisSpell
    if (spellCardId && typeof spellCardId === 'object' && spellCardId.keywords && 
        spellCardId.keywords.includes('MaySpendManaAsThoughItWereManaOfAnyColorToCastThisSpell')) {
        // Any mana can pay for any color requirement
        return pool.findIndex(() => true);
    }

    return pool.findIndex(p => ManaMap[el.color].includes(p.color))
}

export const ManaMap:Record<CostColor,Color[]> =
{
    White: ["White"],
    Blue: ["Blue"],
    Black: ["Black"],
    Red: ["Red"],
    Green: ["Green"],
    Colorless: ["Colorless"],
    Generic: ["White","Blue","Black","Red","Green"],
    X: [],
    "W/U": ["White","Blue"]
}