import { CardId } from "./IdCounter";
import { InputUnion } from "./InputTypes";
import { GameAction, NumberDef } from "./Types";
import { ZoneName } from "./ZoneNames";

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
    source:CardId
    name:'ChangeZoneAction'
}

export type LibraryDirection = 'Top'|'Bottom'

export interface LibrarySpecification
{
    direction:LibraryDirection
    offset:NumberDef
}

export type GameActionUnion = InputAction | ChangeZoneAction