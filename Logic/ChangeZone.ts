import { controller } from "../Network/Server";
import { ChangeZoneAction } from "../Types/GameActionTypes";
import { GetCardTitle } from "../Types/GetText";
import { PlayerId, newTimestamp } from "../Types/IdCounter";
import { Card } from "../Types/Types";
import { ZoneName } from "../Types/ZoneNames";
import { ClearCastState, ClearFieldState } from "./ClearState";
import { EvaluateNumber } from "./Evaluate";
import { ExecuteTrigger } from "./ExecuteTrigger";
import { GetCards, GetPlayer } from "./GetCard";

export const ChangeZone = (action:ChangeZoneAction) =>
{
    const {cardIds,zoneTo,source} = action
    const cards = GetCards(cardIds)

      const grouped = groupCardsByZoneAndPlayerId(cards)

      grouped.forEach(({playerId,zoneFrom,zoneCards}) => 
      {

        if(zoneFrom === zoneTo)
        {
            console.log("Same Zone")
            return;
        }

        const zoneCardIds = zoneCards.map(c => c.id)      

        switch(zoneFrom)
        {
            case 'Field':
                //Remove permanent info?
                zoneCardIds.forEach(zci => ClearFieldState(zci))
                break;
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
                zoneCardIds.forEach(zci => ClearCastState(zci))
                controller.stack.unshift(...zoneCardIds); 
                break;
            case 'FastStack':
                zoneCardIds.forEach(zci => ClearCastState(zci))
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
        }

        //Enter Triggers
        switch(zoneTo)
        {
            case 'Field': ExecuteTrigger("ETB",zoneCardIds); break;
        }

        if(zoneFrom !== 'AbilityHolding' && zoneFrom !== 'TokenHolding')
        {
            const timestamp = newTimestamp()
            zoneCards.forEach(c => {
                c.timestamp = timestamp
            })
        }
        
        console.log(`ChangeZone: ${zoneCards.map(c => GetCardTitle(c)).join(",")} from ${zoneFrom} to ${zoneTo}`)
        zoneCards.forEach(c => {
            c.previousZone = zoneFrom
            c.zone = zoneTo
        })

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
