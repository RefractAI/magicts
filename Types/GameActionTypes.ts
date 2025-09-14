import { CardId } from "./IdCounter";
import { InputUnion } from "./InputTypes";
import { NumberDef } from "./ConditionTypes";
import { ZoneName } from "./ZoneNames";
import { EffectUnion } from "./EffectTypes";

export type GameActionName = 'None'|'InputAction'|'ChangeZoneAction'|'ReplacementEffectAction'

export interface GameAction
{
    name:GameActionName,
    priority:number,
    cls:'GameAction'
}

export interface InputAction extends GameAction
{
    input:InputUnion,
    name:'InputAction'
}

export interface ChangeZoneAction extends GameAction
{
    cardIds:CardId[],
    zoneTo:ZoneName,
    librarySpecification?:LibrarySpecification,
    source:CardId,
    reason:string,
    name:'ChangeZoneAction'
}

export interface ReplacementEffectAction extends GameAction
{
    source:CardId,
    effects:EffectUnion[],
    name:'ReplacementEffectAction'
}

export type LibraryDirection = 'Top'|'Bottom'

export interface LibrarySpecification
{
    direction:LibraryDirection
    offset:NumberDef
}

export type GameActionUnion = InputAction | ChangeZoneAction | ReplacementEffectAction