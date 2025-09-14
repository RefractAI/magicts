
import { GetCard } from "../Logic/GetCard";
import { Card, Controller, ConditionConcreteContext, Player } from "./CardTypes";
import { Color } from "./ColorTypes";
import { ColorVariable, ColorVariableName, NumberVariable, NumberVariableName } from "./ConditionTypes";

const NN = (name:NumberVariableName,fn:(c:Card,s:Card,b:Controller,x:ConditionConcreteContext) => number):NumberVariable => ({name,cls:'NumberVariable',fn})

const CardController = (c:Card,b:Controller):Player => b.cards.find(b => b.id === c.controller) as Player

const NumberOfCardTypesInGraveyard = (c:Card, _s:Card, b:Controller) => {
    const controller = CardController(c, b);
    const graveyardCards = b.cards.filter(card => card.zone === 'Graveyard' && card.controller === controller.id);
    const cardTypes = new Set();
    graveyardCards.forEach(card => {
        card.tribes.forEach(tribe => {
            if (['Land', 'Creature', 'Instant', 'Sorcery', 'Planeswalker', 'Battle', 'Artifact', 'Enchantment'].includes(tribe)) {
                cardTypes.add(tribe);
            }
        });
    });
    return cardTypes.size;
}

export const NumberVariables:Record<NumberVariableName,NumberVariable> =
{
    NumberOfPlusOnePlusOneCountersOnIt: NN("NumberOfPlusOnePlusOneCountersOnIt", c => c.counters.filter(c => c === 'PlusOnePlusOne').length),
    ChosenNumber: NN("NumberOfPlusOnePlusOneCountersOnIt", (_,__,___,x) => x.numberVariable!),
    LinkedEffectTargetPower: NN("LinkedEffectTargetPower", (_,__,___,x) => x.linkedTargets!.flatMap(t => t).map(c => GetCard(c).power).reduce((a,b) => a+b)),
    SelectedX: NN("SelectedX", (_, s) => {
        // For effects on the stack, get X from the spell/ability
        const sourceCard = s.abilitySourceId ? GetCard(s.abilitySourceId) : s;
        return sourceCard.castSelectedX;
    }),
    NegativeSelectedX: NN("NegativeSelectedX", (_, __, ___, x) => {
        // Use selectedX from the resolution context, return negative value
        return x.selectedX ? -x.selectedX : 0;
    }),
    NumberOfCardTypesInGraveyard: NN("NumberOfCardTypesInGraveyard", (c, _s, b) => NumberOfCardTypesInGraveyard(c, _s, b)),
    NumberOfCardTypesInGraveyardPlusOne: NN("NumberOfCardTypesInGraveyardPlusOne", (c, _s, b) => NumberOfCardTypesInGraveyard(c, _s, b) + 1),
    ContextTargetCMC: NN("ContextTargetCMC", (_, __, ___, x) => {
        if (x.chosenTargets && x.chosenTargets.length > 0) {
            const targetCard = GetCard(x.chosenTargets[0]);
            return targetCard.cmc;
        }
        return 0;
    }),
    ContextTargetPower: NN("ContextTargetPower", (_, __, ___, x) => {
        if (x.chosenTargets && x.chosenTargets.length > 0) {
            const targetCard = GetCard(x.chosenTargets[0]);
            return targetCard.power;
        }
        return 0;
    }),
    SpellsCastThisTurn: NN("SpellsCastThisTurn", (c, _s, b) => {
        const controller = CardController(c, b);
        return controller.spellsCastThisTurn;
    }),
}

const CLN = (name:ColorVariableName,fn:(c:Card,s:Card,b:Controller,x:ConditionConcreteContext) => Color):ColorVariable => ({name,cls:'ColorVariable',fn})

export const ColorVariables:Record<ColorVariableName,ColorVariable> =
{
   ChosenColor: CLN("ChosenColor",(_,__,___,x) => x.chosenColor || x.colorVariable!)
}

//numberofcreaturesyoucontrol is a condition