import { controller } from "../Network/Server"
import { ActivatedAbility } from "../Types/AbilityClass"
import { GetAbilityType, MakeActivatedAbility, ToAbility } from "../Types/AbilityClassHelpers"
import { AddMana } from "../Types/EffectClassHelpers"
import { PlayerId } from "../Types/IdCounter"
import { IsTribe } from "../Types/IsCard"
import { TribeName } from "../Types/TribeNames"
import { AbilityClass } from "../Types/Types"
import { CalculateCanCast, CalculateCanCastAbility } from "./CanCast"
import { ClearTempState } from "./ClearState"
import { EvaluateCondition, EvaluateNumber, GetConditionCards } from "./Evaluate"
import { GetActivatedAbilities, GetBaseOption, GetBasePowerToughnessAbility, GetCard, GetCardType, GetColorAbilities, GetKeywordAbilities, GetPowerAbilities, GetPowerToughnessAbilities, GetToughnessAbilities, GetTribeAbilities } from "./GetCard"

const PlainsAbility = MakeActivatedAbility("T", AddMana("White"))
const IslandAbility = MakeActivatedAbility("T", AddMana("Blue"))
const SwampAbility = MakeActivatedAbility("T", AddMana("Black"))
const MountainAbility = MakeActivatedAbility("T", AddMana("Red"))
const ForestAbility = MakeActivatedAbility("T", AddMana("Green"))

export const CalculateAbilities = () => {
    ClearTempState()

    //Characteristic Abilities written on the card
    const selfAbilities = controller.cards
        .flatMap(card => GetBaseOption(card.id).abilities
            .filter(a => a.affects.cls === 'SelfCondition')
            .filter(a => a.condition.cls === 'NoneCondition' || EvaluateCondition(card.id, card.id, a.condition, {targets:[]}))
            .map(ca => ({ ca, c: card.id, t:card.timestamp })))

    selfAbilities.forEach(cac => GetCard(cac.c).abilities.push(ToAbility(cac.ca, cac.c, cac.t, {targets:[]})))

    //Layer 0 - Base Characteristics
    //Layer 2 - Copy
    //Layer 3 - Text
    //Layer 4 - Type
    ApplyAbilities(["TribeAbility"])
    controller.cards.forEach(card => {
        card.tribes = GetTribeAbilities(card).map(t => t[1].tribe);
        card.colors = GetColorAbilities(card).map(c => c[1].color);
        card.cost = GetCardType(card.id).options[0].cost
    })

    //Layer 5 - Color
    //Layer 6 - Ability add/remove, Keyword counters
    const landMapping: [tribe: TribeName, a: ActivatedAbility][] = [["Plains", PlainsAbility], ["Island", IslandAbility], ["Swamp", SwampAbility], ["Mountain", MountainAbility], ["Forest", ForestAbility]];
    landMapping.forEach(([tribe, aa]) => {
        const lands = controller.cards.filter(c => c.zone === 'Field' && IsTribe(c, tribe))

        lands.forEach(p => p.abilities.push(ToAbility(aa, p.id, p.timestamp, {targets:[]})))
    });

    ApplyAbilities(["ActivatedAbility", "TriggeredAbility", "KeywordAbility"])
    controller.cards.forEach(card => {
        card.keywords = GetKeywordAbilities(card).map(ka => ka[1].keyword);


        [1 as PlayerId, 2 as PlayerId].forEach(playerId => {

            if (CalculateCanCast(playerId, card)) {
                card.canCast.push({ playerId, cardId: card.id, abilityTypeId: null })
            }

            const activatedAbilities = GetActivatedAbilities(card)
                .filter(a => CalculateCanCastAbility(playerId, card, a[1]))

            card.canCast.push(...activatedAbilities.map(a => ({ playerId, cardId: card.id, abilityTypeId: a[1].id })))

        })

    })


    //Layer 7a - Characteristic P/T
    //ApplyAbilities(["BasePowerToughnessAbility"]) - this would be applied first. Does this mean */* is applied later?
    //Layer 7b - Set P/T
    ApplyAbilities(["BasePowerToughnessAbility"])
    //Layer 7c - Modify P/T
    ApplyAbilities(["PowerToughnessAbility", "PowerAbility", "ToughnessAbility"])
    controller.cards.forEach(card => {
        const basePowerToughness = GetBasePowerToughnessAbility(card)[0]
        const basep = basePowerToughness ? EvaluateNumber(card.id, card.id, basePowerToughness[1].power, basePowerToughness[0].context) : 0
        const baset = basePowerToughness ? EvaluateNumber(card.id, card.id, basePowerToughness[1].toughness, basePowerToughness[0].context) : 0
        const p = GetPowerAbilities(card).map(ability => EvaluateNumber(card.id, card.id, ability[1].power, ability[0].context))
        const t = GetToughnessAbilities(card).map(ability => EvaluateNumber(card.id, card.id, ability[1].toughness, ability[0].context))
        const ptp = GetPowerToughnessAbilities(card).map(ability => EvaluateNumber(card.id, card.id, ability[1].power, ability[0].context))
        const ptt = GetPowerToughnessAbilities(card).map(ability => EvaluateNumber(card.id, card.id, ability[1].toughness, ability[0].context))

        card.power = [basep, ...p, ...ptp].reduce((a, b) => a + b)
        card.toughness = [baset, ...t, ...ptt].reduce((a, b) => a + b)
    });
    //Layer 7d - Swap P/T

}

const ApplyAbilities = (cls: AbilityClass[]) => {
    const allAbilities = controller.cards
        .filter(c => c.zone === 'Field')
        .flatMap(card => card.abilityTypes
            .map(a => ({ability:a,abilityType:GetAbilityType(a.type)}))
            .filter(a => a.abilityType.affects.cls !== 'SelfCondition') // as already applied before
            .filter(a => cls.includes(a.abilityType.abilityCls))
            .filter(a => a.abilityType.condition.cls === 'NoneCondition' || EvaluateCondition(card.id, card.id, a.abilityType.condition, a.ability.context))
            .map(ca => ({ ca, c: card.id, t:card.timestamp })))

    const affectedCards = allAbilities
        .flatMap(cac => GetConditionCards(cac.c, cac.ca.abilityType.affects, cac.ca.ability.context).map(target => ({ ...cac, target: GetCard(target) })))

    affectedCards.forEach(cac => cac.target.abilities.push(ToAbility(cac.ca.abilityType, cac.c, cac.t, cac.ca.ability.context)))
}

/*

A: ETB, Cs get +2/+2  (option -> effects -> C.abilityTypes)
B: Static, Cs get +2/+2   (option -> B.abilityTypes)

B: base power 3/2
layer 7c:
+2/+2 from B.abilityTypes -> B.abilities
+2/+2 from C.abilityTypes -> B.abilities
B.power calculated from B.abilities
activated abilities pulled out in canCast
triggered abilities pulled out in execute trigger


*/