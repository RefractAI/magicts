import { controller } from "../Network/Server"
import { ActivatedAbility } from "../Types/AbilityTypes"
import { GetAbilityType } from "../Types/AbilityTypes"
import { CostMana, ManaCanPayFor, ManaMap, CostElement, CostManaElement, CanPayFor } from "../Types/CostTypes"
import { Color } from "../Types/ColorTypes"
import { PlayerId, CardId } from "../Types/IdCounter"
import { CastSpecification } from "../Types/InputTypes"
import { Cost } from "../Types/CostTypes"
import { GetPlayer } from "./GetCard"
import { AddPayInputGameAction } from "../Types/InputTypesHelpers"

export const IdentifyCanPayFor = (playerId:PlayerId,cost:Cost,spellCard?:any):[boolean,CastSpecification[]] =>
{
    const player = GetPlayer(playerId);
    
    // First check if we can already pay with current mana pool using CanPayFor
    if (CanPayFor(player, cost, false, spellCard)) {
        return [true, []]; // No additional mana abilities needed
    }

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

    const manaPoolCopy = [...player.manaPool]
    
    const costmana = CostMana(cost)
    for(var i=0;i<costmana.length;i++)
    {
            
        const el = costmana[i]
       
        //Try remove from real manapool - now uses the updated ManaCanPayFor with spell card support
        const realPoolIndex = ManaCanPayFor(el,manaPoolCopy, spellCard)
        if(realPoolIndex>-1)
        {
            manaPoolCopy.splice(realPoolIndex,1)
            continue;
        }
        else
        {
             //Try remove from overflow "pool"
            const poolIndex = spellCard && spellCard.keywords && 
                spellCard.keywords.includes('MaySpendManaAsThoughItWereManaOfAnyColorToCastThisSpell') 
                ? pool.findIndex(() => true) // Any mana can pay for any color
                : pool.findIndex(p => ManaMap[el.color].includes(p))
            if(poolIndex>-1)
            {
                pool.splice(poolIndex,1)
                continue;
            }
            else
            {
                    //Try remove from new ability prioritising least mana
                const index = spellCard && spellCard.keywords && 
                    spellCard.keywords.includes('MaySpendManaAsThoughItWereManaOfAnyColorToCastThisSpell')
                    ? manaAbilities.findIndex(ma => ma.mana.length > 0) // Any mana ability can help
                    : manaAbilities.findIndex(ma => ma.mana.some(mai => ManaMap[el.color].includes(mai)))
                if(index>-1)
                {
                    usedIndexes.push(index)
                    pool.push(...manaAbilities[index].mana)
                    //Then try remove from "pool"
                    const poolIndex = spellCard && spellCard.keywords && 
                        spellCard.keywords.includes('MaySpendManaAsThoughItWereManaOfAnyColorToCastThisSpell') 
                        ? pool.findIndex(() => true) // Any mana can pay for any color
                        : pool.findIndex(p => ManaMap[el.color].includes(p))
                    pool.splice(poolIndex,1)
                    continue;
                }
            }
        }
        return [false,[]]
    }

    return [true,usedIndexes.map(index => manaAbilities[index].cc)]
}

export const AddPay = (cardId: CardId, cost: Cost) => {
    // Calculate remaining mana cost after subtracting what's in mana pool
    const player = GetPlayer(controller.active2);
    const spellCard = controller.cards.find(c => c.id === cardId);
    const manaPoolCopy = [...player.manaPool];
    const remainingManaElements: CostElement[] = [];
    
    // Only process mana elements from the cost, ignore effects like Tap
    const manaCostElements = cost.elements.filter(e => e.cls === 'CostManaElement') as CostManaElement[];
    
    manaCostElements.forEach(costElement => {
        const manaCanPayIndex = ManaCanPayFor(costElement, manaPoolCopy, spellCard);
        
        if (manaCanPayIndex === -1) {
            // Can't pay this element with current mana pool, add to remaining cost
            remainingManaElements.push(costElement);
        } else {
            // Remove the mana from pool copy since it can pay for this element
            manaPoolCopy.splice(manaCanPayIndex, 1);
        }
    });
    
    // Only create PayInput if there's remaining mana cost to pay
    if (remainingManaElements.length > 0) {
        const remainingCost: Cost = {
            cls: 'Cost',
            elements: remainingManaElements
        };
        
        const canCast = controller.cards
        .filter(c => c.canCast.filter(c => c.playerId === controller.active2
            && c.abilityTypeId
            && GetAbilityType(c.abilityTypeId)?.abilityCls === 'ActivatedAbility'
            && (GetAbilityType(c.abilityTypeId) as ActivatedAbility).isManaAbility //Only mana abilities
            ).length>0)
        .map(c => c.id)

        AddPayInputGameAction(controller.active2, cardId, canCast, remainingCost)
    }
}


