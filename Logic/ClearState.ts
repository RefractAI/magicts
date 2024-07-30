import { controller } from "../Network/Server"
import { CardId } from "../Types/IdCounter"
import { GetCard } from "./GetCard"

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

export const ClearCastState = (cardId:CardId) =>
{
    const card = GetCard(cardId)
    card.castPhase = 'None'
    card.castSelectedCost = undefined
    card.castSelectedOption = undefined
    //keep X
}

export const ClearFieldState = (cardId:CardId) =>
{
    const card = GetCard(cardId)
    card.abilityTypes = []
    card.abilitySourceAbilityId = undefined
    card.abilitySourceId = undefined
    card.abilitySourceSourceIds = undefined
    card.attacking = undefined
    card.blocking = []
    card.blockOrder = []
    card.counters = []
    card.effects = []
    card.damageMarked = 0
    //keep X
}
