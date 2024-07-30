import { controller } from "../Network/Server"
import { GameActionUnion } from "../Types/GameActionTypes"
import { AbilityTypeId, CardId, PlayerId, newTimestamp } from "../Types/IdCounter"
import { ChooseInput, ModeInput, NumberInput } from "../Types/InputTypes"
import { GetCard, GetEffect, GetPlayer, NewCard } from "./GetCard"
import { AddChangeZoneGameAction } from "../Types/GameActionHelpers"
import { ChangeZone } from "./ChangeZone"
import { TokenName } from "../Types/CardNames"
import { AbilityTypeRegistry } from "../Types/AbilityClassHelpers"
import { Color, NoneCondition } from "../Types/Types"
import { IsTribe } from "../Types/IsCard"
import { ExecuteTrigger } from "./ExecuteTrigger"

export const PerformDrawCard = (playerId:PlayerId,amount:number=1) =>
{
    const player = GetPlayer(playerId)
    const cardIds = player.library.slice(0,amount)
    AddChangeZoneGameAction("Hand", cardIds, playerId)
    ExecuteTrigger("DrawCard", [playerId])
}

export const PerformShuffle = (playerId:PlayerId) =>
{
    const player = GetPlayer(playerId)
    shuffle(player.library)
}

export const PerformTap = (cardId:CardId) =>
{
    const card = GetCard(cardId)
    if(card.tapped)
    {
        throw 'Double Tap -'+cardId.toString()
    }
    card.tapped = true;
}

export const PerformAddMana = (playerId:PlayerId,color:Color,amount:number) =>
{
    const player = GetPlayer(playerId)
    for(var i=0;i<amount;i++)
    {
        player.manaPool.push({cls:'CostManaElement',color,condition:NoneCondition})
    }  
}

export const PerformUntap = (cardId:CardId) =>
{
    const card = GetCard(cardId)
    if(!card.tapped)
    {
        throw 'Double Untap -'+cardId.toString()
    }
    card.tapped = false;
}

export const PerformCast = (cardId:CardId,abilityId:AbilityTypeId|null) =>
{
    if(abilityId === null)
    {
        console.log('Cast',cardId)
        const card = GetCard(cardId)
        
        AddChangeZoneGameAction("Stack", [cardId], card.controller)
    }
    else
    {
        console.log('Cast Ability',cardId)
        const card = GetCard(cardId)

        const ability = AbilityTypeRegistry[abilityId]
        if(ability.abilitySuperCls !== 'ActivatedAbility')
        {
            throw 'Not Activated'
        }

        const activatedAbility = NewCard('Ability',card.controller,'AbilityHolding',newTimestamp())
        controller.cards.push(activatedAbility)
        activatedAbility.abilitySourceId = cardId
        activatedAbility.abilitySourceAbilityId = ability.id

        if(ability.isManaAbility)
        {
            AddChangeZoneGameAction("FastStack",[activatedAbility.id],cardId)
        }
        else
        {
            controller.hasCastOrPassed = true;
            AddChangeZoneGameAction("Stack",[activatedAbility.id],cardId)
        }

    }

    //Reset priority as something new went on the stack
    controller.priorityPassed = 0
}

export const SetCastMode = (input:ModeInput) =>
{
    const card = GetCard(input.source)
    card.castSelectedOption = input.modes[input.response]
}

export const SetCastX = (input:NumberInput) =>
{
    const card = GetCard(input.source)
    card.castSelectedX = input.response
}

export const SetCastTargets = (input:ChooseInput) =>
{
    const effect = GetEffect(input.source,input.sourceEffectIndex!)

    if(input.contextKey === 'targets' || input.contextKey === 'discardTargetIds')
    {
        effect.context[input.contextKey!]![input.contextKeyIndex!] = input.response
    }
    else
    {
        throw 'not implemented'
    }

}

export function shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

export const DoGameAction = (action:GameActionUnion):boolean => //Returns whether to exit loop
{
    switch(action.name)
    {
        case 'InputAction':
            controller.input = action.input
            return true;
        
        case 'ChangeZoneAction':
            ChangeZone(action)
            return false;
    }
}

export const PerformDamage = (sourceId:CardId,targetId:CardId,amount:number) =>
{
    //const source = GetCard(sourceId);
    const target = GetCard(targetId);

    console.log("PerformDamage",sourceId,targetId,amount)

    if(amount <=0)
    {
        return
    }
    if(IsTribe(target,"Player"))
    {
        PerformLoseLife(sourceId,targetId as PlayerId,amount)
    }
    else if (IsTribe(target,"Planeswalker"))
    {

    }
    else if (IsTribe(target,"Creature"))
    {
        target.damageMarked += amount
    }
    else
    {
        throw 'Damage not implemented'
    }
}

export const PerformLoseLife = (_:CardId,targetId:PlayerId,amount:number) =>
{
    //const source = GetCard(sourceId);
    const target = GetPlayer(targetId)
    if(IsTribe(target,"Player"))
    {
        target.life -= amount
    }
    else
    {
        throw 'Life loss not implemented'
    }
}

export const PerformCreate = (playerId:PlayerId,token:TokenName,amount:number) =>
{
    const timestamp = newTimestamp()
    for(var i=0;i<amount;i++)
    {
        const card = NewCard(token,playerId,'Field',timestamp)
        controller.cards.push(card)
    }  
}

export const PerformCombat = (firstStrike:boolean) =>
{
    const attackers = controller.cards.filter(c => c.attacking)

    attackers.forEach(attacker =>
        {
            const blockers = attacker.blockOrder
            var remainingPower = attacker.power

            blockers.forEach((b,i) =>
                {
                    const blocker = GetCard(b)
                    var assignedPower = Math.min(remainingPower, blocker.toughness)
                    if(attacker.keywords.includes('Deathtouch'))
                    {
                        assignedPower = Math.min(assignedPower,1)
                    }
                    if(i === blockers.length-1) //Last blocker
                    {
                        assignedPower = remainingPower
                    }
                    remainingPower -= assignedPower
                    PerformDamage(attacker.id,blocker.id,assignedPower)

                    var blockerPower = blocker.power
                    PerformDamage(blocker.id,attacker.id,blockerPower)
                })

            if(attacker.attacking && remainingPower > 0 && (blockers.length === 0 || attacker.keywords.includes('Trample')))
            {
                PerformDamage(attacker.id,attacker.attacking,remainingPower)
            }

            
        })
}