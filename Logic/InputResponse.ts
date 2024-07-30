import { controller } from "../Network/Server";
import { GetCard } from "./GetCard";
import { PerformCast, SetCastMode, SetCastTargets, SetCastX } from "./MutateBoard";

export const ProcessInputResponse = () =>
{
    const input = controller.input!
    controller.input = undefined
    switch(input.name)
    {
        case 'PayInput':
            if(input.response.cardId !== null) //"Pass"
            {
                PerformCast(input.response.cardId,input.response.abilityTypeId)
            }
            
            //Then the mana-ability will resolve in fast time
            //If paid, continue, otherwise re-add

            break;

        case 'CastInput':
            if(input.response.cardId !== null) //"Pass"
            {
                PerformCast(input.response.cardId,input.response.abilityTypeId)
            }
            else
            {
                //Otherwise, pass priority
                controller.hasCastOrPassed = true;
            }
            break;

        case 'ModeInput':
            SetCastMode(input)
            break;

        case 'NumberInput':
            if(input.sourceEffectIndex != undefined)
            {
                //SetEffectChoice()
            }
            else
            {
                SetCastX(input)
            }
            break;
        
        case 'PairInput':
            switch(input.purpose)
            {
                case 'Attackers':
                    input.response.forEach(a => {
                        GetCard(a[0]).attacking = a[1]
                    })
                    break;
                case 'Blockers':
                    input.response.forEach(a => {
                        GetCard(a[0]).blocking = [a[1]]
                    })
                    break;
                default:
                    throw 'not implemented'+input.purpose
            }
            break;

        case 'ChooseInput':
            if(input.purpose === 'Effect')
            {
                SetCastTargets(input)
            }
            else
            {
                throw 'not implemented'+input.purpose
            }
            break;

        case 'BucketInput':

            if(input.purpose === 'OrderBlockers')
            {
                const attacker = GetCard(input.source)
                attacker.blockOrder = input.response[0]
            }

            break;

        case 'ButtonChooseInput':
            
            const effect = GetCard(input.source).effects[input.sourceEffectIndex!];

            (effect.context as any)[input.contextKey as any] = input.buttons[input.response]
            
            break;

        default:
            throw 'not implemented'
    }
}
