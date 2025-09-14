import { controller } from "../Network/Server";
import { ActivatedAbility } from "../Types/AbilityTypes";
import { CostTap } from "../Types/CostTypes";
import { PlayerId } from "../Types/IdCounter";
import { IsTribe } from "../Types/IsCard";
import { Card } from "../Types/CardTypes";
import { GetCastingOptionAbilities } from "./GetCard";

export const CalculateCanCast = (p:PlayerId,c:Card):boolean =>
{
    var canCast = false;

    // Normal casting from hand
    if(c.zone === 'Hand' && c.controller === p)
    {
        if((controller.phase === 'FirstMain' || controller.phase == 'SecondMain') && controller.active === p && controller.stack.length === 0)
        {
            canCast = true;
        }   
        if(IsTribe(c, "Instant"))
        {
            canCast = true;
        }
    }

    // Check if any casting option abilities make this card castable
    const castingOptionAbilities = GetCastingOptionAbilities(c).filter(a => a[1].optionType === 'AlternateCost')

    if(castingOptionAbilities.length > 0)
    {
        canCast = true;
    }
   
    return canCast;
}

export const CalculateCanCastAbility = (p:PlayerId,c:Card,a:ActivatedAbility):boolean =>
{
    var canCast = false;
    if(c.zone === 'Field' && c.controller === p)
    {
        if((controller.phase === 'FirstMain' || controller.phase == 'SecondMain') && controller.active === p && controller.stack.length === 0)
        {
            canCast = true;
        }   
        if(a.speed === 'Instant')
        {
            canCast = true;
        }
    }   

    if(CostTap(a.cost) && c.tapped)
    {
        return false;
    }

    return canCast;
}