import { ButtonChoiceEffect } from "../Types/EffectTypes";
import { Effect } from "../Types/EffectTypes";
import { AddButtonChooseInputGameAction } from "../Types/InputTypesHelpers";
import { GetController } from "../Logic/GetCard";
import { PlayerId } from "../Types/IdCounter";

export const ResolveButtonChoiceEffect = (effect: Effect, buttonChoiceEffect: ButtonChoiceEffect) => {
    const {source, effectIndex, context} = effect;
    const {buttonChoice} = context;
    
    console.log("ResolveButtonChoiceEffect called with buttonChoice:", buttonChoice, "choices:", buttonChoiceEffect.choices);

    if(buttonChoice === undefined) {
        console.log("ButtonChoiceEffect requesting button choice input");
        // Get the target player from context (first target should be the player who makes the choice)
        // If no target is specified, default to the source controller (friendly player)
        const targetPlayerId = (context.targets && context.targets[0] && context.targets[0][0]) 
            ? context.targets[0][0] 
            : GetController(source);
        if(targetPlayerId > 2)
        {
            throw 'target player should be a PlayerId'
        }
        AddButtonChooseInputGameAction(
            targetPlayerId as PlayerId, 
            "Choose an option", 
            source, 
            buttonChoiceEffect.choices, 
            effectIndex, 
            'buttonChoice'
        );
        return false; // Wait for input
    }

    console.log("ButtonChoiceEffect resolved with choice:", buttonChoice);
    
    // Find the index of the chosen button
    const choiceIndex = buttonChoiceEffect.choices.indexOf(buttonChoice);

    effect.selectedThenEffects = buttonChoiceEffect.effectGroups[choiceIndex];
     
    return true;
};