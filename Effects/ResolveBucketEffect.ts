import { BucketEffect } from "../Types/EffectTypes";
import { Effect } from "../Types/EffectTypes";
import { AddBucketInputGameAction } from "../Types/InputTypesHelpers";
import { PlayerId } from "../Types/IdCounter";
import { AddChangeZoneGameAction } from "../Types/GameActionHelpers";
import { BucketInputBucket } from "../Types/InputTypes";
import { ExecuteTrigger } from "../Logic/ExecuteTrigger";
import { EvaluateNumber, GetConditionCards } from "../Logic/Evaluate";

export const ResolveBucketEffect = (effect: Effect, bucketEffect: BucketEffect): boolean => {
    const { source, context, effectIndex } = effect;
    
    // Execute trigger if this is the first execution and a trigger is specified
    if (effect.executionCount === 0 && bucketEffect.trigger) {
        ExecuteTrigger(bucketEffect.trigger, [effect.source]);
    }

    const playerSource = context.targets[0][0] as PlayerId
    if (playerSource >2)
    {
        throw 'Expected bucket target to be a player'
    }
    
    // Get the cards to put in buckets using cardTarget
    const cardTargets = GetConditionCards(playerSource, bucketEffect.cardTarget, context, false);

    // Check if we already have bucket input response
    if (context.bucketResponse) {
        // Process the bucket response
        const bucketResponse = context.bucketResponse;
        
        // Validate bucket response
        if (bucketResponse.length !== bucketEffect.buckets.length) {
            console.error(`BucketEffect: Response has ${bucketResponse.length} buckets but expected ${bucketEffect.buckets.length}`);
            return false;
        }
        
        // Each bucket in the response should correspond to a bucket specification
        bucketEffect.buckets.forEach((bucketSpec, bucketIndex) => {
            const cardsInThisBucket = bucketResponse[bucketIndex] || [];
            
            // Store bucket cards in ResolutionContext for later reference
            if (bucketSpec.name && cardsInThisBucket.length > 0) {
                if (!context.bucketTargetIds) {
                    context.bucketTargetIds = {};
                }
                context.bucketTargetIds[bucketSpec.name] = cardsInThisBucket;
            }
            
            // Move cards in this bucket to the specified zone
            if (cardsInThisBucket.length > 0 && bucketSpec.toZone && bucketSpec.toZone !== "None") {
                AddChangeZoneGameAction(bucketSpec.toZone, cardsInThisBucket, source, "BucketEffect", bucketSpec.librarySpecification);
            }

            // Apply bucket's additional effects if any
            if (bucketSpec.effects && bucketSpec.effects.length > 0) {
                // Queue the bucket's effects for these cards
                effect.selectedThenEffects = [...(effect.selectedThenEffects || []), ...bucketSpec.effects];
            }
        });

        // Add the bucket effect's own thenEffects to be processed next
        // Only add them if they haven't been added yet (prevent duplication on multiple executions)
        if (bucketEffect.thenEffects && bucketEffect.thenEffects.length > 0 && 
            (!effect.selectedThenEffects || effect.selectedThenEffects.length === 0)) {
            effect.selectedThenEffects = [...bucketEffect.thenEffects];
        }

        return true;
    }

    // If no response yet, request bucket input from the appropriate player
    // Create bucket specifications for the input system

    const buckets: BucketInputBucket[] = bucketEffect.buckets.map((bucket, index) => {
        const max = bucket.amount ? EvaluateNumber(source, source, bucket.amount, context) : cardTargets.length
        
        return ({
        prompt:bucket.prompt || bucket.toZone || "Bucket",
        initial: index === 0 ? cardTargets : [], // Put all cards in first bucket initially, they can be moved
        min: 0,
        max: max,
        })
    });

    AddBucketInputGameAction(
        playerSource,
        bucketEffect.prompt,
        source,
        buckets,
        bucketEffect.requiresOrder || false, // requiresOrder - use provided setting or default to false
        'Effect',
        effectIndex,
        'bucketResponse'
    );

    return false; // Wait for input
};