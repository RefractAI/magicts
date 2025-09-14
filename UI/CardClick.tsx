import { ClientGetCard } from "./ClientGetCard";
import { GetAbilityText } from "../Types/GetText";
import { ClientInputRespond } from "../Network/Client";
import { CardId } from "../Types/IdCounter";
import { InputUnion } from "../Types/InputTypes";
import { Controller } from "../Types/CardTypes";
import { Selectable } from "../Types/UITypes";
import { GetCastModeSummary } from "../Types/OptionTypes";

export function CardClick(id: CardId, selectable: Selectable, input: InputUnion, selected: CardId[], setSelected: (selected: CardId[]) => void, context: Controller, setContext: (context: Controller) => void, setButtons: (buttons: string[]) => void, setInput: (input: InputUnion) => void, isHoldingPriority: boolean): void {
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
        
        // Check if we need to show cast mode selection
        const needsModeSelection = castingOptions.length === 1 && !castingOptions[0].abilityTypeId && 
          (card.options.length > 1 || (card.options.length === 1 && card.options[0].length > 0));
        
        console.log(`CardClick debug for ${card.name}:`, {
          castingOptionsLength: castingOptions.length,
          hasAbilityTypeId: castingOptions[0]?.abilityTypeId,
          optionsLength: card.options.length,
          firstOptionLength: card.options[0]?.length,
          needsModeSelection,
          options: card.options
        });
        
        if (castingOptions.length === 1 && !needsModeSelection) {
          // Single option, no mode selection needed
          input.response = castingOptions[0];
          ClientInputRespond('CastInput', input.response, setContext, setInput, !isHoldingPriority);
        } else if (needsModeSelection) {
          // Single spell casting option but multiple cast modes - show mode selection
          setSelected([id]);
          const modeButtons = [];
          
          // Add normal cast option if available
          if (card.options.length === 0 || card.options.some(optionGroup => optionGroup.length === 0)) {
            modeButtons.push(`${card.name} (Normal cast)`);
          }
          
          // Add cast mode options
          card.options.forEach((optionGroup, _index) => {
            if (optionGroup.length > 0) {
              // Special handling for split cards - show individual sides
              if (optionGroup.length === 1 && optionGroup[0].optionType === 'Split' && optionGroup[0].cardName) {
                modeButtons.push(`Cast ${optionGroup[0].cardName}`);
              } else if (optionGroup.length === 1 && optionGroup[0].optionType === 'Transform' && optionGroup[0].cardName) {
                modeButtons.push(`Transform to ${optionGroup[0].cardName}`);
              } else {
                const castModeText = GetCastModeSummary(optionGroup);
                modeButtons.push(`${card.name} (${castModeText})`);
              }
            }
          });
          
          console.log(`Generated mode buttons for ${card.name}:`, modeButtons);
          setButtons(modeButtons);
        } else {
          // Multiple casting options (abilities vs spells) or complex combinations
          setSelected([id]);
          setButtons(castingOptions.map(c => {
            if (c.abilityTypeId) {
              return GetAbilityText(c.abilityTypeId);
            } else {
              // This is a casting option - show the cast mode summary
              const cardName = ClientGetCard(c.cardId!).name;
              if (c.chosenMode !== undefined) {
                const card = ClientGetCard(c.cardId!);
                const castModeOptions = card.options[c.chosenMode] || [];
                const castModeText = GetCastModeSummary(castModeOptions);
                return castModeOptions.length > 0 ? `${cardName} (${castModeText})` : cardName;
              }
              return cardName;
            }
          }));
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
            ClientInputRespond('ChooseInput', [id], setContext, setInput, !isHoldingPriority);
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

    default:
      console.log('Click not allowed in this event');
  }
}
