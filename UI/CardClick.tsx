import { ClientGetCard } from "./ClientGetCard";
import { GetAbilityText } from "../Types/GetText";
import { ClientInputRespond } from "../Network/Client";
import { CardId } from "../Types/IdCounter";
import { InputUnion } from "../Types/InputTypes";
import { Controller, Selectable } from "../Types/Types";

export function CardClick(id: CardId, selectable: Selectable, input: InputUnion, selected: CardId[], setSelected: (selected: CardId[]) => void, context: Controller, setContext: (context: Controller) => void, setButtons: (buttons: string[]) => void, setInput: (input: InputUnion) => void): void {
  const card = ClientGetCard(id);
  const playerId = context.active2;
  switch (input.name) {
    case 'CastInput':
    case 'PayInput':
      if (input?.allowed.includes(id)) {

        const castingOptions = card.canCast.filter(c => c.playerId === playerId);
        if (castingOptions.length === 0) {
          throw 'uncastable - ' + id;
        }
        if (castingOptions.length == 1) {
          input.response = castingOptions[0];
          ClientInputRespond(input.response, setContext, setInput);
        }

        else {
          //More than one option, cast or activate ability
          setSelected([id]);
          setButtons(castingOptions.map(c => c.abilityTypeId ? GetAbilityText(c.abilityTypeId) : ClientGetCard(c.cardId!).name));
        }
      }

      else {
        console.log('Click not allowed for this card');
      }
      break;

    case 'ChooseInput':

      switch (selectable) {
        case 'Allowed':
          if (input.min === 1 && input.max === 1) {
            ClientInputRespond([id], setContext, setInput);
          }

          else {
            setSelected([...selected, id]);
          }
          break;
        case 'Selected': setSelected(selected.filter(s => s !== id)); break;
        default: console.log('Click not allowed for this card'); break;
      }

      break;

      case 'BucketInput':

      switch (selectable) {
        case 'Allowed': setSelected([id]); break;
        case 'Selected': setSelected([]); break;
        default: console.log('Click not allowed for this card'); break;
      }

      break;

      case 'PairInput':

      switch (selectable) {
        case 'Allowed':
        case 'Paired':

          if(input.toCards.length === 1)
          {
            if(input.response.some(i => i[0] === id))
            {
              //Already in list, remove
              setInput({...input, response: input.response.filter(i => i[0] !== id)})
            }
            else
            {
              //Add the single pair
              setInput({...input, response: [...input.response.filter(i => i[0] !== id),[id,input.toCards[0]]]})
            }          
          }
          else
          {
            //Select the first one
            setSelected([id]);
            setInput({...input, response: input.response.filter(i => i[0] !== id)})
          }
          
          break;
        case 'Selected': 
          setSelected([]); 
          break;
        case 'Other':
          if(selected[0])
          {
            setInput({...input, response: [...input.response,[selected[0],id]]})
            setSelected([]); 
          }
        break;
        default: console.log('Click not allowed for this card'); break;
      }

      break;

    case 'BucketInput':

      switch (selectable) {
        case 'Allowed':
          setSelected([...selected, id]);
          break;
        case 'Selected': setSelected(selected.filter(s => s !== id)); break;
        default: console.log('Click not allowed for this card'); break;
      }

      break;

    default:
      console.log('Click not allowed in this event');
  }
}
