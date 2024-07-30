import { MayEffect } from "../Types/EffectClass";
import { Effect } from "../Types/Types";
import { AddBooleanInputGameAction } from "../Types/InputTypesHelpers";
import { GetController } from "../Logic/GetCard";

export const ResolveTapEffect = ({source,effectIndex,context}: Effect, _: MayEffect) => {

    const {mayInput} = context

    if(mayInput === undefined)
    {
        AddBooleanInputGameAction(GetController(source), "May?", source, effectIndex, 'mayInput')
        return false;
    }

    //Theneffects chosen based on may value

    return true;
};
