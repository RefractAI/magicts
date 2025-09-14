import { controller } from "../Network/Server"
import { ActivatedAbility, BasePowerToughnessAbility, BaseTribeAbility, CastingOptionAbility, ColorAbility, CostModificationAbility, DelayedTriggeredAbility, HasAllAbilitiesOfAbility, KeywordAbility, PowerAbility, PowerToughnessAbility, ReplacementEffectAbility, ToughnessAbility, TribeAbility, TriggeredAbility } from "../Types/AbilityTypes"
import { GetAbilityType } from "../Types/AbilityTypes"
import { ActualCardName, CardName, TokenName, TokenNames, EmblemName, EmblemNames } from "../Cards/Common/CardNames"
import { CardTypes, TokenTypes, EmblemTypes } from "../Cards/Common/CardTypes"
import { EmptyCost } from "../Types/CostTypes"
import { PlayerId, CardId, newCardId, Timestamp, AbilityTypeId } from "../Types/IdCounter"
import { IsPlayer, IsTribe } from "../Types/IsCard"
import { TribeName } from "../Types/TribeNames"
import { Card, CardType, Player } from "../Types/CardTypes"
import { Ability, AbilityClass, AbilityType } from "../Types/AbilityTypes"
import { Effect } from "../Types/EffectTypes"
import { ZoneName } from "../Types/ZoneNames"
import { ChangeZone } from "./ChangeZone"
import { LibrarySpecification } from "../Types/GameActionTypes"

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
    if(!c) {
        throw new Error('Card not found:'+cardId)
    }
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
    if(card.name === 'Ability' && !card.abilitySourceAbilityId)
    {
        throw 'Missing Ability Source Definition 2'
    }
    return GetCardTypeFromCardName(card.name, card.abilitySourceAbilityId)
}

export const GetCardTypeFromCardName = (cardName:CardName, abilitySourceAbilityId?:AbilityTypeId):CardType =>
{
    if(cardName === 'Ability')
    {
        if(!abilitySourceAbilityId)
        {
            throw 'Missing Ability Source Definition'
        }
        const abilityType = GetAbilityType(abilitySourceAbilityId) as ActivatedAbility | TriggeredAbility | DelayedTriggeredAbility
        return ({name:'Ability',abilities:abilityType.abilities,effects:abilityType.effects,cls:'CardType',cost:abilityType.cost })
    }
    if(TokenNames.includes(cardName as TokenName))
    {
        return TokenTypes[cardName as TokenName]
    }
    else if(EmblemNames.includes(cardName as EmblemName))
    {
        return EmblemTypes[cardName as EmblemName]
    }
    else if (cardName in CardTypes)
    {
        return CardTypes[cardName as ActualCardName]
    }
    else
    {
        throw 'Card type not found:'+cardName
    }
}

export const GetEffect = (cardId:CardId,effectIndex:number):Effect =>
{
    const card = GetCard(cardId)
    const effect = card.effects[effectIndex]
    if(!effect)
    {
        console.trace()
        throw 'Effect not found:'+cardId+','+effectIndex+','+JSON.stringify(card.effects)
    }
    return effect
}

