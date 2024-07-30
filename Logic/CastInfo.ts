import { controller } from "../Network/Server";
import { ToAbility } from "../Types/AbilityClassHelpers";
import { CanPayFor, CostEffects, CostX } from "../Types/CostHelpers";
import { AddModeInputGameAction, AddNumberInputGameAction, AddCastInputGameAction } from "../Types/InputTypesHelpers";
import { AddChangeZoneGameAction } from "../Types/GameActionHelpers";
import { GetCardTitle } from "../Types/GetText";
import { CardId, newTimestamp } from "../Types/IdCounter";
import { IsPermanent } from "../Types/IsCard";
import { Card, CastPhaseNames, Cost, NoneCondition } from "../Types/Types";
import { ClearCastState } from "./ClearState";
import { GetCard, GetCardType, GetPlayer, Opponent } from "./GetCard";
import { GetOptions } from "./GetOptions";
import { AddConcreteEffect } from "./Targeting";
import { TryResolveEffects } from "./ResolveEffect";

export const NextCastPhase = (cardId:CardId) =>
{
    const card = GetCard(cardId)
    card.name !== 'Ability' && console.log('BeginCastPhase',GetCardTitle(card),card.castPhase)

    //If any pending effect, do the first
    switch(card.castPhase)
    {
        case 'PayCostDoEffects': TryResolveEffects(cardId,"Cost",-1); return;
        case 'ToResolveDoEffects': TryResolveEffects(cardId,"Normal",-1); return;
        default: card.castPhase = CastPhaseNames[CastPhaseNames.indexOf(card.castPhase)+1]; break;
    }
    
    //Do start of next castphase
    switch(card.castPhase)
    {
        case 'None': break; 
        case 'ChooseMode': ChooseMode(card); break;
        case 'ChooseX': ChooseX(card); break;
        case 'ChooseTargets': ChooseTargets(card); break;
        case 'DivideTargets': DivideTargets(card); break;
        case 'DetermineCost': DetermineCost(card); break;
        case 'DetermineCostChooseTargets': DetermineCostChooseTargets(card); break;
        case 'BeforePayCost': break;
        case 'PayCost': PayCost(card); break;
        case 'PayCostDoEffects': break;
        case 'BeforeResolve': BeforeResolve(card); break;
        case 'ToResolve': ToResolve(card); break;
        case 'ToResolveDoEffects': break;
        case 'Resolved': Resolved(card); break;
    }
}

const ChooseMode = (card:Card) =>
{
    const cardType = GetCardType(card.id)
    const options = GetOptions(cardType)
    if(options.length > 1)
    {
        AddModeInputGameAction(card.controller,card.id,options)
    }
    else if(options.length === 1)
    {
        card.castSelectedOption = options[0]
    }
    else
    {
        throw 'No options'
    }
}

const ChooseX = (card:Card) =>
{
    if(CostX(card.cost)>0)
    {
        AddNumberInputGameAction(card.controller,card.id,1,100)
    }
}

const ChooseTargets = (card:Card) =>
{
    card.castSelectedOption!
    .flatMap(o => o.effects)
    .forEach((effect) => AddConcreteEffect(card.id,effect,"Cost",-1,{targets:[]})) //blank context for now
}

const DivideTargets = (_:Card) =>
{

}

const DetermineCost = (card:Card) =>
{
    //Determine X

    const x = CostX(card.cost) * card.castSelectedX
    const elements = card.cost.elements.filter(e => e.cls !== 'CostManaElement' || e.color !== 'X')
    for(var i=0;i<x;i++)
    {
        elements.push({cls:'CostManaElement',color:'Generic',condition:NoneCondition})
    }
    const finalCost:Cost = ({cls:'Cost',elements})
    card.castSelectedCost = finalCost
}

const DetermineCostChooseTargets = (card:Card) =>
{
    
  const costEffectTypes = CostEffects(card.cost)
  console.log("COSTEFFECTS",card.cost,costEffectTypes)
  
  costEffectTypes.forEach((effect) => AddConcreteEffect(card.id,effect,"Normal",-1,{targets:[]})) //blank context for now
}

const PayCost = (card:Card) =>
{
    CanPayFor(GetPlayer(controller.active2), card.castSelectedCost!, true)
}

const BeforeResolve = (card:Card) =>
{
    const opponent = Opponent(card.controller)
    const canCast = controller.cards.filter(c => c.canCast[opponent]).map(c => c.id)
        if(canCast.length > 0)
        {
            AddCastInputGameAction(opponent,canCast)
        }
}

const ToResolve = (card:Card) =>
{
    const timestamp = newTimestamp()
    card.abilityTypes = card.castSelectedOption!.flatMap(o => o.abilities).map(a => ToAbility(a,card.id,timestamp,{targets:[]})) //blank context for now
}

const Resolved = (card:Card) =>
{
    ClearCastState(card.id)
    if(IsPermanent(card))
    {
        AddChangeZoneGameAction("Field", [card.id], card.controller)
    }
    else
    {
        AddChangeZoneGameAction("Graveyard", [card.id], card.controller)
    }
}




