import { controller } from "../Network/Server";
import { ActivatedAbility } from "../Types/AbilityClass";
import { GetAbilityType } from "../Types/AbilityClassHelpers";
import { CanPayFor } from "../Types/CostHelpers";
import { AddCastInputGameAction, AddPayInputGameAction } from "../Types/InputTypesHelpers";
import { CardId } from "../Types/IdCounter";
import { Cost } from "../Types/Types";
import { IdentifyCanPayFor } from "./AutoTapper";
import { CalculateAbilities } from "./CalculateAbilities";
import { NextCastPhase } from "./CastInfo";
import { GetCard, GetPlayer, Opponent } from "./GetCard";
import { ProcessInputResponse } from "./InputResponse";
import { DoGameAction, PerformCast } from "./MutateBoard";
import { NextPhase, BeginPhase } from "./Phases";
import { StateBasedActions } from "./StateBasedActions";

export const GameLoop = () =>
{
    var exit = false
    var loops = 0

    while(!exit)
    {
        loops+=1

        //CHECK INPUT
        if(controller.input)
        {
            if(controller.input.responded)
            {
                ProcessInputResponse()
            }
            else
            {
                throw 'Not responded yet'
            }
        }
        CalculateAbilities();

        //DO INPUT
        const action = controller.actions.pop();
        if(action)
        {
            exit = DoGameAction(action)
            continue;
        }

        const fastStack = controller.fastStack[0];
        const fastStackCard = fastStack && GetCard(fastStack)
        var nyp = fastStack && GetCard(fastStack).castPhase === 'BeforePayCost'
        
        //FAST STACK PAYMENT
        if(fastStack && nyp)
        {
            //console.log("NYP")
            const cost = fastStackCard.castSelectedCost!

            if(!CanPayFor(GetPlayer(controller.active2), cost, false))
            {
                AddPay(fastStack,cost)
                continue;
            }

            //Otherwise, continue. Cost paid in castinfo
        }

        //FAST STACK NEXT
        if(fastStack)
        {
            NextCastPhase(fastStack)
            continue;
        }

        //STACK PAYMENT
        const stack = controller.stack[0];
        const stackCard = stack && GetCard(stack)
        nyp = stack && GetCard(stack).castPhase === 'BeforePayCost'
        
        //Loop payment until paid
        if(stack && nyp)
        {
            //console.log("NYP")
            const cost = stackCard.castSelectedCost!

            if(!CanPayFor(GetPlayer(controller.active2), cost, false))
            {
                const autotap = IdentifyCanPayFor(controller.active2,cost)
                if(autotap[0] && controller.autoTapLoopCount < 10)
                {
                    //Autotap
                    console.log("AUTOTAP", autotap[1][0])
                    controller.autoTapLoopCount++;
                    PerformCast(autotap[1][0].cardId!,autotap[1][0].abilityTypeId)
                    continue;
                }
                controller.autoTapLoopCount = 0
                //Manual tap
                AddPay(stack,cost)
                continue;
            }

            //Otherwise, continue. Cost paid in castinfo
        }

        //STACK NEXT (IF NOT BEFORE RESOLVE)
        const nyr = stack && (GetCard(stack).castPhase !== 'BeforeResolve' || controller.priorityPassed === 2)

        if(stack && nyr)
        {
            NextCastPhase(stack)
            continue;
        }

        //PASS PRIORITY
        if(!controller.hasCastOrPassed)
        {
            //Continue, allow casting again
        }
        else if(controller.priorityPassed < 2)
        {
            //Pass Priority
            //console.log('Pass Priority',controller.priorityPassed)
            controller.active2 = Opponent(controller.active2)
            controller.priorityPassed++     
        }
        else
        {
            //Next Phase
            console.log('Begin Phase')
            controller.active2 = controller.active
            controller.priorityPassed = 0
            NextPhase()
            BeginPhase()
        }
        
        //THEN ALLOW CASTING
        if(controller.priorityPassed < 2)
        {
            StateBasedActions()
            //IF ANY STATE BASED ACTIONS, RELOOP
            if(controller.actions.length > 0)
            {
                continue;
            }

            if(["FirstMain","SecondMain","BeginCombat","DeclareAttackers","DeclareBlockers","EndStep"].includes(controller.phase))
            {
                const canCast = controller.cards.filter(c => c.canCast.filter(c => c.playerId === controller.active2).length>0).map(c => c.id)
                if(canCast.length > 0)
                {
                    AddCastInputGameAction(controller.active2,canCast)
                    controller.hasCastOrPassed = false;
                    continue;
                }
            }
        }

        if(loops>100)
        {
            exit = true
            console.log("Too Many Loops")
        }
    }
}

const AddPay = (cardId:CardId,cost:Cost) =>
{
  
        const canCast = controller.cards
        .filter(c => c.canCast.filter(c => c.playerId === controller.active2
            && c.abilityTypeId
            && GetAbilityType(c.abilityTypeId)?.abilityCls === 'ActivatedAbility'
            && (GetAbilityType(c.abilityTypeId) as ActivatedAbility).isManaAbility //Only mana abilities
            ).length>0)
        .map(c => c.id)

        AddPayInputGameAction(controller.active2,cardId,canCast,cost)
}