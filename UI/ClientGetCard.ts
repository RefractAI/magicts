import { clientState } from "../Network/Client"
import { PlayerId, CardId } from "../Types/IdCounter"
import { Player, Card } from "../Types/Types"

export const ClientGetPlayer = (playerId:PlayerId):Player =>
{
    const c = clientState.cards.find(c => c.id == playerId)! as Player
    if(!c) {throw 'Player not found'+playerId}
    return c
}

export const ClientGetCard = (cardId:CardId):Card =>
{
    const c = clientState.cards.find(c => c.id == cardId)! as Card
    if(!c) {throw 'Card not found'+cardId}
    return c
}