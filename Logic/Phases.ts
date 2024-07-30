import { controller } from "../Network/Server";
import { AddBucketInputGameAction, AddPairInputGameAction } from "../Types/InputTypesHelpers";
import { PlayerId } from "../Types/IdCounter";
import { IsTribe } from "../Types/IsCard";
import { PhaseNames } from "../Types/PhaseNames";
import { CalculateAbilities } from "./CalculateAbilities";
import { CanAttack, CanBlock } from "./CanAttack";
import { ExecuteTrigger } from "./ExecuteTrigger";
import { PerformDrawCard, PerformCombat, PerformUntap } from "./MutateBoard";
import { BucketInputBucket } from "../Types/InputTypes";

export const BeginPhase = () =>
{
    CalculateAbilities()
    switch(controller.phase)
    {
        case 'Upkeep': UpkeepPhase(); break;
        case 'Untap':UntapPhase(); break;
        case 'Draw': DrawPhase(); break;
        case 'FirstMain': FirstMainPhase(); break;
        case 'BeginCombat': BeginCombatPhase(); break;
        case 'DeclareAttackers': DeclareAttackersPhase(); break;
        case 'DeclareBlockers': DeclareBlockersPhase(); break;
        case 'OrderBlockers': OrderBlockersPhase(); break;
        case 'Combat': CombatPhase(false); break;
        case 'EndCombat': EndCombatPhase(); break;
        case 'SecondMain': SecondMainPhase(); break;
        case 'EndStep': EndStepPhase(); break;
        case 'Cleanup': CleanupPhase(); break;
    }
}

export const NextPhase = () =>
{
    const idx = PhaseNames.indexOf(controller.phase)
    if(controller.phase == 'Cleanup')
    {
        controller.active = (controller.active === 1 ? 2 : 1) as PlayerId
        controller.phase = 'Upkeep'
    }
    else
    {
        if(controller.phase === 'DeclareAttackers' && controller.cards.filter(c => c.attacking).length === 0)
        {
            controller.phase = 'SecondMain'
        }
        else
        {
            controller.phase = PhaseNames[idx+1]
        }        
    }
    console.log("Phase: "+controller.phase)
}

const UpkeepPhase = () =>
{
    ExecuteTrigger("Upkeep",[controller.active])
}

const UntapPhase = () =>
{
    const tappedPermanents = controller.cards.filter(c => c.controller === controller.active && c.tapped)
    tappedPermanents.forEach(t => PerformUntap(t.id))
}

const DrawPhase = () =>
{
    PerformDrawCard(controller.active)
    ExecuteTrigger("DrawStep",[controller.active])
}

const FirstMainPhase = () =>
{
    ExecuteTrigger("FirstMain",[controller.active])
}

const BeginCombatPhase = () =>
{
    ExecuteTrigger("BeginCombat",[controller.active])
}

const DeclareAttackersPhase = () =>
{
    const canAttack = controller.cards.filter(c => c.controller === controller.active && CanAttack(c.id)).map(c => c.id)
    const defenders = controller.cards.filter(c => c.controller !== controller.active && (IsTribe(c,'Player') || IsTribe(c,'Planeswalker') || IsTribe(c,'Battle'))).map(c => c.id)
    if(canAttack.length > 0)
    {
        AddPairInputGameAction(controller.active,"Choose attackers",controller.active,canAttack,defenders, "Attackers")
    }
    else
    {
        console.log("NO VALID ATTACKERS")
    }
}

const DeclareBlockersPhase = () =>
{

    console.log("NO VALID BLOCKERS")

    const attackers = controller.cards.filter(c => c.attacking)
    const canBlock = controller.cards.filter(c => c.controller !== controller.active && attackers.some(attacker => CanBlock(attacker.id,c.id))).map(c => c.id)
    if(canBlock.length > 0)
    {
        AddPairInputGameAction(controller.active,"Choose blockers",controller.active,canBlock,attackers.map(a => a.id),"Blockers")
    }
    else
    {
        console.log("NO VALID BLOCKERS")
    }
}

const OrderBlockersPhase = () =>
{
    const orderBlockers = controller.cards
        .filter(a => a.attacking)
        .map(a => ({attacker:a,blockers:controller.cards.filter(b => b.blocking.includes(a.id))}));


        orderBlockers.forEach(({attacker,blockers}) => {

            if(blockers.length > 1)
            {
                const bucket:BucketInputBucket = ({prompt:'Blockers', initial:blockers.map(b => b.id),min:blockers.length,max:blockers.length})
                AddBucketInputGameAction(controller.active, "Order blockers", attacker.id, [bucket],true,'OrderBlockers')
            }
            else
            {
                attacker.blockOrder = blockers.map(b => b.id)
            }
        
    
        })
}

const CombatPhase = (firstStrike:boolean) =>
{
    ExecuteTrigger("Combat",[controller.active])
    PerformCombat(firstStrike)
}

const EndCombatPhase = () =>
{
    controller.cards.forEach(card =>
        {
            card.attacking = undefined
            card.blocking = []
            card.blockOrder = []
        })
   
    ExecuteTrigger("EndCombat",[controller.active])
}

const SecondMainPhase = () =>
{
    ExecuteTrigger("SecondMain",[controller.active])
}

const EndStepPhase = () =>
{
    ExecuteTrigger("EndStep",[controller.active])
}

const CleanupPhase = () =>
{

}