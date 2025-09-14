import { MakeBaseTribeAbility, MakeColorAbility, MakeKeywordAbility, MakeBasePowerToughnessAbility } from "./AbilityClassHelpers"
import { CardName } from "../Cards/Common/CardNames"
import { AbilityUnion } from "../Types/AbilityTypes"
import { Clause, CardType } from "../Types/CardTypes"
import { ColorNames, Color } from "../Types/ColorTypes"
import { NumberVar } from "../Types/ConditionTypes"
import { SelfCondition } from "../Types/ConditionHelpers"
import { CostVar, ToCost } from "../Types/CostTypes"
import { EffectUnion } from "../Types/EffectTypes"
import { KeywordNames, KeywordName } from "../Types/KeywordTypes"
import { TribeNames, TribeName } from "../Types/TribeNames"

function C(name:CardName, cost:CostVar, clauses:Clause[]):CardType 
{
    const newCost = ToCost(cost)
    const abilities:AbilityUnion[] = []
    const effects:EffectUnion[] = []

    clauses.forEach(c =>
        {
            if(typeof c === 'string')
            {
                c.split(" ").forEach(tname => 
                    {
                        if(TribeNames.includes(tname as TribeName))
                        {
                            abilities.push(MakeBaseTribeAbility(tname as TribeName))
                        }
                        else if (ColorNames.includes(tname as Color)) {
                            abilities.push(MakeColorAbility(tname as Color,SelfCondition))
                        }
                        else if (KeywordNames.includes(tname as KeywordName)) {
                            abilities.push(MakeKeywordAbility(tname as KeywordName,SelfCondition))
                        }
                        else
                        {
                            throw 'not implemented clause :'+c+"."
                        }
                    })
            }
            else if(c.cls === 'AbilityType')
            {
                abilities.push(c)
            }
            else if(c.cls === 'EffectType')
            {
                effects.push(c)
            }
        })
    return ({name,cost:newCost,abilities,effects,cls:'CardType'})
}
 
export const Generic = (name:CardName,tribe:TribeName):CardType => C(name, "", [MakeBaseTribeAbility(tribe)])
export const Land = (name:CardName, ...clauses:Clause[]):CardType => C(name, "", [...clauses,MakeBaseTribeAbility("Land")])
export const Creature = (name:CardName, cost:CostVar, power:NumberVar, toughness:NumberVar, ...clauses:Clause[]):CardType => C(name, cost, [...clauses,MakeBaseTribeAbility("Creature"),MakeBasePowerToughnessAbility(power,toughness)])
export const Artifact = (name:CardName, cost:CostVar, ...clauses:Clause[]):CardType => C(name, cost, [...clauses,"Artifact"])
export const Instant = (name:CardName, cost:CostVar, ...clauses:Clause[]):CardType => C(name, cost, [...clauses,"Instant"])
export const Sorcery = (name:CardName, cost:CostVar, ...clauses:Clause[]):CardType => C(name, cost, [...clauses,"Sorcery"])
export const Enchantment = (name:CardName, cost:CostVar, ...clauses:Clause[]):CardType => C(name, cost, [...clauses,"Enchantment"])
export const Planeswalker = (name:CardName, cost:CostVar, ...clauses:Clause[]):CardType => C(name, cost, [...clauses,"Planeswalker"])

export const TokenCreature = (name:CardName, power:NumberVar, toughness:NumberVar, ...clauses:Clause[]):CardType => C(name, "", [...clauses,MakeBaseTribeAbility("Token"),MakeBaseTribeAbility("Creature"),MakeBasePowerToughnessAbility(power,toughness)])
export const TokenArtifactCreature = (name:CardName, power:NumberVar, toughness:NumberVar, ...clauses:Clause[]):CardType => C(name, "", [...clauses,MakeBaseTribeAbility("Token"),MakeBaseTribeAbility("Artifact"),MakeBaseTribeAbility("Creature"),MakeBasePowerToughnessAbility(power,toughness)])
export const Emblem = (name:CardName, ...clauses:Clause[]):CardType => C(name, "", [...clauses,MakeBaseTribeAbility("Emblem")])
