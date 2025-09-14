import { PayEffect } from "../Types/EffectTypes";
import { Effect } from "../Types/EffectTypes";
import { GetController, GetPlayer, GetCard } from "../Logic/GetCard";
import { IdentifyCanPayFor, AddPay } from "../Logic/AutoTapper";
import { CanPayFor } from "../Types/CostTypes";
import { PerformCast } from "../Logic/MutateBoard";
import { controller } from "../Network/Server";
import { AddBooleanInputGameAction } from "../Types/InputTypesHelpers";

export const ResolvePayEffect = (effect: Effect, payEffect: PayEffect) => {
    const {source, effectIndex, context} = effect;
    const controllerId = GetController(source);
    const player = GetPlayer(controllerId);
    const sourceCard = GetCard(source);
    const {booleanChoice} = context;
    
    console.log("ResolvePayEffect called with cost:", payEffect.cost);

    // First check if we need to ask the player if they want to pay
    if(booleanChoice === undefined) {
        console.log("PayEffect: Requesting boolean choice for payment");
        AddBooleanInputGameAction(
            controllerId,
            payEffect.prompt,
            source,
            effectIndex,
            'booleanChoice'
        );
        return false; // Wait for input
    }

    // Player chose not to pay
    if(!booleanChoice) {
        console.log("PayEffect: Player chose not to pay, using effectsIfNotPaid");
        effect.selectedThenEffects = payEffect.effectsIfNotPaid;
        return true;
    }

    // Player chose to pay - check if the cost can be paid automatically with current resources
    if(CanPayFor(player, payEffect.cost, false, sourceCard)) {
        console.log("PayEffect: Can pay automatically, paying cost");
        // Pay the cost automatically (this will consume mana from pool and apply cost effects)
        CanPayFor(player, payEffect.cost, true, sourceCard);
        // The thenEffects will be processed by the effect resolution system
        return true;
    }

    // Can't pay automatically, try auto-tapping mana abilities
    const autotap = IdentifyCanPayFor(controllerId, payEffect.cost, sourceCard);
    if(autotap[0] && controller.autoTapLoopCount < 10) {
        console.log("PayEffect: Auto-tapping mana abilities:", autotap[1][0]);
        controller.autoTapLoopCount++;
        PerformCast(autotap[1][0].cardId!, autotap[1][0].abilityTypeId);
        return false; // Wait for the mana ability to resolve, then retry
    }
    
    controller.autoTapLoopCount = 0;

    // Still can't pay, create PayInput for manual payment
    console.log("PayEffect: Creating PayInput for manual payment");
    AddPay(source, payEffect.cost);
    return false; // Wait for input
};