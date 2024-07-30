import { controller } from "../Network/Server";
import { AddChangeZoneGameAction } from "../Types/GameActionHelpers";
import { CardId, newTimestamp } from "../Types/IdCounter";
import { TriggerName } from "../Types/TriggerNames";
import { GetConditionCards } from "./Evaluate";
import { GetTriggeredAbilities, NewCard } from "./GetCard";

export const ExecuteTrigger = (triggerName:TriggerName,triggerSources:CardId[]) =>
{
    const triggers = controller.cards.flatMap(c => GetTriggeredAbilities(c)
    .filter(ta => ta[1].trigger === triggerName)
    .map(ta => ({ta,sources:GetConditionCards(c,ta[1].triggerSourceCondition,ta[0].context).filter(ts => triggerSources.includes(ts))}))
    .filter(ta => ta.sources.length>0)
    .map(ta => ({c,ta:ta.ta,sources:ta.sources})))

    const timestamp = newTimestamp()
    triggers.forEach(({c,ta,sources}) =>
        {
            console.log("ExecuteTrigger",ta[1].trigger,c.id,sources)
            const triggeredAbility = NewCard('Ability',c.controller,'AbilityHolding',timestamp)
            triggeredAbility.abilitySourceId = c.id
            triggeredAbility.abilitySourceSourceIds = sources
            triggeredAbility.abilitySourceAbilityId = ta[1].id
            controller.cards.push(triggeredAbility)

            AddChangeZoneGameAction("Stack",[triggeredAbility.id],c.id)
            //Reset priority as something new went on the stack
            controller.priorityPassed = 0
        })
}