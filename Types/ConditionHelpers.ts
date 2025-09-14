import { ConditionName } from "./ConditionNames";
import { IsCreature, IsPlayer, IsPlaneswalker, IsLibrary, IsTribe, IsColor, IsKeyword, IsPowerN, IsCMCNOrGreater, IsCMCNOrLess, IsPowerNOrGreater, IsPowerNOrLess, IsToughnessN, IsToughnessNOrGreater, IsToughnessNOrLess, IsInstant, IsSorcery, IsArtifact, IsEnchantment, IsBattle, IsLand, IsToken, IsAbility } from "./IsCard";
import { TribeName } from "./TribeNames";
import { Card, ConditionConcreteContext, ConditionContext, Controller, Player } from "./CardTypes";
import { ColorDef } from "./ColorTypes";
import { KeywordName } from "./KeywordTypes";
import { CardName } from "../Cards/Common/CardNames";
import { ZoneName } from "./ZoneNames";

import { Condition, ConditionSpecification, NumberVar, NumberDef, ConditionItem } from "./ConditionTypes";

export const NoneCondition:ConditionSpecification = {conditions:[], min:0, max:0, all:true, andOr:'AND', cls:'NoneCondition', doesTarget:false, context:{}, validationFunction:"None"}
export const SelfCondition:ConditionSpecification = {conditions:["Self"], min:1, max:1, all:true, andOr:'AND', cls:'SelfCondition', doesTarget:false, context:{}, validationFunction:"None"}

const CN = (name:ConditionName,fn:(c:Card,s:Card,b:Controller,x:ConditionConcreteContext) => boolean,numberOfTargets:NumberVar=1):Condition => ({name,cls:'Condition',fn,numberOfTargets:numberOfTargets})

const IsFriendly = (c:Card,s:Card) => c.controller === s.controller
const IsOpponent = (c:Card,s:Card) => c.controller !== s.controller
const IsSelf = (c:Card,s:Card) => c.id === s.id
const IsOther = (c:Card,s:Card) => c.id !== s.id
const IsField = (c:Card) => c.zone === 'Field'
const IsHand = (c:Card) => c.zone === 'Hand'
const IsStack = (c:Card) => c.zone === 'Stack'
const IsGraveyard = (c:Card) => c.zone === 'Graveyard'
const CardController = (c:Card,b:Controller):Player => b.cards.find(b => b.id === c.controller) as Player

