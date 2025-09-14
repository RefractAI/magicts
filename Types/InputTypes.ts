import { CardName } from "../Cards/Common/CardNames";
import { AbilityTypeId, CardId, PlayerId } from "./IdCounter";
import { ResolutionContext } from "./CardTypes";
import { Cost } from "./CostTypes";

export type InputName = 'NoneInput'|'CastInput'|'PayInput'|'NumberInput'|'BooleanInput'|'BucketInput'|'ChooseInput'|'CardNameInput'|'PairInput'|'ButtonChooseInput'

export interface InputType
{
    name:InputName,
    prompt:string,
    response:any,
    responded:boolean,
    playerId:PlayerId,
    purpose:InputKind

    source:CardId, //Player, spell or ability that requires the choice
    sourceEffectIndex?:number, //For that card, effect that requires card choice
    contextKey?:keyof ResolutionContext //For that effect, the context key to return the results to
    contextKeyIndex?:number  //For that context key, the array index to return the results to
}

export interface NoneInput extends InputType
{
    name:'NoneInput'
}

export interface CastInput extends InputType
{
    name:'CastInput',
    allowed:CardId[],
    response:CastSpecification
}

export interface CastSpecification
{
    playerId:PlayerId,
    cardId:CardId|null,
    abilityTypeId:AbilityTypeId|null,
    chosenMode?:number // Index of chosen casting option
}

export interface PayInput extends InputType
{
    cost:Cost,
    name:'PayInput',
    allowed:CardId[],
    response:CastSpecification // i.e. action to pay
}

export interface ChooseInput extends InputType
{
    name:'ChooseInput',
    min:number,
    max:number,
    allowed:CardId[],
    response:CardId[],
    validationFunction?:string
}

export interface ButtonChooseInput extends InputType
{
    name:'ButtonChooseInput',
    buttons:string[],
    response:number
}

export type InputKind = 'Attackers'|'Blockers'|'OrderBlockers'|'Effect'|'Cast'

export interface PairInput extends InputType
{
    name:'PairInput',
    allowed:CardId[],
    toCards:CardId[],
    requiredFroms:CardId[], // Cards that must be paired with something
    requiredTos:CardId[], // Cards that must have something paired with them
    requiredPairs:[from:CardId,to:CardId][], // Specific pairs that must be included
    response:[from:CardId,to:CardId][]
}

export interface NumberInput extends InputType
{
    name:'NumberInput',
    min:number,
    max:number,
    response:number
}

export interface CardNameInput extends InputType
{
    allowed:CardName[]
    name:'CardNameInput',
    response:CardName
}

export interface BooleanInput extends InputType
{
    name:'BooleanInput',
    response:boolean
}

export interface BucketInputBucket
{
    prompt:string,
    initial:CardId[],
    min:number,
    max:number
}

export interface BucketInput extends InputType
{
    prompt:string,
    buckets:BucketInputBucket[]
    name:'BucketInput'
    response:CardId[][],
    requiresOrder:boolean
}

export type InputUnion = NoneInput|CastInput|PayInput|BucketInput|NumberInput|BooleanInput|ChooseInput|CardNameInput|PairInput|ButtonChooseInput