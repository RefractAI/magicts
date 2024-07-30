import { controller } from "../Network/Server"
import { ActivatedAbility, BasePowerToughnessAbility, ColorAbility, DelayedTriggeredAbility, KeywordAbility, PowerAbility, PowerToughnessAbility, ToughnessAbility, TribeAbility, TriggeredAbility } from "../Types/AbilityClass"
import { GetAbilityType } from "../Types/AbilityClassHelpers"
import { ActualCardName, CardName, TokenName, TokenNames } from "../Types/CardNames"
import { CardTypes, TokenTypes } from "../Types/CardTypes"
import { EmptyCost } from "../Types/CostHelpers"
import { PlayerId, CardId, newCardId, Timestamp } from "../Types/IdCounter"
import { IsPlayer, IsTribe } from "../Types/IsCard"
import { TribeName } from "../Types/TribeNames"
import { Ability, AbilityClass, AbilityType, Card, CardType, Effect, Player } from "../Types/Types"
import { ZoneName } from "../Types/ZoneNames"

export const GetPlayer = (playerId:PlayerId):Player =>
{
    const c = controller.cards.find(c => c.id == playerId)! as Player
    if(!c) {throw 'Player not found'+playerId}
    return c
}

export const GetPlayers = () => controller.cards.filter(c => IsPlayer(c)) as Player[]
export const GetTribe = (t:TribeName) => controller.cards.filter(c => IsTribe(c,t))

export const Opponent = (playerId:PlayerId):PlayerId => playerId === 1 as PlayerId ? 2 as PlayerId : 1 as PlayerId

export const GetCard = (cardId:CardId):Card =>
{
    const c = controller.cards.find(c => c.id == cardId)! as Card
    if(!c) {throw 'Card not found'+cardId}
    return c
}

export const GetController = (cardId:CardId):PlayerId =>
{
    return GetCard(cardId).controller
}

export const GetCards = (cardIds:CardId[]):Card[] =>
{
    return cardIds.map(c => GetCard(c))
}

export const GetCardType = (cardId:CardId):CardType =>
{
    const card = GetCard(cardId)
    if(card.name === 'Ability')
    {
        if(!card.abilitySourceAbilityId)
        {
            throw 'Missing Ability Source Definition'
        }
        const abilityType = GetAbilityType(card.abilitySourceAbilityId) as ActivatedAbility | TriggeredAbility | DelayedTriggeredAbility
        return ({name:'Ability',options:abilityType.options,cls:'CardType' })
    }
    if(card.name in TokenNames)
    {
        return TokenTypes[card.name as TokenName]
    }
    else if (card.name in CardTypes)
    {
        return CardTypes[card.name as ActualCardName]
    }
    else
    {
        throw 'Card type not found:'+card.name
    }
}


export const GetBaseOption = (cardId:CardId) => GetCardType(cardId).options[0]

export const GetEffect = (cardId:CardId,effectIndex:number):Effect =>
{
    const card = GetCard(cardId)
    return card.effects[effectIndex];
}

export const NewCard = (name:CardName,controller:PlayerId,zone:ZoneName,timestamp:Timestamp):Card =>
({
    name
    ,id:name == 'Player' || name == 'Opponent' ? controller : newCardId()
    ,controller
    ,zone
    ,previousZone:zone
    ,abilities:[]
    ,abilityTypes:[]
    ,cls:'Card'
    ,power:0
    ,toughness:0
    ,cost:EmptyCost
    ,tribes:[]
    ,colors:[]
    ,cmc:0
    ,tapped:false
    ,counters:[]
    ,blockOrder:[]
    ,blocking:[]
    ,damageMarked:0
    ,canCast:[]
    ,castPhase:'None'
    ,castSelectedCost:undefined
    ,castSelectedX:0
    ,castSelectedOption:undefined
    ,effects:[]
    ,keywords:[]
    ,timestamp
    ,summoningSickness:true
})

export const GetBasePowerToughnessAbility = (card:Card) => GetAbilitiesOfType(card,'BasePowerToughnessAbility') as [a:Ability,at:BasePowerToughnessAbility][]
export const GetPowerAbilities = (card:Card) => GetAbilitiesOfType(card,'PowerAbility') as [a:Ability,at:PowerAbility][]
export const GetToughnessAbilities = (card:Card) => GetAbilitiesOfType(card,'ToughnessAbility') as [a:Ability,at:ToughnessAbility][]
export const GetPowerToughnessAbilities = (card:Card) => GetAbilitiesOfType(card,'PowerToughnessAbility') as [a:Ability,at:PowerToughnessAbility][]
export const GetTribeAbilities = (card:Card) => GetAbilitiesOfType(card,'TribeAbility') as [a:Ability,at:TribeAbility][]
export const GetColorAbilities = (card:Card) => GetAbilitiesOfType(card,'ColorAbility') as [a:Ability,at:ColorAbility][]
export const GetTriggeredAbilities = (card:Card) => GetAbilitiesOfType(card,'TriggeredAbility') as [a:Ability,at:TriggeredAbility][]
export const GetActivatedAbilities = (card:Card) => GetAbilitiesOfType(card,'ActivatedAbility') as [a:Ability,at:ActivatedAbility][]
export const GetKeywordAbilities = (card:Card) => GetAbilitiesOfType(card,'KeywordAbility') as [a:Ability,at:KeywordAbility][]

const GetAbilitiesOfType = (card:Card,cls:AbilityClass) => card.abilities.map(a => [a,GetAbilityType(a.type)] as [a:Ability,at:AbilityType]).filter(aat => aat[1].abilityCls === cls)