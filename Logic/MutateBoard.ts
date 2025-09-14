import { controller } from "../Network/Server"
import { GameActionUnion } from "../Types/GameActionTypes"
import { AbilityTypeId, CardId, PlayerId, newTimestamp } from "../Types/IdCounter"
import { ChooseInput, NumberInput } from "../Types/InputTypes"
import { GetCard, GetEffect, GetPlayer, NewCard } from "./GetCard"
import { AddChangeZoneGameAction } from "../Types/GameActionHelpers"
import { ChangeZone } from "./ChangeZone"
import { TokenName } from "../Cards/Common/CardNames"
import { AbilityTypeRegistry } from "../Types/AbilityTypes"
import { Color } from "../Types/ColorTypes"
import { NoneCondition } from "../Types/ConditionHelpers"
import { CounterType } from "../Types/CounterTypes"
import { IsTribe } from "../Types/IsCard"
import { ExecuteTrigger } from "./ExecuteTrigger"
import { ReplacementEffect } from "./ReplacementEffect"
import { GetCastModeSummary } from "../Types/OptionTypes"
import { AddConcreteEffect } from "./Targeting"

export const PerformDrawCard = (playerId:PlayerId,amount:number=1) =>
{
    const player = GetPlayer(playerId)
    const cardIds = player.library.slice(0,amount)
    AddChangeZoneGameAction("Hand", cardIds, playerId, 'DrawCard')
    const currentCardsDrawnThisTurn = player.cardsDrawnThisTurn
    player.cardsDrawnThisTurn += amount
    ExecuteTrigger("DrawCard", [playerId])
    if(currentCardsDrawnThisTurn < 2 && player.cardsDrawnThisTurn >= 2)
    {
        ExecuteTrigger("DrawSecondCard", [playerId])
    }
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

export const PerformReveal = (cardId:CardId) =>
{
    const card = GetCard(cardId);
    card.revealed = true;
}

export const PerformUnreveal = (cardId:CardId) =>
{
    const card = GetCard(cardId);
    card.revealed = false;
}

export const PerformUntap = (cardId:CardId) =>
{
    const card = GetCard(cardId)
    if(!card.tapped)
    {
        throw 'Double Untap -'+cardId.toString()
    }
    
    // Check for replacement effects (like stun counters)
    if (ReplacementEffect("Untap", [cardId])) {
        console.log(`Untap replaced by replacement effect for card ${cardId}`);
        return; // Replacement effect applied, don't untap
    }
    
    card.tapped = false;
    console.log(`Card ${cardId} untapped`);
}

export const PerformAddCounter = (cardId:CardId, counterType:CounterType) =>
{
    const card = GetCard(cardId)
    card.counters.push(counterType);
}

export const PerformCast = (cardId:CardId,abilityId:AbilityTypeId|null,chosenMode?:number) =>
{
    if(abilityId === null)
    {
        const card = GetCard(cardId)
        
        // Save the options before they get cleared by zone change
        const savedOptions = [...card.options];
        
        // Save the chosen options to be applied on zone change (centralized in ChangeZone)
        card.selectedOptions = []
        // If a mode was chosen, save it before moving to stack
        if(chosenMode !== undefined && savedOptions.length > chosenMode)
        {
            const selectedOptions = savedOptions[chosenMode];
            const castModeSummary = GetCastModeSummary(selectedOptions);
            console.log('Cast:', cardId, card.name, 'with mode:', castModeSummary)
            card.selectedOptions = selectedOptions
        }
        else
        {
            const modeInfo = chosenMode !== undefined ? ` (mode ${chosenMode}, options: ${savedOptions.length})` : '';
            console.log('Cast:', cardId, card.name, 'with mode: Normal cast' + modeInfo)
        }
        
        //Intent: casting a card marks that you will pass priority when it gets to BeforeResolve. (Unless you hold priority)
        // Reset pass status for both players when casting
        controller.activePlayerPassed = false;
        controller.nonActivePlayerPassed = false;
        
        AddChangeZoneGameAction("Stack", [cardId], card.controller, 'PerformCast')
        const player = GetPlayer(card.controller)
        player.spellsCastThisTurn += 1
        ExecuteTrigger("CastSpell", [cardId])
    }
    else
    {
        console.log('Cast Ability: ',cardId)
        const card = GetCard(cardId)

        const ability = AbilityTypeRegistry[abilityId]
        if(!ability)
        {
            throw 'Ability not found'
        }
        if(ability.abilitySuperCls !== 'ActivatedAbility')
        {
            throw 'Not Activated'
        }

        const activatedAbility = NewCard('Ability',card.controller,'Stack',1,newTimestamp(),undefined,cardId,[cardId],ability.id)[0]
        
        if(ability.isManaAbility)
        {
            AddChangeZoneGameAction("FastStack",[activatedAbility.id],cardId, 'PerformCast')
        }
        else
        {
            //Intent: casting a card marks that you will pass priority when it gets to BeforeResolve. (Unless you hold priority, todo)
            // Reset pass status for both players when casting
            controller.activePlayerPassed = false;
            controller.nonActivePlayerPassed = false;
            AddChangeZoneGameAction("Stack",[activatedAbility.id],cardId, 'PerformCast')
        }

    }
}

export const SetCastX = (input:NumberInput) =>
{
    const card = GetCard(input.source)
    card.castSelectedX = input.response
}

export const SetCastTargets = (input:ChooseInput) =>
{
    const effect = GetEffect(input.source,input.sourceEffectIndex!)

    if(input.contextKey === 'targets' || input.contextKey === 'discardTargetIds' || input.contextKey === 'sacrificeTargetIds' || input.contextKey === 'searchTargetIds')
    {
        if(!effect.context[input.contextKey!]) {
            effect.context[input.contextKey!] = [];
        }
        effect.context[input.contextKey!]![input.contextKeyIndex!] = input.response
    }
    else
    {
        throw 'Unknown context key:'+input.contextKey
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
            
        case 'ReplacementEffectAction':
            console.log(`Resolving ReplacementEffectAction from source ${action.source}`);
            action.effects.forEach(effect => {
                AddConcreteEffect(action.source, effect, 'Normal', -1, {targets: []});
            });
            return false;
    }
}

export const PerformDamage = (sourceId:CardId,targetId:CardId,amount:number) =>
{
    const source = GetCard(sourceId);
    const target = GetCard(targetId);

    console.log("PerformDamage: ",sourceId,targetId,amount)

    if(amount <=0)
    {
        return
    }
    
    // Apply damage to target
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
        throw 'Damage not implemented for this card:'+target.name
    }
    
    // Check for lifelink and gain life for source's controller
    if(source.keywords.includes('Lifelink'))
    {
        PerformGainLife(sourceId, source.controller, amount)
    }
}

