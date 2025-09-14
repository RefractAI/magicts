import { controller } from "../Network/Server";
import { CanPayFor } from "../Types/CostTypes";
import { AddCastInputGameAction } from "../Types/InputTypesHelpers";
import { IdentifyCanPayFor, AddPay } from "./AutoTapper";
import { CalculateAbilities } from "./CalculateAbilities";
import { NextCastPhase } from "./CastInfo";
import { GetCard, GetPlayer, Opponent } from "./GetCard";
import { ProcessInputResponse } from "./InputResponse";
import { DoGameAction, PerformCast } from "./MutateBoard";
import { NextPhase, BeginPhase } from "./Phases";
import { StateBasedActions } from "./StateBasedActions";
import { ProcessQueuedTriggeredAbilities } from "./ExecuteTrigger";

// Helper functions for priority system
const BothPlayersPassed = (): boolean => {
    return controller.activePlayerPassed && controller.nonActivePlayerPassed;
}

export const GameLoop = () =>
{
    var exit = false
    var loops = 0

    var continueReasons:string[] = []
    while(!exit)
    {
        loops+=1
        if(loops>200)
        {
            exit = true 
            throw new Error('Too Many Loops. Last 5 Continue Reasons: '+continueReasons.slice(-5).join(', '))
        }

        // If there is a pending input response, process it.
        if(controller.input)
        {
            if(controller.input.responded)
            {
                // The player has provided their response to the input request.
                // Process their choice and continue with the game flow.
                ProcessInputResponse()
            }
            else
            {
                // The input is still waiting for the player to make their choice.
                throw new Error('Expected input response but none provided')
            }
        }
        CalculateAbilities();

        //If there is an outstanding game action, process it.
        // Game actions include things like moving cards between zones and requesting input from the player
        const action = controller.actions.pop();
        if(action)
        {
            exit = DoGameAction(action)
            continueReasons.push('DoGameAction')
            continue;
        }

        const fastStack = controller.fastStack[controller.fastStack.length - 1];
        const fastStackCard = fastStack && GetCard(fastStack)
        var nyp = fastStack && GetCard(fastStack).castPhase === 'BeforePayCost'
        
        // If there is an ability on the fast stack (like a mana ability) that needs to be paid for, attempt to pay for it automatically or request input from the player
        if(fastStack && nyp)
        {
            const cost = fastStackCard.castSelectedCost!

            if(!CanPayFor(GetPlayer(controller.active2), cost, false))
            {
                // The player cannot pay the cost automatically.
                // Create a payment input so they can choose how to pay (tap lands, etc.).
                AddPay(fastStack, cost)
                continueReasons.push('AddPay FastStack')
                continue;
            }

            // The player can pay the cost, so it will be automatically paid during cast processing.
            // Continue to advance the mana ability to its next phase.
        }

        // If there is an ability on the fast stack (like a mana ability), in another cast phase, advance it to its next phase
        if(fastStack)
        {
            NextCastPhase(fastStack)
            continueReasons.push('NextCastPhase')
            continue;
        }

        // If there is a spell or ability on the stack that needs to be paid for, attempt to pay for it automatically or request input from the player
        const stack = controller.stack[0];
        const stackCard = stack && GetCard(stack)
        nyp = stack && GetCard(stack).castPhase === 'BeforePayCost'
        
        if(stack && nyp)
        {
            const cost = stackCard.castSelectedCost!

            if(!CanPayFor(GetPlayer(controller.active2), cost, false, stackCard))
            {
                // The player cannot pay the full cost automatically.
                // First, try to automatically tap mana sources to help pay the cost.
                const autotap = IdentifyCanPayFor(controller.active2,cost, stackCard)
                if(autotap[0] && controller.autoTapLoopCount < 10)
                {
                    // Auto-tap available mana sources to help pay the cost.
                    console.log("AUTOTAP: ", autotap[1][0])
                    controller.autoTapLoopCount++;
                    PerformCast(autotap[1][0].cardId!,autotap[1][0].abilityTypeId)
                    continueReasons.push('PerformCast')
                    continue;
                }
                controller.autoTapLoopCount = 0
                // Auto-tapping couldn't cover the full cost, so create a payment input for the player to manually choose how to pay.
                AddPay(stack, cost)
                continueReasons.push('AddPay')
                continue;
            }

            // The player has sufficient resources to pay the cost, so the cost will be automatically paid when the spell advances to its next phase.
        }

        // If there is a spell or ability on the stack that is not at the BeforeResolve phase, advance it to its next cast phase
        //If there is a spell or ability on the stack that is at the BeforeResolve phase, and both players have passed priority, resolve it by moving it to the Resolve phase
        const topStackCard = stack && GetCard(stack)
        const nyr = stack && (topStackCard.castPhase !== 'BeforeResolve' || BothPlayersPassed())
        
        if(stack && nyr)
        {
            NextCastPhase(stack)
            continueReasons.push('NextCastPhase')
            continue;
        }

        //If both players have passed priority and the stack is empty, reset priority to the active player
        if(BothPlayersPassed() && controller.stack.length === 0)
        {
            const activePlayerHadPassed = controller.activePlayerPassed;
            controller.active2 = controller.active; // Reset priority back to the active player
            controller.activePlayerPassed = false;
            controller.nonActivePlayerPassed = false;
            
            // A phase or step ends when the stack is empty and both players pass.
            // However, main phases allow the active player to cast another spell or ability if they have passed.
            if(activePlayerHadPassed || !(controller.phase === 'FirstMain' || controller.phase === 'SecondMain'))
            {
                NextPhase()
                BeginPhase()
            }
        }
        else
        {
            // Both players haven't passed yet, so we need to pass priority within the current phase
            // Check if the current player (who has priority) has already passed.
            const currentPlayerPassed = (controller.active2 === controller.active) 
                ? controller.activePlayerPassed 
                : controller.nonActivePlayerPassed;
                
            if(currentPlayerPassed)
            {
                // The current player has passed priority, so we switch priority to the other player.
                // This continues the round of priority until both players have passed in succession.
                console.log('Pass Priority: Active:',controller.active, 'Active2:', controller.active2)
                controller.active2 = Opponent(controller.active2)
                continueReasons.push('Pass Priority')
                continue; // Continue the loop to give the other player their chance at priority
            }
        }
        
        // BRANCH: Give the current player an opportunity to cast spells or activate abilities.
        // This is where players actually get to make choices during the game.
        // We only reach this point if not both players have passed priority yet.
        if(!BothPlayersPassed())
        {
            // Before players can act, we must follow rule 117.5:
            // Each time a player would get priority, first perform state-based actions,
            // then put triggered abilities on stack, repeat until no more occur
            StateBasedActions()
            if(controller.actions.length > 0)
            {
                // State-based actions have created new game actions that need to be processed.
                continueReasons.push('StateBasedActions')
                continue;
            }

            // Then, put triggered abilities on the stack
            const triggersProcessed = ProcessQueuedTriggeredAbilities();
            if (triggersProcessed) {
                // Triggered abilities were put on the stack, restart the loop to check for more state-based actions
                continueReasons.push('ProcessQueuedTriggeredAbilities')
                continue;
            }

            // BRANCH: Determine if the current game phase allows players to cast spells.
            // Some phases (like Upkeep, Draw) don't allow casting, while others do.
            if(["FirstMain","SecondMain","BeginCombat","DeclareAttackers","DeclareBlockers","EndStep"].includes(controller.phase))
            {
                const canCast = controller.cards.filter(c => c.canCast.filter(c => c.playerId === controller.active2).length>0).map(c => c.id)

                if(canCast.length > 0)
                {
                    // The player has at least one legal spell or ability they can cast/activate.
                    // Create an input asking them to choose what they want to do.
                    // Note that the client should still auto-pass if they are not holding priority AND (they just cast a spell OR only have mana abilities available at current timing restrictions)
                    AddCastInputGameAction(controller.active2,canCast)
                    // Since we're giving them an opportunity to act, reset their pass status.
                    // They haven't passed priority if they have new choices to make.
                    if (controller.active2 === controller.active) {
                        controller.activePlayerPassed = false;
                    } else {
                        controller.nonActivePlayerPassed = false;
                    }
                    continueReasons.push('AddCastInputGameAction')
                    continue;
                }
                else
                {
                    // The player has no legal spells or abilities they can cast right now.
                    // Automatically pass priority for them since they have no choices to make.
                    if (controller.active2 === controller.active) {
                        controller.activePlayerPassed = true;
                    } else {
                        controller.nonActivePlayerPassed = true;
                    }
                    continueReasons.push('Auto-pass no legal plays')
                    continue;
                }
            }
            else
            {
                // This phase doesn't allow casting spells (like Upkeep, Draw, Combat Damage phases).
                // Automatically pass priority for the current player since they can't cast anything.
                if (controller.active2 === controller.active) {
                    controller.activePlayerPassed = true;
                } else {
                    controller.nonActivePlayerPassed = true;
                }
                continueReasons.push('Auto-pass non-casting phase')
                continue;
            }

            continueReasons.push('No more actions: Phase:'+controller.phase)
        }

        
    }
}

