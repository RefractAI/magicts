import { CreateEffect, ZoneChangeEffect } from "../Types/EffectClass";
import { PlayerId } from "../Types/IdCounter";
import { Effect } from "../Types/Types";
import { EvaluateNumber } from "../Logic/Evaluate";
import { PerformCreate } from "../Logic/MutateBoard";
import { AddChangeZoneGameAction } from "../Types/GameActionHelpers";

export const ResolveZoneChangeEffect = (effect: Effect, type: ZoneChangeEffect) => {

    const {toZone,librarySpecification} = type;
    const {source, context} = effect;
    const target = context.targets[0];

    AddChangeZoneGameAction(toZone, target, source, librarySpecification)

    return true;
};
