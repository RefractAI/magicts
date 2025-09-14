import { TribeName } from "./TribeNames"
import { Card } from "./CardTypes"
import { Color } from "./ColorTypes"
import { CounterType } from "./CounterTypes"
import { KeywordName } from "./KeywordTypes"

export const IsTribe = (card:Card,tribe:TribeName):boolean => card.tribes.some(t => t === tribe)
export const IsColor = (card:Card,color:Color):boolean => card.colors.some(c => c === color)
export const IsKeyword = (card:Card,keyword:KeywordName):boolean => card.keywords.some(k => k === keyword)

export const IsPowerN = (card:Card,power:number):boolean => card.power === power
export const IsToughnessN = (card:Card,toughness:number):boolean => card.toughness === toughness
export const IsCMCN = (card:Card,cmc:number):boolean => card.cmc === cmc
export const IsPowerNOrGreater = (card:Card,power:number):boolean => card.power >= power
export const IsToughnessNOrGreater = (card:Card,toughness:number):boolean => card.toughness >= toughness
export const IsCMCNOrGreater = (card:Card,cmc:number):boolean => card.cmc >= cmc
export const IsPowerNOrLess = (card:Card,power:number):boolean => card.power < power
export const IsToughnessNOrLess = (card:Card,toughness:number):boolean => card.toughness <= toughness
export const IsCMCNOrLess = (card:Card,cmc:number):boolean => card.cmc <= cmc

export const IsPermanent = (c:Card):boolean => ["Artifact","Enchantment","Creature","Battle","Planeswalker"].some(t => IsTribe(c, t as TribeName))
export const IsCreature = (c:Card):boolean => IsTribe(c, "Creature")
export const IsInstant = (c:Card):boolean => IsTribe(c, "Instant")
export const IsSorcery = (c:Card):boolean => IsTribe(c, "Sorcery")
export const IsArtifact = (c:Card):boolean => IsTribe(c, "Artifact")
export const IsEnchantment = (c:Card):boolean => IsTribe(c, "Enchantment")
export const IsBattle = (c:Card):boolean => IsTribe(c, "Battle")
export const IsLand = (c:Card):boolean => IsTribe(c, "Land")

export const IsPlayer = (c:Card):boolean => IsTribe(c, "Player")
export const IsPlaneswalker = (c:Card):boolean => IsTribe(c, "Planeswalker")
export const IsToken = (c:Card):boolean => IsTribe(c, "Token")
export const IsAbility = (c:Card):boolean => IsTribe(c, "Ability")
export const HasCounter = (c:Card,counter:CounterType):boolean => c.counters.filter(c => c === counter).length >= 0
export const HasCountersOrMore = (c:Card,counter:CounterType,amount:number):boolean => c.counters.filter(c => c === counter).length >= amount
export const HasCountersOrLess = (c:Card,counter:CounterType,amount:number):boolean => c.counters.filter(c => c === counter).length <= amount

export const IsHand = (c:Card) => c.zone === 'Hand'
export const IsLibrary = (c:Card) => c.zone === 'Library'
export const IsGraveyard = (c:Card) => c.zone === 'Graveyard'
export const IsExile = (c:Card) => c.zone === 'Exile'
