import { InputUnion, CastInput } from "../Types/InputTypes";
import { Controller } from "../Types/CardTypes";
import { ServerInputRespond, controller } from "./Server";
import { ClientGetCard } from "../UI/ClientGetCard";
import { GetAbilityType } from "../Types/AbilityTypes";


export var clientState:Controller = {...controller}

// Helper function to check if there are any non-mana abilities available
const hasNonManaAbilities = (input: CastInput): boolean => {
  const currentPlayer = input.playerId;
  const allowedCards = input.allowed;
  const availableAbilities: string[] = [];
  
  for (const cardId of allowedCards) {
    const card = ClientGetCard(cardId);
    for (const castSpec of card.canCast) {
      if (castSpec.playerId === currentPlayer) {
        if (castSpec.abilityTypeId === null) {
          // This is casting the card itself, not an ability - non-mana
          availableAbilities.push(`${card.name} (spell)`);
          //console.log('No auto-pass priority - allowed abilities:', availableAbilities);
          return true;
        } else {
          // This is an activated ability - check if it's a mana ability
          const abilityType = GetAbilityType(castSpec.abilityTypeId);
          if (abilityType.abilityCls === 'ActivatedAbility') {
            if (!abilityType.isManaAbility) {
              availableAbilities.push(`${card.name} (${abilityType.abilityCls})`);
              //console.log('No auto-pass priority - allowed abilities:', availableAbilities);
              return true;
            } else {
              availableAbilities.push(`${card.name} (mana ability)`);
            }
          } else if (abilityType.abilityCls === 'TriggeredAbility') {
            if (!abilityType.isManaAbility) {
              availableAbilities.push(`${card.name} (${abilityType.abilityCls})`);
              //console.log('No auto-pass priority - allowed abilities:', availableAbilities);
              return true;
            } else {
              availableAbilities.push(`${card.name} (mana ability)`);
            }
          } else {
            // Other ability types are non-mana
            availableAbilities.push(`${card.name} (${abilityType.abilityCls})`);
            //console.log('No auto-pass priority - allowed abilities:', availableAbilities);
            return true;
          }
        }
      }
    }
  }
  
  if (availableAbilities.length > 0) {
    console.log('Only mana abilities available - auto-passing priority:', availableAbilities);
  }
  return false;
};

export function ClientUpdate(setContext:(context:Controller) => void,setInput:(input:InputUnion) => void, autoPassPriority: boolean = false)
{
    //Client
    clientState = {...controller}
    setContext(clientState)
    setInput(clientState.input!)
    
    // Auto-pass priority if enabled and only mana abilities available
    if (autoPassPriority && clientState.input?.name === 'CastInput') {
      if (!hasNonManaAbilities(clientState.input)) {
        // Automatically pass priority
        console.log('Auto-pass priority')
        ServerInputRespond('CastInput', {playerId: clientState.active2, cardId: null, abilityTypeId: null});
        // Recursively update after auto-pass
        ClientUpdate(setContext, setInput, autoPassPriority);
      }
    }

    //Auto-respond if ChooseInput and the number of targets is equal to the minimum
    if(clientState.input?.name === 'ChooseInput' && clientState.input.allowed.length === clientState.input.min)
    {
        ServerInputRespond('ChooseInput', clientState.input.allowed);
        ClientUpdate(setContext, setInput, autoPassPriority);
    }
}

export function ClientInputRespond<T extends InputUnion> (expectedInputType: T['name'], response:T['response'],setContext:(context:Controller) => void,setInput:(input:InputUnion) => void, autoPassPriority: boolean = false)
{
  ServerInputRespond(expectedInputType, response)
  ClientUpdate(setContext,setInput, autoPassPriority)
}