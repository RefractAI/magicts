import { controller } from "../Network/Server"
import { GameActionUnion, LibrarySpecification } from "./GameActionTypes"
import { CardId } from "./IdCounter"
import { InputUnion } from "./InputTypes"
import { ZoneName } from "./ZoneNames"
import { EffectUnion } from "./EffectTypes"

const AddGameAction = (action:GameActionUnion) =>
{
    controller.actions.push(action)
}

export const AddInputGameAction = (input:InputUnion) =>
{
    AddGameAction({name:'InputAction', priority:1, input, cls:'GameAction'})
}


export const AddChangeZoneGameAction = (zoneTo:ZoneName,cardIds:CardId[],source:CardId,reason:string,librarySpecification?:LibrarySpecification) =>
{

    if(cardIds.length === 0)
    {
        return;
    }
    if(zoneTo == 'Library' && !librarySpecification)
    {
        throw 'Missing Library Spec'
    }

    AddGameAction({name:'ChangeZoneAction', priority:1, cardIds, zoneTo, source, reason, librarySpecification, cls:'GameAction'})
}

export const AddReplacementEffectGameAction = (source:CardId, effects:EffectUnion[]) =>
{
    AddGameAction({name:'ReplacementEffectAction', priority:1, source, effects, cls:'GameAction'})
}

