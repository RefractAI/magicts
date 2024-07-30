import { controller } from "../Network/Server"
import { CardName } from "../Types/CardNames"
import { PlayerId, Timestamp, newTimestamp } from "../Types/IdCounter"
import { Player } from "../Types/Types"
import { PerformShuffle, PerformDrawCard } from "./MutateBoard"
import { GetBaseOption, GetPlayer, NewCard } from "./GetCard"
import { ZoneName } from "../Types/ZoneNames"
import { ToAbility } from "../Types/AbilityClassHelpers"

type DeckCard = [CardName,number]
const OpponentDeck:DeckCard[] = [["Mountain",3],["Lightning Bolt",2],["Flametongue Kavu",2],["Mountain",14],["Lightning Bolt",8],["Flametongue Kavu",12]]

const PlayerDeck:DeckCard[] = [["Mountain",3],["Lightning Bolt",3],["Flametongue Kavu",2],["Mountain",14],["Lightning Bolt",18],["Flametongue Kavu",12]];

export const Init = () =>
{
    const timestamp = newTimestamp()
    var player:Player = NewCard("Player",1 as PlayerId,'Player',timestamp) as Player
    var opponent:Player = NewCard("Opponent",2 as PlayerId,'Player',timestamp) as Player
    player = {...player, life:20, library:[], manaPool:[]}
    opponent = {...opponent, life:20, library:[], manaPool:[]}
    controller.cards.push(player)
    controller.cards.push(opponent)
    
    PlayerDeck.forEach(dc => 
        {
            AddToZone(player.id,dc[0],'Library',dc[1],timestamp)
        })

    OpponentDeck.forEach(dc => 
        {
            AddToZone(opponent.id,dc[0],'Library',dc[1],timestamp)
        })

    controller.phase = 'BeginCombat'

    AddToZone(player.id,"Mountain","Field",4,timestamp)
    AddToZone(opponent.id,"Mountain","Field",4,timestamp)
    AddToZone(player.id,"Flametongue Kavu","Field",2,timestamp)
    AddToZone(opponent.id,"Flametongue Kavu","Field",2,timestamp)

    //PerformShuffle(player.id)
    //PerformShuffle(opponent.id)

    PerformDrawCard(player.id, 7)
    PerformDrawCard(opponent.id, 7)
}

const AddToZone = (playerId:PlayerId,name:CardName,zone:ZoneName,amount:number,timestamp:Timestamp) =>
{
    for(var i=0;i<amount;i++)
    {
        const newCard = NewCard(name,playerId,zone,timestamp)
        controller.cards.push(newCard)
        if(zone === 'Field')
        {
            newCard.abilityTypes = GetBaseOption(newCard.id).abilities.map(a => ToAbility(a,newCard.id,timestamp,{targets:[]}))
        }
        if(zone === 'Library')
        {
            GetPlayer(playerId).library.push(newCard.id)
        }
    }
}