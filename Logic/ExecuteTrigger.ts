import { controller } from "../Network/Server";
import { CardId, newTimestamp } from "../Types/IdCounter";
import { TriggerName } from "../Types/TriggerNames";
import { GetConditionCards, EvaluateCondition } from "./Evaluate";
import { GetTriggeredAbilities, NewCard } from "./GetCard";

export const ExecuteTrigger = (triggerName:TriggerName,triggerSources:CardId[]) =>
{
    console.log(`ExecuteTrigger called: ${triggerName}, triggerSources:`, triggerSources)
    
    const allTriggeredAbilities = controller.cards.flatMap(c => {
        const triggeredAbilities = GetTriggeredAbilities(c)
        //console.log(`Card ${c.id} (${c.name}) has ${triggeredAbilities.length} triggered abilities`)
        return triggeredAbilities.map(ta => ({card: c, ta}))
    })
    
    const relevantTriggers = allTriggeredAbilities.filter(({ta}) => ta[1].trigger === triggerName)
    console.log(`Found ${relevantTriggers.length} abilities with trigger ${triggerName}`)
    if (triggerName === "EndStep") {
        console.log("All triggered abilities:", allTriggeredAbilities.map(({card, ta}) => ({cardId: card.id, cardName: card.name, trigger: ta[1].trigger})));
    }
    
    const triggers = relevantTriggers
    .filter(({card: c, ta}) => {
        // Check if the trigger condition is met (for conditional triggers)
        const conditionMet = ta[1].condition.cls === 'NoneCondition' || EvaluateCondition(c.id, c.id, ta[1].condition, ta[0].context);
        console.log(`Condition check for ${ta[1].trigger} on card ${c.id} (${c.name}): ${conditionMet}`);
        return conditionMet;
    })
    .map(({card: c, ta}) => ({ta,sources:GetConditionCards(c,ta[1].triggerSourceCondition,ta[0].context).filter(ts => triggerSources.includes(ts))}))
    .filter(ta => ta.sources.length>0)
    .map(ta => ({c:relevantTriggers.find(rt => rt.ta === ta.ta)!.card,ta:ta.ta,sources:ta.sources}))

    //console.log(`Found ${triggers.length} triggers that will fire`)

    const timestamp = newTimestamp()
    triggers.forEach(({c,ta,sources}) =>
        {
            console.log("QueueTrigger: ",ta[1].trigger,c.id,sources)
            // Queue the triggered ability instead of immediately putting it on the stack
            controller.triggeredAbilityQueue.push({
                triggerName: ta[1].trigger,
                triggerSources: sources,
                controller: c.controller,
                sourceCard: c.id,
                abilityTypeId: ta[1].id,
                timestamp: timestamp
            })
        })
}

// Process all queued triggered abilities and put them on the stack
export const ProcessQueuedTriggeredAbilities = (): boolean => {

    const triggersToProcess = [...controller.triggeredAbilityQueue]

    triggersToProcess.forEach(trigger => {
        console.log("ProcessTrigger: ", trigger.triggerName, trigger.sourceCard, trigger.triggerSources)
        NewCard('Ability', trigger.controller, 'Stack', 1, trigger.timestamp, undefined, trigger.sourceCard, trigger.triggerSources, trigger.abilityTypeId)
    })
    controller.triggeredAbilityQueue = [];
    
    return triggersToProcess.length > 0;
}