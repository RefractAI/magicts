import { ShuffleEffect, Effect } from "../Types/EffectTypes";
import { PlayerId } from "../Types/IdCounter";
import { PerformShuffle } from "../Logic/MutateBoard";

export const ResolveShuffleEffect = (effect: Effect, _shuffleEffect: ShuffleEffect) => {
    const { context } = effect;
    const targets = context.targets[0];

    if (!targets || targets.length === 0) {
        console.log(`ShuffleEffect: No targets`);
        return true;
    }

    targets.forEach(targetId => {
        console.log(`Resolving shuffle for player ${targetId}`);
        PerformShuffle(targetId as PlayerId);
    });

    return true;
};