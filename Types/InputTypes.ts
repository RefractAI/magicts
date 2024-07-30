import { CardName } from "./CardNames";
import { AbilityTypeId, CardId, PlayerId } from "./IdCounter";
import { ConditionContext, Cost, InputType, Option, ResolutionContext } from "./Types";

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

export interface ModeInput extends InputType
{
    name:'ModeInput',
    modes:Option[][],
    response:number
}

export interface CastSpecification
{
    playerId:PlayerId,
    cardId:CardId|null,
    abilityTypeId:AbilityTypeId|null
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
    response:CardId[]
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

export type InputUnion = NoneInput|CastInput|PayInput|BucketInput|NumberInput|BooleanInput|ChooseInput|CardNameInput|ModeInput|PairInput|ButtonChooseInput