export const PerformLoseLife = (_:CardId,targetId:PlayerId,amount:number) =>
{
    //const source = GetCard(sourceId);
    const target = GetPlayer(targetId)
    if(IsTribe(target,"Player"))
    {
        target.life -= amount
        target.lostLifeThisTurn += amount
    }
    else
    {
        throw 'Life loss not implemented for this card:'+target.name
    }
}

export const PerformGainLife = (_:CardId,targetId:PlayerId,amount:number) =>
{
    //const source = GetCard(sourceId);
    const target = GetPlayer(targetId)
    if(IsTribe(target,"Player"))
    {
        target.life += amount
        target.gainedLifeThisTurn += amount
    }
    else
    {
        throw 'Life gain not implemented for this card:'+target.name
    }
}

export const PerformCreate = (playerId:PlayerId,token:TokenName,amount:number):CardId[] =>
{
    const timestamp = newTimestamp()
    const cards = NewCard(token,playerId,'Field',amount,timestamp)
    return cards.map(c => c.id)
}

export const PerformCreateCopy = (playerId:PlayerId,copyTarget:CardId,amount:number):CardId[] =>
{
    const timestamp = newTimestamp()
    const originalCard = GetCard(copyTarget)
    
    // Create new cards as copies, but they'll get the proper abilities set via ChangeZone
    const cards = NewCard(originalCard.name,playerId,'Field',amount,timestamp)
    
    // The NewCard -> ChangeZone process will automatically set up the proper abilities
    // from the card definition, so we don't need to manually copy abilities here
    
    return cards.map(c => c.id)
}

export const PerformCombat = (_firstStrike:boolean) =>
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