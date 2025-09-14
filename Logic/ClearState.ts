import { controller } from "../Network/Server"
import { EmptyCost } from "../Types/CostTypes"
import { CardId } from "../Types/IdCounter"
import { GetCard, GetPlayers } from "./GetCard"

export const ClearTempState = () =>
{
    controller.cards.forEach(c =>
        {
            c.abilities = []
            c.tribes = []
            c.cmc = 0
            c.power = 0
            c.toughness = 0
            c.canCast = []    
            c.keywords = []
        })
}

export const ClearEndOfTurnState = () =>
{
    GetPlayers().forEach(p =>
        {
            p.cardsDrawnThisTurn = 0
            p.spellsCastThisTurn = 0
            p.gainedLifeThisTurn = 0
            p.lostLifeThisTurn = 0
            p.cardsEnteredThisTurn = []
        })
    
    // Clear enteredThisTurn for all cards
    controller.cards.forEach(c =>
        {
            c.enteredThisTurn = false
        })
}

export const ClearCastState = (cardId:CardId) =>
{
    const card = GetCard(cardId)
    card.castPhase = 'None'
    card.castSelectedCost = EmptyCost
    card.castSelectedAbilities = []
    card.castSelectedEffects = []
    card.castSelectedName = card.name
    //keep X
}

export const ClearCardZoneState = (cardId:CardId) =>
{
    const card = GetCard(cardId)
    card.printedAbilities = []
    card.attacking = undefined
    card.blocking = []
    card.blockOrder = []
    card.counters = []
    card.effects = []
    card.damageMarked = 0
    card.revealed = false
    //keep X
}