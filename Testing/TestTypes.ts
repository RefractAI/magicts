import { ActualCardName, CardName } from "../Cards/Common/CardNames"
import { CardId } from "../Types/IdCounter"
import { PhaseName } from "../Types/PhaseNames"
import { InputName } from "../Types/InputTypes"
import { ZoneName } from "../Types/ZoneNames"
import { Controller } from "../Types/CardTypes"
import { ConditionName } from "../Types/ConditionNames"

export interface TestCard
{
    id:string
    cardName:CardName
    zone:ZoneName
    friendly:boolean
    position?: number  // For library positioning: 0 = top, 1 = second from top, etc.
}

export interface TestInput
{
    type:"Input"
    name:InputName | "PassPriority" | "PassUntil"
}

export interface TestCastInput extends TestInput
{
    name:"CastInput"
    targetCardId:string
    abilityIndex?:number  // Optional: specify which ability to activate (null = cast spell, 0-based index for abilities)
    chosenMode?:number    // Optional: specify which casting mode to use (index into options array)
}

export interface TestChooseInput extends TestInput
{
    name:"ChooseInput"
    targetCardId?:string        // For single target selection
    targetCardIds?:string[]     // For multiple target selection
}

export interface TestPayInput extends TestInput
{
    name:"PayInput"
    targetCardId:string
}

export interface TestButtonChooseInput extends TestInput
{
    name:"ButtonChooseInput"
    buttonText:string
}

export interface TestPairInput extends TestInput
{
    name:"PairInput"
    pairs:[from:string,to:string][]
}

export interface PassPriority extends TestInput
{
    name:"PassPriority"
}

export interface TestBooleanInput extends TestInput
{
    name:"BooleanInput"
    response:boolean
}

export interface PassUntil extends TestInput
{
    name:"PassUntil"
    phase:PhaseName
    friendly:boolean
}

export interface TestNumberInput extends TestInput
{
    name:"NumberInput"
    value:number
}

export interface TestBucketInput extends TestInput
{
    name:"BucketInput"
    buckets:string[][] // Array of buckets, each bucket is an array of card IDs
}

export type TestInputUnion = TestCastInput | TestChooseInput | TestPayInput | TestButtonChooseInput | TestPairInput | PassPriority | TestBooleanInput | PassUntil | TestNumberInput | TestBucketInput

export type TestStepUnion = TestInputUnion | AssertionUnion

export type AssertionType = "ConditionAssertion" | "TokenExists" | "EmblemExists" | "Life" | "Phase" | "CardsInZone" | "Name" | "NotImplemented" | "Debugger" | "ManaPool" | "CastCost"

export interface TestAssertion
{
    type:"Assertion"
    name:AssertionType
}

export interface TestCardAssertion extends TestAssertion
{
    targetCardId:string
}

export interface TestPhaseAssertion extends TestAssertion
{
    name:"Phase"
    expectedPhase:PhaseName
}

export interface TestTokenExistsAssertion extends TestAssertion
{
    name:"TokenExists",
    tokenTestCardIds:string[]
    tokenCardName:string
    zone:ZoneName
    friendly:boolean
    count:number
}

export interface TestEmblemExistsAssertion extends TestAssertion
{
    name:"EmblemExists",
    emblemTestCardIds:string[]
    emblemCardName:string
    zone:ZoneName
    friendly:boolean
    count:number
}

export interface TestLifeAssertion extends TestCardAssertion
{
    name:"Life"
    expectedLife:number
}

export interface TestCardsInZoneAssertion extends TestAssertion
{
    name:"CardsInZone"
    friendly:boolean
    zone:ZoneName
    expectedCount:number
}

export interface TestNotImplementedAssertion extends TestAssertion
{
    name:"NotImplemented"
    mechanicName:string
    description:string
}

export interface TestDebuggerAssertion extends TestAssertion
{
    name:"Debugger"
    debugFn:(controller: Controller) => void
}

export interface TestNameAssertion extends TestAssertion
{
    name:"Name"
    targetCardId:string
    cardName:ActualCardName
}

export interface TestManaPoolAssertion extends TestAssertion
{
    name:"ManaPool"
    friendly:boolean
    expectedMana:string
}

export interface TestConditionAssertion extends TestCardAssertion
{
    name:"ConditionAssertion"
    conditionName:ConditionName
    expectedValue?:any
}

export interface TestCastCostAssertion extends TestCardAssertion
{
    name:"CastCost"
    castModeIndex?:number    // Index of the casting mode/options (undefined = normal cast)
    abilityIndex?:number     // Index of the activated ability (undefined = cast spell)
    expectedCost:string      // Expected cost string like "2R" or "1UU"
}

export type AssertionUnion = TestConditionAssertion | TestCardsInZoneAssertion 
| TestLifeAssertion | TestNameAssertion
| TestPhaseAssertion | TestTokenExistsAssertion | TestEmblemExistsAssertion | TestManaPoolAssertion
| TestNotImplementedAssertion | TestDebuggerAssertion | TestCastCostAssertion

export interface Test
{
    name:string
    description:string  
    initialPhase:PhaseName
    initialCards:TestCard[]
    steps:TestStepUnion[]
}

export interface StepLog
{
    stepIndex: number
    stepType: string
    logs: string[]
    success: boolean
}

export interface Execution
{
    test:Test
    cardIdMap:Map<string,CardId>
    errors:Error[]
    passed:boolean
    stepLogs: StepLog[]
}
