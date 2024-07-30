import { AbilityEffect } from "../Types/EffectClass";
import { Effect } from "../Types/Types";
import { GetCard, GetController, NewCard } from "../Logic/GetCard";
import { ToAbility } from "../Types/AbilityClassHelpers";
import { newTimestamp } from "../Types/IdCounter";
import { controller } from "../Network/Server";
import { AddChangeZoneGameAction } from "../Types/GameActionHelpers";

export const ResolveAbilityEffect = ({source,context}: Effect, {abilities,target}: AbilityEffect) => {

    const timestamp = newTimestamp()
    const targets = context.targets[0]

    if(target.cls === 'NoneCondition')
    {
        console.log("ExecuteTrigger","WhenYouDo")
            const ability = abilities[0]
            const triggeredAbility = NewCard('Ability',GetController(source),'AbilityHolding',timestamp)
            triggeredAbility.abilitySourceId = source
            triggeredAbility.abilitySourceSourceIds = [source]
            triggeredAbility.abilitySourceAbilityId = ability.id
            controller.cards.push(triggeredAbility)

            AddChangeZoneGameAction("Stack",[triggeredAbility.id],source)
        return true;
    }

    targets.forEach(target => {

        //Now pass the context (populated from parent effect) to the ability
        const newAbilities = abilities.map(a => ToAbility(a,source,timestamp,context))
        GetCard(target).abilityTypes.push(...newAbilities)
        
    });

    return true;
};