export const NewCard = (name:CardName,playerId:PlayerId,zone:ZoneName,amount:number,timestamp:Timestamp,librarySpecification?:LibrarySpecification,abilitySourceId?:CardId,abilitySourceSourceIds?:CardId[],abilitySourceAbilityId?:AbilityTypeId):Card[] =>
{
    const cardIds:CardId[] = Array(amount).fill(0).map(() => name == 'Player' || name == 'Opponent' ? playerId : newCardId())

    const cards = cardIds.map(id => 
    {
        const card:Card = ({
        name
        ,originalName:name
        ,id
        ,controller:playerId
        ,zone:'NewCardHolding'
        ,previousZone:'NewCardHolding'
        ,abilities:[]
        ,printedAbilities:[]
        ,cls:'Card'
        ,power:0
        ,toughness:0
        ,cost:EmptyCost
        ,tribes:[]
        ,colors:[]
        ,cmc:0
        ,tapped:false
        ,revealed:false
        ,counters:[]
        ,blockOrder:[]
        ,blocking:[]
        ,damageMarked:0
        ,canCast:[]
        ,options:[]
        ,castPhase:'None'
        ,castSelectedCost:EmptyCost
        ,castSelectedX:0
        ,castSelectedAbilities:[]
        ,castSelectedEffects:[]
        ,castSelectedName:name
        ,effects:[]
        ,selectedOptions:[]
        ,keywords:[]
        ,timestamp
        ,summoningSickness:false //For testing, remove summoning sickness
        ,enteredThisTurn:false
        })
        if(name === 'Ability')
        {
            if(!abilitySourceAbilityId || !abilitySourceId || !abilitySourceSourceIds)
            {
                throw 'Missing Ability Type ID'
            }
            card.abilitySourceAbilityId = abilitySourceAbilityId
            card.abilitySourceId = abilitySourceId
            card.abilitySourceSourceIds = abilitySourceSourceIds
        }
        controller.cards.push(card)
        return card
    });
    ChangeZone({cardIds,zoneTo:zone,librarySpecification,source:playerId,reason:'NewCard',name:'ChangeZoneAction',priority:0,cls:'GameAction'})
    return cards
}

export const GetBasePowerToughnessAbility = (card:Card) => GetAbilitiesOfType(card,'BasePowerToughnessAbility') as [a:Ability,at:BasePowerToughnessAbility][]
export const GetPowerAbilities = (card:Card) => GetAbilitiesOfType(card,'PowerAbility') as [a:Ability,at:PowerAbility][]
export const GetToughnessAbilities = (card:Card) => GetAbilitiesOfType(card,'ToughnessAbility') as [a:Ability,at:ToughnessAbility][]
export const GetPowerToughnessAbilities = (card:Card) => GetAbilitiesOfType(card,'PowerToughnessAbility') as [a:Ability,at:PowerToughnessAbility][]
export const GetBaseTribeAbilities = (card:Card) => GetAbilitiesOfType(card,'BaseTribeAbility') as [a:Ability,at:BaseTribeAbility][]
export const GetTribeAbilities = (card:Card) => GetAbilitiesOfType(card,'TribeAbility') as [a:Ability,at:TribeAbility][]
export const GetColorAbilities = (card:Card) => GetAbilitiesOfType(card,'ColorAbility') as [a:Ability,at:ColorAbility][]
export const GetTriggeredAbilities = (card:Card) => GetAbilitiesOfType(card,'TriggeredAbility') as [a:Ability,at:TriggeredAbility][]
export const GetActivatedAbilities = (card:Card) => GetAbilitiesOfType(card,'ActivatedAbility') as [a:Ability,at:ActivatedAbility][]
export const GetKeywordAbilities = (card:Card) => GetAbilitiesOfType(card,'KeywordAbility') as [a:Ability,at:KeywordAbility][]
export const GetCastingOptionAbilities = (card:Card) => GetAbilitiesOfType(card,'CastingOptionAbility') as [a:Ability,at:CastingOptionAbility][]
export const GetCostModificationAbilities = (card:Card) => GetAbilitiesOfType(card,'CostModificationAbility') as [a:Ability,at:CostModificationAbility][]
export const GetReplacementEffectAbilities = (card:Card) => GetAbilitiesOfType(card,'ReplacementEffectAbility') as [a:Ability,at:ReplacementEffectAbility][]
export const GetHasAllAbilitiesOfAbilities = (card:Card) => GetAbilitiesOfType(card,'HasAllAbilitiesOfAbility') as [a:Ability,at:HasAllAbilitiesOfAbility][]

const GetAbilitiesOfType = (card:Card,cls:AbilityClass) => card.abilities.map(a => [a,GetAbilityType(a.type)] as [a:Ability,at:AbilityType]).filter(aat => aat[1].abilityCls === cls)