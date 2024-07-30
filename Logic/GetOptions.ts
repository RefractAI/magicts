import { CardType, Option } from "../Types/Types";

export const GetOptions = (card: CardType): Option[][] => {
    const options = card.options;
    const result: Option[][] = [];
  
    const recursiveCombine = (currentOptionIndex: number, currentCombination: Option[]) => {
      if (currentOptionIndex === options.length) {
        result.push([...currentCombination]);
        return;
      }
  
      const currentOption = options[currentOptionIndex];
      if (currentOption.optionType === 'Must') {
        recursiveCombine(currentOptionIndex + 1, [...currentCombination, currentOption]);
      } else {
        recursiveCombine(currentOptionIndex + 1, currentCombination); // skip this option
        recursiveCombine(currentOptionIndex + 1, [...currentCombination, currentOption]); // include this option
      }
    };
  
    recursiveCombine(0, []);
    return result.filter(r => r.length > 0);
  };