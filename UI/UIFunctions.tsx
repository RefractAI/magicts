import { ClientGetCard } from "./ClientGetCard";
import { ClientInputRespond } from "../Network/Client";
import { CardId } from "../Types/IdCounter";
import { InputUnion, CastInput, BucketInput } from "../Types/InputTypes";
import { Controller } from "../Types/CardTypes";

export function ButtonClick(buttonNumber:number, input:InputUnion, selected:CardId[], setSelected:(selected:CardId[]) => void, context:Controller, setContext:(context:Controller) => void, _:string[], setButtons:(buttons:string[]) => void,setInput:(input:InputUnion) => void, isHoldingPriority: boolean): void 
{
  const playerId = context.active2
  switch(input.name)
  {
      case 'CastInput':
      case 'PayInput':
            const card = ClientGetCard(selected[0])
            const castingOptions = card.canCast.filter(c => c.playerId === playerId)
            
            // Check if we're in cast mode selection vs casting option selection
            const needsModeSelection = castingOptions.length === 1 && !castingOptions[0].abilityTypeId && 
              (card.options.length > 1 || (card.options.length === 1 && card.options[0].length > 0));
            
            if (needsModeSelection) {
              // Handle cast mode selection
              let chosenMode: number | undefined = buttonNumber;
              
              // If we have a "Normal cast" option, adjust the mode index
              const hasNormalCastingOption = card.options.length === 0 || card.options.some(optionGroup => optionGroup.length === 0);
              if (hasNormalCastingOption && buttonNumber === 0) {
                chosenMode = undefined; // Normal cast, no specific mode
              } else if (hasNormalCastingOption) {
                chosenMode = buttonNumber - 1; // Adjust for normal cast option
              }
              
              const selectedOption = castingOptions[0];
              input.response = ({
                playerId,
                cardId: selectedOption.cardId,
                abilityTypeId: selectedOption.abilityTypeId,
                chosenMode
              });
            } else {
              // Handle regular casting option selection (abilities vs spells)
              const selectedOption = castingOptions[buttonNumber]
              input.response = ({
                playerId,
                cardId: selectedOption.cardId,
                abilityTypeId: selectedOption.abilityTypeId,
                chosenMode: selectedOption.chosenMode
              });
            }
            
            ClientInputRespond('CastInput', input.response, setContext, setInput, !isHoldingPriority)
       
            //Clear selection
            setButtons([])
            setSelected([])

        break;
      case 'ButtonChooseInput':
        ClientInputRespond('ButtonChooseInput', buttonNumber, setContext, setInput, !isHoldingPriority)
        break;
      default:
        console.log('Button not allowed in this event')
  }
}


export function PassPriorityClick(_input:CastInput,context:Controller,setContext:(context:Controller) => void,setInput:(input:InputUnion) => void, isHoldingPriority: boolean = false)
{
  ClientInputRespond('CastInput', ({playerId:context.active2,cardId:null,abilityTypeId:null}), setContext, setInput, !isHoldingPriority)
}

export function AcceptClick(selected:CardId[],input:InputUnion,setContext:(context:Controller) => void,setInput:(input:InputUnion) => void, isHoldingPriority: boolean = false)
{
  //Validate
  var valid = true;
  switch(input.name)
  {

    case 'BucketInput':
      input.buckets.forEach((b,i) =>
      {
        if(input.response[i].length > b.max){
          console.log("Card count over max")
          valid = false
        }
        if(input.response[i].length < b.min){
          console.log("Card count under min")
          valid = false
        }
      })

      break;

    case 'PairInput':
        //todo check valid attack/block pairs
        
        break;

    case 'ChooseInput':
        if(selected.length > input.max){
          console.log("Card count over max")
          valid = false
        }
        if(selected.length < input.min){
          console.log("Card count under min")
          valid = false
        }
        if(valid)
        {
          input.response = selected
        }
        
        break;

    case 'NumberInput':
        if(input.response > input.max){
          console.log("Card count over max")
          valid = false
        }
        if(input.response < input.min){
          console.log("Card count under min")
          valid = false
        }
        break;

    default: break;
  }

  if(valid)
  {
    ClientInputRespond(input.name as any, input.response, setContext, setInput, !isHoldingPriority)
  }
}

