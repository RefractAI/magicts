import { AddInputGameAction } from "./GameActionHelpers"
import { GetCostText } from "./GetText"
import { PlayerId, CardId } from "./IdCounter"
import { BucketInputBucket, InputKind } from "./InputTypes"
import { ResolutionContext } from "./CardTypes"
import { Cost } from "./CostTypes"

export const AddCastInputGameAction = (source:PlayerId,allowed:CardId[]) =>
{
    AddInputGameAction({
        name:'CastInput'
        , prompt:'Play a card or pass'
        , allowed
        , response:({playerId:source,cardId:null,abilityTypeId:null})
        , responded: false
        , source
        , playerId:source
        , purpose:'Cast'
    })
}

export const AddPayInputGameAction = (playerId:PlayerId,source:CardId,allowed:CardId[],cost:Cost) =>
{
    AddInputGameAction({
        name:'PayInput'
        , prompt:'Pay '+GetCostText(cost)
        , cost
        , allowed
        , response:({playerId,cardId:null,abilityTypeId:null})
        , responded: false
        , source
        , playerId
        , purpose:'Cast'
    })
}

export const AddNumberInputGameAction = (playerId:PlayerId,source:CardId,min:number,max:number,sourceEffectIndex?:number,contextKey?:keyof ResolutionContext,contextKeyIndex?:number) =>
{
    AddInputGameAction({
        name:'NumberInput'
        , prompt:`Choose a number from ${min} to ${max}`
        , min
        , max
        , sourceEffectIndex
        , contextKey
        , contextKeyIndex
        , response:0
        , responded: false
        , source
        , playerId
        , purpose:'Effect'
    })
}

export const AddChooseInputGameAction = (playerId:PlayerId,prompt:string,source:CardId,min:number,max:number,allowed:CardId[],sourceEffectIndex?:number,contextKey?:keyof ResolutionContext,contextKeyIndex?:number,validationFunction?:string) =>
{
    AddInputGameAction({
        name:'ChooseInput'
        , prompt
        , min
        , max
        , allowed
        , sourceEffectIndex
        , contextKey
        , contextKeyIndex
        , response:[]
        , responded: false
        , source
        , playerId
        , purpose:'Effect'
        , validationFunction
    })
}

export const AddBooleanInputGameAction = (playerId:PlayerId,prompt:string,source:CardId,sourceEffectIndex?:number,contextKey?:keyof ResolutionContext,contextKeyIndex?:number) =>
{
    AddInputGameAction({
        name:'BooleanInput'
        , prompt
        , sourceEffectIndex
        , contextKey
        , contextKeyIndex
        , response: false
        , responded: false
        , source
        , playerId
        , purpose:'Effect'
    })
}

export const AddButtonChooseInputGameAction = (playerId:PlayerId,prompt:string,source:CardId,buttons:string[],sourceEffectIndex?:number,contextKey?:keyof ResolutionContext,contextKeyIndex?:number) =>
{
    AddInputGameAction({
        name:'ButtonChooseInput'
        , prompt
        , buttons
        , sourceEffectIndex
        , contextKey
        , contextKeyIndex
        , response:-1
        , responded: false
        , source
        , playerId
        , purpose:'Effect'
    })
}

export const AddPairInputGameAction = (
    playerId:PlayerId,
    prompt:string,
    source:CardId,
    allowed:CardId[],
    toCards:CardId[],
    purpose:InputKind,
    requiredFroms:CardId[] = [],
    requiredTos:CardId[] = [],
    requiredPairs:[CardId,CardId][] = [],
    sourceEffectIndex?:number,
    contextKey?:keyof ResolutionContext,
    contextKeyIndex?:number
) =>
{
    AddInputGameAction({
        name:'PairInput'
        , prompt
        , allowed
        , toCards
        , requiredFroms
        , requiredTos
        , requiredPairs
        , sourceEffectIndex
        , contextKey
        , contextKeyIndex
        , response:[]
        , responded: false
        , source
        , playerId
        , purpose
    })
}

export const AddBucketInputGameAction = (playerId:PlayerId,prompt:string,source:CardId,buckets:BucketInputBucket[],requiresOrder:boolean,purpose:InputKind,sourceEffectIndex?:number,contextKey?:keyof ResolutionContext,contextKeyIndex?:number) =>
{
    const response = buckets.map(b => b.initial)

    AddInputGameAction({
        name:'BucketInput'
        , prompt
        , buckets
        , sourceEffectIndex
        , contextKey
        , contextKeyIndex
        , response
        , responded: false
        , source
        , playerId
        , requiresOrder
        , purpose
    })
}