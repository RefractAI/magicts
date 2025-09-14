import { ExploreEffect } from "../Types/EffectTypes";
import { Effect } from "../Types/EffectTypes";
import { AddBooleanInputGameAction } from "../Types/InputTypesHelpers";
import { GetCard, GetController, GetPlayer } from "../Logic/GetCard";
import { PerformAddCounter } from "../Logic/MutateBoard";
import { AddChangeZoneGameAction } from "../Types/GameActionHelpers";
import { CardId } from "../Types/IdCounter";
import { IsTribe } from "../Types/IsCard";

export const ResolveExploreEffect = (effect: Effect, _: ExploreEffect) => {

    const {source, context} = effect;
    const {exploreChoice} = context;
    const target = context.targets[0][0];


    const exploringCreature = GetCard(target as CardId);
    const controller = GetController(target as CardId);
    const player = GetPlayer(controller);

    // Reveal the top card of library
    const revealedCard = GetCard(player.library[0]);
    console.log(`Exploring with ${exploringCreature.name}: revealed ${revealedCard.name}`);

    // Check if revealed card is a land
    if (IsTribe(revealedCard, "Land")) {
        // Put land into hand using proper zone change
        AddChangeZoneGameAction("Hand", [revealedCard.id], controller,'ExploreEffect');
        console.log(`Land revealed - put ${revealedCard.name} into hand`);
    } else {
        // Ask player if they want to put the card in graveyard
        if (exploreChoice === undefined) {
            // Non-land card: put +1/+1 counter on exploring creature
            PerformAddCounter(exploringCreature.id, 'PlusOnePlusOne');
            console.log(`Non-land revealed - put +1/+1 counter on ${exploringCreature.name}`);
            
            console.log(`ExploreEffect asking for input, returning false to wait`);
            AddBooleanInputGameAction(
                controller, 
                `Put ${revealedCard.name} into your graveyard?`, 
                source, 
                effect.effectIndex, 
                'exploreChoice'
            );
            return false;
        }

        console.log(`Explore choice received: ${exploreChoice}`);
        
        // Process the choice
        if (exploreChoice) {
            // Put card in graveyard using proper zone change
            AddChangeZoneGameAction("Graveyard", [revealedCard.id], controller,'ExploreEffect');
            console.log(`Put ${revealedCard.name} into graveyard`);
        } else {
            // Leave on top of library (do nothing)
            console.log(`Left ${revealedCard.name} on top of library`);
        }
    }

    return true;
};