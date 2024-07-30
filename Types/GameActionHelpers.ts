import { controller } from "../Network/Server"
import { GameActionUnion, LibrarySpecification } from "./GameActionTypes"
import { CardId } from "./IdCounter"
import { InputUnion } from "./InputTypes"
import { ZoneName } from "./ZoneNames"

const AddGameAction = (action:GameActionUnion) =>
{
    controller.actions.push(action)
}

export const AddInputGameAction = (input:InputUnion) =>
{
    AddGameAction({name:'InputAction', priority:1, input, cls:'GameAction'})
}


export const AddChangeZoneGameAction = (zoneTo:ZoneName,cardIds:CardId[],source:CardId,librarySpecification?:LibrarySpecification) =>
{

    if(cardIds.length === 0)
    {
        return;
    }
    if(zoneTo == 'Library' && !librarySpecification)
    {
        throw 'Missing Library Spec'
    }

    AddGameAction({name:'ChangeZoneAction', priority:1, cardIds, zoneTo, source, librarySpecification, cls:'GameAction'})
}

