import { CreateEmblemEffect, Effect } from "../Types/EffectTypes";
import { EmblemName } from "../Cards/Common/CardNames";
import { GetController } from "../Logic/GetCard";
import { AddChangeZoneGameAction } from "../Types/GameActionHelpers";
import { NewCard } from "../Logic/GetCard";
import { newTimestamp } from "../Types/IdCounter";

export const ResolveCreateEmblemEffect = (effect: Effect, createEmblemEffect: CreateEmblemEffect) => {
    const { context } = effect;
    const targets = context.targets[0];

    if (!targets || targets.length === 0) {
        console.log(`CreateEmblemEffect: No targets`);
        return true;
    }

    targets.forEach(targetId => {
        const controllerId = GetController(targetId);
        const emblemCards = NewCard(createEmblemEffect.emblem as EmblemName, controllerId, "Field", 1, newTimestamp());
        
        console.log(`Creating emblem ${createEmblemEffect.emblem} for player ${controllerId}`);
        AddChangeZoneGameAction("Field", emblemCards.map(c => c.id), controllerId, "CreateEmblem");
    });

    return true;
};