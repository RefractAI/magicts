import { CardName } from "../Cards/Common/CardNames"
import { GetCardTypeFromCardName } from "../Logic/GetCard"
import { AbilityUnion, CastingOptionAbility } from "./AbilityTypes"
import { EffectUnion } from "./EffectTypes"
import { GetCostText } from "./GetText"

export const GetAbilitiesAndEffectsFromCastingOption = (option:CastingOptionAbility):{abilities:AbilityUnion[], effects:EffectUnion[], name?:CardName} => {
    switch( option.optionType )
    {
        case 'ChooseOne':
        case 'AlternateCost':
            return {abilities:option.abilities || [], effects:option.effects || [], name:undefined}
        case 'Split':
        case 'Transform':
            if (option.cardName) {
                const cardType = GetCardTypeFromCardName(option.cardName)
                return {abilities:cardType.abilities, effects:cardType.effects, name:option.cardName}
            }
            return {abilities:[], effects:[], name:undefined}
    }
}

export const GetCastModeSummary = (options: CastingOptionAbility[]): string => {
    if (options.length === 0) {
        return "Normal cast"
    }
    
    const summaryParts = options.map(option => {
        const cost = option.cost ? GetCostText(option.cost) : ""
        const costText = cost ? ` (${cost})` : ""
        
        switch (option.optionType) {
            case 'AlternateCost':
                return `Alternate cost${costText}`
            case 'ChooseOne':
                return `Choose one${costText}`
            case 'Transform':
                return `Transform → ${option.cardName || 'other side'}${costText}`
            case 'Split':
                return `Split → ${option.cardName}${costText}`
            default:
                return option.optionType + costText
        }
    })
    
    return summaryParts.join(", ")
}