import { controller } from "../Network/Server"
import { ActivatedAbility, CastingOptionAbility } from "../Types/AbilityTypes"
import { GetAbilityType, ToAbility } from "../Types/AbilityTypes"
import { AddMana } from "../CardHelpers/EffectClassHelpers"
import { PlayerId, AbilityTypeId, CardId, Timestamp } from "../Types/IdCounter"
import { IsTribe } from "../Types/IsCard"
import { TribeName } from "../Types/TribeNames"
import { AbilityClass } from "../Types/AbilityTypes"
import { CalculateCanCast, CalculateCanCastAbility } from "./CanCast"
import { ClearTempState } from "./ClearState"
import { EvaluateCondition, EvaluateNumber, GetConditionCards } from "./Evaluate"
import { GetActivatedAbilities, GetBasePowerToughnessAbility, GetBaseTribeAbilities, GetCard, GetCardType, GetColorAbilities, GetHasAllAbilitiesOfAbilities, GetKeywordAbilities, GetPowerAbilities, GetPowerToughnessAbilities, GetToughnessAbilities, GetTribeAbilities } from "./GetCard"
import { MakeActivatedAbility, MakeStunCounterReplacementEffect } from "../CardHelpers/AbilityClassHelpers"
import { Card, ResolutionContext } from "../Types/CardTypes"
import { CMC } from "../Types/CostTypes"

const PlainsAbility = MakeActivatedAbility("T", AddMana("White"))
const IslandAbility = MakeActivatedAbility("T", AddMana("Blue"))
const SwampAbility = MakeActivatedAbility("T", AddMana("Black"))
const MountainAbility = MakeActivatedAbility("T", AddMana("Red"))
const ForestAbility = MakeActivatedAbility("T", AddMana("Green"))

export const CalculateAbilities = () => {

    ClearTempState()

    //Layer 0 - Base Characteristics

    //BaseColors
    controller.cards.forEach(card => {
        //Determine card colors from mana cost
        const cardType = GetCardType(card.id);
        const costElements = cardType.cost.elements;
        const costColors = costElements
            .filter(e => e.cls === 'CostManaElement' && e.color !== 'Generic' && e.color !== 'X')
            .map(e => (e as any).color);
        
        card.colors = [...new Set(costColors)]; // Remove duplicates
        card.cost = cardType.cost
        card.cmc = CMC(cardType.cost)
    })

    //Apply tribes written on the card
    ApplyAbilitiesSelf(["BaseTribeAbility"])
    controller.cards.forEach(card => {
        card.tribes = GetBaseTribeAbilities(card).map(t => t[1].tribe);
    })

    //Apply base power and toughness written on the card
    ApplyAbilitiesSelf(["BasePowerToughnessAbility"])
    controller.cards.forEach(card => {
        const basePowerToughness = GetBasePowerToughnessAbility(card)[0]
        let basep = 0
        let baset = 0
        if (basePowerToughness && typeof basePowerToughness[1].power === 'number' && typeof basePowerToughness[1].toughness === 'number')
        {
            basep = basePowerToughness[1].power
            baset = basePowerToughness[1].toughness
        }
        card.power = basep
        card.toughness = baset
    })

    //Apply all other abilities written on the card that apply to the card itself
    ApplyAbilitiesSelf(["TribeAbility", "ColorAbility", "PowerAbility", "ToughnessAbility", "PowerToughnessAbility", "KeywordAbility", "ProtectionFromAbility", "ActivatedAbility", "TriggeredAbility", "CastingOptionAbility", "CostModificationAbility", "ReplacementEffectAbility"])

    
    //Layer 2 - Copy
    //Layer 3 - Text
    //Layer 4 - Type
    ApplyAbilities(["TribeAbility"])
    controller.cards.forEach(card => {
        card.tribes.push(...GetTribeAbilities(card).map(t => t[1].tribe));
    })
    

    //Layer 5 - Color
    ApplyAbilities(["ColorAbility"])
    controller.cards.forEach(card => {
        card.colors.push(...GetColorAbilities(card).map(c => c[1].color));
    })

    //Layer 6 - Ability add/remove, Keyword counters
    const landMapping: [tribe: TribeName, a: ActivatedAbility][] = [
        ["Plains", PlainsAbility]
        , ["Island", IslandAbility]
        , ["Swamp", SwampAbility]
        , ["Mountain", MountainAbility]
        , ["Forest", ForestAbility]
        , ["Rainbow", PlainsAbility]
        , ["Rainbow", IslandAbility]
        , ["Rainbow", SwampAbility]
        , ["Rainbow", MountainAbility]
        , ["Rainbow", ForestAbility]
    ];
    landMapping.forEach(([tribe, aa]) => {
        const lands = controller.cards.filter(c => c.zone === 'Field' && IsTribe(c, tribe))

        lands.forEach(p => p.abilities.push(ToAbility(aa, p.id, p.timestamp, {targets:[]})))
    });

    ApplyAbilities(["ActivatedAbility", "TriggeredAbility", "KeywordAbility", "ProtectionFromAbility", "CastingOptionAbility", "CostModificationAbility", "ReplacementEffectAbility", "HasAllAbilitiesOfAbility"])
    controller.cards.forEach(card => {
        card.keywords = GetKeywordAbilities(card).map(ka => ka[1].keyword);

        // Add keywords granted by counters
        if (card.counters.includes("Flying")) {
            card.keywords.push("Flying");
        }

        // Add stun counter replacement effect
        if (card.counters.includes("Stun")) {
            card.abilities.push(ToAbility(MakeStunCounterReplacementEffect(), card.id, card.timestamp, {targets:[]}));
        }
    });

    // Handle HasAllAbilitiesOfAbility - must be done after all other abilities are calculated
    controller.cards.forEach(card => {
        const hasAllAbilitiesOfAbilities = GetHasAllAbilitiesOfAbilities(card);
        hasAllAbilitiesOfAbilities.forEach(([ability, abilityType]) => {
            // Find cards that match the target condition (e.g., exiled creature cards)
            const targetCards = GetConditionCards(ability.source, abilityType.target, ability.context, false);
            
            // Get all abilities from the target cards
            const abilitiesToCopy: { abilityTypeId: AbilityTypeId, source: CardId, timestamp: Timestamp, context: ResolutionContext }[] = [];
            targetCards.forEach(targetId => {
                const targetCard = GetCard(targetId);
                targetCard.printedAbilities.forEach(printedAbility => {
                    abilitiesToCopy.push({
                        abilityTypeId: printedAbility.type,
                        source: targetId,
                        timestamp: targetCard.timestamp,
                        context: printedAbility.context
                    });
                });
            });
            
            // Apply these abilities to cards affected by this HasAllAbilitiesOfAbility
            const affectedCards = GetConditionCards(ability.source, abilityType.affects, ability.context, false);
            affectedCards.forEach(affectedId => {
                const affectedCard = GetCard(affectedId);
                abilitiesToCopy.forEach(copiedAbility => {
                    affectedCard.abilities.push(ToAbility(GetAbilityType(copiedAbility.abilityTypeId), copiedAbility.source, copiedAbility.timestamp, copiedAbility.context));
                });
            });
        });
    });

    controller.cards.forEach(card => {
        // Calculate valid casting options for this card
        card.options = GetOptions(card);

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
    //e.g. */* 
    //Layer 7b - Set P/T
    
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

        // Add +1/+1 counter bonuses
        const plusOnePlusOneCounters = card.counters.filter(c => c === 'PlusOnePlusOne').length
        
        card.power = [basep, ...p, ...ptp, plusOnePlusOneCounters].reduce((a, b) => a + b)
        card.toughness = [baset, ...t, ...ptt, plusOnePlusOneCounters].reduce((a, b) => a + b)
    });

    //Layer 7d - Swap P/T

}

