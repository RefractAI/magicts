import { GetCardType } from "../Logic/GetCard"
import { AbilityTypeId, CardId, PlayerId } from "../Types/IdCounter"
import { CastInput, ChooseInput } from "../Types/InputTypes"
import { Respond } from "./TestSteps"

export const CastTest = (cardId:CardId,abilityNumber:number=-1) => 
{
    if(abilityNumber != -1)
    {
        const abilityTypeId = GetCardType(cardId).options[0].abilities[abilityNumber].id
        Respond<CastInput>(({playerId:1 as PlayerId,cardId,abilityTypeId}))
    }
    else
    {
        Respond<CastInput>(({playerId:1 as PlayerId,cardId,abilityTypeId:null}))
    }
   
}
export const ChooseTest = (...cardIds:CardId[]) => Respond<ChooseInput>(cardIds)