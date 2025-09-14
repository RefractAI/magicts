import { controller } from "../Network/Server";
import { CanPayFor, CostEffects, CostX } from "../Types/CostTypes";
import { AddNumberInputGameAction } from "../Types/InputTypesHelpers";
import { AddChangeZoneGameAction } from "../Types/GameActionHelpers";
import { GetCardTitle } from "../Types/GetText";
import { CardId } from "../Types/IdCounter";
import { IsPermanent } from "../Types/IsCard";
import { Card } from "../Types/CardTypes";
import { CastPhaseNames } from "../Types/CastPhaseTypes";
import { NoneCondition } from "../Types/ConditionHelpers";
import { Cost } from "../Types/CostTypes";
import { GetCard, GetCostModificationAbilities, GetPlayer } from "./GetCard";
import { AddConcreteEffect, DetermineTargetLegality, RemoveIllegalTargets } from "./Targeting";
import { TryResolveEffects } from "./ResolveEffect";

export const NextCastPhase = (cardId:CardId) =>
{
    const card = GetCard(cardId)
    card.name !== 'Ability' && console.log('BeginCastPhase',GetCardTitle(card),card.castPhase)

    if (card.castPhase === 'PayCostDoEffects')
    {
        if (!TryResolveEffects(cardId,"Cost",-1))
        {
            return;
        }
    }
    if (card.castPhase === 'ToResolveDoEffects')
    {
        //Remove illegal targets, but the spell does not fizzle
        const effects = card.effects.filter(e => e.status !== 'Complete' && e.kind === 'Normal' && e.parentEffectIndex === -1)
        effects.forEach(e => DetermineTargetLegality(e))
        effects.forEach(e => RemoveIllegalTargets(e))

        if (!TryResolveEffects(cardId,"Normal",-1))
        {
            return;
        }
    }
    card.castPhase = CastPhaseNames[CastPhaseNames.indexOf(card.castPhase)+1];
    
    //Do start of next castphase
    switch(card.castPhase)
    {
        case 'None': break; 
        case 'ChooseX': ChooseX(card); break;
        case 'ChooseTargets': ChooseTargets(card); break;
        case 'DivideTargets': DivideTargets(card); break;
        case 'DetermineCost': DetermineCost(card); break;
        case 'DetermineCostChooseTargets': DetermineCostChooseTargets(card); break;
        case 'BeforePayCost': break;
        case 'PayCost': PayCost(card); break;
        case 'PayCostDoEffects': break;
        case 'BeforeResolve': BeforeResolve(card); break;
        case 'CheckForIllegalTargets': CheckForIllegalTargets(card); break;
        case 'ToResolveDoEffects': break;
        case 'Resolved': Resolved(card); break;
    }
}

// ChooseMode removed; its logic is performed in PerformCast when initiating a cast

const ChooseX = (card:Card) =>
{
    const baseCost = card.castSelectedCost && card.castSelectedCost.elements.length > 0 ? card.castSelectedCost : card.cost;
    if(CostX(baseCost)>0)
    {
        AddNumberInputGameAction(card.controller,card.id,1,100)
    }
}

const ChooseTargets = (card:Card) =>
{
    const effects = card.castSelectedEffects

    console.log("Effects:",card.id,effects.map(e => e.effectCls))

    effects.forEach((effect) => AddConcreteEffect(card.id,effect,"Normal",-1,{targets:[], selectedX:card.castSelectedX})) 
}

const DivideTargets = (_:Card) =>
{

}

const DetermineCost = (card:Card) =>
{
    // If castSelectedCost is already set (from alternate costs like escape), use it as the base
    // Otherwise, use the card's regular cost
    const baseCost = card.castSelectedCost && card.castSelectedCost.elements.length > 0 ? card.castSelectedCost : card.cost;

    //Determine X
    const x = CostX(baseCost) * card.castSelectedX
    const elements = baseCost.elements.filter(e => e.cls !== 'CostManaElement' || e.color !== 'X')
    for(var i=0;i<x;i++)
    {
        elements.push({cls:'CostManaElement',color:'Generic',condition:NoneCondition})
    }

    const costModAbilities = GetCostModificationAbilities(card)
    const costIncreaseElements = costModAbilities.map(cma => cma[1].costIncrease).flatMap(c => c.elements)
    elements.push(...costIncreaseElements);

    const finalCost:Cost = ({cls:'Cost',elements})
    card.castSelectedCost = finalCost
}

const DetermineCostChooseTargets = (card:Card) =>
{
    
  const costEffectTypes = CostEffects(card.castSelectedCost || card.cost)
  console.log("Cost Effects: ",costEffectTypes.map(e => e.cls))
  
  costEffectTypes.forEach((effect) => AddConcreteEffect(card.id,effect,"Cost",-1,{targets:[], selectedX:card.castSelectedX})) //blank context for now
}

const PayCost = (card:Card) =>
{
    CanPayFor(GetPlayer(controller.active2), card.castSelectedCost!, true, card)
}

const BeforeResolve = (_:Card) =>
{

}

//Happens once, after priority pause but before effects are resolved in a loop
const CheckForIllegalTargets = (card:Card) =>
{
    const effects = card.effects.filter(e => e.status !== 'Complete' && e.kind === 'Normal' && e.parentEffectIndex === -1)
    effects.forEach(e => DetermineTargetLegality(e))
    const targetingEffects = effects.filter(e => e.type.target.doesTarget)
    if(targetingEffects.length > 0 && targetingEffects.every(e => 
    {
        // Rule 608.2b: Check if all targets are illegal for effects that specify targets
        // If all chosen targets are illegal, this effect fails
        return e.context.targets.every((targetGroup, groupIndex) => 
            targetGroup.length > 0 && targetGroup.every(targetId => 
                e.context.illegalTargets![groupIndex]?.includes(targetId) ?? false
            )
        )
    }))
    {
        console.log("Spell Fizzles",card.id,targetingEffects.map(e => e.type.effectCls+" "+e.context.targets.map(t => t.map(t => GetCard(t).name))))
        AddChangeZoneGameAction("Graveyard", [card.id], card.controller, 'CheckForIllegalTargets')
        return;
    }
    effects.forEach(e => RemoveIllegalTargets(e))
}

const Resolved = (card:Card) =>
{
    if(IsPermanent(card))
    {
        AddChangeZoneGameAction("Field", [card.id], card.controller, 'Resolved')
    }
    else
    {
        AddChangeZoneGameAction("Graveyard", [card.id], card.controller, 'Resolved')
    }

    // The active player receives priority after a spell or ability (other than a mana ability) resolves.
    if(card.zone === 'Stack')
    {
        controller.activePlayerPassed = false;
        controller.nonActivePlayerPassed = false;
        controller.active2 = controller.active;
    }
}




