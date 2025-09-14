import { MayEffect } from "../Types/EffectTypes";
import { Effect } from "../Types/EffectTypes";
import { AddBooleanInputGameAction } from "../Types/InputTypesHelpers";
import { GetController } from "../Logic/GetCard";

export const ResolveMayEffect = (effect: Effect, _: MayEffect) => {
    const {source,effectIndex,context} = effect;
    const {mayInput} = context
    console.log("ResolveMayEffect called with mayInput:", mayInput, "context:", JSON.stringify(context, null, 2));

    if(mayInput === undefined)
    {
        console.log("MayEffect requesting Boolean input");
        AddBooleanInputGameAction(GetController(source), "May?", source, effectIndex, 'mayInput')
        return false;
    }

    console.log("MayEffect resolved with mayInput:", mayInput);
    
    // If the choice is "No", clear the selectedThenEffects so they won't be created
    if(!mayInput) {
        console.log("MayEffect choice was No, clearing selectedThenEffects");
        effect.selectedThenEffects = [];
    }

    return true;
};
