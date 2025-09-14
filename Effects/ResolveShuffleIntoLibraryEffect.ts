import { ShuffleIntoLibraryEffect, Effect } from "../Types/EffectTypes";
import { GetCard } from "../Logic/GetCard";
import { CardId, PlayerId } from "../Types/IdCounter";
import { AddChangeZoneGameAction } from "../Types/GameActionHelpers";
import { PerformShuffle } from "../Logic/MutateBoard";

export const ResolveShuffleIntoLibraryEffect = (effect: Effect, _shuffleEffect: ShuffleIntoLibraryEffect) => {
    const { source, context } = effect;
    const targets = context.targets[0];

    if (!targets || targets.length === 0) {
        console.log(`ShuffleIntoLibraryEffect: No targets to shuffle`);
        return true;
    }

    // Group cards by owner for library placement
    const cardsByOwner = new Map<PlayerId, CardId[]>();
    
    targets.forEach(targetId => {
        const targetCard = GetCard(targetId as CardId);
        const ownerId = targetCard.controller;
        
        if (!cardsByOwner.has(ownerId)) {
            cardsByOwner.set(ownerId, []);
        }
        cardsByOwner.get(ownerId)!.push(targetId as CardId);
    });

    // Move cards to their owners' libraries and shuffle
    cardsByOwner.forEach((cardIds, ownerId) => {
        console.log(`Shuffling ${cardIds.length} cards into ${ownerId}'s library`);
        AddChangeZoneGameAction("Library", cardIds, source, 'ShuffleIntoLibraryEffect', {direction: 'Top', offset: 0});
        PerformShuffle(ownerId);
    });

    return true;
};