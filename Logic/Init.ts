import { controller } from "../Network/Server"
import { CardName } from "../Cards/Common/CardNames"
import { PlayerId, newTimestamp } from "../Types/IdCounter"
import { Player } from "../Types/CardTypes"
import { PerformDrawCard } from "./MutateBoard"
import { NewCard } from "./GetCard"

type DeckCard = [CardName,number]
//const OpponentDeck:DeckCard[] = [["Mountain",3],["Lightning Bolt",2],["Flametongue Kavu",2],["Mountain",14],["Lightning Bolt",8],["Flametongue Kavu",12]]

//const PlayerDeck:DeckCard[] = [["Mountain",3],["Lightning Bolt",3],["Flametongue Kavu",2],["Mountain",14],["Lightning Bolt",18],["Flametongue Kavu",12]];
const OpponentDeck:DeckCard[] = [["Mountain",10]]

const PlayerDeck:DeckCard[] = [["Mountain",10]];

export const Init = () =>
{
    const timestamp = newTimestamp()
    NewCard("Player",1 as PlayerId,'Player',1,timestamp)
    NewCard("Opponent",2 as PlayerId,'Player',1,timestamp)
    
    var player:Player = controller.cards.find(c => c.name === "Player") as Player
    var opponent:Player = controller.cards.find(c => c.name === "Opponent") as Player
    
    player.life = 20
    player.library = []
    player.manaPool = []
    player.cardsDrawnThisTurn = 0
    player.spellsCastThisTurn = 0
    player.gainedLifeThisTurn = 0
    player.lostLifeThisTurn = 0
    player.cardsEnteredThisTurn = []
    
    opponent.life = 20
    opponent.library = []
    opponent.manaPool = []
    opponent.cardsDrawnThisTurn = 0
    opponent.spellsCastThisTurn = 0
    opponent.gainedLifeThisTurn = 0
    opponent.lostLifeThisTurn = 0
    opponent.cardsEnteredThisTurn = []
    
    PlayerDeck.forEach(dc => 
        {
            NewCard(dc[0],player.id,'Library',dc[1],timestamp,{direction:'Top',offset:0})
        })

    OpponentDeck.forEach(dc => 
        {
            NewCard(dc[0],opponent.id,'Library',dc[1],timestamp,{direction:'Top',offset:0})
        })


    NewCard("RainbowLand",player.id,'Field',4,timestamp)
    NewCard("RainbowLand",opponent.id,'Field',4,timestamp)

    //PerformShuffle(player.id)
    //PerformShuffle(opponent.id)

    PerformDrawCard(player.id, 7)
    PerformDrawCard(opponent.id, 7)
}
