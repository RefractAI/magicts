import { CardId } from "../Types/IdCounter"
import { IsCreature } from "../Types/IsCard"
import { GetCard } from "./GetCard"

export const CanAttack = (attackerId:CardId):boolean =>
{
    const attacker = GetCard(attackerId)
    return attacker.zone === 'Field'
    && IsCreature(attacker) 
    && !attacker.tapped
}

export const CanBlock = (attackerId:CardId,blockerId:CardId):boolean =>
{
    const attacker = GetCard(attackerId)
    const blocker = GetCard(blockerId)
    return attacker.zone === 'Field'
    && blocker.zone === 'Field'
    && attacker.controller !== blocker.controller 
    && IsCreature(attacker) 
    && !attacker.tapped 
    && IsCreature(blocker) 
    && !blocker.tapped
}