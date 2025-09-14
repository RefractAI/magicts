import { DestroyEffect, Effect } from "../Types/EffectTypes";
import { AddChangeZoneGameAction } from "../Types/GameActionHelpers";
import { CardId } from "../Types/IdCounter";

export const ResolveDestroyEffect = (effect: Effect, _destroyEffect: DestroyEffect) => {
    const { source, context } = effect;
    const targets = context.targets[0];

    if (!targets || targets.length === 0) {
        console.log(`DestroyEffect: No targets`);
        return true;
    }

    console.log(`Destroying ${targets.length} permanents: ${targets.map(id => id.toString()).join(', ')}`);
    AddChangeZoneGameAction("Graveyard", targets as CardId[], source, 'DestroyEffect');

    return true;
};