import { GameLoop } from "../Logic/GameLoop";
import { ServerInputRespond } from "../Network/Server";
import { CardName } from "../Types/CardNames";
import { CardId } from "../Types/IdCounter";
import { InputUnion } from "../Types/InputTypes";
import { PhaseName } from "../Types/PhaseNames";
import { InputName } from "../Types/Types";
import { ZoneName } from "../Types/ZoneNames";

export const Setup = (player:"Player"|"Opponent",zone:ZoneName,cardname:CardName):CardId =>
{
    return 1 as CardId
}

export const ToPhase = (player:"Player"|"Opponent",phase:PhaseName) =>
{
    TestLoop()
}
export const Respond = <T extends InputUnion>(response:T['response']) =>
{
    ServerInputRespond(response)
    TestLoop()
}

export const Target = (cardId:CardId) =>
{
    TestLoop()
}

export const TestLoop = () =>
{
    GameLoop()
}

/*
function Foo<T extends Bar>(bar: T, response: T['response']): void {
  // Function implementation
}
*/