export function LeftClick(input:BucketInput,setInput:(input:BucketInput) => void,selected:CardId[])
{
  const cardArrays = moveCardLeft(input.response,selected[0], input.requiresOrder)

  setInput({...input, response:cardArrays})
}

export function RightClick(input:BucketInput,setInput:(input:BucketInput) => void,selected:CardId[])
{
  const cardArrays = moveCardRight(input.response,selected[0], input.requiresOrder)

  setInput({...input, response:cardArrays})
}

function moveCardLeft(
  cardArrays: CardId[][],
  selectedCardId: CardId,
  requiresOrder:boolean
): CardId[][] {
  // Find the array that contains the selected card
  const selectedCardIndex = cardArrays.findIndex((arr) =>
    arr.includes(selectedCardId)
  );

  // If the card is not found in any array, return the original arrays
  if (selectedCardIndex === -1) {
    return cardArrays;
  }

  const selectedCardArr = cardArrays[selectedCardIndex];
  const selectedCardIdx = selectedCardArr.indexOf(selectedCardId);

  // Create a new array without the selected card
  const newSelectedCardArr = [...selectedCardArr];
  newSelectedCardArr.splice(selectedCardIdx, 1);

  // If the card is at the left edge of its array, move it to the right edge of the previous array
  if (selectedCardIdx === 0 || !requiresOrder) {

    if (selectedCardIndex === 0) {
      //Left edge of left bucket
      return cardArrays;
    } else {
      // Move the card to the end of the previous array
      const prevArr = cardArrays[selectedCardIndex - 1];
      return [
        ...cardArrays.slice(0, selectedCardIndex - 1),
        [...prevArr, selectedCardId],
        newSelectedCardArr,
        ...cardArrays.slice(selectedCardIndex + 1),
      ];
    }
  }

  // Otherwise, move the card to the left within its array
  const newArr = [
    ...newSelectedCardArr.slice(0, selectedCardIdx - 1),
    selectedCardId,
    ...newSelectedCardArr.slice(selectedCardIdx - 1),
  ];

  return [
    ...cardArrays.slice(0, selectedCardIndex),
    newArr,
    ...cardArrays.slice(selectedCardIndex + 1),
  ];
}

function moveCardRight(
  cardArrays: CardId[][],
  selectedCardId: CardId,
  requiresOrder:boolean
): CardId[][] {
  // Find the array that contains the selected card
  const selectedCardIndex = cardArrays.findIndex((arr) =>
    arr.includes(selectedCardId)
  );

  // If the card is not found in any array, return the original arrays
  if (selectedCardIndex === -1) {
    return cardArrays;
  }

  const selectedCardArr = cardArrays[selectedCardIndex];
  const selectedCardIdx = selectedCardArr.indexOf(selectedCardId);

  // Create a new array without the selected card
  const newSelectedCardArr = [...selectedCardArr];
  newSelectedCardArr.splice(selectedCardIdx, 1);

  // If the card is at the right edge of its array, move it to the left edge of the next array
  if (selectedCardIdx === selectedCardArr.length - 1 || !requiresOrder) {
    if (selectedCardIndex === cardArrays.length - 1) {
      return cardArrays;
    } else {
      // Move the card to the beginning of the next array
      const nextArr = cardArrays[selectedCardIndex + 1];
      return [
        ...cardArrays.slice(0, selectedCardIndex),
        newSelectedCardArr,
        [selectedCardId, ...nextArr],
        ...cardArrays.slice(selectedCardIndex + 2),
      ];
    }
  }

  // Otherwise, move the card to the right within its array
  const newArr = [
    ...newSelectedCardArr.slice(0, selectedCardIdx + 1),
    selectedCardId,
    ...newSelectedCardArr.slice(selectedCardIdx + 1),
  ];

  return [
    ...cardArrays.slice(0, selectedCardIndex),
    newArr,
    ...cardArrays.slice(selectedCardIndex + 1),
  ];
}