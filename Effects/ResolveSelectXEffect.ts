import { SelectXEffect, Effect } from "../Types/EffectTypes";
import { GetCard, GetController } from "../Logic/GetCard";
import { AddNumberInputGameAction } from "../Types/InputTypesHelpers";

export const ResolveSelectXEffect = (effect: Effect, _selectXEffect: SelectXEffect) => {
    const { source, effectIndex, context } = effect;
    const controllerId = GetController(source);
    const sourceCard = GetCard(source);

    if(effect.executionCount === 1) //First time we've seen this effect
    {
        console.log("SelectXEffect: Requesting X choice from player");
        AddNumberInputGameAction(
            controllerId,
            source,
            0, // min
            20, // max
            effectIndex,
            'selectedX'
        );
        return false; // Wait for input
    }
    
    // Check if X has already been selected
    if (context.selectedX === undefined) 
    {
        throw 'Expected selectedX to be set'
    }

    // Store the selected X value in the source card's castSelectedX
    sourceCard.castSelectedX = context.selectedX;
    console.log(`SelectXEffect: X = ${context.selectedX} selected and stored`);

    //Specifically for selected X, because normal effects have been created already without X being chosen yet, we need to update the context of all Normal effects on this card to have the correct selectedX
    sourceCard.effects.forEach(effect => {
        effect.context.selectedX = context.selectedX;
    });
    
    return true;
    
    
};