export const ConditionTypes:Record<ConditionName,Condition> =
{
    None: CN("None", (_) => false),
    Self: CN("Self", (c, s) => IsSelf(c, s)),

    Friendly: CN("Friendly", (c, s) => IsFriendly(c, s)),
    Other: CN("Other", (c, s) => IsOther(c, s)),
    Opponent: CN("Opponent", (c, s) => IsOpponent(c, s)),

    //On Field
    Creature: CN("Creature", (c) => IsField(c) && IsCreature(c)),
    NonCreature: CN("NonCreature", (c) => IsField(c) && !IsCreature(c)),
    Land: CN("Land", (c) => IsField(c) && IsLand(c)),
    NonLand: CN("NonLand", (c) => IsField(c) && !IsLand(c)),
    Instant: CN("Instant", (c) => IsField(c) && IsInstant(c)),
    Sorcery: CN("Sorcery", (c) => IsField(c) && IsSorcery(c)),
    Planeswalker: CN("Planeswalker", (c) => IsField(c) && IsPlaneswalker(c)),
    Battle: CN("Battle", (c) => IsField(c) && IsBattle(c)),
    Artifact: CN("Artifact", (c) => IsField(c) && IsArtifact(c)),
    Enchantment: CN("Enchantment", (c) => IsField(c) && IsEnchantment(c)),
    ArtifactOrEnchantment: CN("ArtifactOrEnchantment", (c) => IsField(c) && (IsArtifact(c) || IsEnchantment(c))),
    InstantOrSorcery: CN("InstantOrSorcery", (c) => IsField(c) && (IsInstant(c) || IsSorcery(c))),
    CreatureOrPlayer: CN("CreatureOrPlayer", (c) => IsField(c) && (IsCreature(c) || IsPlayer(c))),

    //In Hand
    NonLandHand: CN("NonLandHand", (c) => IsHand(c) && !IsLand(c)),
    
    //On Stack
    NonCreatureStack: CN("NonCreatureStack", (c) => IsStack(c) && !IsCreature(c)),
    NonCreatureAnyZone: CN("NonCreatureAnyZone", (c) => !IsCreature(c)),

    AnyTarget: CN("AnyTarget", (c) => (IsField(c) && IsCreature(c) || IsPlaneswalker(c)) || IsPlayer(c)),

    Player: CN("Player", (c) => IsPlayer(c)),
    FriendlyPlayer:  CN("Player", (c,s) => IsPlayer(c) && IsFriendly(c, s)),
    OpponentPlayer:  CN("Player", (c,s) => IsPlayer(c) && !IsFriendly(c, s)),

    AbilitySource: CN("AbilitySource", (c, s) => c.id === s.abilitySourceId),
    ContextTarget: CN("ContextTarget", (c, _, __, x) => x.chosenTargets ? x.chosenTargets.includes(c.id) : false),
    Library: CN("Library", (c) => IsLibrary(c)),
    Hand: CN("Hand", (c) => IsHand(c)),
    TopNCardsOfLibrary: CN("TopNCardsOfLibrary", (c, _, b, x) => {
        const position = CardController(c, b).library.indexOf(c.id);
        return position >= 0 && position < x.numberVariable!;
    }),

    OfType: CN("OfType", (c, _, __, x) => IsTribe(c, x.tribeVariable!)),
    OfColor: CN("OfColor", (c, _, __, x) => IsColor(c, x.colorVariable!)),
    OfKeyword: CN("OfKeyword", (c, _, __, x) => IsKeyword(c, x.keywordVariable!)),
    InZone: CN("InZone", (c, _, __, x) => c.zone === x.zoneVariable), 
    HasPower: CN("HasPower", (c, _, __, x) => c.power === x.numberVariable),  
    HasToughness: CN("HasToughness", (c, _, __, x) => c.toughness === x.numberVariable),
    HasDamageMarked: CN("HasDamageMarked", (c, _, __, x) => c.damageMarked === x.numberVariable),
    HasAbility: CN("HasAbility", (c, _, __, x) => {console.log("HasAbility", JSON.stringify(c.abilities), JSON.stringify(x.abilityVariable)); return c.abilities.some(a => a.name === x.abilityVariable!)}), 
    HasKeyword: CN("HasKeyword", (c, _, __, x) => c.keywords.includes(x.keywordVariable!)), 
    IsTapped: CN("IsTapped", (c) => c.tapped),
    IsUntapped: CN("IsUntapped", (c) => !c.tapped),
    GainedLifeThisTurn: CN("GainedLifeThisTurn", (c, _, b) => CardController(c, b).gainedLifeThisTurn > 0),
    LostLifeThisTurn: CN("LostLifeThisTurn", (c, _, b) => CardController(c, b).lostLifeThisTurn > 0),
    NumberOfPermanentsControlled: CN("NumberOfPermanentsControlled", (c, _, b, x) => b.cards.filter(card => card.controller === CardController(c, b).id && card.zone === 'Field').length >= x.numberVariable!),

    PowerN: CN("PowerN", (c, _, __, x) => IsPowerN(c, x.numberVariable!)),
    CMCN: CN("CMCN", (c, _, __, x) => IsPowerN(c, x.numberVariable!)),
    ToughnessN: CN("ToughnessN", (c, _, __, x) => IsToughnessN(c, x.numberVariable!)),
    PowerNOrGreater: CN("PowerNOrGreater", (c, _, __, x) => IsPowerNOrGreater(c, x.numberVariable!)),
    CMCNOrGreater: CN("CMCNOrGreater", (c, _, __, x) => IsCMCNOrGreater(c, x.numberVariable!)),
    ToughnessNOrGreater: CN("ToughnessNOrGreater", (c, _, __, x) => IsToughnessNOrGreater(c, x.numberVariable!)),
    PowerNOrLess: CN("PowerNOrLess", (c, _, __, x) => IsPowerNOrLess(c, x.numberVariable!)),
    CMCNOrLess: CN("CMCNOrLess", (c, _, __, x) => IsCMCNOrLess(c, x.numberVariable!)),
    ToughnessNOrLess: CN("ToughnessNOrLess", (c, _, __, x) => IsToughnessNOrLess(c, x.numberVariable!)),

    //Card specific
    NotAttackingAndNoSummoningSickness: CN("NotAttackingAndNoSummoningSickness", c => !c.attacking && !c.summoningSickness),
    Attacking: CN("Attacking", (c) => IsField(c) && IsCreature(c) && !!c.attacking),
    
    Delirium: CN("Delirium", (c, _s, b) => {
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
        return cardTypes.size >= 4;
    }),

    HasCitysBlessing: CN("HasCitysBlessing", (c, _s, b) => {
        const controller = CardController(c, b);
        return b.cards.some(card => card.controller === controller.id && card.zone === 'Field' && card.name === "City's Blessing");
    }),

    ControlsCard: CN("ControlsCard", (c, _s, b, x) => {
        const controller = CardController(c, b);
        const cardNameToFind = x.cardNameVariable;
        if (!cardNameToFind) {
            throw new Error("ControlsCard condition requires cardNameVariable");
        }
        return b.cards.some(card => card.controller === controller.id && card.zone === 'Field' && card.name === cardNameToFind);
    }),

    EnteredThisTurn: CN("EnteredThisTurn", (c, _s, _b) => {
        // Check if this card entered any zone this turn
        return c.enteredThisTurn;
    }),

    IsToken: CN("IsToken", (c, _s, _b) => {
        return IsToken(c)
    }),

    IsAbility: CN("IsAbility", (c, _s, _b) => {
        return IsAbility(c)
    }),
    
    IsAbilityOf: CN("IsAbilityOf", (c, _, b, x) => {
        if (!IsAbility(c) || !c.abilitySourceId || !x.tribeVariable) return false;
        const sourceCard = b.cards.find(card => card.id === c.abilitySourceId);
        return sourceCard ? IsTribe(sourceCard, x.tribeVariable) : false;
    }),
    
    Graveyard: CN("Graveyard", (c, _s, _b) => {
        return IsGraveyard(c);
    }),

    HasStunCounter: CN("HasStunCounter", (c, _s, _b) => {
        return c.counters.includes('Stun');
    }),

    ArtifactEnteredThisTurn: CN("ArtifactEnteredThisTurn", (c, _s, b) => {
        const controller = CardController(c, b);
        return controller.cardsEnteredThisTurn.some(cardId => {
            const enteredCard = b.cards.find(card => card.id === cardId);
            return enteredCard && IsArtifact(enteredCard);
        });
    }),

    BucketTarget: CN("BucketTarget", (c, _, __, x) => {
        if (!x.bucketTargetIds || !x.stringVariable) return false;
        const bucketCards = x.bucketTargetIds[x.stringVariable];
        return bucketCards ? bucketCards.includes(c.id) : false;
    }),
}

