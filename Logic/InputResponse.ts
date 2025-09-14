import { controller } from "../Network/Server";
import { GetCard } from "./GetCard";
import { PerformCast, SetCastTargets, SetCastX } from "./MutateBoard";
import { ExecuteTrigger } from "./ExecuteTrigger";
import { PairInput } from "../Types/InputTypes";
import { ValidationFunctions } from "./ValidationFunctions";

const ValidatePairInputResponse = (input: PairInput) => {
    // Check that all required specific pairs are included
    for (const [requiredFrom, requiredTo] of input.requiredPairs) {
        const found = input.response.find(([from, to]) => from === requiredFrom && to === requiredTo);
        if (!found) {
            throw new Error(`Required pair missing: ${requiredFrom} must be paired with ${requiredTo}`);
        }
    }
    
    // Check that all required froms are paired with something
    for (const requiredFrom of input.requiredFroms) {
        const found = input.response.find(([from, _to]) => from === requiredFrom);
        if (!found) {
            throw new Error(`Required from missing: ${requiredFrom} must be paired with something`);
        }
    }
    
    // Check that all required tos have something paired with them
    for (const requiredTo of input.requiredTos) {
        const found = input.response.find(([_from, to]) => to === requiredTo);
        if (!found) {
            throw new Error(`Required to missing: something must be paired with ${requiredTo}`);
        }
    }
};

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
                PerformCast(input.response.cardId,input.response.abilityTypeId,input.response.chosenMode)
            }
            else
            {
                //Otherwise, pass priority
                if (controller.active2 === controller.active) {
                    controller.activePlayerPassed = true;
                } else {
                    controller.nonActivePlayerPassed = true;
                }
            }
            break;

        case 'NumberInput':
            if(input.sourceEffectIndex != undefined)
            {
                const numberEffect = GetCard(input.source).effects[input.sourceEffectIndex];
                (numberEffect.context as any)[input.contextKey as any] = input.response;
            }
            else
            {
                SetCastX(input)
            }
            break;
        
        case 'PairInput':
            // Validate that all required pairs are included in the response
            ValidatePairInputResponse(input);
            
            switch(input.purpose)
            {
                case 'Attackers':
                    const attackerIds = input.response.map(a => a[0]);
                    input.response.forEach(a => {
                        const attacker = GetCard(a[0]);
                        attacker.attacking = a[1];
                        // Tap attacking creatures unless they have Vigilance
                        if (!attacker.keywords.includes('Vigilance')) {
                            attacker.tapped = true;
                        }
                    })
                    // Execute OnAttack triggers for all attacking creatures
                    if (attackerIds.length > 0) {
                        ExecuteTrigger("OnAttack", attackerIds);
                    }
                    break;
                case 'Blockers':
                    input.response.forEach(a => {
                        GetCard(a[0]).blocking = [a[1]]
                    })
                    break;
                default:
                    throw 'Unknown input purpose:'+input.purpose
            }
            break;

        case 'ChooseInput':
            // Validate with custom validation function if provided
            if(input.validationFunction && ValidationFunctions[input.validationFunction])
            {
                const isValid = ValidationFunctions[input.validationFunction](input.response);
                if(!isValid)
                {
                    throw `Validation failed for ${input.validationFunction}: invalid choice`;
                }
            }
            
            if(input.purpose === 'Effect')
            {
                SetCastTargets(input)
            }
            else
            {
                throw 'Unknown input purpose:'+input.purpose
            }
            break;

        case 'BucketInput':

            if(input.purpose === 'OrderBlockers')
            {
                const attacker = GetCard(input.source)
                attacker.blockOrder = input.response[0]
            }
            else if(input.purpose === 'Effect' && input.contextKey && input.sourceEffectIndex !== undefined)
            {
                const sourceCard = GetCard(input.source);
                const effect = sourceCard.effects[input.sourceEffectIndex];
                if (effect && input.contextKey) {
                    (effect.context as any)[input.contextKey] = input.response;
                }
            }

            break;

        case 'ButtonChooseInput':
            
            const effect = GetCard(input.source).effects[input.sourceEffectIndex!];

            if (input.response === undefined || input.response === null || !input.buttons || !input.buttons[input.response])
            {
                throw 'Invalid response to ButtonChooseInput:'+input.response
            }

            (effect.context as any)[input.contextKey as any] = input.buttons[input.response]
            
            break;

        case 'BooleanInput':
            
            const booleanEffect = GetCard(input.source).effects[input.sourceEffectIndex!];

            (booleanEffect.context as any)[input.contextKey as any] = input.response
            
            break;

        default:
            throw 'Not implemented input name:'+input.name
    }
}
