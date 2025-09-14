import { ZoneChangeEffect } from "../Types/EffectTypes";
import { Effect } from "../Types/EffectTypes";
import { AddChangeZoneGameAction } from "../Types/GameActionHelpers";

export const ResolveZoneChangeEffect = (effect: Effect, type: ZoneChangeEffect) => {

    const {toZone,librarySpecification} = type;
    const {source, context} = effect;
    const target = context.targets[0];

    AddChangeZoneGameAction(toZone, target, source, 'ZoneChangeEffect', librarySpecification)

    return true;
};
