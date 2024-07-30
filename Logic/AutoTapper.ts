import { controller } from "../Network/Server"
import { ActivatedAbility } from "../Types/AbilityClass"
import { GetAbilityType } from "../Types/AbilityClassHelpers"
import { CostMana, ManaCanPayFor, ManaMap } from "../Types/CostHelpers"
import { PlayerId } from "../Types/IdCounter"
import { CastSpecification } from "../Types/InputTypes"
import { Color, Cost } from "../Types/Types"
import { GetPlayer } from "./GetCard"



export const IdentifyCanPayFor = (playerId:PlayerId,cost:Cost):[boolean,CastSpecification[]] =>
{

    const manaAbilities = controller.cards
    .flatMap(c => c.canCast)
    .filter(c => c.playerId === playerId)
    .filter(cc => cc.abilityTypeId 
        && GetAbilityType(cc.abilityTypeId).abilityCls === 'ActivatedAbility' 
        && (GetAbilityType(cc.abilityTypeId) as ActivatedAbility).isManaAbility
        && (GetAbilityType(cc.abilityTypeId) as ActivatedAbility).couldAddMana.length > 0
        )
    .map(cc => ({cc,mana:(GetAbilityType(cc.abilityTypeId!) as ActivatedAbility).couldAddMana}))
    .sort((a,b)=> a.mana.length - b.mana.length)

    const usedIndexes:number[] = []
    const pool:Color[] = []


    const manaPoolCopy = [...GetPlayer(playerId).manaPool]
    
    const costmana = CostMana(cost)
    for(var i=0;i<costmana.length;i++)
    {
            
        const el = costmana[i]
       
        //Try remove from real manapool
        const realPoolIndex = ManaCanPayFor(el,manaPoolCopy)
        if(realPoolIndex>-1)
        {
            manaPoolCopy.splice(realPoolIndex,1)
            continue;
        }
        else
        {
             //Try remove from overflow "pool"
            const poolIndex = pool.findIndex(p => ManaMap[el.color].includes(p))
            if(poolIndex>-1)
            {
                pool.splice(poolIndex,1)
                continue;
            }
            else
            {
                    //Try remove from new ability prioritising least mana
                const index = manaAbilities.findIndex(ma => ma.mana.some(mai => ManaMap[el.color].includes(mai)))
                if(index>-1)
                {
                    usedIndexes.push(index)
                    pool.push(...manaAbilities[index].mana)
                    //Then try remove from "pool"
                    const poolIndex = pool.findIndex(p => ManaMap[el.color].includes(p))
                    pool.splice(poolIndex,1)
                    continue;
                }
            }
        }
        return [false,[]]
    }

        return [true,usedIndexes.map(index => manaAbilities[index].cc)]
}


