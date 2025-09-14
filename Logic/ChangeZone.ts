import { controller } from "../Network/Server";
import { ChangeZoneAction } from "../Types/GameActionTypes";
import { GetCardTitle } from "../Types/GetText";
import { CardId, PlayerId, newTimestamp } from "../Types/IdCounter";
import { Card } from "../Types/CardTypes";
import { ZoneName } from "../Types/ZoneNames";
import { ClearCardZoneState } from "./ClearState";
import { EvaluateNumber } from "./Evaluate";
import { ExecuteTrigger } from "./ExecuteTrigger";
import { GetCards, GetPlayer, GetCardType, GetCard } from "./GetCard";
import { ToAbility, GetAbilityType } from "../Types/AbilityTypes";
import { CalculateAbilities } from "./CalculateAbilities";
import { HandleCardNameChange } from "./NameChange";
import { EntersWithCountersAbility } from "../Types/AbilityTypes";
import { PerformAddCounter } from "./MutateBoard";
import { GetAbilitiesAndEffectsFromCastingOption } from "../Types/OptionTypes";
import { EmptyCost } from "../Types/CostTypes";

export const ChangeZone = (action:ChangeZoneAction) =>
{
    const {cardIds,zoneTo,source,reason} = action
    const cards = GetCards(cardIds)

      const grouped = groupCardsByZoneAndPlayerId(cards)

      grouped.forEach(({playerId,zoneFrom,zoneCards}) => 
      {

        if(zoneFrom === zoneTo)
        {
            console.log(`Attempting to change ${zoneCards.map(c => GetCardTitle(c)).join(",")} zone to same zone: ${zoneFrom} to ${zoneTo}`)
            return;
        }

        const zoneCardIds = zoneCards.map(c => c.id)      

        switch(zoneFrom)
        {
            case 'Stack':
                controller.stack = controller.stack.filter(s => !zoneCardIds.includes(s))
                break;
            case 'FastStack':
                controller.fastStack = controller.fastStack.filter(s => !zoneCardIds.includes(s))
                break;
            case 'Library':
                const player = GetPlayer(playerId)
                player.library = player.library.filter(s => !zoneCardIds.includes(s))
                break; 
        }

        switch(zoneTo)
        {
            case 'Stack':
                controller.stack.unshift(...zoneCardIds); 
                break;
            case 'FastStack':
                controller.fastStack.push(...zoneCardIds); 
                break;
            case 'Library':
                if(!action.librarySpecification)
                {
                    throw 'Missing library spec'
                }
                const amount = EvaluateNumber(source,source,action.librarySpecification.offset,{targets:[]})
                const library = GetPlayer(playerId).library
                if(action.librarySpecification.direction === 'Top')
                {
                    library.splice(amount,0,...zoneCardIds)
                }
                else
                {
                    const reverseIds = [...zoneCardIds]
                    reverseIds.reverse()
                    library.splice(amount,library.length-1,...reverseIds)
                }     
                break; 
        }

        //Leave Triggers
        switch(zoneFrom)
        {
            case 'Field': ExecuteTrigger("LTB",zoneCardIds); break;
            break;
        }

        const timestamp = newTimestamp()

        console.log(`ChangeZone: ${zoneCards.map(c => GetCardTitle(c)).join(",")} from ${zoneFrom} to ${zoneTo}. Reason: (${reason})`)
        zoneCards.forEach(c => {
            c.timestamp = timestamp
            c.previousZone = zoneFrom
            c.zone = zoneTo
            c.enteredThisTurn = true // Mark that this card entered a zone this turn

            //Clear all state from the card
            ClearCardZoneState(c.id)

            if (zoneTo === 'Stack')
            {
                ClearCardCastState(c.id)
                // Centralize cast selections:
                if (c.name === 'Ability') {
                    // Ability card: base from ability definition
                    const abilityCardType = GetCardType(c.id)
                    c.castSelectedAbilities = abilityCardType.abilities
                    c.castSelectedEffects = abilityCardType.effects
                    c.castSelectedName = 'Ability' as any
                    c.castSelectedCost = abilityCardType.cost
                } else {
                    // Spell card: start from its base card definition
                    const baseType = GetCardType(c.id)
                    let abilities = baseType.abilities
                    let effects = baseType.effects
                    let name: any = c.name
                    let cost = baseType.cost

                    // If selectedOptions exist (alternate/transform/split), override from options
                    if (c.selectedOptions && c.selectedOptions.length > 0) {
                        const merged = c.selectedOptions.map(o => GetAbilitiesAndEffectsFromCastingOption(o))
                        abilities = merged.flatMap(m => m.abilities)
                        effects = merged.flatMap(m => m.effects)
                        // name: last provided name wins if any option specifies
                        const withName = merged.find(m => m.name)
                        if (withName && withName.name) {
                            name = withName.name
                        }
                        // cost: use first option's cost if provided (e.g., AlternateCost)
                        const costOpt = c.selectedOptions.find(o => o.cost)
                        if (costOpt && costOpt.cost) {
                            cost = costOpt.cost
                        }
                    }

                    c.castSelectedAbilities = abilities
                    c.castSelectedEffects = effects
                    c.castSelectedName = name
                    c.castSelectedCost = cost
                }

                // Apply selected name to the card when it hits the stack
                c.name = c.castSelectedName
                HandleCardNameChange(c.id,c.name)
            }
            else if (zoneFrom === 'Stack' && zoneTo === 'Field')
            {
                //Apply selected options from CastInfo when resolving from stack
                c.name = c.castSelectedName
                c.cost = c.castSelectedCost
                c.printedAbilities = c.castSelectedAbilities.map(a => ToAbility(a,c.id,c.timestamp,{targets:[]}))
            }
            else 
            {
                HandleCardNameChange(c.id,c.name)
            }

        })

        //Now that all new cards have their base abilities, calculate all abilities
        //Potentially move trigger execution to its own GameAction
        CalculateAbilities()

        //Apply EntersWithCounters abilities for cards entering the field
        if(zoneTo === 'Field') {
            zoneCardIds.forEach(cardId => {
                const card = GetCards([cardId])[0];
                card.printedAbilities.forEach(ability => {
                    const abilityType = GetAbilityType(ability.type);
                    if(abilityType.abilityCls === 'EntersWithCountersAbility') {
                        const entersWithCountersAbility = abilityType as EntersWithCountersAbility;
                        const amount = EvaluateNumber(card, card, entersWithCountersAbility.amount, {targets:[]});
                        for(let i = 0; i < amount; i++) {
                            PerformAddCounter(cardId, entersWithCountersAbility.counterType);
                        }
                    }
                });
            });
        }

        //Track cards entering the battlefield
        if(zoneTo === 'Field') {
            zoneCardIds.forEach(cardId => {
                const card = GetCard(cardId);
                const player = GetPlayer(card.controller);
                if(!player.cardsEnteredThisTurn.includes(cardId)) {
                    player.cardsEnteredThisTurn.push(cardId);
                }
            });
        }

        //Enter Triggers - moved after abilities are applied
        switch(zoneTo)
        {
            case 'Field': ExecuteTrigger("ETB",zoneCardIds); break;
        }

    })
}

interface GroupedCards {
    zoneFrom: ZoneName;
    playerId: PlayerId;
    zoneCards: Card[];
  }


const groupCardsByZoneAndPlayerId = (cards: Card[]) => {
    return Array.from(
      cards.reduce((acc, card) => {
        const key = `${card.zone},${card.controller}`;
        if (!acc.has(key)) {
          acc.set(key, { zoneFrom: card.zone, playerId: card.controller, zoneCards: [] });
        }
        acc.get(key)!.zoneCards.push(card);
        return acc;
      }, new Map<string, GroupedCards>()),
      ([_, value]) => value
    );
  };

const ClearCardCastState = (id: CardId) =>
{
    const card = GetCard(id)
    card.castSelectedAbilities = []
    card.castSelectedEffects = []
    card.castSelectedName = card.originalName
    card.castSelectedCost = EmptyCost
}