export interface ConditionBuilder {
    (baseType: ConditionName): ConditionSpecification;
    All: (...conditions: (ConditionName | ConditionSpecification)[]) => ConditionSpecification;
    Or: (...conditions: (ConditionName | ConditionSpecification)[]) => ConditionSpecification;
    Target: (...conditions: (ConditionName | ConditionSpecification)[]) => ConditionSpecification;
    WithValidationFunction:  (validationFunction:string, ...conditions: (ConditionName | ConditionSpecification)[]) => ConditionSpecification;
    
    OfColor: (color: ColorDef) => ConditionSpecification;
    OfTribe: (tribe: TribeName) => ConditionSpecification;  
    OfKeyword: (keyword: KeywordName) => ConditionSpecification;
    IsAbilityOf: (tribe: TribeName) => ConditionSpecification;
    PowerN: (power: NumberDef) => ConditionSpecification;
    PowerNOrLess: (power: NumberDef) => ConditionSpecification;
    PowerNOrGreater: (power: NumberDef) => ConditionSpecification;
    ToughnessN: (toughness: NumberDef) => ConditionSpecification;
    ToughnessNOrLess: (toughness: NumberDef) => ConditionSpecification;
    ToughnessNOrGreater: (toughness: NumberDef) => ConditionSpecification;
    CMCN: (cmc: NumberDef) => ConditionSpecification;
    CMCNOrLess: (cmc: NumberDef) => ConditionSpecification;
    CMCNOrGreater: (cmc: NumberDef) => ConditionSpecification;
    TopNCardsOfLibrary: (amount: NumberDef) => ConditionSpecification;
    InZone: (zone: ZoneName) => ConditionSpecification;
    ControlsCard: (cardName: CardName) => ConditionSpecification;
    BucketTarget: (bucketName: string) => ConditionSpecification;
    Friendly: ConditionSpecification;
    Opponent: ConditionSpecification;
    Self: ConditionSpecification;
    Other: ConditionSpecification;
}

export const createConditionWithContext = (conditionName: ConditionName, context: Partial<ConditionContext>={}): ConditionSpecification => ({
    conditions: [conditionName],
    min: 1,
    max: 1,
    all: false,
    andOr: 'AND',
    doesTarget: true,
    context,
    validationFunction: "None",
    cls: 'ConditionSpecification'
});

