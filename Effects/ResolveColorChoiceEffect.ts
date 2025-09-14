import { ColorChoiceEffect } from "../Types/EffectTypes";
import { Effect } from "../Types/EffectTypes";
import { PlayerId } from "../Types/IdCounter";
import { AddButtonChooseInputGameAction } from "../Types/InputTypesHelpers";

export const ResolveColorChoiceEffect = (effect: Effect, type: ColorChoiceEffect) => {

    const {source,context} = effect;
    const {choices} = type;
    const target = context.targets[0][0]

    if(context.chosenColor)
    {
        return true;
    }
    else
    {
        AddButtonChooseInputGameAction(target as PlayerId, "Choose color", source, choices, effect.effectIndex,'chosenColor')
        return false;
    }

   
};