const ApplyAbilitiesSelf = (cls: AbilityClass[]) => {
    const allAbilities = controller.cards
        .flatMap(card => card.printedAbilities
            .map(a => ({ability:a,abilityType:GetAbilityType(a.type)}))
            .filter(a => cls.includes(a.abilityType.abilityCls))
            .filter(a => a.abilityType.condition.cls === 'NoneCondition' || EvaluateCondition(card.id, card.id, a.abilityType.condition, a.ability.context))
            .map(ca => ({ ca, c: card.id, t:card.timestamp })))

    allAbilities.forEach(cac => GetCard(cac.c).abilities.push(ToAbility(cac.ca.abilityType, cac.c, cac.t, cac.ca.ability.context)))
}

const ApplyAbilities = (cls: AbilityClass[]) => {
    const allAbilities = controller.cards
        .filter(c => c.zone === 'Field')
        .flatMap(card => card.printedAbilities
            .map(a => ({ability:a,abilityType:GetAbilityType(a.type)}))
            .filter(a => a.abilityType.affects.cls !== 'SelfCondition') // as already applied before
            .filter(a => cls.includes(a.abilityType.abilityCls))
            .filter(a => a.abilityType.condition.cls === 'NoneCondition' || EvaluateCondition(card.id, card.id, a.abilityType.condition, a.ability.context))
            .map(ca => ({ ca, c: card.id, t:card.timestamp })))

    const affectedCards = allAbilities
        .flatMap(cac => GetConditionCards(cac.c, cac.ca.abilityType.affects, cac.ca.ability.context, false).map(target => ({ ...cac, target: GetCard(target) })))
    affectedCards.forEach(cac => cac.target.abilities.push(ToAbility(cac.ca.abilityType, cac.c, cac.t, cac.ca.ability.context)))
}

export const GetOptions = (card:Card) => {
    const filteredOptions = card.printedAbilities
        .filter(a => {
            const ability = GetAbilityType(a.type);
            if (ability.abilityCls !== 'CastingOptionAbility') return false;

            if(ability.condition.cls === 'NoneCondition')
            {
                return true
            }
            
            // Check if the condition is met for this ability
            return EvaluateCondition(card, card, ability.condition, {targets:[]});
        })
        .map(a => GetAbilityType(a.type) as CastingOptionAbility)
    
    if (filteredOptions.length === 0) {
        return [];
    }
    
    // Check if we have mutually exclusive options (like Split cards)
    const hasSplitOptions = filteredOptions.some(option => option.optionType === 'Split');
    const hasTransformOptions = filteredOptions.some(option => option.optionType === 'Transform');
    const hasChooseOneOptions = filteredOptions.some(option => option.optionType === 'ChooseOne');
    
    if (hasSplitOptions || hasTransformOptions || hasChooseOneOptions) {
        // For split/transform/choose-one cards, each option is mutually exclusive
        return filteredOptions.map(option => [option]);
    }
    
    // For combinable options (like kicker), generate combinations
    const result: CastingOptionAbility[][] = []
    
    const recursiveCombine = (currentOptionIndex: number, currentCombination: CastingOptionAbility[]) => {
        if (currentOptionIndex === filteredOptions.length) {
            result.push([...currentCombination]);
            return;
        }
        
        const currentOption = filteredOptions[currentOptionIndex];
        recursiveCombine(currentOptionIndex + 1, currentCombination); // skip this option
        recursiveCombine(currentOptionIndex + 1, [...currentCombination, currentOption]); // include this option
    }
    
    recursiveCombine(0, []);
    return result.filter(r => r.length > 0);
}