const combineConditions = (all: boolean, andOr: 'AND' | 'OR', conditions: (ConditionName | ConditionSpecification)[]): ConditionSpecification => {
    const conditionItems: ConditionItem[] = [];
    let combinedContext = {};
    
    conditions.forEach(condition => {
        if (typeof condition === 'string') {
            conditionItems.push(condition);
        } else {
            conditionItems.push(condition);
            combinedContext = { ...combinedContext, ...condition.context };
        }
    });
    
    return {
        conditions: conditionItems,
        min: 1,
        max: 1,
        all,
        andOr,
        doesTarget: !all,
        context: combinedContext,
        validationFunction: "None",
        cls: 'ConditionSpecification'
    };
};

export const C: ConditionBuilder = Object.assign(
    (baseType: ConditionName): ConditionSpecification => 
        createConditionWithContext(baseType),
    {
        All: (...conditions: (ConditionName | ConditionSpecification)[]): ConditionSpecification =>
            combineConditions(true, 'AND', conditions),
            
        Or: (...conditions: (ConditionName | ConditionSpecification)[]): ConditionSpecification =>
            combineConditions(false, 'OR', conditions),
            
        //Any
        Target: (...conditions: (ConditionName | ConditionSpecification)[]): ConditionSpecification =>
            combineConditions(false, 'AND', conditions),

        WithValidationFunction: (validationFunction:string, ...conditions: (ConditionName | ConditionSpecification)[]): ConditionSpecification =>
            ({...combineConditions(false, 'AND', conditions), validationFunction}),
            
        OfColor: (color: ColorDef): ConditionSpecification =>
            createConditionWithContext("OfColor", { colorVariable: color }),
            
        OfTribe: (tribe: TribeName): ConditionSpecification =>
            createConditionWithContext("OfType", { tribeVariable: tribe }),
            
        OfKeyword: (keyword: KeywordName): ConditionSpecification =>
            createConditionWithContext("OfKeyword", { keywordVariable: keyword }),
            
        IsAbilityOf: (tribe: TribeName): ConditionSpecification =>
            createConditionWithContext("IsAbilityOf", { tribeVariable: tribe }),
            
        PowerN: (power: NumberDef): ConditionSpecification =>
            createConditionWithContext("PowerN", { numberVariable: power }),
            
        PowerNOrLess: (power: NumberDef): ConditionSpecification =>
            createConditionWithContext("PowerNOrLess", { numberVariable: power }),
            
        PowerNOrGreater: (power: NumberDef): ConditionSpecification =>
            createConditionWithContext("PowerNOrGreater", { numberVariable: power }),
            
        ToughnessN: (toughness: NumberDef): ConditionSpecification =>
            createConditionWithContext("ToughnessN", { numberVariable: toughness }),
            
        ToughnessNOrLess: (toughness: NumberDef): ConditionSpecification =>
            createConditionWithContext("ToughnessNOrLess", { numberVariable: toughness }),
            
        ToughnessNOrGreater: (toughness: NumberDef): ConditionSpecification =>
            createConditionWithContext("ToughnessNOrGreater", { numberVariable: toughness }),
            
        CMCN: (cmc: NumberDef): ConditionSpecification =>
            createConditionWithContext("CMCN", { numberVariable: cmc }),
            
        CMCNOrLess: (cmc: NumberDef): ConditionSpecification =>
            createConditionWithContext("CMCNOrLess", { numberVariable: cmc }),
            
        CMCNOrGreater: (cmc: NumberDef): ConditionSpecification =>
            createConditionWithContext("CMCNOrGreater", { numberVariable: cmc }),

        TopNCardsOfLibrary: (amount: NumberDef): ConditionSpecification =>
            createConditionWithContext("TopNCardsOfLibrary", { numberVariable: amount }),
            
        InZone: (zone: ZoneName): ConditionSpecification =>
            createConditionWithContext("InZone", { zoneVariable: zone }),
            
        ControlsCard: (cardName: CardName): ConditionSpecification =>
            createConditionWithContext("ControlsCard", { cardNameVariable: cardName }),

        BucketTarget: (bucketName: string): ConditionSpecification =>
            createConditionWithContext("BucketTarget", { stringVariable: bucketName }),
            
        Friendly: createConditionWithContext("Friendly"),
        Opponent: createConditionWithContext("Opponent"),
        Self: createConditionWithContext("Self"),
        Other: createConditionWithContext("Other")
    }
);

// Example usage (commented out - for documentation):
// const allRatsWithPower2OrLess = C.All("Creature", C.PowerNOrLess(2), C.OfTribe("Rat"));
// const targetCreature = C("Creature");
// const redCardsInHand = C.All("Hand", C.OfColor("Red"));

