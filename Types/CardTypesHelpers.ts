import { MakeBasePowerToughnessAbility, MakeColorAbility, MakeKeywordAbility, MakeTribeAbility } from "./AbilityClassHelpers"
import { CardType, Clause, Color, ColorNames, CostVar, KeywordName, KeywordNames, NumberVar, Option, OptionType, SelfCondition } from "./Types"
import { CardName } from "./CardNames"
import { TribeName, TribeNames } from "./TribeNames"
import { ToCost } from "./CostHelpers"



function C(name:CardName, cost:CostVar, clauses:Clause[]):CardType 
{
    const newCost = ToCost(cost)
    const baseOption:Option =  ({optionType:'Base',abilities:[],effects:[],cost:newCost,cls:'Option'})
    const options = [baseOption]

    clauses.forEach(c =>
        {
            if(typeof c === 'string')
            {
                c.split(" ").forEach(tname => 
                    {
                        if(TribeNames.includes(tname as TribeName))
                        {
                            baseOption.abilities.push(MakeTribeAbility(tname as TribeName))
                        }
                        else
                        {
                            throw 'not implemented clause :'+c+"."
                        }
                    })
            }
            else if(c.cls === 'AbilityType')
            {
                baseOption.abilities.push(c)
            }
            else if(c.cls === 'EffectType')
            {
                baseOption.effects.push(c)
            }
            else
            {
                options.push(c)
            }
        })
    return ({name,options,cls:'CardType'})
}
 
function MakeOptionInternal(optionType:OptionType, name:CardName, cost:CostVar, clauses:Clause[]):CardType 
{
    const newCost = ToCost(cost)
    const baseOption:Option =  ({optionType,abilities:[],effects:[],cost:newCost,cls:'Option'})
    const options = [baseOption]

    clauses.forEach(c =>
        {
            if(typeof c === 'string')
            {
                if(c in TribeNames)
                {
                    return MakeTribeAbility(c as TribeName)
                }
                else if(c in KeywordNames)
                {
                    return MakeKeywordAbility(c as KeywordName,SelfCondition)
                }
                else if(c in ColorNames)
                {
                    return MakeColorAbility(c as Color,SelfCondition)
                }
                else
                {
                    throw 'not implemented clause '+c
                }
            }
            else if(c.cls === 'AbilityType')
            {
                baseOption.abilities.push(c)
            }
            else if(c.cls === 'EffectType')
            {
                baseOption.effects.push(c)
            }
            else
            {
                options.push(c)
            }
        })
    return ({name,options,cls:'CardType'})
}

export const Generic = (name:CardName,tribe:TribeName):CardType => C(name, "", [MakeTribeAbility(tribe)])
export const Land = (name:CardName, ...clauses:Clause[]):CardType => C(name, "", [...clauses,MakeTribeAbility("Land")])
export const Creature = (name:CardName, cost:CostVar, power:NumberVar, toughness:NumberVar, ...clauses:Clause[]):CardType => C(name, cost, [...clauses,MakeTribeAbility("Creature"),MakeBasePowerToughnessAbility(power,toughness)])
export const Artifact = (name:CardName, cost:CostVar, ...clauses:Clause[]):CardType => C(name, cost, [...clauses,"Artifact"])
export const Instant = (name:CardName, cost:CostVar, ...clauses:Clause[]):CardType => C(name, cost, [...clauses,"Instant"])
export const Sorcery = (name:CardName, cost:CostVar, ...clauses:Clause[]):CardType => C(name, cost, [...clauses,"Sorcery"])
export const Enchantment = (name:CardName, cost:CostVar, ...clauses:Clause[]):CardType => C(name, cost, [...clauses,"Enchantment"])
export const Planeswalker = (name:CardName, cost:CostVar, ...clauses:Clause[]):CardType => C(name, cost, [...clauses,"Planeswalker"])

export const TokenCreature = (name:CardName, power:NumberVar, toughness:NumberVar, ...clauses:Clause[]):CardType => C(name, "", [...clauses,MakeTribeAbility("Token"),MakeTribeAbility("Creature"),MakeBasePowerToughnessAbility(power,toughness)])
export const TokenArtifactCreature = (name:CardName, power:NumberVar, toughness:NumberVar, ...clauses:Clause[]):CardType => C(name, "", [...clauses,MakeTribeAbility("Token"),MakeTribeAbility("Artifact"),MakeTribeAbility("Creature"),MakeBasePowerToughnessAbility(power,toughness)])


export const MakeOptionCard = (name:CardName, cost:CostVar, ...clauses:Clause[]):CardType => MakeOptionInternal("May",name, cost, clauses)
export const MakeOption = (optionType:OptionType, cost:CostVar, ...clauses:Clause[]):CardType => MakeOptionInternal(optionType,"Option", cost, clauses)