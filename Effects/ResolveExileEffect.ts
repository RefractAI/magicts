import { ExileEffect, Effect } from "../Types/EffectTypes";
import { AddChangeZoneGameAction } from "../Types/GameActionHelpers";
import { CardId } from "../Types/IdCounter";

export const ResolveExileEffect = (effect: Effect, _exileEffect: ExileEffect) => {
    const { source, context } = effect;
    const targets = context.targets[0];

    if (!targets || targets.length === 0) {
        console.log(`ExileEffect: No targets`);
        return true;
    }

    console.log(`Exiling ${targets.length} cards: ${targets.map(id => id.toString()).join(', ')}`);
    AddChangeZoneGameAction("Exile", targets as CardId[], source, 'ExileEffect');

    return true;
};