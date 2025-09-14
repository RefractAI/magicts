import { AbilityEffect } from "../Types/EffectTypes";
import { Effect } from "../Types/EffectTypes";
import { GetCard, GetController, NewCard } from "../Logic/GetCard";
import { ToAbility } from "../Types/AbilityTypes";
import { newTimestamp } from "../Types/IdCounter";

export const ResolveAbilityEffect = ({source,context}: Effect, {abilities,target}: AbilityEffect) => {

    const timestamp = newTimestamp()
    const targets = context.targets[0]

    if(target.cls === 'NoneCondition')
    {
        console.log("ExecuteTrigger:","WhenYouDo")

        const ability = abilities[0]
        NewCard('Ability',GetController(source),'Stack',1,timestamp,undefined,source,[source],ability.id)[0]
        
        return true;
    }

    targets.forEach(target => {

        //Now pass the context (populated from parent effect) to the ability
        //e,g. selectedX from this effect is passed to the ability
        const newAbilities = abilities.map(a => ToAbility(a,source,timestamp,context))
        GetCard(target).printedAbilities.push(...newAbilities)
        
    });

    return true;
};
